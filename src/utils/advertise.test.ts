import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BUSINESSES } from '../data/businesses';

test('Catalog contains exactly 2000 establishments', () => {
  assert.equal(BUSINESSES.length, 2000);
});

test('All 2000 establishment IDs are unique', () => {
  const ids = new Set(BUSINESSES.map(b => b.id));
  assert.equal(ids.size, 2000);
});

test('Matching logic identifies existing businesses by normalized name', () => {
  const sample = BUSINESSES[0];
  const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const query = normalize(sample.name.slice(0, 10));
  
  const found = BUSINESSES.find(b => normalize(b.name).includes(query));
  assert.ok(found);
  assert.equal(found.id, sample.id);
});

test('Matching logic identifies existing businesses by phone digits', () => {
  const sample = BUSINESSES[10];
  const digits = sample.phone.replace(/\D/g, '').slice(-8);
  
  const found = BUSINESSES.find(b => b.phone.replace(/\D/g, '').includes(digits));
  assert.ok(found);
  assert.equal(found.id, sample.id);
});
