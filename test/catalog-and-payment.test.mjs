import test from 'node:test';
import assert from 'node:assert/strict';
import { BUSINESSES } from '../src/data/businesses.ts';
import { CITIES } from '../src/data/cities.ts';

test('Catálogo contém exatamente 2.000 estabelecimentos', () => {
  assert.equal(BUSINESSES.length, 2000, `Esperado 2000 estabelecimentos, encontrado: ${BUSINESSES.length}`);
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
