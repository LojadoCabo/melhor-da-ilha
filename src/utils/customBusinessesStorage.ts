import { Business } from '../types';
import { fetchApiJson } from './api';

export const CUSTOM_BUSINESSES_STORAGE_KEY = 'melhordailha_custom_businesses_v1';
export const CLIENT_AUTH_SESSION_KEY = 'melhordailha_client_session_v1';

export interface ClientAuthSession {
  businessId: string;
  businessSlug: string;
  businessName: string;
  email?: string;
  whatsapp?: string;
  loggedAt: number;
}

/**
 * Converte o nome da empresa em um slug de pasta limpo (ex: "melhordailha.online/nome-da-empresa")
 */
export function toBusinessSlug(text: string): string {
  return (text || 'empresa')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'empresa';
}

/**
 * Carrega todos os estabelecimentos cadastrados ou editados pelos clientes no localStorage
 */
export function getStoredCustomBusinesses(): Business[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_BUSINESSES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.warn('Erro ao carregar cadastros locais do localStorage:', error);
  }
  return [];
}

/**
 * Salva ou atualiza um estabelecimento no localStorage
 */
export function saveCustomBusiness(business: Business): Business[] {
  if (typeof window === 'undefined') return [business];
  try {
    const cleanSlug = business.slug ? toBusinessSlug(business.slug) : toBusinessSlug(business.name);
    const normalized: Business = {
      ...business,
      slug: cleanSlug,
      miniSiteSlug: cleanSlug,
    };
    const existing = getStoredCustomBusinesses();
    const filtered = existing.filter(b => b.id !== normalized.id && b.slug !== normalized.slug);
    const updated = [normalized, ...filtered];
    localStorage.setItem(CUSTOM_BUSINESSES_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn('Erro ao salvar cadastro no localStorage:', error);
    return [business];
  }
}

/**
 * Mescla os estabelecimentos base com os cadastros/edições do localStorage
 */
export function mergeWithStoredBusinesses(baseBusinesses: Business[]): Business[] {
  const customList = getStoredCustomBusinesses();
  if (customList.length === 0) return baseBusinesses;

  const customIds = new Set(customList.map(b => b.id));
  const customSlugs = new Set(customList.map(b => b.slug));
  const remainingBase = baseBusinesses.filter(
    b => !customIds.has(b.id) && (!b.slug || !customSlugs.has(b.slug))
  );

  return [...customList, ...remainingBase];
}

/**
 * Localiza a empresa de um cliente a partir do E-mail ou número de WhatsApp cadastrado
 */
export function findBusinessByCredential(
  credential: string,
  allBusinesses: Business[]
): Business | null {
  const trimmed = (credential || '').trim().toLowerCase();
  if (!trimmed) return null;

  const digits = trimmed.replace(/\D/g, '');
  const isPhoneSearch = digits.length >= 8 && !trimmed.includes('@');

  // 1. Busca exata por e-mail ou WhatsApp/Telefone
  for (const biz of allBusinesses) {
    const bizEmail = (biz.email || '').trim().toLowerCase();
    if (trimmed.includes('@') && bizEmail && bizEmail === trimmed) {
      return biz;
    }

    if (isPhoneSearch) {
      const bizWhats = (biz.whatsapp || biz.ownerWhatsapp || '').replace(/\D/g, '');
      const bizPhone = (biz.phone || '').replace(/\D/g, '');
      const shortInput = digits.slice(-8);
      if (
        (bizWhats && bizWhats.slice(-8) === shortInput) ||
        (bizPhone && bizPhone.slice(-8) === shortInput)
      ) {
        return biz;
      }
    }
  }

  // 2. Busca por slug ou nome da empresa caso o cliente digite o e-mail corporativo ou nome
  const emailPrefix = trimmed.includes('@') ? trimmed.split('@')[0] : trimmed;
  const slugCandidate = toBusinessSlug(emailPrefix);

  const bySlugOrName = allBusinesses.find(
    b =>
      b.slug === slugCandidate ||
      toBusinessSlug(b.name) === slugCandidate ||
      b.name.toLowerCase().includes(emailPrefix)
  );

  return bySlugOrName || null;
}

/**
 * Sessão de Login do Lojista (via E-mail ou WhatsApp)
 */
export function getLoggedClientSession(): ClientAuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CLIENT_AUTH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ClientAuthSession;
  } catch {
    return null;
  }
}

export function saveLoggedClientSession(session: ClientAuthSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CLIENT_AUTH_SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('Erro ao salvar sessão do lojista:', err);
  }
}

export function clearLoggedClientSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CLIENT_AUTH_SESSION_KEY);
  } catch {
    // ignore
  }
}

/**
 * Aciona o backend (Node.js ou api.php na HostGator) para criar automaticamente a pasta
 * separada do cliente (ex: melhordailha.online/nome-da-empresa) com dados do Maps,
 * redes sociais e fotos otimizadas com IA (Gemini).
 */
export async function provisionClientMiniSite(
  business: Partial<Business>,
  clientEmail?: string,
  clientWhatsapp?: string
): Promise<{
  slug: string;
  folderUrl: string;
  aiPitch?: string;
  aiHighlights?: string[];
  enhancedPhotos?: string[];
}> {
  const slug = toBusinessSlug(business.slug || business.name || 'empresa');
  const folderUrl = `https://melhordailha.online/${slug}`;

  try {
    const res = await fetchApiJson<{
      slug?: string;
      folderUrl?: string;
      aiPitch?: string;
      aiHighlights?: string[];
      enhancedPhotos?: string[];
    }>('/api/minisite/provision', {
      method: 'POST',
      body: JSON.stringify({
        business: {
          ...business,
          slug,
          email: clientEmail || business.email || '',
          whatsapp: clientWhatsapp || business.whatsapp || business.phone || '',
        },
      }),
    });

    return {
      slug: res?.slug || slug,
      folderUrl: res?.folderUrl || folderUrl,
      aiPitch: res?.aiPitch,
      aiHighlights: res?.aiHighlights,
      enhancedPhotos: res?.enhancedPhotos,
    };
  } catch {
    return {
      slug,
      folderUrl,
    };
  }
}
