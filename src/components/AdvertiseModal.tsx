import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  CheckCircle2,
  Send,
  MessageCircle,
  ShieldCheck,
  Star
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { CITIES } from '../data/cities';
import { useFavorites } from '../context/FavoritesContext';

interface AdvertiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBusinessAdded?: (biz: any) => void;
}

export const AdvertiseModal: React.FC<AdvertiseModalProps> = ({
  isOpen,
  onClose,
  onBusinessAdded
}) => {
  const { showToast } = useFavorites();
  const [submitted, setSubmitted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'destaque' | 'premium'>('destaque');

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.whatsapp.trim()) {
      showToast('Por favor, informe o nome do negócio e WhatsApp.');
      return;
    }

    if (onBusinessAdded) {
      const selectedCityObj = CITIES.find(c => c.name === formData.city) || CITIES[0];
      const selectedCatObj = CATEGORIES.find(c => c.name === formData.category) || CATEGORIES[0];
      const isRmsPremium = selectedPlan === 'premium';

      const newBiz = {
        id: `custom-${Date.now()}`,
        name: formData.name.trim(),
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        tagline: formData.services.slice(0, 80) || 'Negócio local na Ilha de Itaparica e RMS',
        description: formData.description.trim() || 'Cadastrado no guia oficial MELHOR DA ILHA.',
        categoryId: selectedCatObj.id,
        categoryName: selectedCatObj.name,
        cityId: selectedCityObj.id,
        cityName: selectedCityObj.name,
        neighborhood: formData.neighborhood.trim() || 'Centro',
        address: `${formData.neighborhood}, ${formData.city} - BA`,
        phone: formData.phone || formData.whatsapp,
        whatsapp: formData.whatsapp.replace(/\D/g, ''),
        instagram: formData.instagram.trim() || undefined,
        rating: 5.0,
        reviewCount: 1,
        priceLevel: '$$' as const,
        tags: [formData.category.split(' ')[0], formData.neighborhood],
        services: formData.services ? formData.services.split(',').map(s => s.trim()) : ['Atendimento Local'],
        isVerified: true,
        isFeatured: isRmsPremium || selectedPlan === 'destaque',
        isRmsPremium: isRmsPremium,
        planType: selectedPlan,
        registeredAt: Date.now(),
        hasDelivery: true,
        isOpenNow: true,
        openingHoursText: 'Segunda a Sábado: Horário Comercial',
        coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=700&q=80',
        badgeText: isRmsPremium ? 'CLIENTE PREMIUM ⭐' : (selectedPlan === 'destaque' ? 'Destaque Ilha' : undefined)
      };

      onBusinessAdded(newBiz);
    }

    // Persist lead to Firestore
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

    setSubmitted(true);
    showToast('Cadastro recebido! Seu negócio foi adicionado com sucesso.');
  };

  const handleWhatsAppContact = () => {
    const text = encodeURIComponent(
      `Olá equipe MELHOR DA ILHA! Quero cadastrar meu negócio: ${formData.name || '(Nome)'} em ${formData.city} no plano ${selectedPlan.toUpperCase()}.`
    );
    window.open(`https://wa.me/5571999545085?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[92vh] flex flex-col overflow-y-auto transition-all duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="advertise-modal-title"
      >
        <button
          onClick={onClose}
          aria-label="Fechar modal de cadastro"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            <div className="flex items-center gap-3 mb-4 pr-10">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 id="advertise-modal-title" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Anuncie no Melhor da Ilha
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Seja encontrado por moradores e turistas na Ilha e Salvador
                </p>
              </div>
            </div>

            {/* Plans selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
              {/* Free */}
              <button
                type="button"
                onClick={() => setSelectedPlan('free')}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  selectedPlan === 'free'
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 dark:text-white">Gratuito</div>
                <div className="text-base font-extrabold text-teal-600 dark:text-teal-400">R$ 0</div>
                <div className="text-[11px] text-slate-500 mt-1 leading-tight">
                  Presença no guia, telefone e WhatsApp
                </div>
              </button>

              {/* Destaque Ilha */}
              <button
                type="button"
                onClick={() => setSelectedPlan('destaque')}
                className={`relative p-3 rounded-2xl text-left border transition-all ${
                  selectedPlan === 'destaque'
                    ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wide">
                  Mais Popular
                </span>
                <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Destaque Ilha
                </div>
                <div className="text-base font-extrabold text-teal-600 dark:text-teal-400">R$ 29/mês</div>
                <div className="text-[11px] text-slate-500 mt-1 leading-tight">
                  Selo Verificado, topo da categoria e suporte
                </div>
              </button>

              {/* RMS Premium */}
              <button
                type="button"
                onClick={() => setSelectedPlan('premium')}
                className={`relative p-3 rounded-2xl text-left border transition-all ${
                  selectedPlan === 'premium'
                    ? 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/40 shadow-md ring-2 ring-amber-400/50'
                    : 'border-slate-200 dark:border-slate-800 hover:border-amber-300'
                }`}
              >
                <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[9px] uppercase tracking-wide shadow-sm flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-slate-950 text-slate-950" />
                  TOPO DO SITE
                </span>
                <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  Plano RMS Premium
                </div>
                <div className="text-base font-extrabold text-amber-600 dark:text-amber-400">R$ 59/mês</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-tight font-medium">
                  Sobe ao topo com estrela <strong>CLIENTE PREMIUM ⭐</strong> + Bônus de <strong>Mini-Site em melhordailha.online/meu-site</strong>
                </div>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nome do Negócio ou Profissional *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Silveira Motos, Pousada Sol..."
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Município *
                  </label>
                  <select
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  >
                    {CITIES.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.region})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bairro ou Localidade
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Mar Grande, Ponta de Areia, Barra Grande..."
                    value={formData.neighborhood}
                    onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
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
                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
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
                  rows={3}
                  placeholder="Conte sobre sua história, horário de funcionamento e diferenciais..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
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
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all hover:scale-102"
                >
                  <Send className="w-4 h-4" />
                  <span>Concluir Cadastro</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Cadastro Concluído com Sucesso!
            </h3>
            {selectedPlan === 'premium' ? (
              <div className="max-w-md mx-auto space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <p>
                  O seu negócio <strong>{formData.name}</strong> foi cadastrado no <strong>Plano RMS Premium R$ 59/mês</strong> e subiu imediatamente para o <span className="text-amber-600 dark:text-amber-400 font-black">TOPO DO SITE</span> com a estrela dourada de <strong>CLIENTE PREMIUM ⭐</strong>!
                </p>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-xs text-amber-900 dark:text-amber-200 font-medium">
                  🎁 <strong>BÔNUS EXCLUSIVO ATIVADO:</strong> Sua página oficial com mini-site pronto já está reservada em:
                  <div className="font-mono font-bold text-teal-700 dark:text-teal-300 mt-1">
                    melhordailha.online/meu-site
                  </div>
                </div>
              </div>
            ) : (
              <p className="max-w-md mx-auto text-sm text-slate-600 dark:text-slate-300">
                O seu negócio <strong>{formData.name}</strong> já foi incluído no guia e está pronto para ser visto por milhares de clientes na Ilha e RMS.
              </p>
            )}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-md"
              >
                Voltar ao Guia
              </button>
              <button
                type="button"
                onClick={handleWhatsAppContact}
                className="px-6 py-2.5 rounded-xl border border-emerald-500/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              >
                Chamar no WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
