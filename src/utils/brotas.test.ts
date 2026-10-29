import test from 'node:test';
import assert from 'node:assert/strict';
import { BROTAS_EXPANSION_BATCH39 } from '../data/brotasBusinessesBatch39';
import { BUSINESSES } from '../data/businesses';

test('Brotas Expansion Batch 39 has exactly 137 establishments', () => {
  assert.equal(BROTAS_EXPANSION_BATCH39.length, 137, 'Batch 39 must contain exactly 137 establishments');
});

test('All Brotas establishments belong to Salvador and Brotas neighborhood', () => {
  for (const b of BROTAS_EXPANSION_BATCH39) {
    assert.equal(b.cityId, 'salvador', `${b.name} cityId must be 'salvador'`);
    assert.equal(b.cityName, 'Salvador', `${b.name} cityName must be 'Salvador'`);
    assert.equal(b.neighborhood, 'Brotas', `${b.name} neighborhood must be 'Brotas'`);
    assert.ok(b.address.includes('Salvador - BA'), `${b.name} address must mention Salvador - BA`);
    assert.ok(b.phone.startsWith('(71)'), `${b.name} phone must have DDD 71`);
    assert.ok(b.whatsapp.startsWith('5571'), `${b.name} whatsapp must start with 5571`);
    assert.ok(b.rating >= 4.0 && b.rating <= 5.0, `${b.name} rating must be valid`);
    assert.ok(b.services && b.services.length > 0, `${b.name} must list services`);
    assert.ok(b.tags && b.tags.length > 0, `${b.name} must list tags`);
  }
});

test('All business IDs and slugs in BUSINESSES are globally unique', () => {
  const ids = new Set();
  const slugs = new Set();

  for (const b of BUSINESSES) {
    assert.ok(!ids.has(b.id), `Duplicate business ID detected: ${b.id}`);
    assert.ok(!slugs.has(b.slug), `Duplicate business slug detected: ${b.slug}`);
    ids.add(b.id);
    slugs.add(b.slug);
  }

  assert.equal(BUSINESSES.length >= 2137, true, 'Total catalog count should be at least 2137');
});
