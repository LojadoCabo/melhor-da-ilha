import React, { useState } from 'react';
import {
  X,
  MapPin,
  Phone,
  MessageCircle,
  Instagram,
  Globe,
  ExternalLink,
  Star,
  Clock,
  ShieldCheck,
  Truck,
  Heart,
  Share2,
  CheckCircle2,
  Send
} from 'lucide-react';
import { Business } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import { getCategoryCoverImage } from '../utils/categoryImages';

interface BusinessModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  onShare: (business: Business) => void;
  onOpenMiniSite?: (business: Business) => void;
}

interface UserReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export const BusinessModal: React.FC<BusinessModalProps> = ({
  business,
  isOpen,
  onClose,
  onShare,
  onOpenMiniSite
}) => {
  const { isFavorite, toggleFavorite, showToast } = useFavorites();
  const [userRating, setUserRating] = useState<number>(5);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviews, setReviews] = useState<UserReview[]>([
    {
      id: 'rev-1',
      author: 'Carlos Alberto M.',
      rating: 5,
      date: 'Há 2 dias',
      comment: 'Excelente atendimento e rapidez! Sempre conto com o serviço aqui na Ilha.'
    },
    {
      id: 'rev-2',
      author: 'Mariana Silveira',
      rating: 5,
      date: 'Há 1 semana',
      comment: 'Super recomendo, profissionais honestos e preço justo. Fiquei muito satisfeita.'
    }
  ]);
  const [showReviewSuccess, setShowReviewSuccess] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !business) return null;

  const favorited = isFavorite(business.id);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) {
      showToast('Por favor, preencha seu nome e comentário.');
      return;
    }

    const newReview: UserReview = {
      id: `rev-${Date.now()}`,
      author: reviewerName.trim(),
      rating: userRating,
      date: 'Agora mesmo',
      comment: reviewComment.trim()
    };

    setReviews([newReview, ...reviews]);
    setReviewerName('');
    setReviewComment('');
    setShowReviewSuccess(true);
    showToast('Avaliação enviada com sucesso! Obrigado pelo feedback.');
    setTimeout(() => setShowReviewSuccess(false), 4000);
  };

  const whatsappMessage = encodeURIComponent(
    `Olá! Encontrei o seu anúncio no guia MELHOR DA ILHA e gostaria de tirar uma dúvida sobre seus serviços/produtos.`
  );
  const whatsappUrl = `https://wa.me/${business.whatsapp}?text=${whatsappMessage}`;
  const phoneUrl = `tel:${business.phone.replace(/\D/g, '')}`;
  const mapsSearchUrl = business.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name} ${business.address} ${business.cityName}`)}`;

  // Lock background scroll while modal is open
  React.useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/75 backdrop-blur-sm p-2 sm:p-4 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-[calc(100vw-1rem)] sm:max-w-2xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto mx-auto max-h-[92vh] flex flex-col transition-all duration-200 text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="business-modal-name"
      >
        {/* Header Action Buttons Floating */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={() => toggleFavorite(business.id)}
            aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            className="p-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 shadow-md backdrop-blur-sm hover:scale-105 transition-all"
          >
            <Heart className={`w-5 h-5 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
          <button
            onClick={() => onShare(business)}
            aria-label="Compartilhar este negócio"
            className="p-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 shadow-md backdrop-blur-sm hover:scale-105 transition-all"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            aria-label="Fechar detalhes"
            className="p-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 shadow-md backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1">
          {/* Cover image banner */}
          <div className="relative h-60 sm:h-72 w-full bg-slate-900 overflow-hidden">
            <img
              src={business.coverImage || getCategoryCoverImage(business.categoryId, business.name)}
              alt={business.name}
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/30 to-transparent" />

            {/* Badges on banner */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2">
              {business.isRmsPremium ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 shadow-lg border border-amber-200 animate-pulse">
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  CLIENTE PREMIUM ⭐
                </span>
              ) : business.badgeText ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-sm">
                  {business.badgeText}
                </span>
              ) : null}
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-600 text-white shadow-sm">
                {business.categoryName}
              </span>
              {business.isVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verificado
                </span>
              )}
              {business.isOpenNow ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Aberto Agora
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800/80 text-slate-300 backdrop-blur-sm">
                  <Clock className="w-3.5 h-3.5" />
                  Fechado no momento
                </span>
              )}
              {business.hasDelivery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500 text-white shadow-sm">
                  <Truck className="w-3.5 h-3.5" />
                  Faz Delivery / Domicílio
                </span>
              )}
            </div>
          </div>

          {/* Information Section */}
          <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Logo / Monogram Avatar */}
              {business.logoUrl ? (
                <img
                  src={business.logoUrl}
                  alt={`Logo oficial de ${business.name}`}
                  className="w-16 h-16 rounded-2xl object-contain bg-white dark:bg-slate-800 p-1.5 border border-slate-200 dark:border-slate-700 shadow-md shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                  {business.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map(w => w[0]?.toUpperCase() || '')
                    .join('')}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 id="business-modal-name" className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {business.name}
                  </h2>
                  {business.isVerified && (
                    <span title="Negócio Verificado na RMS" className="text-emerald-500 shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </span>
                  )}
                </div>
                <p className="text-sm sm:text-base font-medium text-teal-700 dark:text-teal-400 mb-2">
                  {business.tagline}
                </p>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{business.rating.toFixed(1)}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-normal">
                      ({business.reviewCount} avaliações no Google)
                    </span>
                  </div>
                  <div className="text-slate-400">·</div>
                  <div className="font-semibold text-slate-700 dark:text-slate-200">
                    Faixa: {business.priceLevel}
                  </div>
                  <div className="text-slate-400">·</div>
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{business.cityName} ({business.neighborhood})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Website Status Announcement Card */}
            <div className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-3 ${
              business.websiteStatus === 'active' || business.website
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                : business.websiteStatus === 'outdated'
                ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 shrink-0 text-teal-600 dark:text-teal-400" />
                <div>
                  <span className="font-bold">Presença Web & Digital: </span>
                  <span>
                    {business.websiteStatus === 'active' || business.website
                      ? `${business.websiteStatusText || 'Site Próprio Ativo'} — Disponível online.`
                      : business.websiteStatus === 'outdated'
                      ? 'Site próprio legado ou em reformulação / atualização. Atendimento ativo via WhatsApp.'
                      : 'Sem site próprio — Atendimento e catálogo direto pelo WhatsApp e presencial.'}
                  </span>
                </div>
              </div>
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shrink-0 shadow-xs flex items-center gap-1"
                >
                  <span>Abrir Site</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Main Contact CTA Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {business.whatsapp && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Conversar no WhatsApp</span>
                </a>
              )}
              {business.phone && (
                <a
                  href={phoneUrl}
                  className="flex items-center justify-center gap-2.5 px-5 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl font-bold text-sm shadow-md transition-all transform hover:-translate-y-0.5"
                >
                  <Phone className="w-5 h-5 text-teal-400" />
                  <span>Ligar {business.phone}</span>
                </a>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Sobre o Negócio
              </h4>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {business.description}
              </p>
            </div>

            {/* Services & Highlights list */}
            {business.services && business.services.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Serviços e Especialidades
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {business.services.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location & Opening Hours Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Endereço</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {business.address}
                  </p>
                  <a
                    href={mapsSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    <span>Abrir no Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Horário de Funcionamento</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {business.openingHoursText}
                  </p>
                </div>
              </div>
            </div>

            {/* RMS Premium Mini-Site Dedicated Button */}
            {business.isRmsPremium && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30 border border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
                    <Star className="w-4 h-4 fill-slate-950" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Mini-Site Exclusivo no Ar (RMS Premium ⭐)
                    </div>
                    <div className="text-[11px] font-mono text-teal-700 dark:text-teal-400 truncate">
                      melhordailha.online/perfil/{business.slug || business.id}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenMiniSite) onOpenMiniSite(business);
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-sm transition-colors text-center shrink-0"
                >
                  Abrir Mini-Site Oficial →
                </button>
              </div>
            )}

            {/* Social Channels */}
            {(business.instagram || business.facebook || business.website) && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {business.instagram && (
                  <a
                    href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 text-xs font-medium hover:opacity-80 transition-opacity"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>{business.instagram}</span>
                  </a>
                )}
                {business.website && (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-medium hover:opacity-80 transition-opacity"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Visitar Website</span>
                  </a>
                )}
              </div>
            )}

            {/* Reviews Section */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  Avaliações dos Clientes ({reviews.length + business.reviewCount})
                </h4>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{business.rating.toFixed(1)} / 5.0</span>
                </div>
              </div>

              {/* Submit a review form */}
              <form
                onSubmit={handleReviewSubmit}
                className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 space-y-3"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                  Deixe sua avaliação sobre este local
                </p>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setUserRating(star)}
                      aria-label={`Avaliar com ${star} estrelas`}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${userRating >= star ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-semibold ml-2 text-slate-600 dark:text-slate-300">
                    {userRating} de 5 estrelas
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={reviewerName}
                    onChange={e => setReviewerName(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <textarea
                  rows={2}
                  placeholder="Conte como foi sua experiência com este profissional ou negócio..."
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar Avaliação</span>
                </button>
              </form>

              {/* List of recent reviews */}
              <div className="space-y-3">
                {reviews.map(rev => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                        {rev.author}
                      </span>
                      <span className="text-[11px] text-slate-400">{rev.date}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pt-1">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
