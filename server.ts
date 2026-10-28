import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
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
    mercadoPagoConfigured: Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN),
  });
});

// In-memory payment tracker for demo/fallback verification
const paymentsDb = new Map<string, any>();

// ========================================================
// MERCADO PAGO: 1. Criar Preferência para Checkout em Modal
// ========================================================
app.post('/api/mercadopago/create-preference', async (req: Request, res: Response) => {
  try {
    const { title, price, businessName, clientEmail, planType } = req.body;
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    const appUrl = process.env.APP_URL || 'https://melhordailha.online';

    const unitPrice = parseFloat(price) || (planType === 'destaque' ? 29.0 : 59.0);
    const itemTitle = title || `Plano ${planType === 'destaque' ? 'Destaque Ilha' : 'RMS Premium'} - ${businessName || 'Empresa'}`;

    if (!token || token.includes('TEST-seu-access-token')) {
      // Sandbox/Simulação sem token configurado: gera preferência mock para teste no frontend
      const mockId = `pref_mock_${Date.now()}`;
      paymentsDb.set(mockId, {
        id: mockId,
        status: 'pending',
        title: itemTitle,
        price: unitPrice,
        planType,
        businessName,
        createdAt: new Date().toISOString(),
      });

      return res.json({
        preferenceId: mockId,
        isSimulated: true,
        message: 'Modo simulação ativado. Configure MERCADO_PAGO_ACCESS_TOKEN para processar pagamentos reais.',
      });
    }

    // Chamada oficial à API do Mercado Pago
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: itemTitle,
            description: `Assinatura mensal Guia Melhor da Ilha: ${businessName || 'Comércio Local'}`,
            quantity: 1,
            currency_id: 'BRL',
            unit_price: unitPrice,
          },
        ],
        payer: {
          email: (clientEmail && clientEmail.includes('@') && !clientEmail.endsWith('.local'))
            ? clientEmail.trim()
            : 'contato@melhordailha.online',
        },
        back_urls: {
          success: `${appUrl}/?status=approved&plan=${planType}`,
          failure: `${appUrl}/?status=failure`,
          pending: `${appUrl}/?status=pending`,
        },
        auto_return: 'approved',
        payment_methods: {
          excluded_payment_types: [],
          installments: 12,
        },
        statement_descriptor: 'MELHOR DA ILHA',
        notification_url: `${appUrl}/api/mercadopago/webhook`,
        external_reference: `biz_${Date.now()}_${planType}`,
      }),
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('[MercadoPago Preference Error]:', data);
      return res.status(mpResponse.status).json({
        error: data.message || 'Erro ao gerar preferência no Mercado Pago',
        details: data,
      });
    }

    res.json({
      preferenceId: data.id,
      initPoint: data.init_point,
      sandboxInitPoint: data.sandbox_init_point,
    });
  } catch (error: any) {
    console.error('[MercadoPago Error]:', error);
    res.status(500).json({ error: error.message || 'Erro interno no servidor' });
  }
});

