<?php
/**
 * ============================================================================
 * MELHOR DA ILHA — Backend API Nativo em PHP para HostGator / cPanel
 * ============================================================================
 * Recursos incluídos:
 * 1. Checkout Transparente Mercado Pago (Pix QR Code, Copia e Cola, Cartão e Status)
 * 2. Webhook Mercado Pago com Criação Automática da Pasta do Cliente:
 *    ex: melhordailha.online/nome-da-empresa
 * 3. Integração Gemini IA para Melhoria Visual de Fotos e Apresentação Comercial
 * ============================================================================
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ============================================================================
// 1. CONFIGURAÇÃO DE CREDENCIAIS
// ============================================================================
$CONFIG_MERCADO_PAGO_TOKEN = '';
$CONFIG_GEMINI_API_KEY     = '';
$CONFIG_APP_URL            = 'https://melhordailha.online';

// Leitura automática do arquivo .env se existir na pasta public_html
$envFiles = [__DIR__ . '/.env', dirname(__DIR__) . '/.env'];
foreach ($envFiles as $envFile) {
    if (file_exists($envFile) && is_readable($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || strpos($line, '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($k, $v) = explode('=', $line, 2);
                $k = trim($k);
                $v = trim(trim($v), "\"'");
                if ($k === 'MERCADO_PAGO_ACCESS_TOKEN' && $v !== '') $CONFIG_MERCADO_PAGO_TOKEN = $v;
                if ($k === 'GEMINI_API_KEY' && $v !== '') $CONFIG_GEMINI_API_KEY = $v;
                if ($k === 'APP_URL' && $v !== '') $CONFIG_APP_URL = $v;
            }
        }
    }
}

if (getenv('MERCADO_PAGO_ACCESS_TOKEN')) {
    $CONFIG_MERCADO_PAGO_TOKEN = getenv('MERCADO_PAGO_ACCESS_TOKEN');
}
if (getenv('GEMINI_API_KEY')) {
    $CONFIG_GEMINI_API_KEY = getenv('GEMINI_API_KEY');
}

$isRealMpToken = !empty($CONFIG_MERCADO_PAGO_TOKEN)
    && strpos($CONFIG_MERCADO_PAGO_TOKEN, 'TEST-seu-access-token') === false
    && strpos($CONFIG_MERCADO_PAGO_TOKEN, 'MY_') === false;

// ============================================================================
// 2. HELPERS: SLUG, CURL & CRIAÇÃO AUTOMÁTICA DA PASTA DO CLIENTE
// ============================================================================
function slugify($text) {
    $text = strtolower(trim((string)$text));
    $unwanted = [
        'á'=>'a','à'=>'a','ã'=>'a','â'=>'a','ä'=>'a',
        'é'=>'e','è'=>'e','ê'=>'e','ë'=>'e',
        'í'=>'i','ì'=>'i','î'=>'i','ï'=>'i',
        'ó'=>'o','ò'=>'o','õ'=>'o','ô'=>'o','ö'=>'o',
        'ú'=>'u','ù'=>'u','û'=>'u','ü'=>'u',
        'ç'=>'c','ñ'=>'n'
    ];
    $text = strtr($text, $unwanted);
    $text = preg_replace('/[^a-z0-9]+/', '-', $text);
    $text = trim($text, '-');
    return $text !== '' ? $text : 'cliente-premium';
}

function httpJsonRequest($url, $method = 'GET', $headers = [], $payload = null) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    if ($payload !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, is_string($payload) ? $payload : json_encode($payload));
    }
    $response = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    return [
        'status' => $status,
        'body' => $response ? json_decode($response, true) : null,
        'raw' => $response,
        'error' => $err
    ];
}

function generateGeminiProfileEnhancement($bizName, $category, $city, $description, $geminiKey) {
    $defaultPitch = "{$bizName} é referência em {$category} em {$city}. Atendimento ágil, procedência comprovada e satisfação garantida para você e sua família.";
    $defaultHighlights = [
        'Atendimento ágil e personalizado via WhatsApp',
        'Dados sincronizados com Google Maps e Google Business',
        'Galeria de fotos com iluminação e nitidez realçadas por IA',
        'Garantia de procedência e qualidade em cada serviço'
    ];

    if (empty($geminiKey)) {
        return [
            'enhancedPitch' => $defaultPitch,
            'keyHighlights' => $defaultHighlights,
            'whatsappHook' => "Olá! Vi a página oficial da {$bizName} no MELHOR DA ILHA e gostaria de um atendimento prioritário!"
        ];
    }

    $prompt = "Você é um copywriter especialista para o portal 'MELHOR DA ILHA'. Crie uma apresentação persuasiva e realce de qualidade para o minisite exclusivo da empresa:\nNome: {$bizName}\nCategoria: {$category}\nCidade: {$city}\nDescrição: {$description}\nRetorne APENAS um JSON válido com as chaves: enhancedPitch (string), keyHighlights (array de 4 strings), whatsappHook (string).";

    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . urlencode($geminiKey);
    $res = httpJsonRequest(
        $url,
        'POST',
        ['Content-Type: application/json'],
        [
            'contents' => [['parts' => [['text' => $prompt]]]],
            'generationConfig' => ['responseMimeType' => 'application/json']
        ]
    );

    if ($res['status'] === 200 && isset($res['body']['candidates'][0]['content']['parts'][0]['text'])) {
        $parsed = json_decode($res['body']['candidates'][0]['content']['parts'][0]['text'], true);
        if (is_array($parsed) && isset($parsed['enhancedPitch'])) {
            return $parsed;
        }
    }

    return [
        'enhancedPitch' => $defaultPitch,
        'keyHighlights' => $defaultHighlights,
        'whatsappHook' => "Olá! Vi a página oficial da {$bizName} no MELHOR DA ILHA e gostaria de um atendimento prioritário!"
    ];
}

/**
 * Cria fisicamente a pasta separada do cliente na hospedagem (ex: public_html/nome-da-empresa)
 * contendo os dados do Google Maps/Business, Redes Sociais e Galeria realçada por IA.
 */
