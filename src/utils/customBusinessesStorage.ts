import { Business } from '../types';

export const CUSTOM_BUSINESSES_STORAGE_KEY = 'melhordailha_custom_businesses_v1';

/**
 * Carrega todos os estabelecimentos cadastrados pelos usuários salvos no localStorage
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
    const existing = getStoredCustomBusinesses();
    // Remove duplicatas se o ID já existir
    const filtered = existing.filter(b => b.id !== business.id);
    const updated = [business, ...filtered];
    localStorage.setItem(CUSTOM_BUSINESSES_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn('Erro ao salvar cadastro no localStorage:', error);
    return [business];
  }
}

/**
 * Mescla os estabelecimentos mockados (os 2.000 locais) com os cadastros do localStorage
 */
export function mergeWithStoredBusinesses(baseBusinesses: Business[]): Business[] {
  const customList = getStoredCustomBusinesses();
  if (customList.length === 0) return baseBusinesses;

  const customIds = new Set(customList.map(b => b.id));
  const remainingBase = baseBusinesses.filter(b => !customIds.has(b.id));

  // Cadastros customizados ficam no topo com prioridade
  return [...customList, ...remainingBase];
}
