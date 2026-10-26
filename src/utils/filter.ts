import { Business, FilterState } from '../types';

/**
 * Normalizes text for accent-insensitive and case-insensitive matching
 */
export function normalizeText(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Checks if a business matches a search query
 */
export function matchesQuery(business: Business, query: string): boolean {
  if (!query) return true;
  const q = normalizeText(query);
  const terms = q.split(/\s+/).filter(Boolean);

  const searchableString = normalizeText(
    `${business.name} ${business.tagline} ${business.description} ${business.categoryName} ${business.cityName} ${business.neighborhood} ${business.address} ${(business.tags || []).join(' ')} ${(business.services || []).join(' ')}`
  );

  return terms.every(term => searchableString.includes(term));
}

/**
 * Filters a business list against the full filter state
 */
export function filterBusinesses(businesses: Business[], filters: FilterState): Business[] {
  return businesses.filter(b => {
    // Search query
    if (filters.query && !matchesQuery(b, filters.query)) {
      return false;
    }

    // Category
    if (filters.categoryId && filters.categoryId !== 'all' && b.categoryId !== filters.categoryId) {
      return false;
    }

    // City
    if (filters.cityId && filters.cityId !== 'all' && b.cityId !== filters.cityId) {
      return false;
    }

    // Neighborhood / District
    if (filters.neighborhood && filters.neighborhood !== 'all' && b.neighborhood !== filters.neighborhood) {
      return false;
    }

    // Open now
    if (filters.openNowOnly && !b.isOpenNow) {
      return false;
    }

    // Verified only
    if (filters.verifiedOnly && !b.isVerified) {
      return false;
    }

    // Delivery only
    if (filters.deliveryOnly && !b.hasDelivery) {
      return false;
    }

    // WhatsApp contact only
    if (filters.whatsappOnly && !b.whatsapp) {
      return false;
    }

    // Minimum rating
    if (filters.minRating > 0 && b.rating < filters.minRating) {
      return false;
    }

    // Website status filter
    if (filters.websiteFilter && filters.websiteFilter !== 'all') {
      if (filters.websiteFilter === 'has_website' && (b.websiteStatus === 'none' || (!b.website && b.websiteStatus !== 'active'))) {
        return false;
      }
      if (filters.websiteFilter === 'outdated_website' && b.websiteStatus !== 'outdated') {
        return false;
      }
      if (filters.websiteFilter === 'direct_whatsapp' && b.websiteStatus !== 'none') {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sorts businesses based on sort criteria
 */
export function sortBusinesses(
  businesses: Business[],
  sortBy: FilterState['sortBy']
): Business[] {
  const list = [...businesses];

  switch (sortBy) {
    case 'rating':
      return list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case 'reviews':
      return list.sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating);
    case 'name':
      return list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    case 'featured':
    default:
      return list.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return b.rating - a.rating;
      });
  }
}

/**
 * Computes business counts per category
 */
export function getCategoryCounts(businesses: Business[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const b of businesses) {
    counts[b.categoryId] = (counts[b.categoryId] || 0) + 1;
  }
  return counts;
}

/**
 * Computes business counts per city
 */
export function getCityCounts(businesses: Business[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const b of businesses) {
    counts[b.cityId] = (counts[b.cityId] || 0) + 1;
  }
  return counts;
}