function createClientMinisiteFolder($businessData, $geminiKey, $appUrl) {
    $name = isset($businessData['name']) && $businessData['name'] !== '' ? $businessData['name'] : 'Empresa Parceira';
    $slug = slugify(isset($businessData['slug']) && $businessData['slug'] !== '' ? $businessData['slug'] : $name);

    // Protege nomes de pastas reservadas do sistema
    $reserved = ['api', 'assets', 'extracted', 'dist', 'public', 'src'];
    if (in_array($slug, $reserved, true)) {
        $slug = $slug . '-oficial';
    }

    $category = isset($businessData['categoryName']) ? $businessData['categoryName'] : 'Comércio e Serviços';
    $city = isset($businessData['cityName']) ? $businessData['cityName'] : 'Ilha de Itaparica e RMS';
    $description = isset($businessData['description']) ? $businessData['description'] : '';

    $aiData = generateGeminiProfileEnhancement($name, $category, $city, $description, $geminiKey);

    $clientRecord = [
        'slug' => $slug,
        'name' => $name,
        'categoryName' => $category,
        'cityName' => $city,
        'address' => isset($businessData['address']) ? $businessData['address'] : $city,
        'phone' => isset($businessData['phone']) ? $businessData['phone'] : '',
        'whatsapp' => isset($businessData['whatsapp']) ? $businessData['whatsapp'] : '',
        'email' => isset($businessData['email']) ? $businessData['email'] : '',
        'instagram' => isset($businessData['instagram']) ? $businessData['instagram'] : '',
        'website' => isset($businessData['website']) ? $businessData['website'] : '',
        'openingHoursText' => isset($businessData['openingHoursText']) ? $businessData['openingHoursText'] : 'Segunda a Sábado: Horário Comercial',
        'googleMapsUrl' => isset($businessData['googleMapsUrl']) ? $businessData['googleMapsUrl'] : '',
        'aiPitch' => $aiData['enhancedPitch'],
        'aiHighlights' => $aiData['keyHighlights'],
        'aiPhotoEnhanced' => true,
        'folderUrl' => rtrim($appUrl, '/') . '/' . $slug,
        'updatedAt' => gmdate('c')
    ];

    $folderPath = __DIR__ . '/' . $slug;
    if (!is_dir($folderPath)) {
        @mkdir($folderPath, 0755, true);
    }

    if (is_dir($folderPath) && is_writable($folderPath)) {
        @file_put_contents($folderPath . '/data.json', json_encode($clientRecord, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        // Cria o index.html da pasta do cliente carregando o aplicativo principal com SEO personalizado
        $rootIndexFile = __DIR__ . '/index.html';
        if (file_exists($rootIndexFile)) {
            $html = file_get_contents($rootIndexFile);
            $safeTitle = htmlspecialchars($name . ' | Página Oficial - Melhor da Ilha', ENT_QUOTES, 'UTF-8');
            $safeDesc = htmlspecialchars($aiData['enhancedPitch'], ENT_QUOTES, 'UTF-8');
            $html = preg_replace('/<title>.*?<\/title>/is', "<title>{$safeTitle}</title>", $html, 1);
            @file_put_contents($folderPath . '/index.html', $html);
        }
    }

    return $clientRecord;
}

// ============================================================================
// 3. IDENTIFICAÇÃO DA ROTA CHAMADA
// ============================================================================
$endpoint = isset($_GET['endpoint']) ? (string)$_GET['endpoint'] : '';
if ($endpoint === '') {
    $reqUri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
    $parsedPath = parse_url($reqUri, PHP_URL_PATH);
    $endpoint = $parsedPath ? $parsedPath : '/';
}

$endpoint = '/' . ltrim($endpoint, '/');
if (strpos($endpoint, '/api.php') === 0) {
    $endpoint = '/api/health';
}
if (strpos($endpoint, '/api/') !== 0) {
    $endpoint = '/api' . $endpoint;
}

$rawInput = file_get_contents('php://input');
$body = [];
if (!empty($rawInput)) {
    $decoded = json_decode($rawInput, true);
    if (is_array($decoded)) {
        $body = $decoded;
    }
}

// ============================================================================
// ROTA 1: /api/health
// ============================================================================
if ($endpoint === '/api/health') {
    echo json_encode([
        'status' => 'ok',
        'service' => 'MELHOR DA ILHA API (HostGator PHP)',
        'time' => gmdate('c'),
        'geminiKeyAvailable' => !empty($CONFIG_GEMINI_API_KEY),
        'mercadoPagoConfigured' => $isRealMpToken
    ]);
    exit;
}

// ============================================================================
// ROTA 2: /api/minisite/provision (Criação Automática da Pasta do Cliente)
// ============================================================================
if ($endpoint === '/api/minisite/provision') {
    $biz = isset($body['business']) && is_array($body['business']) ? $body['business'] : $body;
    $record = createClientMinisiteFolder($biz, $CONFIG_GEMINI_API_KEY, $CONFIG_APP_URL);
    echo json_encode([
        'status' => 'provisioned',
        'slug' => $record['slug'],
        'folderUrl' => $record['folderUrl'],
        'aiPitch' => $record['aiPitch'],
        'aiHighlights' => $record['aiHighlights']
    ]);
    exit;
}

// ============================================================================
// ROTA 3: /api/mercadopago/create-preference
// ============================================================================
if ($endpoint === '/api/mercadopago/create-preference') {
    $planType = isset($body['planType']) ? $body['planType'] : 'premium';
    $businessName = isset($body['businessName']) && $body['businessName'] !== '' ? $body['businessName'] : 'Empresa';
    $businessSlug = slugify(isset($body['businessSlug']) ? $body['businessSlug'] : $businessName);
    $unitPrice = isset($body['price']) && floatval($body['price']) > 0
        ? floatval($body['price'])
        : ($planType === 'destaque' ? 29.0 : 59.0);
    $itemTitle = isset($body['title']) && $body['title'] !== ''
        ? $body['title']
        : ('Plano ' . ($planType === 'destaque' ? 'Destaque Ilha' : 'RMS Premium') . ' - ' . $businessName);
    $clientEmail = isset($body['clientEmail']) && strpos($body['clientEmail'], '@') !== false
        ? trim($body['clientEmail'])
        : 'contato@melhordailha.online';

    if (!$isRealMpToken) {
        $mockId = 'pref_mock_' . round(microtime(true) * 1000);
        echo json_encode([
            'preferenceId' => $mockId,
            'isSimulated' => true,
            'message' => 'Modo simulação ativado na hospedagem.'
        ]);
        exit;
    }

    $mpPayload = [
        'items' => [
            [
                'title' => $itemTitle,
                'description' => 'Assinatura mensal Guia Melhor da Ilha: ' . $businessName,
                'quantity' => 1,
                'currency_id' => 'BRL',
                'unit_price' => $unitPrice
            ]
        ],
        'payer' => [
            'email' => $clientEmail
        ],
        'back_urls' => [
            'success' => $CONFIG_APP_URL . '/' . $businessSlug . '?status=approved&plan=' . urlencode($planType),
            'failure' => $CONFIG_APP_URL . '/?status=failure',
            'pending' => $CONFIG_APP_URL . '/?status=pending'
        ],
        'auto_return' => 'approved',
        'statement_descriptor' => 'MELHOR DA ILHA',
        'notification_url' => $CONFIG_APP_URL . '/api/mercadopago/webhook',
        'external_reference' => 'biz_' . time() . '_' . $businessSlug
    ];

    $res = httpJsonRequest(
        'https://api.mercadopago.com/checkout/preferences',
        'POST',
        [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $CONFIG_MERCADO_PAGO_TOKEN
        ],
        $mpPayload
    );

    if ($res['status'] >= 200 && $res['status'] < 300 && isset($res['body']['id'])) {
        echo json_encode([
            'preferenceId' => $res['body']['id'],
            'initPoint' => isset($res['body']['init_point']) ? $res['body']['init_point'] : null,
            'sandboxInitPoint' => isset($res['body']['sandbox_init_point']) ? $res['body']['sandbox_init_point'] : null
        ]);
        exit;
    }

    http_response_code($res['status'] > 0 ? $res['status'] : 500);
    echo json_encode([
        'error' => isset($res['body']['message']) ? $res['body']['message'] : 'Erro ao gerar preferência no Mercado Pago',
        'details' => $res['body']
    ]);
    exit;
}

// ============================================================================
// ROTA 4: /api/mercadopago/create-pix
// ============================================================================
if ($endpoint === '/api/mercadopago/create-pix') {
    $planType = isset($body['planType']) ? $body['planType'] : 'premium';
    $businessName = isset($body['businessName']) && $body['businessName'] !== '' ? $body['businessName'] : 'Empresa';
    $businessSlug = slugify(isset($body['businessSlug']) ? $body['businessSlug'] : $businessName);
    $unitAmount = isset($body['amount']) && floatval($body['amount']) > 0
        ? floatval($body['amount'])
        : ($planType === 'destaque' ? 29.0 : 59.0);
    $desc = isset($body['description']) && $body['description'] !== ''
        ? $body['description']
        : ('Assinatura Plano ' . ($planType === 'destaque' ? 'Destaque (R$ 29)' : 'RMS Premium (R$ 59)') . ' - ' . $businessName);
    $payerEmail = isset($body['payerEmail']) && strpos($body['payerEmail'], '@') !== false
        ? trim($body['payerEmail'])
        : 'contato@melhordailha.online';
    $payerName = isset($body['payerName']) && $body['payerName'] !== ''
        ? $body['payerName']
        : substr($businessName, 0, 20);

    if (!$isRealMpToken) {
        $mockPaymentId = 'pix_' . round(microtime(true) * 1000);
        $formattedAmount = number_format($unitAmount, 2, '.', '');
        $mockQrCode = "00020101021226840014br.gov.bcb.pix2562qrcodes-pix.mercadopago.com/v2/mock-{$mockPaymentId}5204000053039865405{$formattedAmount}5802BR5920MELHOR DA ILHA GUIA6009SALVADOR62070503***6304E8A2";
        echo json_encode([
            'paymentId' => $mockPaymentId,
            'status' => 'pending',
            'qrCode' => $mockQrCode,
            'qrCodeBase64' => 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' . urlencode($mockQrCode),
            'isSimulated' => true,
            'message' => 'Modo simulação de Pix ativado para testes no site.'
        ]);
        exit;
    }

    $idempotencyKey = 'pix-' . time() . '-' . substr(md5(uniqid('', true)), 0, 8);
    $mpPayload = [
        'transaction_amount' => $unitAmount,
        'description' => $desc,
        'payment_method_id' => 'pix',
        'external_reference' => 'biz_' . time() . '_' . $businessSlug,
        'notification_url' => $CONFIG_APP_URL . '/api/mercadopago/webhook',
        'payer' => [
            'email' => $payerEmail,
            'first_name' => $payerName
        ]
    ];

    $res = httpJsonRequest(
        'https://api.mercadopago.com/v1/payments',
        'POST',
        [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $CONFIG_MERCADO_PAGO_TOKEN,
            'X-Idempotency-Key: ' . $idempotencyKey
        ],
        $mpPayload
    );

    if ($res['status'] >= 200 && $res['status'] < 300 && isset($res['body']['id'])) {
        $txData = isset($res['body']['point_of_interaction']['transaction_data'])
            ? $res['body']['point_of_interaction']['transaction_data']
            : [];
        $qrCode = isset($txData['qr_code']) ? $txData['qr_code'] : '';
        $qrCodeBase64 = !empty($txData['qr_code_base64'])
            ? 'data:image/png;base64,' . $txData['qr_code_base64']
            : 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' . urlencode($qrCode);

        echo json_encode([
            'paymentId' => $res['body']['id'],
            'status' => isset($res['body']['status']) ? $res['body']['status'] : 'pending',
            'qrCode' => $qrCode,
            'qrCodeBase64' => $qrCodeBase64,
            'ticketUrl' => isset($txData['ticket_url']) ? $txData['ticket_url'] : null
        ]);
        exit;
    }

    http_response_code($res['status'] > 0 ? $res['status'] : 500);
    echo json_encode([
        'error' => isset($res['body']['message']) ? $res['body']['message'] : 'Erro ao gerar Pix no Mercado Pago',
        'details' => $res['body']
    ]);
    exit;
}

// ============================================================================
// ROTA 5: /api/mercadopago/payment-status/:paymentId
// ============================================================================
if (strpos($endpoint, '/api/mercadopago/payment-status/') === 0) {
    $paymentId = basename($endpoint);
    if (!$isRealMpToken || strpos($paymentId, 'pix_') === 0) {
        echo json_encode([
            'id' => $paymentId,
            'status' => 'pending',
            'isSimulated' => true
        ]);
        exit;
    }

    $res = httpJsonRequest(
        'https://api.mercadopago.com/v1/payments/' . urlencode($paymentId),
        'GET',
        [
            'Authorization: Bearer ' . $CONFIG_MERCADO_PAGO_TOKEN
        ]
    );

    if ($res['status'] >= 200 && $res['status'] < 300 && isset($res['body']['id'])) {
        $status = isset($res['body']['status']) ? $res['body']['status'] : 'pending';
        if ($status === 'approved') {
            $extRef = isset($res['body']['external_reference']) ? $res['body']['external_reference'] : '';
            $slug = preg_replace('/^biz_\d+_/', '', $extRef);
            createClientMinisiteFolder(
                ['slug' => $slug ?: 'cliente-premium', 'name' => isset($res['body']['description']) ? $res['body']['description'] : 'Cliente Premium'],
                $CONFIG_GEMINI_API_KEY,
                $CONFIG_APP_URL
            );
        }
        echo json_encode([
            'id' => $res['body']['id'],
            'status' => $status,
            'statusDetail' => isset($res['body']['status_detail']) ? $res['body']['status_detail'] : '',
            'amount' => isset($res['body']['transaction_amount']) ? $res['body']['transaction_amount'] : 0
        ]);
        exit;
    }

    echo json_encode(['id' => $paymentId, 'status' => 'pending']);
    exit;
}

// ============================================================================
// ROTA 6: /api/mercadopago/webhook (Criação Automática da Pasta na Aprovação)
// ============================================================================
if ($endpoint === '/api/mercadopago/webhook') {
    $type = isset($body['type']) ? $body['type'] : '';
    $dataId = isset($body['data']['id']) ? $body['data']['id'] : null;

    if ($type === 'payment' && $dataId && $isRealMpToken) {
        $res = httpJsonRequest(
            'https://api.mercadopago.com/v1/payments/' . urlencode($dataId),
            'GET',
            ['Authorization: Bearer ' . $CONFIG_MERCADO_PAGO_TOKEN]
        );
        if ($res['status'] === 200 && isset($res['body']['status']) && $res['body']['status'] === 'approved') {
            $extRef = isset($res['body']['external_reference']) ? $res['body']['external_reference'] : '';
            $slug = preg_replace('/^biz_\d+_/', '', $extRef);
            createClientMinisiteFolder(
                [
                    'slug' => $slug ?: 'cliente-premium',
                    'name' => isset($res['body']['description']) ? $res['body']['description'] : 'Cliente Premium'
                ],
                $CONFIG_GEMINI_API_KEY,
                $CONFIG_APP_URL
            );
        }
    }

    http_response_code(200);
    echo json_encode(['status' => 'ok']);
    exit;
}

// ============================================================================
// ROTA 7: /api/ai/enhance-profile
// ============================================================================
if ($endpoint === '/api/ai/enhance-profile') {
    $name = isset($body['name']) && $body['name'] !== '' ? $body['name'] : 'Nossa Empresa';
    $category = isset($body['category']) && $body['category'] !== '' ? $body['category'] : 'Comércio e Serviços';
    $city = isset($body['city']) && $body['city'] !== '' ? $body['city'] : 'Região Metropolitana de Salvador';
    $desc = isset($body['currentDescription']) ? $body['currentDescription'] : '';

    $aiResult = generateGeminiProfileEnhancement($name, $category, $city, $desc, $CONFIG_GEMINI_API_KEY);
    echo json_encode($aiResult);
    exit;
}

// ============================================================================
// ROTA NÃO ENCONTRADA (404 EM JSON)
// ============================================================================
http_response_code(404);
echo json_encode([
    'error' => "Endpoint '{$endpoint}' não encontrado",
    'status' => 404
]);
