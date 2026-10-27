import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini AI client initialization with mandatory telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'MELHOR DA ILHA API',
    time: new Date().toISOString(),
    geminiKeyAvailable: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Multi-turn Concierge Chatbot with Maps Grounding
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], userLocation } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Mensagem inválida ou ausente.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(503).json({
        reply: 'Assistente em modo offline. O serviço de IA necessita da chave GEMINI_API_KEY configurada.',
        groundingChunks: [],
      });
      return;
    }

    // Default to Ilha de Itaparica / Baía de Todos-os-Santos region
    const lat = userLocation?.latitude || -12.9777;
    const lng = userLocation?.longitude || -38.5016;

    const systemInstruction = `Você é o "Concierge Guia da Ilha", o assistente inteligente oficial do portal MELHOR DA ILHA — Guia Comercial e Turístico da Ilha de Itaparica (Itaparica e Vera Cruz), Salvador e toda a Região Metropolitana (Lauro de Freitas, Camaçari, Simões Filho, Candeias, Dias d'Ávila, Madre de Deus, São Francisco do Conde, Mata de São João, Pojuca, São Sebastião do Passé).
Suas diretrizes:
1. Responda em Português do Brasil com tom acolhedor, prestativo e simpático.
2. Ajude os usuários a encontrar empresas, restaurantes, praias, pousadas, oficinas, óticas, cabos de aço e materiais náuticos/elétricos (como a Loja do Cabo Ltda), fornecendo dicas práticas, pontos de referência e rotas.
3. Se perguntarem sobre números ou contatos do portal, informe que o WhatsApp da central é (71) 98382-1218 / (71) 99117-1830.
4. Utilize a ferramenta Google Maps para trazer informações reais de localização e estabelecimentos da região.
5. Formate as respostas com títulos claros, tópicos e destaque para nomes de estabelecimentos.`;

    // Build multi-turn contents format
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const turn of history.slice(-8)) {
        if (turn.role && turn.content) {
          contents.push({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.content }],
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng,
            },
          },
        },
      },
    });

    const reply = response.text || 'Desculpe, não consegui obter informações detalhadas no momento. Como posso ajudar com outra dúvida?';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    res.json({
      reply,
      groundingChunks,
    });
  } catch (error: any) {
    console.warn('Gemini API call failed, generating catalog concierge fallback:', error?.message);

    const { BUSINESSES } = await import('./src/data/businesses.js').catch(() => import('./src/data/businesses'));
    const queryLower = req.body?.message?.toLowerCase() || '';
    
    // Find matching businesses from the regional catalog
    const matches = BUSINESSES.filter((b: any) =>
      b.name.toLowerCase().includes(queryLower) ||
      b.cityName.toLowerCase().includes(queryLower) ||
      b.neighborhood.toLowerCase().includes(queryLower) ||
      b.tags.some((t: string) => queryLower.includes(t.toLowerCase())) ||
      b.services.some((s: string) => queryLower.includes(s.toLowerCase())) ||
      (queryLower.includes('cabo') && b.id.includes('cabo'))
    ).slice(0, 3);

    if (matches.length > 0) {
      let reply = `Encontrei estabelecimentos recomendados no nosso guia oficial da Ilha e RMS:\n\n`;
      const groundingChunks: any[] = [];
      for (const m of matches) {
        reply += `📍 **${m.name}** (${m.cityName} - ${m.neighborhood})\n`;
        reply += `• ${m.tagline}\n`;
        reply += `• 📞 Telefone/WhatsApp: ${m.phone} | ⭐ ${m.rating} (${m.reviewCount} avaliações)\n`;
        if (m.address) reply += `• Endereço: ${m.address}\n\n`;

        groundingChunks.push({
          maps: {
            title: m.name,
            uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.name + ' ' + m.address)}`
          }
        });
      }
      reply += `Precisa de mais informações ou contato direto? Você também pode falar com a nossa central pelo WhatsApp: (71) 98382-1218.`;

      res.json({ reply, groundingChunks });
      return;
    }

    res.json({
      reply: `Olá! Sou o Concierge do MELHOR DA ILHA 🌴🌊.\n\nTemos 66 estabelecimentos catalogados em Itaparica, Vera Cruz, Salvador, Simões Filho, Lauro de Freitas e Região Metropolitana.\n\nVocê pode buscar por nomes como **Loja do Cabo Ltda**, restaurantes de moqueca, pousadas ou oficinas mecânicas diretamente nos filtros do portal!\n\nCentral de atendimento: (71) 98382-1218 / (71) 99117-1830.`,
      groundingChunks: [
        {
          maps: {
            title: 'Ilha de Itaparica no Google Maps',
            uri: 'https://www.google.com/maps/place/Ilha+de+Itaparica'
          }
        }
      ]
    });
  }
});

// Configure Vite middleware in development or static serving in production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MELHOR DA ILHA] Server running on http://0.0.0.0:${PORT} (env: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
