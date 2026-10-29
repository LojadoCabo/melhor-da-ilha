import React, { useState, useMemo } from 'react';
import {
  X,
  PlusCircle,
  CheckCircle2,
  Send,
  MessageCircle,
  ShieldCheck,
  Star,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Search,
  CreditCard,
  Lock,
  QrCode,
  MapPin,
  Loader2,
  Camera
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { CITIES } from '../data/cities';
import { BUSINESSES as fallbackBusinesses } from '../data/businesses';
import { Business } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import { MercadoPagoModal } from './MercadoPagoModal';
import { getCategoryCoverImage } from '../utils/categoryImages';
import { saveCustomBusiness } from '../utils/customBusinessesStorage';

interface AdvertiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBusinessAdded?: (biz: any) => void;
  businesses?: Business[];
  onOpenMiniSite?: (biz: Business) => void;
}

export const AdvertiseModal: React.FC<AdvertiseModalProps> = ({
  isOpen,
  onClose,
  onBusinessAdded,
  businesses,
  onOpenMiniSite
}) => {
  const { showToast } = useFavorites();
  const [submitted, setSubmitted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'destaque' | 'premium'>('premium');
  const [createdBiz, setCreatedBiz] = useState<any>(null);
  const [dismissMatch, setDismissMatch] = useState(false);
  const [isMpModalOpen, setIsMpModalOpen] = useState(false);
  const [mpModalData, setMpModalData] = useState<{
    business: Partial<Business>;
    planType: 'destaque' | 'premium';
  } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES[0].name,
    city: 'Vera Cruz',
    neighborhood: 'Mar Grande',
    phone: '',
    whatsapp: '',
    instagram: '',
    description: '',
    services: ''
  });

  // Smart CEP State & ViaCEP auto-fill
  const [cep, setCep] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');
  const [cepSuccess, setCepSuccess] = useState(false);
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [referencia, setReferencia] = useState('');
  const [showManualAddress, setShowManualAddress] = useState(false);

  // Dynamic Contextual Cover Image
  const [customCoverImage, setCustomCoverImage] = useState('');
  const [showCustomImageInput, setShowCustomImageInput] = useState(false);

  const contextualCoverImage = useMemo(() => {
    return getCategoryCoverImage(formData.category, formData.name);
  }, [formData.category, formData.name]);

  const handleCepChange = async (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 8);
    const masked = raw.length > 5 ? `${raw.slice(0, 5)}-${raw.slice(5)}` : raw;
    setCep(masked);
    setCepError('');
    setCepSuccess(false);

    if (raw.length === 8) {
      setCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
        const data = await res.json();
        if (data.erro) {
          setCepError('CEP não encontrado pelo ViaCEP. Preencha os campos abaixo.');
          setCepSuccess(false);
          setShowManualAddress(true);
        } else {
          setLogradouro(data.logradouro || '');
          const detectedBairro = data.bairro || '';
          const detectedCity = data.localidade || '';

          // Match city with CITIES array
          const matchedCity = CITIES.find(
            c => c.name.toLowerCase() === detectedCity.toLowerCase()
          );

          setFormData(prev => ({
            ...prev,
            city: matchedCity ? matchedCity.name : (detectedCity || prev.city),
            neighborhood: detectedBairro || prev.neighborhood
          }));

          setCepSuccess(true);
        }
      } catch (err) {
        console.warn('ViaCEP fetch error:', err);
        setCepError('Não foi possível consultar o CEP automaticamente.');
        setShowManualAddress(true);
      } finally {
        setCepLoading(false);
      }
    }
  };

  // Intelligent matching to detect if the establishment is already registered
  const matchedBusiness = useMemo(() => {
    if (dismissMatch) return null;

    const normalize = (str: string) =>
      str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

    const nameQuery = normalize(formData.name);
    const cleanDigits = formData.whatsapp.replace(/\D/g, '');

    if (nameQuery.length < 3 && cleanDigits.length < 8) {
      return null;
    }

    const catalog = businesses && businesses.length > 0 ? businesses : fallbackBusinesses;

    // 1. Check matching phone / WhatsApp (if at least 8 digits)
    if (cleanDigits.length >= 8) {
      const phoneMatch = catalog.find(b => {
        const bPhoneDigits = b.phone ? b.phone.replace(/\D/g, '') : '';
        const bWaDigits = b.whatsapp ? b.whatsapp.replace(/\D/g, '') : '';
        return (
          (bPhoneDigits && bPhoneDigits.endsWith(cleanDigits)) ||
          (cleanDigits.length >= 8 && bPhoneDigits.includes(cleanDigits)) ||
          (bWaDigits && bWaDigits.endsWith(cleanDigits)) ||
          (cleanDigits.length >= 8 && bWaDigits.includes(cleanDigits))
        );
      });
      if (phoneMatch) return phoneMatch;
    }

    // 2. Check matching name (if at least 3 chars)
    if (nameQuery.length >= 3) {
      const exactMatch = catalog.find(b => normalize(b.name) === nameQuery);
      if (exactMatch) return exactMatch;

      if (nameQuery.length >= 4) {
        const startsWithMatch = catalog.find(b => normalize(b.name).startsWith(nameQuery));
        if (startsWithMatch) return startsWithMatch;
      }

      if (nameQuery.length >= 5) {
        const includesMatch = catalog.find(b => normalize(b.name).includes(nameQuery));
        if (includesMatch) return includesMatch;
      }
    }

    return null;
  }, [formData.name, formData.whatsapp, dismissMatch, businesses]);

  if (!isOpen) return null;

  // Handle claiming / upgrading an existing business profile
  const handleUpgradeExisting = (plan: 'destaque' | 'premium', openCheckout = true) => {
    if (!matchedBusiness) return;
    const isPremium = plan === 'premium';

    const updatedBiz: Business = {
      ...matchedBusiness,
      isRmsPremium: isPremium,
      isFeatured: true,
      planType: plan,
      badgeText: isPremium ? 'CLIENTE PREMIUM ⭐' : 'Destaque Ilha',
      registeredAt: Date.now()
    };

    setCreatedBiz(updatedBiz);
    setSelectedPlan(plan);

    if (openCheckout) {
      setMpModalData({
        business: updatedBiz,
        planType: plan
      });
      setIsMpModalOpen(true);
      return;
    }

    if (onBusinessAdded) {
      onBusinessAdded(updatedBiz);
    }

    setSubmitted(true);
    showToast(`🎉 Parabéns! ${matchedBusiness.name} agora é ${isPremium ? 'CLIENTE PREMIUM' : 'Destaque'}!`);
  };

  // Callback ao aprovar o pagamento no Mercado Pago sem sair do site
  const handlePaymentSuccess = (plan: 'destaque' | 'premium', paidBusiness?: Partial<Business>) => {
    const isPremium = plan === 'premium';
    const base = (paidBusiness || createdBiz || matchedBusiness || {}) as Partial<Business>;

    const finalBiz: Business = {
      ...(base as Business),
      isRmsPremium: isPremium,
      isFeatured: true,
      planType: plan,
      badgeText: isPremium ? 'CLIENTE PREMIUM ⭐' : 'Destaque Ilha',
      registeredAt: Date.now()
    };

    setCreatedBiz(finalBiz);
    setSelectedPlan(plan);

    if (onBusinessAdded) {
      onBusinessAdded(finalBiz);
    }

    // Persist paid subscription to Firestore
    try {
      const inqId = `adv-paid-${Date.now()}`;
      import('../lib/firebase').then(({ db, doc, setDoc }) => {
        setDoc(doc(db, 'inquiries', inqId), {
          businessName: finalBiz.name || formData.name,
          email: formData.whatsapp || 'cliente@melhordailha.online',
          phone: formData.whatsapp || formData.phone,
          planType: plan,
          status: 'paid_active',
          city: finalBiz.cityName || formData.city,
          paymentProvider: 'mercadopago_transparent',
          createdAt: new Date().toISOString()
        }).catch(err => console.warn('Payment record Firestore write error:', err));
      });
    } catch (e) {
      console.warn(e);
    }

    setIsMpModalOpen(false);
    setSubmitted(true);
    showToast(`🎉 Pagamento aprovado com sucesso! ${finalBiz.name} agora é ${isPremium ? 'CLIENTE PREMIUM ⭐' : 'Destaque'}!`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.whatsapp.trim()) {
      showToast('Por favor, informe o nome do negócio e WhatsApp.');
      return;
    }

    // If an existing business is matched, guide user to upgrade
    if (matchedBusiness) {
      handleUpgradeExisting(selectedPlan === 'free' ? 'destaque' : selectedPlan, true);
      return;
    }

    const selectedCityObj = CITIES.find(c => c.name === formData.city) || CITIES[0];
    const selectedCatObj = CATEGORIES.find(c => c.name === formData.category) || CATEGORIES[0];
    const isRmsPremium = selectedPlan === 'premium';

    // Construção do endereço inteligente a partir do CEP, número e referência
    const addressParts = [
      logradouro ? logradouro : '',
      numero ? `Nº ${numero}` : '',
      referencia ? `(Ref: ${referencia})` : '',
      formData.neighborhood,
      `${formData.city} - BA`,
      cep ? `CEP: ${cep}` : ''
    ].filter(Boolean);

    const fullFormattedAddress = addressParts.join(', ') || `${formData.neighborhood}, ${formData.city} - BA`;
    const finalCoverImage = customCoverImage.trim() || contextualCoverImage;

    const newBiz: Business = {
      id: `custom-${Date.now()}`,
      name: formData.name.trim(),
      slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      tagline: formData.services.slice(0, 80) || `Atendimento de referência em ${formData.category}`,
      description: formData.description.trim() || `Cadastrado no guia oficial MELHOR DA ILHA em ${formData.city} (${formData.neighborhood}).`,
      categoryId: selectedCatObj.id,
      categoryName: selectedCatObj.name,
      cityId: selectedCityObj.id,
      cityName: selectedCityObj.name,
      neighborhood: formData.neighborhood.trim() || 'Centro',
      address: fullFormattedAddress,
      phone: formData.phone || formData.whatsapp,
      whatsapp: formData.whatsapp.replace(/\D/g, ''),
      instagram: formData.instagram.trim() || undefined,
      rating: 5.0,
      reviewCount: 1,
      priceLevel: '$$' as const,
      tags: [formData.category.split(' ')[0], formData.neighborhood],
      services: formData.services ? formData.services.split(',').map(s => s.trim()) : ['Atendimento Especializado', 'Suporte WhatsApp', 'Garantia de Qualidade'],
      isVerified: true,
      isFeatured: true,
      isRmsPremium: isRmsPremium,
      planType: selectedPlan,
      registeredAt: Date.now(),
      hasDelivery: true,
      isOpenNow: true,
      openingHoursText: 'Segunda a Sábado: Horário Comercial',
      coverImage: finalCoverImage,
      badgeText: isRmsPremium ? 'CLIENTE PREMIUM ⭐' : (selectedPlan === 'destaque' ? 'Destaque Ilha' : undefined)
    };

    saveCustomBusiness(newBiz);

    setCreatedBiz(newBiz);

    if (onBusinessAdded) {
      onBusinessAdded(newBiz);
    }

    // Persist lead to Firestore if available
    try {
      const inqId = `adv-${Date.now()}`;
      import('../lib/firebase').then(({ db, doc, setDoc }) => {
        setDoc(doc(db, 'inquiries', inqId), {
          name: formData.name.trim(),
          email: `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'anuncio'}@anunciante.local`,
          phone: formData.whatsapp || formData.phone,
          businessName: formData.name.trim(),
          message: `Plano: ${selectedPlan}. Cidade: ${formData.city} (${formData.neighborhood}). Serviços: ${formData.services || 'Não especificado'}. Descrição: ${formData.description}`,
          type: 'advertise',
          createdAt: new Date().toISOString()
        }).catch(err => console.warn('Advertise lead Firestore write error:', err));
      });
    } catch (e) {
      console.warn(e);
    }

    // Se escolheu plano pago, abre checkout do Mercado Pago sem sair do site
    if (selectedPlan !== 'free') {
      setMpModalData({
        business: newBiz,
        planType: selectedPlan
      });
      setIsMpModalOpen(true);
      return;
    }

    setSubmitted(true);
    showToast('Cadastro gratuito concluído com sucesso!');
  };

  const handleWhatsAppContact = () => {
    const text = encodeURIComponent(
      `Olá equipe MELHOR DA ILHA! Quero cadastrar/atualizar meu negócio: ${formData.name || '(Nome)'} em ${formData.city} no plano ${selectedPlan.toUpperCase()}.`
    );
    window.open(`https://wa.me/5571999545085?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-hidden">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] transition-all duration-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="advertise-modal-title"
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-5 sm:p-7 pb-4 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
          <div className="flex items-center gap-3 pr-8">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 id="advertise-modal-title" className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                Anuncie no Melhor da Ilha
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cadastre sua empresa ou ative seu plano comercial na Ilha de Itaparica e RMS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar modal de cadastro"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Wrap */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 pt-4 custom-scrollbar">
            {!submitted ? (
              <>
              {/* Smart Detection Banner */}
              {matchedBusiness && (
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-transparent border-2 border-amber-500/60 dark:bg-amber-950/40 text-slate-900 dark:text-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md font-black text-xl">
                      🎉
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider mb-1">
                        VOCÊ JÁ FAZ PARTE DO NOSSO TIME!
                      </div>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                        "{matchedBusiness.name}" já está cadastrado no Guia Melhor da Ilha!
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        Identificamos o seu negócio cadastrado em <strong>{matchedBusiness.cityName}</strong> ({matchedBusiness.neighborhood}). Seu perfil já está ativo no catálogo básico.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-amber-500/30 space-y-3">
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Assine um plano mensal para subir ao topo:</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Upgrade Option 1 */}
                      <div className="p-3.5 rounded-xl border border-teal-500/50 bg-white/90 dark:bg-slate-900/90 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                              Plano Destaque
                            </span>
                            <span className="font-black text-xs text-teal-600 dark:text-teal-400">
                              R$ 29/mês
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                            Selo Verificado oficial e topo na categoria.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUpgradeExisting('destaque', true)}
                          className="mt-3 w-full py-2 px-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Pagar R$ 29 (Mercado Pago)</span>
                        </button>
                      </div>

                      {/* Upgrade Option 2 */}
                      <div className="p-3.5 rounded-xl border-2 border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              RMS Premium
                            </span>
                            <span className="font-black text-xs text-amber-600 dark:text-amber-400">
                              R$ 59/mês
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                            Destaque máximo + Mini-Site exclusivo.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUpgradeExisting('premium', true)}
                          className="mt-3 w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Pagar R$ 59 (Mercado Pago)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-right mt-3">
                    <button type="button" onClick={() => setDismissMatch(true)} className="text-[10px] text-slate-500 hover:underline">
                      Não é o meu negócio? Continuar cadastro.
                    </button>
                  </div>
                </div>
              )}

              {/* Plans selector for new registrations */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setSelectedPlan('free')}
                  className={`p-3.5 rounded-2xl text-left border transition-all ${
                    selectedPlan === 'free'
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 ring-2 ring-teal-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 dark:text-white">Gratuito</div>
                  <div className="text-base font-extrabold text-teal-600 dark:text-teal-400">R$ 0</div>
                  <div className="text-[10px] text-slate-500 mt-1 leading-tight">Presença básica no guia.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlan('destaque')}
                  className={`relative p-3.5 rounded-2xl text-left border transition-all ${
                    selectedPlan === 'destaque'
                      ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/40 shadow-sm ring-2 ring-teal-500/40'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span className="absolute -top-2 right-2 px-2 py-0.5 rounded-full bg-teal-500 text-white font-black text-[8px] uppercase tracking-wide shadow-sm z-10">
                    Mais Popular
                  </span>
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Destaque
                  </div>
                  <div className="text-base font-extrabold text-teal-600 dark:text-teal-400">R$ 29/mês</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlan('premium')}
                  className={`relative p-3.5 rounded-2xl text-left border transition-all ${
                    selectedPlan === 'premium'
                      ? 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/40 shadow-md ring-2 ring-amber-400/50'
                      : 'border-slate-200 dark:border-slate-800 hover:border-amber-300'
                  }`}
                >
                  <span className="absolute -top-2 right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[8px] uppercase tracking-wide shadow-sm z-10">
                    ★ TOPO DO SITE
                  </span>
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> RMS Premium
                  </div>
                  <div className="text-base font-extrabold text-amber-600 dark:text-amber-400">R$ 59/mês</div>
                </button>
              </div>

              {/* Form Body Content */}
              <div className="space-y-4 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nome do Negócio ou Profissional *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Ex: Pousada Sol, Oficina Silva, Dr. Marcos..."
                      value={formData.name}
                      onChange={e => {
                        setFormData({ ...formData, name: e.target.value });
                        if (dismissMatch) setDismissMatch(false);
                      }}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    {matchedBusiness && (
                      <span className="absolute right-2.5 top-2 px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[9px] font-black">
                        JÁ NO GUIA
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Categoria Principal *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 1. CEP Inteligente com Auto-Preenchimento ViaCEP */}
              <div className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-teal-950 dark:text-teal-200 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Localização Inteligente por CEP *</span>
                  </label>
                  <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold bg-teal-100/70 dark:bg-teal-900/50 px-2 py-0.5 rounded-full">
                    Auto-preenchimento ViaCEP
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={9}
                    placeholder="Digite o CEP (ex: 44470-000 ou 41830-490)"
                    value={cep}
                    onChange={e => handleCepChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-teal-300 dark:border-teal-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono tracking-wide placeholder:font-sans placeholder:tracking-normal"
                  />
                  <div className="absolute right-3 top-2.5 flex items-center gap-1.5 text-xs">
                    {cepLoading && (
                      <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 text-[11px] font-semibold animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Consultando...
                      </span>
                    )}
                    {cepSuccess && (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Identificado!
                      </span>
                    )}
                  </div>
                </div>

                {cepError && (
                  <p className="text-[11px] text-rose-500 dark:text-rose-400 font-medium">
                    {cepError}
                  </p>
                )}

                {/* Resumo do Endereço Localizado */}
                {cepSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1 leading-snug">
                      <span className="font-bold">Endereço identificado: </span>
                      <span>
                        {logradouro ? `${logradouro}, ` : ''}
                        {formData.neighborhood} — {formData.city} (BA)
                      </span>
                    </div>
                  </div>
                )}

                {/* Campos simplificados: Número do Imóvel + Ponto de Referência */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Número do Imóvel *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 120, S/N, Loja 02, Box 15"
                      value={numero}
                      onChange={e => setNumero(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Ponto de Referência
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Em frente à praça, Ferry Boat, Ao lado do mercado"
                      value={referencia}
                      onChange={e => setReferencia(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Opção para alternar campos manuais de Município e Bairro se desejar */}
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowManualAddress(!showManualAddress)}
                    className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>{showManualAddress ? '▾ Ocultar edição manual de Município e Bairro' : '▸ Ajustar Município ou Bairro manualmente'}</span>
                  </button>

                  {showManualAddress && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-teal-200/60 dark:border-teal-800/40">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Logradouro / Rua
                        </label>
                        <input
                          type="text"
                          placeholder="Rua, Avenida, Travessa..."
                          value={logradouro}
                          onChange={e => setLogradouro(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Município
                        </label>
                        <select
                          value={formData.city}
                          onChange={e => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                        >
                          {CITIES.map(c => (
                            <option key={c.id} value={c.name}>
                              {c.name} ({c.region})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          Bairro
                        </label>
                        <input
                          type="text"
                          placeholder="Bairro"
                          value={formData.neighborhood}
                          onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Imagem Contextualizada por Segmento de Atividade */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Capa do Estabelecimento (Automática por Segmento)</span>
                  </label>
                  <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                    HD Unsplash
                  </span>
                </div>

                {/* Banner de Preview da Capa Contextual */}
                <div className="relative h-28 sm:h-32 w-full rounded-xl overflow-hidden shadow-inner border border-slate-200/80 dark:border-slate-700">
                  <img
                    src={customCoverImage.trim() || contextualCoverImage}
                    alt={`Capa sugerida para ${formData.category}`}
                    className="w-full h-full object-cover transition-all duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-black/20 to-transparent flex items-end p-2.5">
                    <span className="text-[11px] font-bold text-white drop-shadow-md">
                      {customCoverImage.trim()
                        ? '📸 Foto personalizada configurada'
                        : `📸 Foto representativa de: ${formData.category}`}
                    </span>
                  </div>
                </div>

                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowCustomImageInput(!showCustomImageInput)}
                    className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    {showCustomImageInput ? '▾ Usar foto contextual automática' : '▸ Prefiro enviar link de foto própria (opcional)'}
                  </button>

                  {showCustomImageInput && (
                    <div className="mt-2">
                      <input
                        type="url"
                        placeholder="https://exemplo.com/minha-foto.jpg"
                        value={customCoverImage}
                        onChange={e => setCustomCoverImage(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        Cole o link público de uma imagem de fachada, ambiente ou produto da sua empresa. Se deixar em branco, o sistema usará a foto de alta qualidade selecionada para seu segmento.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp para Clientes *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: (71) 98842-1920"
                    value={formData.whatsapp}
                    onChange={e => {
                      setFormData({ ...formData, whatsapp: e.target.value });
                      if (dismissMatch) setDismissMatch(false);
                    }}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Instagram (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: @seunegocio"
                    value={formData.instagram}
                    onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Serviços e Especialidades (separados por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Peças multimarcas, Troca de óleo, Revisão preventiva, Socorro 24h"
                  value={formData.services}
                  onChange={e => setFormData({ ...formData, services: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição ou Apresentação
                </label>
                <textarea
                  rows={2}
                  placeholder="Conte sobre sua história, horário de funcionamento e diferenciais..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </>
        ) : (
            <div className="py-4 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {selectedPlan === 'premium' ? '🎉 Mini-Site Ativo & Perfil no Topo!' : 'Parabéns! Cadastro Ativado com Sucesso!'}
              </h3>

              {selectedPlan === 'premium' ? (
                <div className="space-y-4 text-left">
                  {/* Simulated Browser Bar */}
                  <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 text-white shadow-xl">
                    <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                        <span className="ml-2 text-slate-400">melhordailha.online/meu-site</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                        ⭐ CLIENTE PREMIUM
                      </span>
                    </div>

                    {/* Mini-site Preview Card */}
                    <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-900 to-slate-950 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[10px]">
                              CLIENTE PREMIUM ⭐
                            </span>
                            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> Verificado
                            </span>
                          </div>
                          <h4 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                            {createdBiz?.name || formData.name}
                          </h4>
                          <p className="text-xs text-slate-300">
                            {createdBiz?.neighborhood || formData.neighborhood}, {createdBiz?.cityName || formData.city} · {createdBiz?.categoryName || formData.category}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-amber-400 font-black text-sm flex items-center gap-1 justify-end">
                            <Star className="w-4 h-4 fill-amber-400" /> 5.0
                          </div>
                          <span className="text-[10px] text-slate-400">Página Oficial</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 italic bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                        "{createdBiz?.description || formData.description || 'Atendimento de alta qualidade na Ilha de Itaparica e RMS.'}"
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(createdBiz?.services || (formData.services ? formData.services.split(',') : ['Atendimento no WhatsApp', 'Orçamento Rápido'])).map((s: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-teal-950/80 border border-teal-800 text-[10px] text-teal-300 font-medium">
                            ✓ {s.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Open in new tab CTA */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenMiniSite && createdBiz) {
                          onOpenMiniSite(createdBiz);
                        } else {
                          window.location.href = `/perfil/${createdBiz?.slug || 'novo-cliente'}`;
                        }
                      }}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-teal-900/30 flex items-center justify-center gap-2 transition-all hover:scale-101 text-center"
                    >
                      <span>Abrir Mini-Site Oficial ↗ (melhordailha.online/perfil/{createdBiz?.slug || 'seu-negocio'})</span>
                    </button>
                    <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                      O link do seu mini-site está ativo e pode ser divulgado no seu Instagram, cartões e WhatsApp!
                    </p>
                  </div>
                </div>
              ) : (
                <p className="max-w-md mx-auto text-sm text-slate-600 dark:text-slate-300">
                  O seu negócio <strong>{createdBiz?.name || formData.name}</strong> foi atualizado com sucesso no Guia Melhor da Ilha no plano {selectedPlan === 'destaque' ? 'Destaque Ilha (R$ 29/mês)' : 'Gratuito'}.
                </p>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-md"
                >
                  Ver no Topo do Guia ⭐
                </button>
                <button
                  type="button"
                  onClick={handleWhatsAppContact}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-emerald-500/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                >
                  Falar com a Central no WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>

          {!submitted && (
            <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shrink-0">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleWhatsAppContact}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs font-bold transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Falar com o Comercial</span>
                </button>

                <button
                  type="submit"
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold shadow-md transition-all hover:scale-102 ${
                    selectedPlan === 'premium'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/20 font-black'
                      : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-600/20'
                  }`}
                >
                  {selectedPlan !== 'free' ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>
                        {selectedPlan === 'premium'
                          ? 'Pagar R$ 59/mês no Mercado Pago (Sem sair)'
                          : 'Pagar R$ 29/mês no Mercado Pago (Sem sair)'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{matchedBusiness ? 'Ativar Cadastro Gratuito' : 'Concluir Cadastro Gratuito'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Modal de Checkout Mercado Pago sem sair do site */}
        <MercadoPagoModal
          isOpen={isMpModalOpen}
          onClose={() => setIsMpModalOpen(false)}
          business={mpModalData?.business || createdBiz || { name: formData.name, cityName: formData.city }}
          planType={mpModalData?.planType || (selectedPlan === 'free' ? 'destaque' : selectedPlan)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </div>
    </div>
  );
};
