var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_url = require("url");
var import_genai = require("@google/genai");
var import_meta = {};
import_dotenv.default.config();
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
var app = (0, import_express.default)();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
var isProd = process.env.NODE_ENV === "production";
app.use(import_express.default.json({ limit: "10mb" }));
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "MELHOR DA ILHA API",
    time: (/* @__PURE__ */ new Date()).toISOString(),
    geminiKeyAvailable: Boolean(process.env.GEMINI_API_KEY),
    mercadoPagoConfigured: Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN)
  });
});
var paymentsDb = /* @__PURE__ */ new Map();
app.post("/api/mercadopago/create-preference", async (req, res) => {
  try {
    const { title, price, businessName, clientEmail, planType } = req.body;
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    const appUrl = process.env.APP_URL || "https://melhordailha.online";
    const unitPrice = parseFloat(price) || (planType === "destaque" ? 29 : 59);
    const itemTitle = title || `Plano ${planType === "destaque" ? "Destaque Ilha" : "RMS Premium"} - ${businessName || "Empresa"}`;
    if (!token || token.includes("TEST-seu-access-token")) {
      const mockId = `pref_mock_${Date.now()}`;
      paymentsDb.set(mockId, {
        id: mockId,
        status: "pending",
        title: itemTitle,
        price: unitPrice,
        planType,
        businessName,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      return res.json({
        preferenceId: mockId,
        isSimulated: true,
        message: "Modo simula\xE7\xE3o ativado. Configure MERCADO_PAGO_ACCESS_TOKEN para processar pagamentos reais."
      });
    }
    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        items: [
          {
            title: itemTitle,
            description: `Assinatura mensal Guia Melhor da Ilha: ${businessName || "Com\xE9rcio Local"}`,
            quantity: 1,
            currency_id: "BRL",
            unit_price: unitPrice
          }
        ],
        payer: {
          email: clientEmail && clientEmail.includes("@") && !clientEmail.endsWith(".local") ? clientEmail.trim() : "contato@melhordailha.online"
        },
        back_urls: {
          success: `${appUrl}/?status=approved&plan=${planType}`,
          failure: `${appUrl}/?status=failure`,
          pending: `${appUrl}/?status=pending`
        },
        auto_return: "approved",
        payment_methods: {
          excluded_payment_types: [],
          installments: 12
        },
        statement_descriptor: "MELHOR DA ILHA",
        notification_url: `${appUrl}/api/mercadopago/webhook`,
        external_reference: `biz_${Date.now()}_${planType}`
      })
    });
    const data = await mpResponse.json();
    if (!mpResponse.ok) {
      console.error("[MercadoPago Preference Error]:", data);
      return res.status(mpResponse.status).json({
        error: data.message || "Erro ao gerar prefer\xEAncia no Mercado Pago",
        details: data
      });
    }
    res.json({
      preferenceId: data.id,
      initPoint: data.init_point,
      sandboxInitPoint: data.sandbox_init_point
    });
  } catch (error) {
    console.error("[MercadoPago Error]:", error);
    res.status(500).json({ error: error.message || "Erro interno no servidor" });
  }
});
app.post("/api/mercadopago/create-pix", async (req, res) => {
  try {
    const { amount, description, payerEmail, payerName, businessName, planType } = req.body;
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    const unitAmount = parseFloat(amount) || (planType === "destaque" ? 29 : 59);
    const desc = description || `Assinatura Plano ${planType === "destaque" ? "Destaque (R$ 29)" : "RMS Premium (R$ 59)"} - ${businessName || "Empresa"}`;
    if (!token || token.includes("TEST-seu-access-token")) {
      const mockPaymentId = `pix_${Date.now()}`;
      const mockQrCode = `00020101021226840014br.gov.bcb.pix2562qrcodes-pix.mercadopago.com/v2/mock-${mockPaymentId}5204000053039865405${unitAmount.toFixed(2)}5802BR5920MELHOR DA ILHA GUIA6009SALVADOR62070503***6304E8A2`;
      paymentsDb.set(mockPaymentId, {
        id: mockPaymentId,
        status: "pending",
        amount: unitAmount,
        qrCode: mockQrCode,
        businessName,
        planType,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      return res.json({
        paymentId: mockPaymentId,
        status: "pending",
        qrCode: mockQrCode,
        // SVG do QR Code gerado em Base64 para exibir na hora sem requisições externas
        qrCodeBase64: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" + encodeURIComponent(mockQrCode),
        isSimulated: true,
        message: "Modo simula\xE7\xE3o de Pix ativado para testes no site."
      });
    }
    const safeEmail = payerEmail && payerEmail.includes("@") && !payerEmail.endsWith(".local") ? payerEmail.trim() : "contato@melhordailha.online";
    const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Idempotency-Key": `pix-${Date.now()}-${Math.random().toString(36).substring(7)}`
      },
      body: JSON.stringify({
        transaction_amount: unitAmount,
        description: desc,
        payment_method_id: "pix",
        payer: {
          email: safeEmail,
          first_name: payerName || (businessName ? businessName.slice(0, 20) : "Cliente")
        }
      })
    });
    const data = await mpResponse.json();
    if (!mpResponse.ok) {
      console.error("[MercadoPago Pix Error]:", data);
      return res.status(mpResponse.status).json({
        error: data.message || "Erro ao gerar Pix no Mercado Pago",
        details: data
      });
    }
    const qrCode = data.point_of_interaction?.transaction_data?.qr_code || "";
    const qrCodeBase64 = data.point_of_interaction?.transaction_data?.qr_code_base64 ? `data:image/png;base64,${data.point_of_interaction.transaction_data.qr_code_base64}` : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCode)}`;
    res.json({
      paymentId: data.id,
      status: data.status,
      qrCode,
      qrCodeBase64,
      ticketUrl: data.point_of_interaction?.transaction_data?.ticket_url
    });
  } catch (error) {
    console.error("[MercadoPago Pix Error]:", error);
    res.status(500).json({ error: error.message || "Erro interno ao processar Pix" });
  }
});
app.get("/api/mercadopago/payment-status/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!token || token.includes("TEST-seu-access-token") || paymentId.startsWith("pix_")) {
      const stored = paymentsDb.get(paymentId);
      return res.json({
        id: paymentId,
        status: stored?.status || "pending",
        isSimulated: true
      });
    }
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!mpResponse.ok) {
      return res.status(mpResponse.status).json({ status: "unknown" });
    }
    const data = await mpResponse.json();
    res.json({
      id: data.id,
      status: data.status,
      statusDetail: data.status_detail,
      amount: data.transaction_amount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/mercadopago/webhook", async (req, res) => {
  try {
    const { type, data } = req.body;
    console.log("[MercadoPago Webhook Received]:", { type, dataId: data?.id });
    if (type === "payment" && data?.id) {
      const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      if (token && !token.includes("TEST-seu-access-token")) {
        const check = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const paymentData = await check.json();
        console.log(`[MercadoPago Payment ${data.id}]: Status = ${paymentData.status}`);
        if (paymentData.status === "approved") {
          const extRef = paymentData.external_reference || "";
          const isPremium = extRef.includes("premium") || paymentData.transaction_amount >= 59;
          const slug = extRef.replace(/^biz_\d+_/, "") || "cliente-premium";
          paymentsDb.set(String(data.id), {
            id: data.id,
            status: "approved",
            planType: isPremium ? "premium" : "destaque",
            miniSiteUrl: `https://melhordailha.online/perfil/${slug}`,
            slug,
            approvedAt: (/* @__PURE__ */ new Date()).toISOString()
          });
          console.log(`[MINI-SITE RMS PREMIUM ATIVADO]: https://melhordailha.online/perfil/${slug}`);
        }
      }
    }
    res.status(200).send("OK");
  } catch (err) {
    console.warn("[MercadoPago Webhook Error]:", err);
    res.status(200).send("OK");
  }
});
app.post("/api/ai/enhance-profile", async (req, res) => {
  try {
    const { name, category, city, currentDescription, services } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        enhancedPitch: `${name} \xE9 refer\xEAncia em ${category} em ${city}. Atendimento \xE1gil, proced\xEAncia comprovada e satisfa\xE7\xE3o garantida para voc\xEA e sua fam\xEDlia.`,
        keyHighlights: [
          "Atendimento \xE1gil e personalizado via WhatsApp",
          "Profissionais experientes e padr\xE3o de excel\xEAncia",
          "Localiza\xE7\xE3o privilegiada com f\xE1cil acesso na regi\xE3o",
          "Garantia de proced\xEAncia e qualidade em cada servi\xE7o"
        ],
        whatsappHook: `Ol\xE1! Vi o mini-site oficial da ${name} no MELHOR DA ILHA e gostaria de um atendimento priorit\xE1rio!`
      });
    }
    const prompt = `Voc\xEA \xE9 um copywriter de marketing de alta performance para o guia comercial oficial "MELHOR DA ILHA" (Ilha de Itaparica e Regi\xE3o Metropolitana de Salvador, Bahia).
Escreva uma apresenta\xE7\xE3o comercial irresist\xEDvel, moderna e persuasiva para o mini-site exclusivo de um assinante do plano RMS Premium.

Dados da Empresa:
- Nome: ${name}
- Categoria: ${category}
- Munic\xEDpio/Regi\xE3o: ${city}
- Descri\xE7\xE3o atual: ${currentDescription || "N\xE3o informada"}
- Especialidades/Servi\xE7os: ${services || "Atendimento comercial de qualidade"}

Retorne EXCLUSIVAMENTE um objeto JSON v\xE1lido com estas chaves:
{
  "enhancedPitch": "Par\xE1grafo envolvente e profissional de 2 a 3 frases destacando confian\xE7a, autoridade e atendimento diferenciado.",
  "keyHighlights": ["Diferencial 1", "Diferencial 2", "Diferencial 3", "Diferencial 4"],
  "whatsappHook": "Mensagem curta e simp\xE1tica que o cliente enviar\xE1 no WhatsApp para fechar neg\xF3cio."
}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error) {
    console.error("Gemini enhance-profile error:", error);
    res.json({
      enhancedPitch: `${req.body.name} \xE9 l\xEDder em ${req.body.category} em ${req.body.city}, unindo tradi\xE7\xE3o, alta qualidade e atendimento humanizado.`,
      keyHighlights: [
        "Atendimento \xE1gil e atencioso direto no WhatsApp",
        "Compromisso com pontualidade e satisfa\xE7\xE3o total",
        "Destaque verificado com nota m\xE1xima no guia oficial",
        "Facilidade de pagamento e negocia\xE7\xE3o direta"
      ],
      whatsappHook: `Ol\xE1 ${req.body.name}! Vi seu mini-site no MELHOR DA ILHA e quero tirar uma d\xFAvida!`
    });
  }
});
app.get(["/baixar", "/download"], (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Download \u2014 dist-hostgator.zip | MELHOR DA ILHA</title>
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
    <div class="icon">\u{1F4E6}</div>
    <h1>Pacote HostGator Compilado</h1>
    <p>O arquivo <strong>dist-hostgator.zip</strong> cont\xE9m todos os arquivos est\xE1ticos minificados, imagens e o arquivo <strong>.htaccess</strong> configurado para a HostGator.</p>
    <a href="/dist-hostgator.zip" download="dist-hostgator.zip" class="btn">
      \u{1F4E5} Baixar dist-hostgator.zip (27,9 MB)
    </a>
    <div class="meta">
      Ap\xF3s baixar, envie e extraia o arquivo diretamente na pasta do seu dom\xEDnio no cPanel da HostGator.
    </div>
  </div>
  <script>
    // Inicia download automaticamente ap\xF3s 500ms
    setTimeout(() => {
      window.location.href = '/dist-hostgator.zip';
    }, 500);
  </script>
</body>
</html>`);
});
app.get(["/download/dist-hostgator.zip", "/dist-hostgator.zip"], (_req, res) => {
  const filePath = import_path.default.resolve(__dirname, "dist-hostgator.zip");
  if (import_fs.default.existsSync(filePath)) {
    res.setHeader("Content-Disposition", 'attachment; filename="dist-hostgator.zip"');
    res.setHeader("Content-Type", "application/zip");
    res.sendFile(filePath);
  } else {
    res.status(404).send("Arquivo zip n\xE3o encontrado. Execute npm run build.");
  }
});
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.resolve(__dirname, "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MELHOR DA ILHA] Server running on http://0.0.0.0:${PORT} (env: ${isProd ? "production" : "development"})`);
  });
}
startServer();
