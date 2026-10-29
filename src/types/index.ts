export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  color: string;
  bgLight: string;
  bgDark: string;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  state: string;
  region: 'Ilha de Itaparica' | 'Região Metropolitana de Salvador';
  neighborhoods: string[];
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  categoryId: string;
  categoryName: string;
  cityId: string;
  cityName: string;
  neighborhood: string;
  address: string;
  phone: string;
  whatsapp: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  websiteStatus?: 'active' | 'outdated' | 'none';
  websiteStatusText?: string;
  googleMapsUrl?: string;
  location?: { lat: number; lng: number };
  rating: number;
  reviewCount: number;
  priceLevel: '$' | '$$' | '$$$' | '$$$$';
  tags: string[];
  services: string[];
  isVerified: boolean;
  isFeatured: boolean;
  hasDelivery: boolean;
  isOpenNow: boolean;
  openingHoursText: string;
  coverImage: string;
  logoUrl?: string;
  badgeText?: string;
  isRmsPremium?: boolean;
  planType?: 'free' | 'destaque' | 'premium';
  registeredAt?: number;
  galleryImages?: string[];
  aiEnhanced?: boolean;
  aiPitch?: string;
  miniSiteSlug?: string;
}

export interface FilterState {
  query: string;
  categoryId: string;
  cityId: string;
  neighborhood: string;
  openNowOnly: boolean;
  verifiedOnly: boolean;
  deliveryOnly: boolean;
  whatsappOnly: boolean;
  websiteFilter?: 'all' | 'has_website' | 'outdated_website' | 'direct_whatsapp';
  minRating: number;
  priceLevel: string;
  sortBy: 'featured' | 'rating' | 'reviews' | 'name';
}
