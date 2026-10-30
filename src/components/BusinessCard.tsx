import React from 'react';
import {
  MapPin,
  Star,
  ShieldCheck,
  Heart,
  Share2,
  MessageCircle,
  Phone,
  Clock,
  Truck,
  Globe,
  AlertCircle,
  Navigation
} from 'lucide-react';
import { Business } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import { getCategoryCoverImage } from '../utils/categoryImages';

interface BusinessCardProps {
  business: Business;
  onSelect: (business: Business) => void;
  onShare: (business: Business) => void;
  onOpenMiniSite?: (business: Business) => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  onSelect,
  onShare,
  onOpenMiniSite
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(business.id);

  const whatsappMessage = encodeURIComponent(
    `Olá! Vi o anúncio da ${business.name} no MELHOR DA ILHA e gostaria de mais informações.`
  );
  const whatsappUrl = `https://wa.me/${business.whatsapp}?text=${whatsappMessage}`;
  const phoneUrl = `tel:${business.phone.replace(/\D/g, '')}`;
  const mapsUrl =
    business.googleMapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${business.name} ${business.address} ${business.cityName}`
    )}`;

  // Generate 2-letter monogram for fallback logo avatar
  const initials = business.name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');

  return (
    <article className={`group relative flex flex-col bg-white dark:bg-slate-900/90 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${
      business.isRmsPremium
        ? 'border-2 border-amber-400 dark:border-amber-400 ring-2 ring-amber-400/30 dark:ring-amber-500/20 shadow-amber-500/10'
        : 'border border-slate-200/90 dark:border-slate-800'
    }`}>
      {/* Top Media Container */}
      <div
        className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer"
        onClick={() => onSelect(business)}
      >
        <img
          src={business.coverImage || getCategoryCoverImage(business.categoryId, business.name)}
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-black/25 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 pointer-events-none">
          {business.isRmsPremium ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-black tracking-wide rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 shadow-md border border-amber-200 animate-pulse">
              <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              CLIENTE PREMIUM ⭐
            </span>
          ) : business.badgeText ? (
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-500 text-slate-950 shadow-md">
              {business.badgeText}
            </span>
          ) : null}
          {business.isOpenNow ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-950/85 text-emerald-300 border border-emerald-500/50 backdrop-blur-sm shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Aberto
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-slate-900/80 text-slate-300 backdrop-blur-sm shadow-sm">
              <Clock className="w-3 h-3" />
              Fechado
            </span>
          )}
        </div>

        {/* Favorite & Share buttons in top-right */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShare(business);
            }}
            aria-label={`Compartilhar ${business.name}`}
            className="p-2 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 shadow-md backdrop-blur-sm hover:scale-110 transition-transform"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(business.id);
            }}
            aria-label={favorited ? `Remover ${business.name} dos favoritos` : `Salvar ${business.name} nos favoritos`}
            className="p-2 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 shadow-md backdrop-blur-sm hover:scale-110 transition-transform"
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Bottom image overlay with Category and Rating */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-teal-600/95 text-white backdrop-blur-sm">
            {business.categoryName}
          </span>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-amber-400 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{business.rating.toFixed(1)}</span>
            <span className="text-slate-300 font-normal">({business.reviewCount})</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3 md:p-4 flex-1 flex flex-col justify-between">
        <div className="cursor-pointer" onClick={() => onSelect(business)}>
          {/* Header Row with Logo Thumbnail & Title */}
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            {/* Logo / Monogram Avatar */}
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={`Logo ${business.name}`}
                className="w-10 h-10 rounded-xl object-contain bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs"
                loading="lazy"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                {initials}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                  {business.name}
                </h3>
                {business.isVerified && (
                  <span title="Negócio Verificado na RMS" className="text-emerald-500 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="font-medium truncate">
                  {business.cityName} · {business.neighborhood}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3 leading-relaxed">
            {business.tagline}
          </p>

          {/* Website Status & Features Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {/* Website badge based on user requirement */}
            {business.websiteStatus === 'active' || business.website ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                <Globe className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{business.websiteStatusText || 'Site Próprio'}</span>
              </span>
            ) : business.websiteStatus === 'outdated' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-[11px] font-semibold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Site em Atualização</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <MessageCircle className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                <span>WhatsApp Direto</span>
              </span>
            )}

            {business.hasDelivery && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-[11px] font-semibold text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
                <Truck className="w-3 h-3" /> Delivery
              </span>
            )}
          </div>

          {/* RMS Premium Mini-Site Bonus Link */}
          {/* Link removido a pedido do usuário */}


          {/* Quick tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {business.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Card Action Buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          {business.whatsapp && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Conversar no WhatsApp com ${business.name}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>WhatsApp</span>
            </a>
          )}
          {/* Google Maps Route Button */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ver rota no Google Maps para ${business.name}`}
            title="Ver no Google Maps"
            className="p-2 rounded-xl bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            <Navigation className="w-4 h-4" />
          </a>
          {business.phone && (
            <a
              href={phoneUrl}
              aria-label={`Ligar para ${business.name}`}
              title="Ligar para a empresa"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
          <button
            type="button"
            onClick={() => onSelect(business)}
            aria-label={`Ver detalhes completos de ${business.name}`}
            className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors text-center shadow-xs"
          >
            Ver Detalhes
          </button>
        </div>
      </div>
    </article>
  );
};
