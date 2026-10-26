import test from 'node:test';
import assert from 'node:assert/strict';
import { BUSINESSES } from './businesses';
import { CITIES } from './cities';

test('every municipality in CITIES has at least 5 businesses', () => {
  assert.equal(CITIES.length, 13, 'There should be 13 official RMS municipalities');

  for (const city of CITIES) {
    const cityBusinesses = BUSINESSES.filter(b => b.cityId === city.id);
    assert.ok(
      cityBusinesses.length >= 5,
      `Municipality ${city.name} (${city.id}) has ${cityBusinesses.length} businesses, expected at least 5`
    );
  }
});

test('every business has valid address, phone or whatsapp, and coordinates/mapsUrl', () => {
  for (const b of BUSINESSES) {
    assert.ok(b.name && b.name.trim().length > 0, `Business ${b.id} missing name`);
    assert.ok(b.address && b.address.trim().length > 0, `Business ${b.name} missing address`);
    assert.ok(b.whatsapp && b.whatsapp.trim().length > 0, `Business ${b.name} missing whatsapp`);
    assert.ok(b.coverImage && b.coverImage.trim().length > 0, `Business ${b.name} missing coverImage`);
    assert.ok(b.googleMapsUrl && b.googleMapsUrl.includes('maps.google.com'), `Business ${b.name} missing googleMapsUrl`);
    assert.ok(
      ['active', 'outdated', 'none'].includes(b.websiteStatus || ''),
      `Business ${b.name} has invalid websiteStatus: ${b.websiteStatus}`
    );
  }
});

test('total business count is at least 65 (13 municipalities * 5 businesses)', () => {
  assert.ok(BUSINESSES.length >= 65, `Expected at least 65 businesses, found ${BUSINESSES.length}`);
});
