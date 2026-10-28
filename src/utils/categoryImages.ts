// Dynamic Contextual Cover Images by Business Category and Activity Segment
// High-resolution Unsplash imagery tailored for local businesses in Ilha de Itaparica and RMS

export interface CategoryImageInfo {
  coverUrl: string;
  label: string;
  tags: string[];
}

export const CATEGORY_DEFAULT_IMAGES: Record<string, CategoryImageInfo> = {
  'automoveis-motos-bicicletas': {
    coverUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80',
    label: 'Oficina Mecânica & Centro Automotivo',
    tags: ['Oficina', 'Peças', 'Manutenção']
  },
  'alimentacao-e-bebidas': {
    coverUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    label: 'Restaurante, Culinária & Gastronomia',
    tags: ['Restaurante', 'Alimentação', 'Delivery']
  },
  'construcao-e-reformas': {
    coverUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    label: 'Construção, Reformas & Materiais',
    tags: ['Construção', 'Reformas', 'Materiais']
  },
  'saude-e-bem-estar': {
    coverUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
    label: 'Clínica de Saúde, Consultório & Bem-estar',
    tags: ['Saúde', 'Clínica', 'Consultório']
  },
  'profissionais-liberais': {
    coverUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    label: 'Escritório Profissional & Consultoria',
    tags: ['Escritório', 'Consultoria', 'Serviços']
  },
  'beleza-e-cuidados-pessoais': {
    coverUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    label: 'Salão de Beleza, Barbearia & Estética',
    tags: ['Beleza', 'Estética', 'Barbearia']
  },
  'lojas-e-comercio': {
    coverUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    label: 'Loja, Comércio Varejista & Supermercado',
    tags: ['Comércio', 'Lojas', 'Varejo']
  },
  'tecnologia-e-servicos-digitais': {
    coverUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    label: 'Tecnologia, Assistência Técnica & Celulares',
    tags: ['Tecnologia', 'Informática', 'Assistência']
  },
  'eventos-e-festas': {
    coverUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    label: 'Espaço de Eventos, Buffet & Festas',
    tags: ['Eventos', 'Buffet', 'Festas']
  },
  'musica-e-entretenimento': {
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    label: 'Música ao Vivo, Artistas & Palco',
    tags: ['Música', 'Artistas', 'Show']
  },
  'moda-e-calcados': {
    coverUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80',
    label: 'Moda Praia, Roupas & Calçados',
    tags: ['Moda', 'Roupas', 'Calçados']
  },
  'graficas-e-comunicacao-visual': {
    coverUrl: 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&w=1200&q=80',
    label: 'Comunicação Visual, Gráfica & Fachadas',
    tags: ['Gráfica', 'Fachadas', 'Impressão']
  }
};

/**
 * Retorna uma imagem contextual em alta resolução baseada na categoria ou palavras-chave do negócio.
 */
export function getCategoryCoverImage(categoryIdentifier: string, businessName: string = ''): string {
  const normCategory = (categoryIdentifier || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const normName = (businessName || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // 1. Verificações especiais por tipo específico no nome do negócio
  if (normName.includes('pousada') || normName.includes('hotel') || normName.includes('resort') || normName.includes('hosped')) {
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
  }

  if (normName.includes('nautica') || normName.includes('barco') || normName.includes('lancha') || normName.includes('passeio') || normName.includes('mergulho')) {
    return 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80';
  }

  if (normName.includes('pet') || normName.includes('vet') || normName.includes('animal') || normName.includes('racao')) {
    return 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=80';
  }

  if (normName.includes('academia') || normName.includes('crossfit') || normName.includes('treino') || normName.includes('musculacao')) {
    return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80';
  }

  // 2. Busca exata por ID de categoria
  if (CATEGORY_DEFAULT_IMAGES[categoryIdentifier]) {
    return CATEGORY_DEFAULT_IMAGES[categoryIdentifier].coverUrl;
  }

  // 3. Busca por termos na categoria
  if (normCategory.includes('auto') || normCategory.includes('moto') || normCategory.includes('bike')) {
    return CATEGORY_DEFAULT_IMAGES['automoveis-motos-bicicletas'].coverUrl;
  }
  if (normCategory.includes('aliment') || normCategory.includes('bebid') || normCategory.includes('restaurante') || normCategory.includes('pizz')) {
    return CATEGORY_DEFAULT_IMAGES['alimentacao-e-bebidas'].coverUrl;
  }
  if (normCategory.includes('constru') || normCategory.includes('reform') || normCategory.includes('casa') || normCategory.includes('vidr')) {
    return CATEGORY_DEFAULT_IMAGES['construcao-e-reformas'].coverUrl;
  }
  if (normCategory.includes('saude') || normCategory.includes('bem-estar') || normCategory.includes('farm') || normCategory.includes('dent') || normCategory.includes('clinic')) {
    return CATEGORY_DEFAULT_IMAGES['saude-e-bem-estar'].coverUrl;
  }
  if (normCategory.includes('profiss') || normCategory.includes('auton') || normCategory.includes('advog') || normCategory.includes('contab')) {
    return CATEGORY_DEFAULT_IMAGES['profissionais-liberais'].coverUrl;
  }
  if (normCategory.includes('beleza') || normCategory.includes('cabel') || normCategory.includes('barbear') || normCategory.includes('estet')) {
    return CATEGORY_DEFAULT_IMAGES['beleza-e-cuidados-pessoais'].coverUrl;
  }
  if (normCategory.includes('tecnolog') || normCategory.includes('digit') || normCategory.includes('celul') || normCategory.includes('comput')) {
    return CATEGORY_DEFAULT_IMAGES['tecnologia-e-servicos-digitais'].coverUrl;
  }
  if (normCategory.includes('event') || normCategory.includes('fest') || normCategory.includes('buffet')) {
    return CATEGORY_DEFAULT_IMAGES['eventos-e-festas'].coverUrl;
  }
  if (normCategory.includes('music') || normCategory.includes('art') || normCategory.includes('show') || normCategory.includes('som')) {
    return CATEGORY_DEFAULT_IMAGES['musica-e-entretenimento'].coverUrl;
  }
  if (normCategory.includes('moda') || normCategory.includes('calc') || normCategory.includes('roup')) {
    return CATEGORY_DEFAULT_IMAGES['moda-e-calcados'].coverUrl;
  }
  if (normCategory.includes('grafic') || normCategory.includes('comunic') || normCategory.includes('visual')) {
    return CATEGORY_DEFAULT_IMAGES['graficas-e-comunicacao-visual'].coverUrl;
  }

  // Fallback geral com foto de comércio local
  return CATEGORY_DEFAULT_IMAGES['lojas-e-comercio'].coverUrl;
}
