/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  reviewerLevel?: string;
  location: string;
  cityId: string;
  avatarUrl: string;
  rating: number;
  highlight: string;
  quote: string;
  businessMentioned: string;
  businessId: string;
  tag: string;
  category: 'morador' | 'empresa' | 'turista' | 'urgencia';
  date: string;
  helpfulCount: number;
  googleMapsReview: boolean;
  businessRatingInMaps?: number;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Marcos Vinícius Brandão',
    role: 'Local Guide · Nível 7 (184 avaliações no Google Maps)',
    reviewerLevel: 'Local Guide Nível 7',
    location: 'Orla Marítima · Madre de Deus',
    cityId: 'madre-de-deus',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    highlight: 'Melhor moqueca de Madre de Deus com vista incrível da Baía',
    quote: 'Restaurante espetacular na orla de Madre de Deus. A moqueca mista de camarão com peixe fresco e o pirão quentinho são os melhores da região. O atendimento foi impecável, cerveja trincando e estacionamento fácil. Encontrei o contato atualizado no guia e reservei a mesa à beira-mar com antecedência.',
    businessMentioned: 'Restaurante & Frutos do Mar Flor de Lis',
    businessId: 'restaurante-flor-de-lis-madre',
    tag: 'Avaliação no Google Maps · Gastronomia',
    category: 'morador',
    date: 'Avaliado em Jan/2025',
    helpfulCount: 54,
    googleMapsReview: true,
    businessRatingInMaps: 4.9
  },
  {
    id: 'test-2',
    name: 'Dra. Cláudia Vasconcelos',
    role: 'Moradora & Médica Veterinária (Vera Cruz)',
    reviewerLevel: 'Local Guide Nível 5',
    location: 'Rodovia BA-001 · Vera Cruz (Ilha de Itaparica)',
    cityId: 'vera-cruz',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    highlight: 'Socorro rápido na BA-001 às 22h com atendimento prestativo',
    quote: 'Meu pneu rasgou voltando de Cacha-Pregos à noite no trecho escuro da BA-001. Pelo Guia MELHOR DA ILHA abri o WhatsApp da Borracharia Ilha 24h e em menos de 20 minutos o rapaz chegou de moto com compressor e ferramentas. Preço super honesto e salvou a viagem. Recomendo de olhos fechados!',
    businessMentioned: 'Borracharia e Mecânica Ilha 24 Horas',
    businessId: 'borracharia-mecanica-ilha-24h',
    tag: 'Avaliação no Google Maps · Socorro 24h',
    category: 'urgencia',
    date: 'Avaliado em Fev/2025',
    helpfulCount: 68,
    googleMapsReview: true,
    businessRatingInMaps: 4.9
  },
  {
    id: 'test-3',
    name: 'Rodrigo & Juliana Menezes',
    role: 'Turistas de Belo Horizonte · MG',
    reviewerLevel: 'Avaliador Frequente Google Maps',
    location: 'Vila dos Pescadores · Mata de São João (Praia do Forte)',
    cityId: 'mata-de-sao-joao',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    highlight: 'Hospedagem charmosa, café da manhã regional e atendimento nota mil',
    quote: 'A Pousada e Bistrô João Sol é um verdadeiro refúgio de paz na Praia do Forte. Jardim impecável com pássaros, piscina refrescante, tapioca e beiju feitos na hora e quartos com ar super silencioso. Os proprietários nos deram as melhores dicas de passeios pela Linha Verde.',
    businessMentioned: 'Pousada e Bistrô João Sol',
    businessId: 'pousada-bistro-joao-sol-praia-do-forte',
    tag: 'Avaliação no Google Maps · Pousadas',
    category: 'turista',
    date: 'Avaliado em Jan/2025',
    helpfulCount: 43,
    googleMapsReview: true,
    businessRatingInMaps: 4.8
  },
  {
    id: 'test-4',
    name: 'Eng. Rogério Meirelles',
    role: 'Engenheiro Civil e Coordenador de Obras',
    reviewerLevel: 'Local Guide Nível 6 · RMS',
    location: 'Centro Industrial de Aratu (CIA) · Simões Filho',
    cityId: 'simoes-filho',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    highlight: 'Esquadrias, vidros temperados e corte sob medida sem atrasos',
    quote: 'Já fechamos três etapas da nossa obra industrial no CIA com a Vidraçaria & Alumínio CIA. A cotação via WhatsApp foi rápida, o orçamento veio detalhado e a entrega dos perfis e vidros temperados aconteceu no dia exato combinado. Atendimento técnico de primeira em Simões Filho.',
    businessMentioned: 'Vidraçaria & Alumínio CIA',
    businessId: 'vidracaria-aluminio-cia-simoes-filho',
    tag: 'Avaliação no Google Maps · Indústria & Obras',
    category: 'empresa',
    date: 'Avaliado em Fev/2025',
    helpfulCount: 37,
    googleMapsReview: true,
    businessRatingInMaps: 4.9
  },
  {
    id: 'test-5',
    name: 'Beatriz Fontes Mendonça',
    role: 'Produtora de Eventos & Cerimonialista',
    reviewerLevel: 'Avaliadora Verificada Google Maps',
    location: 'Vilas do Atlântico · Lauro de Freitas & Salvador',
    cityId: 'salvador',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    highlight: 'Show de voz e violão emocionante em mini wedding à beira-mar',
    quote: 'Contratamos a produção do Mingo Neto para a recepção de um casamento ao entardecer. Repertório fino misturando MPB, Bossa Nova e o melhor do cancioneiro baiano, com sonorização cristalina e pontualidade exemplar. Todos os convidados elogiaram muito!',
    businessMentioned: 'Mingo Neto Produções Musicais & Show Voz e Violão',
    businessId: 'mingo-neto-producoes-salvador',
    tag: 'Avaliação no Google Maps · Música & Shows',
    category: 'empresa',
    date: 'Avaliado em Dez/2024',
    helpfulCount: 52,
    googleMapsReview: true,
    businessRatingInMaps: 5.0
  },
  {
    id: 'test-6',
    name: 'Carla Silveira Dias',
    role: 'Farmacêutica e Moradora de Dias d\'Ávila',
    reviewerLevel: 'Local Guide Nível 5',
    location: 'Avenida Brasil · Dias d\'Ávila',
    cityId: 'dias-davila',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    highlight: 'Fórmulas manipuladas com rigor técnico e entrega pontual',
    quote: 'Manipulo meus medicamentos e cosméticos dermatológicos há mais de dois anos na Farmafórmula Dias d\'Ávila. O atendimento pelo WhatsApp é muito ágil, as farmacêuticas tiram todas as dúvidas e a embalagem vem lacrada com laudo de qualidade. Melhor de Dias d\'Ávila.',
    businessMentioned: 'Farmafórmula Dias d\'Ávila',
    businessId: 'farmaformula-dias-davila',
    tag: 'Avaliação no Google Maps · Farmácia & Saúde',
    category: 'morador',
    date: 'Avaliado em Jan/2025',
    helpfulCount: 29,
    googleMapsReview: true,
    businessRatingInMaps: 4.8
  },
  {
    id: 'test-7',
    name: 'Eduardo Santana Filho',
    role: 'Gerente de TI & Infraestrutura',
    reviewerLevel: 'Local Guide Nível 6 · Simões Filho',
    location: 'Centro · Simões Filho',
    cityId: 'simoes-filho',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    highlight: 'Peças de informática, manutenção de servidores e redes no mesmo dia',
    quote: 'A IP Computadores salvou o servidor do nosso escritório em Simões Filho quando a fonte queimou em plena segunda-feira de fechamento contábil. Tinham a peça em estoque pronta entrega e o técnico configurou tudo com rapidez e conhecimento. Excelente custo-benefício.',
    businessMentioned: 'IP Computadores & Informática',
    businessId: 'ip-computadores-simoes-filho',
    tag: 'Avaliação no Google Maps · Tecnologia & TI',
    category: 'empresa',
    date: 'Avaliado em Fev/2025',
    helpfulCount: 31,
    googleMapsReview: true,
    businessRatingInMaps: 4.8
  },
  {
    id: 'test-8',
    name: 'Renato Barreto Lima',
    role: 'Professor Universitário & Morador',
    reviewerLevel: 'Local Guide Nível 4 · Lauro de Freitas',
    location: 'Estrada do Coco · Lauro de Freitas',
    cityId: 'lauro-de-freitas',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    highlight: 'Melhor preço de armações e lentes multifocais de Lauro de Freitas',
    quote: 'Fiz meus óculos com lentes multifocais com antirreflexo na ótica de Lauro de Freitas e economizei mais de 40% em comparação com as óticas de shopping. Exame de vista cuidadoso, prazo cumprido antes do previsto e atendimento nota dez.',
    businessMentioned: 'Ótica Mercadão dos Óculos Lauro de Freitas',
    businessId: 'otica-mercadao-lauro-de-freitas',
    tag: 'Avaliação no Google Maps · Ótica & Visão',
    category: 'morador',
    date: 'Avaliado em Jan/2025',
    helpfulCount: 46,
    googleMapsReview: true,
    businessRatingInMaps: 4.9
  },
  {
    id: 'test-9',
    name: 'Sérgio Murilo Pinheiro',
    role: 'Motociclista e Morador da Ilha',
    reviewerLevel: 'Cliente Verificado · Ilha de Itaparica',
    location: 'Cacha Pregos · Vera Cruz (Ilha de Itaparica)',
    cityId: 'vera-cruz',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    highlight: 'Revisão e peças de motos com honestidade e rapidez na Ilha',
    quote: 'Quem anda de moto na Ilha de Itaparica sabe da importância de ter mecânica de confiança com peças e socorro rápido. A oficina sempre resolveu minhas revisões com preço justo e equipe prestativa.',
    businessMentioned: 'Motopeças & Oficina Rápida Cacha Pregos',
    businessId: 'motopecas-e-socorro-cacha-pregos',
    tag: 'Avaliação no Google Maps · Oficina & Moto Peças',
    category: 'urgencia',
    date: 'Avaliado em Fev/2025',
    helpfulCount: 59,
    googleMapsReview: true,
    businessRatingInMaps: 4.9
  },
  {
    id: 'test-10',
    name: 'Márcio Vinícius Cavalcante',
    role: 'Cliente Verificado · Salvador & RMS',
    reviewerLevel: 'Local Guide Nível 5 · Salvador',
    location: 'Caminho das Árvores · Salvador & RMS',
    cityId: 'salvador',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    rating: 5,
    highlight: 'Envio 100% discreto, atendimento impecável e produtos com procedência',
    quote: 'Fiz meu pedido da linha Tada Power e Erectus com a Loja do Cabo. Atendimento excelente no WhatsApp, tiraram todas as dúvidas com respeito e discrição total. O pacote chegou em Salvador no dia seguinte, super bem embalado sem nenhuma identificação por fora. Suporte nota mil!',
    businessMentioned: 'Loja do Cabo Ltda',
    businessId: 'loja-do-cabo-ltda-salvador',
    tag: 'Avaliação no Google Maps · Saúde & Vitalidade',
    category: 'morador',
    date: 'Avaliado em Fev/2025',
    helpfulCount: 71,
    googleMapsReview: true,
    businessRatingInMaps: 5.0
  }
];
