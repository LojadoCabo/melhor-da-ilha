import test from 'node:test';
import assert from 'node:assert/strict';
import { TESTIMONIALS } from './testimonials';
import { BUSINESSES } from './businesses';

test('testimonials dataset has valid entries', () => {
  assert.ok(TESTIMONIALS.length >= 5, `Expected at least 5 testimonials, got ${TESTIMONIALS.length}`);

  const businessIdSet = new Set(BUSINESSES.map(b => b.id));

  for (const t of TESTIMONIALS) {
    assert.ok(t.id && t.id.length > 0, `Missing id for testimonial: ${t.name}`);
    assert.ok(t.name && t.name.length > 0, `Missing name for testimonial: ${t.id}`);
    assert.ok(t.quote && t.quote.length > 20, `Quote too short for testimonial: ${t.id}`);
    assert.ok(t.highlight && t.highlight.length > 10, `Highlight too short for testimonial: ${t.id}`);
    assert.ok(t.avatarUrl && t.avatarUrl.startsWith('http'), `Invalid avatarUrl: ${t.avatarUrl}`);
    assert.equal(t.rating, 5, `Expected 5 stars rating: ${t.id}`);
    assert.ok(t.location && t.location.length > 0, `Missing location: ${t.id}`);
    assert.ok(t.businessMentioned && t.businessMentioned.length > 0, `Missing businessMentioned: ${t.id}`);
    assert.ok(t.googleMapsReview, `Testimonial must be flagged as Google Maps review: ${t.id}`);
    assert.ok(businessIdSet.has(t.businessId), `businessId ${t.businessId} must exist in BUSINESSES`);
  }
});

test('every testimonial avatar URL is distinct', () => {
  const avatars = TESTIMONIALS.map(t => t.avatarUrl);
  const uniqueAvatars = new Set(avatars);
  assert.equal(uniqueAvatars.size, avatars.length, 'All testimonial avatars must be unique');
});
