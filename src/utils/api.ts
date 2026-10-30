/**
 * Utilitário central de requisições de API com tratamento seguro de JSON,
 * suporte automático a api.php (HostGator/cPanel) e detecção de fallback HTML.
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

async function executeSingleFetch<T = any>(
  fullUrl: string,
  cleanEndpoint: string,
  options: RequestInit = {}
): Promise<T> {
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
      `Não foi possível conectar ao servidor backend em '${fullUrl}'.`
    );
    err.data = netErr;
    throw err;
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (isJson) {
    const data = await response.json();
    if (!response.ok) {
      const errorMsg =
        data?.error || data?.message || `Erro no servidor (${response.status}): ${response.statusText}`;
      const err: ApiFetchError = new Error(errorMsg);
      err.data = data;
      err.status = response.status;
      throw err;
    }
    return data as T;
  }

  const rawText = await response.text();
  const trimmed = rawText.trim();
  const isHtml =
    trimmed.toLowerCase().startsWith('<') ||
    trimmed.toLowerCase().includes('<!doctype') ||
    trimmed.toLowerCase().includes('<?php') ||
    contentType.toLowerCase().includes('text/html');

  if (isHtml) {
    let diagnostic = '';
    if (response.status === 404) {
      diagnostic = `O endpoint '${cleanEndpoint}' não foi encontrado no servidor (404 HTML).`;
    } else if (response.status === 200) {
      diagnostic = `O servidor web retornou o arquivo HTML 'index.html' em vez da resposta da API.`;
    } else {
      diagnostic = `O servidor retornou uma página HTML com código HTTP ${response.status} (${response.statusText}).`;
    }

    const err: ApiFetchError = new Error(diagnostic);
    err.status = response.status;
    err.isHtmlResponse = true;
    err.raw = rawText;
    throw err;
  }

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

/**
 * Executa requisição para a API garantindo que a resposta seja JSON válida.
 * Em hospedagens compartilhadas (HostGator/cPanel), se /api/* retornar HTML ou 404,
 * tenta automaticamente o motor nativo /api.php?endpoint=...
 */
export async function fetchApiJson<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const primaryUrl = `${baseUrl}${cleanEndpoint}`;

  try {
    return await executeSingleFetch<T>(primaryUrl, cleanEndpoint, options);
  } catch (primaryErr: any) {
    // Se a rota /api/* retornou HTML (Apache sem .htaccess) ou 404, tenta o /api.php diretamente
    if (
      (primaryErr?.isHtmlResponse || primaryErr?.status === 404) &&
      cleanEndpoint.startsWith('/api/')
    ) {
      const phpFallbackUrl = `${baseUrl}/api.php?endpoint=${encodeURIComponent(cleanEndpoint)}`;
      try {
        return await executeSingleFetch<T>(phpFallbackUrl, cleanEndpoint, options);
      } catch {
        // Preserva o erro original formatado caso o fallback também não esteja disponível
        throw primaryErr;
      }
    }
    throw primaryErr;
  }
}