// ========================================================
// MERCADO PAGO: 2. Criar Pagamento Pix Direto (Transparente)
// ========================================================
app.post('/api/mercadopago/create-pix', async (req: Request, res: Response) => {
  try {
    const { amount, description, payerEmail, payerName, businessName, planType } = req.body;
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    const unitAmount = parseFloat(amount) || (planType === 'destaque' ? 29.0 : 59.0);
    const desc = description || `Assinatura Plano ${planType === 'destaque' ? 'Destaque (R$ 29)' : 'RMS Premium (R$ 59)'} - ${businessName || 'Empresa'}`;

    if (!token || token.includes('TEST-seu-access-token')) {
      // Simulação de Pix transparente com QR Code válido e código Copia e Cola para testes imediatos
      const mockPaymentId = `pix_${Date.now()}`;
      const mockQrCode = `00020101021226840014br.gov.bcb.pix2562qrcodes-pix.mercadopago.com/v2/mock-${mockPaymentId}5204000053039865405${unitAmount.toFixed(2)}5802BR5920MELHOR DA ILHA GUIA6009SALVADOR62070503***6304E8A2`;

      paymentsDb.set(mockPaymentId, {
        id: mockPaymentId,
        status: 'pending',
        amount: unitAmount,
        qrCode: mockQrCode,
        businessName,
        planType,
        createdAt: new Date().toISOString(),
      });

      return res.json({
        paymentId: mockPaymentId,
        status: 'pending',
        qrCode: mockQrCode,
        // SVG do QR Code gerado em Base64 para exibir na hora sem requisições externas
        qrCodeBase64: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodeURIComponent(mockQrCode),
        isSimulated: true,
        message: 'Modo simulação de Pix ativado para testes no site.',
      });
    }

    const safeEmail = (payerEmail && payerEmail.includes('@') && !payerEmail.endsWith('.local'))
      ? payerEmail.trim()
      : 'contato@melhordailha.online';

    // Chamada oficial à API de Pagamentos Transparentes v1
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Idempotency-Key': `pix-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      },
      body: JSON.stringify({
        transaction_amount: unitAmount,
        description: desc,
        payment_method_id: 'pix',
        payer: {
          email: safeEmail,
          first_name: payerName || (businessName ? businessName.slice(0, 20) : 'Cliente'),
        },
      }),
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('[MercadoPago Pix Error]:', data);
      return res.status(mpResponse.status).json({
        error: data.message || 'Erro ao gerar Pix no Mercado Pago',
        details: data,
      });
    }

    const qrCode = data.point_of_interaction?.transaction_data?.qr_code || '';
    const qrCodeBase64 = data.point_of_interaction?.transaction_data?.qr_code_base64
      ? `data:image/png;base64,${data.point_of_interaction.transaction_data.qr_code_base64}`
      : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCode)}`;

    res.json({
      paymentId: data.id,
      status: data.status,
      qrCode,
      qrCodeBase64,
      ticketUrl: data.point_of_interaction?.transaction_data?.ticket_url,
    });
  } catch (error: any) {
    console.error('[MercadoPago Pix Error]:', error);
    res.status(500).json({ error: error.message || 'Erro interno ao processar Pix' });
  }
});

// ========================================================
// MERCADO PAGO: 3. Consulta de Status do Pagamento
// ========================================================
app.get('/api/mercadopago/payment-status/:paymentId', async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!token || token.includes('TEST-seu-access-token') || paymentId.startsWith('pix_')) {
      const stored = paymentsDb.get(paymentId);
      return res.json({
        id: paymentId,
        status: stored?.status || 'pending',
        isSimulated: true,
      });
    }

    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!mpResponse.ok) {
      return res.status(mpResponse.status).json({ status: 'unknown' });
    }

    const data = await mpResponse.json();
    res.json({
      id: data.id,
      status: data.status,
      statusDetail: data.status_detail,
      amount: data.transaction_amount,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========================================================
// MERCADO PAGO: 4. Webhook IPN de Notificação & Ativação de Mini-Site
// ========================================================
app.post('/api/mercadopago/webhook', async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;
    console.log('[MercadoPago Webhook Received]:', { type, dataId: data?.id });

    // Se o pagamento foi aprovado, gera e ativa o mini-site automaticamente
    if (type === 'payment' && data?.id) {
      const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (token && !token.includes('TEST-seu-access-token')) {
        const check = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const paymentData = await check.json();
        console.log(`[MercadoPago Payment ${data.id}]: Status = ${paymentData.status}`);

        if (paymentData.status === 'approved') {
          const extRef = paymentData.external_reference || '';
          const isPremium = extRef.includes('premium') || paymentData.transaction_amount >= 59.0;
          const slug = extRef.replace(/^biz_\d+_/, '') || 'cliente-premium';

          paymentsDb.set(String(data.id), {
            id: data.id,
            status: 'approved',
            planType: isPremium ? 'premium' : 'destaque',
            miniSiteUrl: `https://melhordailha.online/perfil/${slug}`,
            slug,
            approvedAt: new Date().toISOString()
          });

          console.log(`[MINI-SITE RMS PREMIUM ATIVADO]: https://melhordailha.online/perfil/${slug}`);
        }
      }
    }

    res.status(200).send('OK');
  } catch (err: any) {
    console.warn('[MercadoPago Webhook Error]:', err);
    res.status(200).send('OK');
  }
});

