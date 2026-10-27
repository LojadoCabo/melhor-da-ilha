import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeText, matchesQuery, filterBusinesses, sortBusinesses, getCategoryCounts } from './filter';
import { Business, FilterState } from '../types';

const mockBusinesses: Business[] = [
  {
    id: 'b1',
    name: 'Silveira Motos & Peças',
    slug: 'silveira-motos',
    tagline: 'Oficina de motos e peças em Mar Grande',
    description: 'Revisão, troca de óleo e socorro mecânico',
    categoryId: 'automoveis-motos-bicicletas',
    categoryName: 'Automóveis, Motos e Bicicletas',
    cityId: 'vera-cruz',
    cityName: 'Vera Cruz',
    neighborhood: 'Mar Grande',
    address: 'Av. Beira Mar, 420',
    phone: '(71) 99117-1830',
    whatsapp: '5571991171830',
    rating: 4.9,
    reviewCount: 120,
    priceLevel: '$$',
    tags: ['motos', 'oficina', 'pecas'],
    services: ['revisao', 'troca de oleo'],
    isVerified: true,
    isFeatured: true,
    hasDelivery: true,
    isOpenNow: true,
    openingHoursText: 'Seg-Sáb 08:00 - 18:00',
    coverImage: 'https://example.com/img1.jpg'
  },
  {
    id: 'b2',
    name: 'Restaurante Manguezal',
    slug: 'restaurante-manguezal',
    tagline: 'Moqueca baiana à beira mar',
    description: 'Frutos do mar frescos na praia de Ponta de Areia',
    categoryId: 'alimentacao-e-bebidas',
    categoryName: 'Alimentação e Bebidas',
    cityId: 'itaparica',
    cityName: 'Itaparica',
    neighborhood: 'Ponta de Areia',
    address: 'Praia de Ponta de Areia, 10',
    phone: '(71) 99120-4450',
    whatsapp: '5571991204450',
    rating: 4.5,
    reviewCount: 300,
    priceLevel: '$$$',
    tags: ['moqueca', 'praia', 'almoco'],
    services: ['delivery', 'mesas pe na areia'],
    isVerified: false,
    isFeatured: false,
    hasDelivery: false,
    isOpenNow: false,
    openingHoursText: 'Ter-Dom 11:00 - 22:00',
    coverImage: 'https://example.com/img2.jpg'
  }
];

const baseFilters: FilterState = {
  query: '',
  categoryId: 'all',
  cityId: 'all',
  neighborhood: 'all',
  openNowOnly: false,
  verifiedOnly: false,
  deliveryOnly: false,
  whatsappOnly: false,
  minRating: 0,
  priceLevel: 'all',
  sortBy: 'featured'
};

test('normalizeText handles accents and uppercase', () => {
  assert.equal(normalizeText('Itaparica & Açougue São João'), 'itaparica & acougue sao joao');
  assert.equal(normalizeText('  VÉRA  CRÚZ  '), 'vera  cruz');
});

test('matchesQuery finds matches across name, description, tags, and services', () => {
  assert.equal(matchesQuery(mockBusinesses[0], 'motos'), true);
  assert.equal(matchesQuery(mockBusinesses[0], 'mar grande'), true);
  assert.equal(matchesQuery(mockBusinesses[0], 'oleo'), true);
  assert.equal(matchesQuery(mockBusinesses[0], 'moqueca'), false);
});

test('filterBusinesses filters by category and city correctly', () => {
  const veraCruzOnly = filterBusinesses(mockBusinesses, {
    ...baseFilters,
    cityId: 'vera-cruz'
  });
  assert.equal(veraCruzOnly.length, 1);
  assert.equal(veraCruzOnly[0].id, 'b1');

  const foodOnly = filterBusinesses(mockBusinesses, {
    ...baseFilters,
    categoryId: 'alimentacao-e-bebidas'
  });
  assert.equal(foodOnly.length, 1);
  assert.equal(foodOnly[0].id, 'b2');
});

test('filterBusinesses filters by openNow and verified', () => {
  const verifiedOnly = filterBusinesses(mockBusinesses, {
    ...baseFilters,
    verifiedOnly: true
  });
  assert.equal(verifiedOnly.length, 1);
  assert.equal(verifiedOnly[0].id, 'b1');

  const openOnly = filterBusinesses(mockBusinesses, {
    ...baseFilters,
    openNowOnly: true
  });
  assert.equal(openOnly.length, 1);
  assert.equal(openOnly[0].id, 'b1');
});

test('sortBusinesses sorts by rating, review count and name', () => {
  const byReviews = sortBusinesses(mockBusinesses, 'reviews');
  assert.equal(byReviews[0].id, 'b2'); // 300 reviews vs 120

  const byRating = sortBusinesses(mockBusinesses, 'rating');
  assert.equal(byRating[0].id, 'b1'); // 4.9 vs 4.5

  const byName = sortBusinesses(mockBusinesses, 'name');
  assert.equal(byName[0].id, 'b2'); // "Restaurante" before "Silveira"
});

test('getCategoryCounts aggregates counts accurately', () => {
  const counts = getCategoryCounts(mockBusinesses);
  assert.equal(counts['automoveis-motos-bicicletas'], 1);
  assert.equal(counts['alimentacao-e-bebidas'], 1);
});

test('filterBusinesses filters by websiteFilter', () => {
  const bizWithWebsite = {
    ...mockBusinesses[0],
    websiteStatus: 'active' as const,
    website: 'https://silveiramotos.com.br'
  };
  const bizWithoutWebsite = {
    ...mockBusinesses[1],
    websiteStatus: 'none' as const,
    website: undefined
  };
  const list = [bizWithWebsite, bizWithoutWebsite];

  const withWebOnly = filterBusinesses(list, { ...baseFilters, websiteFilter: 'has_website' });
  assert.equal(withWebOnly.length, 1);
  assert.equal(withWebOnly[0].id, 'b1');

  const directWAOnly = filterBusinesses(list, { ...baseFilters, websiteFilter: 'direct_whatsapp' });
  assert.equal(directWAOnly.length, 1);
  assert.equal(directWAOnly[0].id, 'b2');
});
