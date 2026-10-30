import test from 'node:test';
import assert from 'node:assert/strict';
import { BUSINESSES } from '../src/data/businesses.ts';
import { CITIES } from '../src/data/cities.ts';
import { getCategoryCoverImage } from '../src/utils/categoryImages.ts';
import { mergeWithStoredBusinesses } from '../src/utils/customBusinessesStorage.ts';

test('Catálogo contém pelo menos 2.137 estabelecimentos (incluindo Salvador & Brotas)', () => {
  assert.equal(BUSINESSES.length, 2137, `Esperado 2137 estabelecimentos, encontrado: ${BUSINESSES.length}`);
});

test('Não há IDs duplicados no catálogo', () => {
  const ids = new Set();
  for (const b of BUSINESSES) {
    assert.equal(ids.has(b.id), false, `ID duplicado encontrado: ${b.id}`);
    ids.add(b.id);
  }
});

test('Todos os 13 municípios da RMS e Ilha possuem estabelecimentos', () => {
  for (const city of CITIES) {
    const count = BUSINESSES.filter(b => b.cityId === city.id || b.cityName === city.name).length;
    assert.ok(count > 0, `Cidade ${city.name} não possui estabelecimentos`);
  }
});

test('Silveira Motos não é pagante premium indevido', () => {
  const silveira = BUSINESSES.find(b => b.name?.toLowerCase().includes('silveira motos'));
  if (silveira) {
    assert.notEqual(silveira.isRmsPremium, true, 'Silveira Motos não deve ser pagante premium');
  }
});

test('getCategoryCoverImage retorna imagem contextual específica para cada categoria', () => {
  const foodImg = getCategoryCoverImage('alimentacao-e-bebidas');
  const autoImg = getCategoryCoverImage('automoveis-motos-bicicletas');
  const healthImg = getCategoryCoverImage('saude-e-bem-estar');
  const constImg = getCategoryCoverImage('construcao-e-reformas');

  assert.ok(foodImg.startsWith('http'), 'Deve retornar URL válida');
  assert.ok(autoImg.startsWith('http'), 'Deve retornar URL válida');
  assert.notEqual(foodImg, autoImg, 'Alimentação e Automotivo devem ter capas diferentes');
  assert.notEqual(foodImg, healthImg, 'Alimentação e Saúde devem ter capas diferentes');
  assert.notEqual(healthImg, constImg, 'Saúde e Construção devem ter capas diferentes');
});

test('getCategoryCoverImage detecta palavras-chave de hotel/pousada e náutica', () => {
  const pousadaImg = getCategoryCoverImage('lojas-e-comercio', 'Pousada Mar e Sol');
  const nauticaImg = getCategoryCoverImage('lojas-e-comercio', 'Lancha Náutica Cacha-Pregos');

  assert.ok(pousadaImg.startsWith('http'));
  assert.ok(nauticaImg.startsWith('http'));
  assert.notEqual(pousadaImg, nauticaImg);
});