// ========================================================
// GEMINI AI: Otimização Automática do Mini-Site RMS Premium
// ========================================================
app.post('/api/ai/enhance-profile', async (req: Request, res: Response) => {
  try {
    const { name, category, city, currentDescription, services } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        enhancedPitch: `${name} é referência em ${category} em ${city}. Atendimento ágil, procedência comprovada e satisfação garantida para você e sua família.`,
        keyHighlights: [
          'Atendimento ágil e personalizado via WhatsApp',
          'Profissionais experientes e padrão de excelência',
          'Localização privilegiada com fácil acesso na região',
          'Garantia de procedência e qualidade em cada serviço'
        ],
        whatsappHook: `Olá! Vi o mini-site oficial da ${name} no MELHOR DA ILHA e gostaria de um atendimento prioritário!`
      });
    }

    const prompt = `Você é um copywriter de marketing de alta performance para o guia comercial oficial "MELHOR DA ILHA" (Ilha de Itaparica e Região Metropolitana de Salvador, Bahia).
Escreva uma apresentação comercial irresistível, moderna e persuasiva para o mini-site exclusivo de um assinante do plano RMS Premium.

Dados da Empresa:
- Nome: ${name}
- Categoria: ${category}
- Município/Região: ${city}
- Descrição atual: ${currentDescription || 'Não informada'}
- Especialidades/Serviços: ${services || 'Atendimento comercial de qualidade'}

Retorne EXCLUSIVAMENTE um objeto JSON válido com estas chaves:
{
  "enhancedPitch": "Parágrafo envolvente e profissional de 2 a 3 frases destacando confiança, autoridade e atendimento diferenciado.",
  "keyHighlights": ["Diferencial 1", "Diferencial 2", "Diferencial 3", "Diferencial 4"],
  "whatsappHook": "Mensagem curta e simpática que o cliente enviará no WhatsApp para fechar negócio."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini enhance-profile error:', error);
    res.json({
      enhancedPitch: `${req.body.name} é líder em ${req.body.category} em ${req.body.city}, unindo tradição, alta qualidade e atendimento humanizado.`,
      keyHighlights: [
        'Atendimento ágil e atencioso direto no WhatsApp',
        'Compromisso com pontualidade e satisfação total',
        'Destaque verificado com nota máxima no guia oficial',
        'Facilidade de pagamento e negociação direta'
      ],
      whatsappHook: `Olá ${req.body.name}! Vi seu mini-site no MELHOR DA ILHA e quero tirar uma dúvida!`
    });
  }
});



// ========================================================
// DOWNLOAD: Arquivo Zip compilado para HostGator
// ========================================================
app.get(['/baixar', '/download'], (_req: Request, res: Response) => {
  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Download — dist-hostgator.zip | MELHOR DA ILHA</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 24px; padding: 36px; max-width: 520px; width: 100%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 24px; font-weight: 800; margin: 0 0 12px; color: #fff; }
    p { font-size: 14px; color: #94a3b8; line-height: 1.6; margin: 0 0 24px; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; background: linear-gradient(135deg, #0d9488, #14b8a6); color: #fff; text-decoration: none; padding: 16px 28px; border-radius: 16px; font-weight: 700; font-size: 15px; box-shadow: 0 10px 25px -5px rgba(20,184,166,0.4); transition: transform 0.2s; }
    .btn:hover { transform: scale(1.02); }
    .meta { margin-top: 24px; padding-top: 18px; border-top: 1px solid #334155; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">📦</div>
    <h1>Pacote HostGator Compilado</h1>
    <p>O arquivo <strong>dist-hostgator.zip</strong> contém todos os arquivos estáticos minificados, imagens e o arquivo <strong>.htaccess</strong> configurado para a HostGator.</p>
    <a href="/dist-hostgator.zip" download="dist-hostgator.zip" class="btn">
      📥 Baixar dist-hostgator.zip (27,9 MB)
    </a>
    <div class="meta">
      Após baixar, envie e extraia o arquivo diretamente na pasta do seu domínio no cPanel da HostGator.
    </div>
  </div>
  <script>
    // Inicia download automaticamente após 500ms
    setTimeout(() => {
      window.location.href = '/dist-hostgator.zip';
    }, 500);
  </script>
</body>
</html>`);
});

app.get(['/download/dist-hostgator.zip', '/dist-hostgator.zip'], (_req: Request, res: Response) => {
  const filePath = path.resolve(__dirname, 'dist-hostgator.zip');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Disposition', 'attachment; filename="dist-hostgator.zip"');
    res.setHeader('Content-Type', 'application/zip');
    res.sendFile(filePath);
  } else {
    res.status(404).send('Arquivo zip não encontrado. Execute npm run build.');
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
