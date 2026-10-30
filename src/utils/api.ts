/**
 * Utilitário central de requisições de API com tratamento seguro de JSON e detecção de fallback HTML
 */

export function getApiBaseUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return '';
}

export interface ApiFetchError extends Error {
  status?: number;
  isHtmlResponse?: boolean;
  data?: any;
  raw?: string;
}

/**
 * Executa requisição para a API garantindo que a resposta seja JSON válida,
 * evitando erros como "Unexpected token '<', '<!doctype...' is not valid JSON".
 */
export async function fetchApiJson<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${cleanEndpoint}`;

  const defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
  };
  if (options.body && typeof options.body === 'string') {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    });
  } catch (netErr: any) {
    const err: ApiFetchError = new Error(
      `Não foi possível conectar ao servidor backend em '${fullUrl}'. Verifique se a aplicação Node.js está ativa.`
    );
    err.data = netErr;
    throw err;
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (isJson) {
    const data = await response.json();
    if (!response.ok) {
      const errorMsg = data?.error || data?.message || `Erro no servidor (${response.status}): ${response.statusText}`;
      const err: ApiFetchError = new Error(errorMsg);
      err.data = data;
      err.status = response.status;
      throw err;
    }
    return data as T;
  }

  // Se a resposta não for JSON (por exemplo, quando o Apache retorna index.html em 404/200 SPA rewrite)
  const rawText = await response.text();
  const trimmed = rawText.trim();
  const isHtml =
    trimmed.toLowerCase().startsWith('<') ||
    trimmed.toLowerCase().includes('<!doctype') ||
    contentType.toLowerCase().includes('text/html');

  if (isHtml) {
    let diagnostic = '';
    if (response.status === 404) {
      diagnostic = `O endpoint '${cleanEndpoint}' não foi encontrado no servidor (404).`;
    } else if (response.status === 200) {
      diagnostic = `O servidor web retornou o arquivo HTML 'index.html' em vez da resposta da API. Isso ocorre em hospedagens estáticas (como HostGator/cPanel) se a aplicação Node.js (server.js) não estiver rodando ou se as requisições /api não estiverem configuradas para o proxy reverso.`;
    } else {
      diagnostic = `O servidor retornou uma página HTML com código HTTP ${response.status} (${response.statusText}).`;
    }

    const err: ApiFetchError = new Error(diagnostic);
    err.status = response.status;
    err.isHtmlResponse = true;
    err.raw = rawText;
    throw err;
  }

  // Tenta parse de fallback caso o content-type esteja ausente
  try {
    const parsed = JSON.parse(rawText);
    if (!response.ok) {
      const err: ApiFetchError = new Error(parsed?.error || parsed?.message || `Erro HTTP ${response.status}`);
      err.data = parsed;
      err.status = response.status;
      throw err;
    }
    return parsed as T;
  } catch {
    const err: ApiFetchError = new Error(
      `Resposta inesperada do servidor para '${cleanEndpoint}': ${trimmed.slice(0, 120)}`
    );
    err.status = response.status;
    throw err;
  }
}
