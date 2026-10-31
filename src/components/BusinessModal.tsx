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
  Send,
  Link2,
  Copy,
  Check,
   Calendar,
   Sparkles,
   Settings,
   Maximize2,
   QrCode,
   Navigation,
   Compass,
   Layers
 } from 'lucide-react';
import { Business } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import { getCategoryCoverImage } from '../utils/categoryImages';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface BusinessModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  onShare: (business: Business) => void;
  onOpenMiniSite?: (business: Business) => void;
  onOpenWorkspaceWithBiz?: (business: Business) => void;
  onEdit?: (business: Business) => void;
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
  onOpenWorkspaceWithBiz,
  onEdit
}) => {
  const { isFavorite, toggleFavorite, showToast } = useFavorites();
  const { user } = useAuth();
  const [userRating, setUserRating] = useState<number>(5);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [showReviewSuccess, setShowReviewSuccess] = useState(false);
  const [copiedDirect, setCopiedDirect] = useState(false);

  // Sync the browser address bar with ?business=[id_or_slug] while modal is open
  React.useEffect(() => {
    if (!isOpen || !business) return;
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const identifier = business.slug || business.id;
      if (url.searchParams.get('business') !== identifier) {
        url.searchParams.set('business', identifier);
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [isOpen, business]);

  const handleCopyDirectLink = async () => {
    if (!business) return;
    const origin = typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://melhordailha.online';
    const identifier = business.slug || business.id;
    const directUrl = `${origin}/${encodeURIComponent(identifier)}`;
    try {
      await navigator.clipboard.writeText(directUrl);
      setCopiedDirect(true);
      showToast('Link direto copiado! Ao abrir, vai direto para este anúncio 📋');
      setTimeout(() => setCopiedDirect(false), 2500);
    } catch {
      showToast('Não foi possível copiar o link.');
    }
  };

  React.useEffect(() => {
    if (!business) return;
    const q = query(
      collection(db, 'businesses', business.id, 'reviews'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews = snapshot.docs.map(doc => ({
        id: doc.id,
        author: doc.data().userName,
        rating: doc.data().rating,
        date: 'Recent', // Simplified date formatting for now
        comment: doc.data().comment
      }));
      setReviews(fetchedReviews);
    });
    return () => unsubscribe();
  }, [business]);

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

  // Lock background scroll only when modal is actively open
  React.useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow || '';
    };
  }, [isOpen]);

  if (!isOpen || !business) return null;

  const favorited = isFavorite(business.id);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) {
      showToast('Por favor, preencha seu nome e comentário.');
      return;
    }

    try {
      await addDoc(collection(db, 'businesses', business.id, 'reviews'), {
        businessId: business.id,
        userId: user?.uid || 'anonymous',
        userName: reviewerName.trim(),
        userAvatar: user?.photoURL || '',
        rating: userRating,
        comment: reviewComment.trim(),
        createdAt: serverTimestamp()
      });
      setReviewerName('');
      setReviewComment('');
      setShowReviewSuccess(true);
      showToast('Avaliação enviada com sucesso! Obrigado pelo feedback.');
      setTimeout(() => setShowReviewSuccess(false), 4000);
    } catch (error) {
      console.error('Error adding review: ', error);
      showToast('Erro ao enviar avaliação. Tente novamente.');
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Olá! Encontrei o seu anúncio no guia MELHOR DA ILHA e gostaria de tirar uma dúvida sobre seus serviços/produtos.`
  );
  const whatsappUrl = `https://wa.me/${business.whatsapp}?text=${whatsappMessage}`;
  const phoneUrl = `tel:${business.phone.replace(/\D/g, '')}`;
  const mapsSearchUrl = business.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name} ${business.address} ${business.cityName}`)}`;


  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/80 backdrop-blur-sm p-2 sm:p-4 flex items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-[calc(100vw-1rem)] sm:max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden my-auto mx-auto max-h-[95vh] flex flex-col transition-all duration-300 border border-slate-200 dark:border-slate-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="business-modal-name"
      >
        {/* Close Button - Floating top right */}
        <button
          onClick={onClose}
          aria-label="Fechar detalhes"
          className="absolute top-5 right-5 z-30 p-2.5 rounded-full bg-white/20 dark:bg-black/20 text-white backdrop-blur-md hover:bg-white/30 transition-all border border-white/20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 overscroll-contain custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
          
          {/* Header Section: Cover Image + Badges */}
          <div className="relative h-56 sm:h-64 w-full bg-slate-900">
            <img
              src={business.coverImage || getCategoryCoverImage(business.categoryId, business.name)}
              alt={business.name}
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
            
            {/* Top Badges (Category & Verification) */}
            <div className="absolute top-5 left-6 flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full text-[10px] font-black bg-white/20 text-white backdrop-blur-md border border-white/30 uppercase tracking-wider">
                {business.categoryName}
              </span>
              {business.isVerified && (
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-lg uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" /> Official Company
                </span>
              )}
            </div>

            {/* Metrics (Views/Likes) - Mocked to match inspiration */}
            <div className="absolute top-5 right-16 flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white backdrop-blur-md border border-white/10 text-[10px] font-bold">
                <Globe className="w-3 h-3 opacity-70" /> 512K
              </div>
              <button 
                onClick={() => toggleFavorite(business.id)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white backdrop-blur-md border border-white/10 text-[10px] font-bold hover:bg-white/20 transition-all"
              >
                <Heart className={`w-3 h-3 ${favorited ? 'fill-rose-500 text-rose-500 border-rose-500' : 'opacity-70'}`} /> 128K
              </button>
            </div>

            {/* Floating Logo Card */}
            <div className="absolute -bottom-12 left-8 z-20">
              <div className="relative p-2 bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700">
                {business.logoUrl ? (
                  <img
                    src={business.logoUrl}
                    alt={`Logo ${business.name}`}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-[1.5rem] object-contain bg-white dark:bg-slate-900"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[1.5rem] bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-black text-4xl flex items-center justify-center shadow-inner uppercase">
                    {business.name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('')}
                  </div>
                )}
                {business.isVerified && (
                  <div className="absolute -bottom-1 -right-1 p-1.5 bg-amber-400 rounded-full border-4 border-white dark:border-slate-800 shadow-lg">
                    <Check className="w-5 h-5 text-slate-900 font-bold" />
                  </div>
                )}
              </div>
            </div>

            {/* Open Now Badge */}
            <div className="absolute bottom-8 right-8">
              <div className="px-5 py-3 rounded-[1.5rem] bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white backdrop-blur-md shadow-2xl border border-white/40 flex items-center gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${business.isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    <span className="text-[12px] font-black uppercase tracking-wider">{business.isOpenNow ? 'Aberto Agora' : 'Fechado'}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">{(business.openingHoursText || '').split('|')[0]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Info Section */}
          <div className="px-8 pt-16 pb-8 space-y-8">
            {/* Title & Tagline */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 id="business-modal-name" className="text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                  {business.name}
                </h2>
                {business.isVerified && (
                   <div className="p-1 bg-amber-400 rounded-full">
                     <Check className="w-4 h-4 text-slate-900 font-bold" />
                   </div>
                )}
                {user?.email === 'filocriacoes@gmail.com' && (
                  <button
                    onClick={() => onEdit?.(business)}
                    className="p-2 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-800 hover:scale-105 transition-transform"
                    title="Editar Anúncio (Admin)"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 text-teal-600 dark:text-teal-400 font-bold text-sm tracking-wide">
                <span>{business.tagline}</span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="uppercase text-[10px] tracking-widest">{business.categoryName}</span>
              </div>
            </div>

            {/* Description Paragraph */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {business.description || 'Nenhuma descrição disponível.'}
            </p>

            {/* Tags Row */}
            <div className="flex flex-wrap gap-2.5">
              <div className="px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-black border border-slate-900 dark:border-white flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer">
                <Compass className="w-4 h-4" /> PESQUISAR
              </div>
              {(business.tags || []).slice(0, 5).map((tag, i) => (
                <div key={i} className="px-4 py-2 rounded-full bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[11px] font-black border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-colors cursor-pointer uppercase tracking-tighter">
                  {tag}
                </div>
              ))}
              {(business.tags || []).length > 5 && (
                <div className="px-4 py-2 rounded-full bg-white dark:bg-slate-900 text-slate-400 text-[11px] font-black border border-slate-200 dark:border-slate-800 cursor-pointer">
                  ... MAIS
                </div>
              )}
            </div>

            {/* Contact & Location List (Icon rows with arrows) */}
            <div className="space-y-2">
              <a 
                href={mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-5 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-[1.25rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[13px] font-black text-slate-900 dark:text-white leading-tight max-w-[200px] sm:max-w-[320px]">
                      {business.address || 'Endereço não informado'}
                    </div>
                    <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{business.cityName || 'Cidade'} · {business.neighborhood || 'Bairro'}</div>
                  </div>
                </div>
                <ExternalLink className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-teal-500 transition-colors" />
              </a>

              <div className="group flex items-center justify-between p-5 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-[1.25rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white flex items-center justify-center shadow-sm">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[13px] font-black text-slate-900 dark:text-white uppercase">Horário de Funcionamento</div>
                    <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">{business.openingHoursText || 'Consulte o estabelecimento'}</div>
                  </div>
                </div>
                <ExternalLink className="w-5 h-5 text-slate-300 dark:text-slate-700 transition-colors" />
              </div>

              {business.phone && (
                <a 
                  href={`tel:${business.phone}`}
                  className="group flex items-center justify-between p-5 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-[1.25rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[13px] font-black text-slate-900 dark:text-white">{business.phone}</div>
                      <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">Telefone Oficial</div>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-teal-500 transition-colors" />
                </a>
              )}

              {business.website && (
                <a 
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-5 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-[1.25rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[13px] font-black text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-none">{business.website.replace(/^https?:\/\//, '')}</div>
                      <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">Website Oficial</div>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-teal-500 transition-colors" />
                </a>
              )}

              {business.email && (
                <a 
                  href={`mailto:${business.email}`}
                  className="group flex items-center justify-between p-5 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-[1.25rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Send className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[13px] font-black text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-none">{business.email}</div>
                      <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">E-mail de Contato</div>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-teal-500 transition-colors" />
                </a>
              )}
            </div>

            {/* Quick Action Bar (Primary Row) */}
            <div className="grid grid-cols-5 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <a href={mapsSearchUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 py-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:scale-105">
                <div className="w-12 h-12 flex items-center justify-center text-teal-600 bg-teal-50 dark:bg-teal-900/20 rounded-2xl shadow-sm">
                  <Navigation className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Rota</span>
              </a>
              {business.phone ? (
                <a href={`tel:${business.phone}`} className="flex flex-col items-center gap-3 py-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:scale-105">
                  <div className="w-12 h-12 flex items-center justify-center text-teal-600 bg-teal-50 dark:bg-teal-900/20 rounded-2xl shadow-sm">
                    <Phone className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Ligar</span>
                </a>
              ) : (
                <div className="flex flex-col items-center gap-3 py-4 opacity-30 grayscale cursor-not-allowed">
                  <div className="w-12 h-12 flex items-center justify-center text-slate-400 bg-slate-100 rounded-2xl">
                    <Phone className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">N/A</span>
                </div>
              )}
              <a href={business.website || '#'} target="_blank" rel="noopener noreferrer" className={`flex flex-col items-center gap-3 py-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:scale-105 ${!business.website && 'opacity-30 grayscale cursor-not-allowed'}`}>
                <div className="w-12 h-12 flex items-center justify-center text-teal-600 bg-teal-50 dark:bg-teal-900/20 rounded-2xl shadow-sm">
                  <Globe className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Site</span>
              </a>
              <button onClick={() => onShare(business)} className="flex flex-col items-center gap-3 py-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:scale-105">
                <div className="w-12 h-12 flex items-center justify-center text-teal-600 bg-teal-50 dark:bg-teal-900/20 rounded-2xl shadow-sm">
                  <Share2 className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Partilhar</span>
              </button>
              <button onClick={handleCopyDirectLink} className="flex flex-col items-center gap-3 py-4 rounded-3xl bg-teal-600 text-white shadow-xl shadow-teal-500/30 hover:scale-105 transition-all">
                <div className="w-12 h-12 flex items-center justify-center">
                  <QrCode className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter">{copiedDirect ? 'Copiado!' : 'QR Direto'}</span>
              </button>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-6 rounded-[2rem] bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 space-y-3 hover:shadow-lg transition-shadow">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <div className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-tight tracking-tight">SOLUÇÕES INOVADORAS</div>
                <div className="text-[9px] font-bold text-emerald-700/70 dark:text-emerald-400/70">Liderando o futuro na RMS</div>
              </div>
              <div className="p-6 rounded-[2rem] bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 space-y-3 hover:shadow-lg transition-shadow">
                <Sparkles className="w-6 h-6 text-blue-600" />
                <div className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-tight tracking-tight">IA & TECNOLOGIA</div>
                <div className="text-[9px] font-bold text-blue-700/70 dark:text-blue-400/70">Smarter every single day</div>
              </div>
              <div className="p-6 rounded-[2rem] bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 space-y-3 hover:shadow-lg transition-shadow">
                <Globe className="w-6 h-6 text-amber-600" />
                <div className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-tight tracking-tight">IMPACTO GLOBAL</div>
                <div className="text-[9px] font-bold text-amber-700/70 dark:text-amber-400/70">Acessível para todos</div>
              </div>
            </div>

            {/* Gallery Section */}
            {business.galleryImages && business.galleryImages.length > 0 && (
              <div className="space-y-6">
                <h4 className="text-base font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400" /> GALERIA DE FOTOS
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {business.galleryImages.map((img, idx) => (
                    <div 
                      key={idx} 
                      className="group relative aspect-video rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:shadow-xl transition-all"
                      onClick={() => window.open(img, '_blank')}
                    >
                      <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services List */}
            <div className="space-y-6">
               <h4 className="text-base font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-500" /> ESPECIALIDADES
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(business.services || []).map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-5 rounded-[1.75rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-teal-500/30 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 font-bold" />
                      </div>
                      <span className="text-[13px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tighter">{service}</span>
                    </div>
                  ))}
                </div>
            </div>

            {/* Explore Big CTA Button */}
            <div className="pt-4">
              <button 
                onClick={() => window.open(whatsappUrl, '_blank')}
                className="w-full py-6 rounded-[2.5rem] bg-teal-600 hover:bg-teal-500 text-white font-black text-lg flex items-center justify-between px-10 shadow-2xl shadow-teal-500/40 transition-all active:scale-[0.97] group"
              >
                <div className="flex items-center gap-5">
                  <MessageCircle className="w-8 h-8 group-hover:animate-bounce" />
                  <span className="tracking-tight">ABRIR CHAT NO WHATSAPP</span>
                </div>
                <Send className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>

            {/* Secondary Action Bar (Favorites / Interested) */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => toggleFavorite(business.id)}
                className={`flex items-center justify-center gap-3 py-5 rounded-[2rem] border-2 transition-all active:scale-[0.97] text-sm font-black uppercase tracking-tight ${
                  favorited 
                    ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 shadow-lg' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-5 h-5 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
                {favorited ? 'SALVO NOS FAVORITOS' : 'ADICIONAR FAVORITO'}
              </button>
              <button 
                onClick={() => window.open(`tel:${business.phone || ''}`, '_self')}
                className="flex items-center justify-center gap-3 py-5 rounded-[2rem] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm font-black transition-all hover:bg-slate-50 active:scale-[0.97] uppercase tracking-tight"
              >
                <Star className="w-5 h-5 text-amber-400 opacity-80" />
                ESTOU INTERESSADO
              </button>
            </div>

            {/* Reviews Section */}
            <div className="pt-6 space-y-8">
              <div className="flex items-center justify-between">
                 <h4 className="text-base font-black uppercase tracking-[0.2em] text-slate-400">AVALIAÇÕES RECENTES</h4>
                 <div className="flex items-center gap-2 text-amber-400 text-lg font-black">
                    <Star className="w-6 h-6 fill-amber-400" /> {(business.rating || 5).toFixed(1)} / 5.0
                 </div>
              </div>
              
              {/* Review Input Box */}
              <form onSubmit={handleReviewSubmit} className="p-8 rounded-[2.5rem] bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 space-y-5 shadow-inner">
                <div className="text-[12px] font-black text-teal-800 dark:text-teal-300 uppercase tracking-[0.2em]">ENVIE SUA AVALIAÇÃO</div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Seu Nome"
                      value={reviewerName}
                      onChange={e => setReviewerName(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900/40 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-teal-500/20"
                    />
                    <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-teal-100 dark:border-teal-900/40">
                      <span className="text-[10px] font-black text-slate-400 uppercase mr-2">Sua Nota:</span>
                      {[1, 2, 3, 4, 5].map(num => (
                        <button 
                          key={num}
                          type="button"
                          onClick={() => setUserRating(num)}
                          className="focus:outline-none transition-transform hover:scale-125"
                        >
                          <Star className={`w-5 h-5 ${num <= userRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea 
                    rows={3}
                    placeholder="Conte como foi sua experiência com esta empresa..."
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    className="w-full p-5 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-teal-100 dark:border-teal-900/40 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-teal-500/20"
                  ></textarea>
                </div>
                <button type="submit" className="w-full sm:w-auto px-10 py-4 rounded-full bg-teal-600 hover:bg-teal-500 text-white text-[12px] font-black uppercase tracking-widest shadow-xl shadow-teal-500/20 transition-all active:scale-95">
                  PUBLICAR AVALIAÇÃO AGORA
                </button>
              </form>

              {/* Review List */}
              <div className="space-y-5">
                {(reviews || []).length > 0 ? reviews.map(rev => (
                  <div key={rev.id} className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black text-sm uppercase">
                            {String(rev.author || 'U')[0]}
                         </div>
                         <div className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{String(rev.author || 'Anônimo')}</div>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{String(rev.date || 'Recente')}</div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < (Number(rev.rating) || 0) ? 'fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />)}
                    </div>
                    <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic">"{String(rev.comment || 'Sem comentário')}"</p>
                  </div>
                )) : (
                  <div className="text-center py-10 px-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700">
                    <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nenhuma avaliação ainda. Seja o primeiro!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom "New Features" Bar (Mocked for style) */}
          <div className="px-8 pb-12">
             <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 text-center">SERVIÇOS EXCLUSIVOS MELHOR DA ILHA</div>
             <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                  { label: 'Analítica', icon: <Layers className="w-6 h-6" /> },
                  { label: 'Promoções', icon: <Sparkles className="w-6 h-6" /> },
                  { label: 'IA Insights', icon: <Sparkles className="w-6 h-6" /> },
                  { label: 'Eventos', icon: <Calendar className="w-6 h-6" /> },
                  { label: 'Recompensas', icon: <Heart className="w-6 h-6" /> },
                  { label: 'Mais', icon: <Settings className="w-6 h-6" /> }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-[1.75rem] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm hover:shadow-md">
                    <div className="w-10 h-10 flex items-center justify-center text-teal-600">
                      {item.icon}
                    </div>
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter text-center leading-none">{item.label}</span>
                  </div>
                ))}
             </div>
          </div>

          {/* Listing ID Footer */}
          <div className="px-10 py-8 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-emerald-500" />
               <span>ID DO ANÚNCIO: LX-TE-{(business.id.slice(0, 8)).toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-4">
               <span>LISTADO OFICIALMENTE EM MELHORDAILHA.ONLINE</span>
               <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                 <QrCode className="w-5 h-5 text-slate-900" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
