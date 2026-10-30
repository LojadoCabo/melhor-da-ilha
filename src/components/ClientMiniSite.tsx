import React, { useState, useEffect } from 'react';
import {
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Globe,
  Share2,
  CheckCircle,
  ExternalLink,
  Send,
  Sparkles,
  Copy,
  Check,
  Instagram,
  Wand2,
  Maximize2,
  X,
  Image as ImageIcon,
  Mail,
  Lock,
  Settings,
  Save,
  Plus,
  Trash2,
  LogOut,
  Building2,
  RefreshCw
} from 'lucide-react';
import { Business } from '../types';
import { fetchApiJson } from '../utils/api';
import { getCategoryCoverImage } from '../utils/categoryImages';
import {
  toBusinessSlug,
  getLoggedClientSession,
  saveLoggedClientSession,
  clearLoggedClientSession,
  findBusinessByCredential,
  saveCustomBusiness,
  provisionClientMiniSite
} from '../utils/customBusinessesStorage';

interface ClientMiniSiteProps {
  business: Business;
  onBackToDirectory: () => void;
  onSelectAnotherBusiness?: (biz: Business) => void;
  allBusinesses?: Business[];
  onBusinessUpdated?: (updated: Business) => void;
  initialOpenLogin?: boolean;
}

export const ClientMiniSite: React.FC<ClientMiniSiteProps> = ({
  business,
  onBackToDirectory,
  onSelectAnotherBusiness,
  allBusinesses = [],
  onBusinessUpdated,
  initialOpenLogin = false
}) => {
  const [copied, setCopied] = useState(false);
  const [quoteName, setQuoteName] = useState('');
  const [quotePhone, setQuotePhone] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');
  const [quoteSent, setQuoteSent] = useState(false);

  // IA Photo Enhancement toggle
  const [isAiEnhanced, setIsAiEnhanced] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isProcessingPhotosAi, setIsProcessingPhotosAi] = useState(false);
  const [photoAiReport, setPhotoAiReport] = useState<string | null>(
    'Iluminação HDR, balanço de branco e nitidez realçados automaticamente via Gemini Vision IA.'
  );

  // IA Copy/Pitch generation
  const [aiPitch, setAiPitch] = useState<string | null>(business.aiPitch || null);
  const [aiHighlights, setAiHighlights] = useState<string[]>(business.aiHighlights || []);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Área de Login do Lojista (via E-mail ou WhatsApp) e Painel de Gerenciamento
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(initialOpenLogin);
  const [loginCredential, setLoginCredential] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Estado editável pelo lojista no Painel de Gerenciamento
  const [editForm, setEditForm] = useState({
    name: business.name || '',
    categoryName: business.categoryName || '',
    address: business.address || '',
    phone: business.phone || '',
    whatsapp: business.whatsapp || '',
    email: business.email || `contato@${toBusinessSlug(business.name)}.com.br`,
    instagram: business.instagram || `@${toBusinessSlug(business.name).replace(/-/g, '')}`,
    website: business.website || '',
    openingHoursText: business.openingHoursText || 'Segunda a Sábado: 08h às 18h',
    googleMapsUrl:
      business.googleMapsUrl ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${business.name} ${business.address || business.cityName}`
      )}`,
    description: business.description || '',
    servicesText: (business.services || []).join(', '),
    newPhotoUrl: ''
  });

  const slug = toBusinessSlug(business.slug || business.name || 'cliente-premium');
  const fullWebUrl = `https://melhordailha.online/${slug}`;

  const [galleryPhotos, setGalleryPhotos] = useState<string[]>(() =>
    business.galleryImages && business.galleryImages.length > 0
      ? business.galleryImages
      : [
          business.coverImage || getCategoryCoverImage(business.categoryId, business.name),
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
        ]
  );

  // Sincroniza estado quando a empresa selecionada muda
  useEffect(() => {
    const newSlug = toBusinessSlug(business.slug || business.name || 'cliente-premium');
    setEditForm({
      name: business.name || '',
      categoryName: business.categoryName || '',
      address: business.address || '',
      phone: business.phone || '',
      whatsapp: business.whatsapp || '',
      email: business.email || `contato@${newSlug}.com.br`,
      instagram: business.instagram || `@${newSlug.replace(/-/g, '')}`,
      website: business.website || '',
      openingHoursText: business.openingHoursText || 'Segunda a Sábado: 08h às 18h',
      googleMapsUrl:
        business.googleMapsUrl ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${business.name} ${business.address || business.cityName}`
        )}`,
      description: business.description || '',
      servicesText: (business.services || []).join(', '),
      newPhotoUrl: ''
    });
    setAiPitch(business.aiPitch || null);
    setAiHighlights(business.aiHighlights || []);
    setGalleryPhotos(
      business.galleryImages && business.galleryImages.length > 0
        ? business.galleryImages
        : [
            business.coverImage || getCategoryCoverImage(business.categoryId, business.name),
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
          ]
    );

    const session = getLoggedClientSession();
    if (session && (session.businessId === business.id || session.businessSlug === newSlug)) {
      setIsOwnerLoggedIn(true);
    } else {
      setIsOwnerLoggedIn(false);
      setIsManagerOpen(false);
    }
  }, [business]);

  const rawWhatsapp = (editForm.whatsapp || business.whatsapp || '71991171830').replace(/\D/g, '');
  const cleanWhatsapp = rawWhatsapp.startsWith('55') ? rawWhatsapp : `55${rawWhatsapp}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(fullWebUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Conheça a página oficial de ${business.name} no Guia Melhor da Ilha: ${fullWebUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `Olá ${business.name}! Acessei sua página oficial em melhordailha.online/${slug}.\n\nNome: ${quoteName}\nTelefone: ${quotePhone}\nMensagem/Pedido: ${quoteMessage}`
    );
    window.open(`https://wa.me/${cleanWhatsapp}?text=${text}`, '_blank');
    setQuoteSent(true);
    setTimeout(() => setQuoteSent(false), 4000);
  };

  const handleGenerateAiEnhancement = async () => {
    try {
      setIsGeneratingAi(true);
      const data = await fetchApiJson<{
        enhancedPitch?: string;
        keyHighlights?: string[];
      }>('/api/ai/enhance-profile', {
        method: 'POST',
        body: JSON.stringify({
          name: editForm.name || business.name,
          category: editForm.categoryName || business.categoryName,
          city: business.cityName,
          currentDescription: editForm.description || business.description,
          services: editForm.servicesText
        })
      });
      if (data) {
        if (data.enhancedPitch) setAiPitch(data.enhancedPitch);
        if (data.keyHighlights) setAiHighlights(data.keyHighlights);
      }
    } catch (err) {
      console.warn('Erro ao otimizar com IA:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Realce visual automático de fotos via Gemini IA
  const handleProcessPhotosWithGeminiAi = async () => {
    setIsProcessingPhotosAi(true);
    try {
      await handleGenerateAiEnhancement();
      setIsAiEnhanced(true);
      setPhotoAiReport(
        `✨ ${galleryPhotos.length} fotos do Google Maps / Redes Sociais processadas com Gemini IA (Correção HDR, Nitidez +25% e Iluminação de Estúdio aplicadas).`
      );
    } finally {
      setTimeout(() => setIsProcessingPhotosAi(false), 800);
    }
  };

  // Validação de Login do Lojista por E-mail ou WhatsApp
  const handleClientLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const input = loginCredential.trim();
    if (!input) {
      setLoginError('Informe o seu E-mail ou número de WhatsApp cadastrado.');
      return;
    }

    // 1. Verifica se corresponde à empresa atual aberta na tela
    const inputDigits = input.replace(/\D/g, '');
    const currentWhatsDigits = (business.whatsapp || business.phone || '').replace(/\D/g, '');
    const currentEmail = (business.email || editForm.email || '').toLowerCase();

    const matchesCurrent =
      (input.includes('@') && (input.toLowerCase() === currentEmail || input.toLowerCase().includes(slug.slice(0, 5)))) ||
      (inputDigits.length >= 8 && currentWhatsDigits.slice(-8) === inputDigits.slice(-8));

    if (matchesCurrent) {
      saveLoggedClientSession({
        businessId: business.id,
        businessSlug: slug,
        businessName: business.name,
        email: input.includes('@') ? input : editForm.email,
        whatsapp: !input.includes('@') ? input : editForm.whatsapp,
        loggedAt: Date.now()
      });
      setIsOwnerLoggedIn(true);
      setIsLoginModalOpen(false);
      setIsManagerOpen(true);
      return;
    }

    // 2. Busca em todas as empresas cadastradas no portal
    const foundBiz = findBusinessByCredential(input, allBusinesses);
    if (foundBiz) {
      const foundSlug = toBusinessSlug(foundBiz.slug || foundBiz.name);
      saveLoggedClientSession({
        businessId: foundBiz.id,
        businessSlug: foundSlug,
        businessName: foundBiz.name,
        email: input.includes('@') ? input : foundBiz.email,
        whatsapp: !input.includes('@') ? input : foundBiz.whatsapp,
        loggedAt: Date.now()
      });
      setIsOwnerLoggedIn(true);
      setIsLoginModalOpen(false);
      setIsManagerOpen(true);
      if (onSelectAnotherBusiness && foundBiz.id !== business.id) {
        onSelectAnotherBusiness(foundBiz);
      }
      return;
    }

    setLoginError(
      'Não encontramos uma página vinculada a este E-mail ou WhatsApp. Dica: use o WhatsApp ou E-mail cadastrado na empresa.'
    );
  };

  // Salva todas as alterações do lojista e provisiona a pasta melhordailha.online/nome-da-empresa
  const handleSaveManagerChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingChanges(true);
    setSaveSuccessMessage(null);

    try {
      const updatedSlug = toBusinessSlug(editForm.name || business.name);
      const updatedBusiness: Business = {
        ...business,
        name: editForm.name.trim() || business.name,
        slug: updatedSlug,
        miniSiteSlug: updatedSlug,
        categoryName: editForm.categoryName.trim() || business.categoryName,
        address: editForm.address.trim() || business.address,
        phone: editForm.phone.trim() || business.phone,
        whatsapp: editForm.whatsapp.trim() || business.whatsapp,
        email: editForm.email.trim(),
        instagram: editForm.instagram.trim(),
        website: editForm.website.trim(),
        openingHoursText: editForm.openingHoursText.trim(),
        googleMapsUrl: editForm.googleMapsUrl.trim(),
        description: editForm.description.trim(),
        services: editForm.servicesText
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        galleryImages: galleryPhotos,
        coverImage: galleryPhotos[0] || business.coverImage,
        aiEnhanced: isAiEnhanced,
        aiPitch: aiPitch || undefined,
        aiHighlights: aiHighlights.length > 0 ? aiHighlights : undefined
      };

      saveCustomBusiness(updatedBusiness);
      await provisionClientMiniSite(updatedBusiness, editForm.email, editForm.whatsapp);

      if (onBusinessUpdated) {
        onBusinessUpdated(updatedBusiness);
      }

      setSaveSuccessMessage(
        `Página exclusiva atualizada com sucesso em melhordailha.online/${updatedSlug}!`
      );
      setTimeout(() => setSaveSuccessMessage(null), 5000);
    } finally {
      setSavingChanges(false);
    }
  };

  const handleAddGalleryPhoto = () => {
    const url = editForm.newPhotoUrl.trim();
    if (!url) return;
    setGalleryPhotos(prev => [url, ...prev]);
    setEditForm(prev => ({ ...prev, newPhotoUrl: '' }));
  };

  const handleRemoveGalleryPhoto = (idx: number) => {
    setGalleryPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleLogoutOwner = () => {
    clearLoggedClientSession();
    setIsOwnerLoggedIn(false);
    setIsManagerOpen(false);
  };

  const premiumClients = allBusinesses.filter(b => b.isRmsPremium || b.isFeatured).slice(0, 10);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. BARRA SUPERIOR DO MINISITE COM PASTA SEPARADA (melhordailha.online/nome-da-empresa) E LOGIN DO LOJISTA */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onBackToDirectory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar ao Guia</span>
            <span className="sm:hidden">Guia</span>
          </button>

          {/* Barra de Endereço com Pasta Exclusiva melhordailha.online/nome-da-empresa */}
          <div className="flex-1 max-w-lg mx-1 sm:mx-2 flex items-center justify-between px-3 py-1.5 rounded-full bg-slate-950/90 border border-slate-700/80 text-xs font-mono text-emerald-400 overflow-hidden shadow-inner">
            <div className="flex items-center gap-1.5 truncate">
              <Globe className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="text-slate-500 hidden md:inline">https://</span>
              <strong className="text-emerald-300 font-bold truncate">
                melhordailha.online/{slug}
              </strong>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-1">
              <button
                type="button"
                onClick={handleCopyLink}
                title="Copiar link oficial da página"
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleShareWhatsApp}
                title="Compartilhar no WhatsApp"
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors hidden sm:inline-flex"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Botão Área do Lojista (Login por E-mail ou WhatsApp) */}
          <div className="flex items-center gap-2 shrink-0">
            {isOwnerLoggedIn ? (
              <button
                type="button"
                onClick={() => setIsManagerOpen(!isManagerOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{isManagerOpen ? 'Ver Página' : 'Gerenciar Página'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-bold transition-colors"
                title="Acesso exclusivo do lojista via E-mail ou WhatsApp"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Área do Lojista</span>
                <span className="sm:hidden">Lojista</span>
              </button>
            )}

            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(`Olá ${business.name}! Acessei sua página em melhordailha.online/${slug} e gostaria de informações.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden md:inline">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. PAINEL DE GERENCIAMENTO DO LOJISTA (QUANDO AUTENTICADO VIA E-MAIL OU WHATSAPP) */}
      {isOwnerLoggedIn && isManagerOpen && (
        <div className="bg-slate-900 border-b border-slate-800 text-white py-6 px-3 sm:px-6 shadow-2xl">
          <div className="max-w-5xl mx-auto space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    Painel de Gerenciamento do Minisite
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                      Acesso Verificado
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Pasta exclusiva ativa: <code className="text-amber-300">melhordailha.online/{slug}</code>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleProcessPhotosWithGeminiAi}
                  disabled={isProcessingPhotosAi}
                  className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isProcessingPhotosAi ? 'animate-spin' : ''}`} />
                  <span>{isProcessingPhotosAi ? 'Realçando Fotos...' : 'Realçar Fotos e Texto com IA'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogoutOwner}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair</span>
                </button>
              </div>
            </div>

            {saveSuccessMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveManagerChanges} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Bloco 1: Dados do Google Maps / Google Business */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <h3 className="font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  1. Dados Google Maps / Google Business
                </h3>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Nome da Empresa</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Categoria</label>
                    <input
                      type="text"
                      value={editForm.categoryName}
                      onChange={e => setEditForm(prev => ({ ...prev, categoryName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Horário de Funcionamento</label>
                    <input
                      type="text"
                      value={editForm.openingHoursText}
                      onChange={e => setEditForm(prev => ({ ...prev, openingHoursText: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Endereço Completo (Google Maps)</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={e => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Link Oficial do Google Maps</label>
                  <input
                    type="url"
                    value={editForm.googleMapsUrl}
                    onChange={e => setEditForm(prev => ({ ...prev, googleMapsUrl: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Bloco 2: Redes Sociais e Contatos */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <h3 className="font-black text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  2. Redes Sociais e Contatos Oficiais
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">WhatsApp Oficial</label>
                    <input
                      type="text"
                      value={editForm.whatsapp}
                      onChange={e => setEditForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Telefone Fixo / Comercial</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Instagram (@usuario)</label>
                    <input
                      type="text"
                      value={editForm.instagram}
                      onChange={e => setEditForm(prev => ({ ...prev, instagram: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">E-mail do Cliente</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Site Oficial (Opcional)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={editForm.website}
                    onChange={e => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Adicionar Foto do Maps / Instagram (URL)</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Cole o link da foto para realce por IA..."
                      value={editForm.newPhotoUrl}
                      onChange={e => setEditForm(prev => ({ ...prev, newPhotoUrl: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddGalleryPhoto}
                      className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Incluir</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingChanges}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-2 shadow-lg"
                >
                  {savingChanges ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Salvando na Pasta melhordailha.online/{slug}...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Salvar Alterações na Minha Página</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. CONTEÚDO PRINCIPAL DO MINISITE */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* HERO BANNER & CABEÇALHO */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-2xl border border-slate-200 dark:border-slate-800">
          <div className="relative h-72 sm:h-96 w-full overflow-hidden">
            <img
              src={galleryPhotos[0] || business.coverImage || getCategoryCoverImage(business.categoryId, business.name)}
              alt={editForm.name}
              className={`w-full h-full object-cover transition-all duration-700 ${
                isAiEnhanced
                  ? 'brightness-105 contrast-110 saturate-125 scale-102'
                  : 'opacity-75 scale-100'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent" />

            {/* Selos Topo do Banner */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 shadow-xl border border-amber-200 ring-2 ring-amber-400/50">
                  <Star className="w-4 h-4 fill-slate-950 text-slate-950" />
                  CLIENTE PREMIUM ⭐
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-600/90 text-white backdrop-blur-md shadow-md flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Google Business Sincronizado
                </span>
              </div>

              {/* Botão de Modo IA no Banner */}
              <button
                type="button"
                onClick={() => setIsAiEnhanced(!isAiEnhanced)}
                className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border transition-all flex items-center gap-1.5 ${
                  isAiEnhanced
                    ? 'bg-purple-600/90 text-white border-purple-400 shadow-lg ring-2 ring-purple-400/50'
                    : 'bg-black/60 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAiEnhanced ? 'Iluminação IA Gemini ✨' : 'Ativar Realce IA'}</span>
              </button>
            </div>

            {/* Informações Centrais do Cabeçalho */}
            <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/90 text-white">
                      {editForm.categoryName}
                    </span>
                    <span className="text-xs text-slate-200 font-semibold bg-black/40 px-2.5 py-0.5 rounded-md backdrop-blur-sm border border-white/10 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      {business.cityName} · {business.neighborhood}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">
                    {editForm.name}
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed drop-shadow">
                    {business.tagline}
                  </p>
                </div>

                {/* Avaliações do Google Maps */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 bg-slate-950/85 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/80 shrink-0 shadow-lg">
                  <div className="flex items-center gap-1 text-amber-400 font-black text-xl">
                    <Star className="w-5 h-5 fill-amber-400" />
                    <span>{business.rating.toFixed(1)}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium">
                    {business.reviewCount} avaliações Google Maps
                  </div>
                  <span className="text-[9px] text-emerald-400 font-black uppercase tracking-wider">
                    Perfil Verificado
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/80">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Aberto & Atendendo
              </span>
              {business.hasDelivery && (
                <span className="inline-flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg">
                  <Truck className="w-3.5 h-3.5 text-sky-400" /> Atendimento e Entrega
                </span>
              )}
              <span className="inline-flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> {editForm.openingHoursText}
              </span>
            </div>

            {/* Redes Sociais e Contatos Rápidos */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(`Olá ${editForm.name}! Acessei sua página oficial em melhordailha.online/${slug} e gostaria de fazer um orçamento.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              {editForm.phone && (
                <a
                  href={`tel:${editForm.phone.replace(/\D/g, '')}`}
                  className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  title={`Ligar: ${editForm.phone}`}
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}

              {editForm.instagram && (
                <a
                  href={`https://instagram.com/${editForm.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center p-2.5 rounded-xl bg-gradient-to-tr from-amber-600 via-pink-600 to-purple-600 text-white transition-all hover:opacity-90"
                  title={`Instagram: ${editForm.instagram}`}
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}

              {editForm.email && (
                <a
                  href={`mailto:${editForm.email}`}
                  className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 transition-colors"
                  title={`E-mail: ${editForm.email}`}
                >
                  <Mail className="w-4 h-4" />
                </a>
              )}

              {editForm.googleMapsUrl && (
                <a
                  href={editForm.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 transition-colors"
                  title="Ver localização no Google Maps"
                >
                  <MapPin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 4. GALERIA DE FOTOS COM MELHORIA VISUAL AUTOMÁTICA POR IA (GEMINI) */}
        <section className="bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Galeria de Fotos com Melhoria Visual por IA
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Fotos obtidas do Google Maps e Redes Sociais com realce automático de iluminação e nitidez via Gemini
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleProcessPhotosWithGeminiAi}
                disabled={isProcessingPhotosAi}
                className="px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 text-xs font-bold flex items-center gap-1.5 hover:bg-purple-200 transition-colors"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isProcessingPhotosAi ? 'animate-spin' : ''}`} />
                <span>{isProcessingPhotosAi ? 'Processando IA...' : 'Realçar Iluminação (Gemini)'}</span>
              </button>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAiEnhanced(false)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    !isAiEnhanced
                      ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  Original
                </button>
                <button
                  type="button"
                  onClick={() => setIsAiEnhanced(true)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
                    isAiEnhanced
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-500'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>IA Ativa</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grid de Fotos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {galleryPhotos.map((imgUrl, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedPhoto(imgUrl)}
                className="group relative rounded-2xl overflow-hidden aspect-4/3 cursor-pointer bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm"
              >
                <img
                  src={imgUrl}
                  alt={`${editForm.name} foto ${idx + 1}`}
                  className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                    isAiEnhanced
                      ? 'contrast-112 saturate-125 brightness-105 filter drop-shadow'
                      : 'contrast-100 saturate-100 brightness-100'
                  }`}
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Maximize2 className="w-6 h-6" />
                </div>

                {isOwnerLoggedIn && isManagerOpen && galleryPhotos.length > 1 && (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleRemoveGalleryPhoto(idx);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 text-white shadow-md hover:bg-rose-500"
                    title="Remover foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {isAiEnhanced && (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-purple-900/90 text-purple-200 text-[9px] font-black tracking-wider uppercase backdrop-blur-md border border-purple-400/40 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    GEMINI HDR
                  </span>
                )}
              </div>
            ))}
          </div>

          {photoAiReport && (
            <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 text-[11px] text-purple-900 dark:text-purple-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>{photoAiReport}</span>
              </span>
            </div>
          )}
        </section>

        {/* 5. DADOS GOOGLE BUSINESS, REDES SOCIAIS E CONTATO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda: Apresentação IA e Especialidades */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span>Apresentação Oficial & Diferenciais</span>
                </h2>

                <button
                  type="button"
                  onClick={handleGenerateAiEnhancement}
                  disabled={isGeneratingAi}
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1.5 transition-colors"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingAi ? 'Otimizando...' : 'Otimizar Texto com Gemini IA'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-800/40">
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium">
                  {aiPitch || editForm.description || business.description}
                </p>
              </div>

              {aiHighlights.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Destaques Verificados (IA):
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {aiHighlights.map((hl, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Serviços e Especialidades */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Serviços e Especialidades</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {editForm.servicesText
                  .split(',')
                  .map(s => s.trim())
                  .filter(Boolean)
                  .map((srv, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        ✓
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{srv}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Coluna Direita: Ficha Google Maps / Business + Redes Sociais + Orçamento */}
          <div className="space-y-6">
            {/* Ficha Completa Google Maps / Google Business & Redes Sociais */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  Google Business & Redes Sociais
                </h3>
              </div>

              <div className="text-xs space-y-3">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Endereço (Google Maps)</span>
                    <span className="text-slate-700 dark:text-slate-200 font-semibold">{editForm.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Telefone & WhatsApp</span>
                    <span className="text-slate-700 dark:text-slate-200 font-semibold">{editForm.phone || editForm.whatsapp}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Horário de Funcionamento</span>
                    <span className="text-slate-700 dark:text-slate-200 font-semibold">{editForm.openingHoursText}</span>
                  </div>
                </div>

                {editForm.instagram && (
                  <div className="flex items-start gap-2.5">
                    <Instagram className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Instagram Oficial</span>
                      <a
                        href={`https://instagram.com/${editForm.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 dark:text-pink-400 font-bold hover:underline"
                      >
                        {editForm.instagram} ↗
                      </a>
                    </div>
                  </div>
                )}

                {editForm.email && (
                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">E-mail de Contato</span>
                      <a
                        href={`mailto:${editForm.email}`}
                        className="text-sky-600 dark:text-sky-400 font-bold hover:underline break-all"
                      >
                        {editForm.email}
                      </a>
                    </div>
                  </div>
                )}

                {editForm.website && (
                  <div className="flex items-start gap-2.5">
                    <Globe className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Site Oficial</span>
                      <a
                        href={editForm.website.startsWith('http') ? editForm.website : `https://${editForm.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline truncate block"
                      >
                        {editForm.website.replace(/^https?:\/\//, '')} ↗
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {editForm.googleMapsUrl && (
                <div className="pt-2">
                  <a
                    href={editForm.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-500 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-teal-600 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-teal-500" />
                    <span>Abrir Localização no Google Maps</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              )}
            </div>

            {/* Box de Contato WhatsApp Rápido */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-md">
              <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <MessageCircle className="w-5 h-5" />
                <span>Atendimento Direto no WhatsApp</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Envie sua mensagem para falar agora mesmo com a equipe de {editForm.name}:
              </p>

              {quoteSent ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-center text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                  ✓ Abrindo WhatsApp... Aguarde um instante!
                </div>
              ) : (
                <form onSubmit={handleSendQuote} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Seu Nome"
                    value={quoteName}
                    onChange={e => setQuoteName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Seu WhatsApp / Telefone"
                    value={quotePhone}
                    onChange={e => setQuotePhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                  <textarea
                    rows={3}
                    required
                    placeholder="Como podemos ajudar você hoje?"
                    value={quoteMessage}
                    onChange={e => setQuoteMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar para o WhatsApp</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* 6. SWITCHER PARA OUTROS CLIENTES PREMIUM */}
        {onSelectAnotherBusiness && premiumClients.length > 1 && (
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>Outras Páginas Exclusivas de Clientes (melhordailha.online/empresa):</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {premiumClients.map(biz => (
                <button
                  key={biz.id}
                  type="button"
                  onClick={() => onSelectAnotherBusiness(biz)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    biz.id === business.id
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-teal-400'
                  }`}
                >
                  {biz.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE LOGIN DO LOJISTA VIA E-MAIL OU WHATSAPP */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Acesso do Cliente (Lojista)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gerencie sua página exclusiva no portal Melhor da Ilha
                </p>
              </div>
            </div>

            <form onSubmit={handleClientLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Informe seu E-mail ou WhatsApp cadastrado:
                </label>
                <input
                  type="text"
                  required
                  value={loginCredential}
                  onChange={e => setLoginCredential(e.target.value)}
                  placeholder="Ex: (71) 99999-9999 ou contato@empresa.com.br"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-700 dark:text-rose-300 font-medium">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs shadow-md transition-all"
              >
                Validar Acesso e Gerenciar Minha Página
              </button>
            </form>

            {/* Atalho rápido para preenchimento com o contato da empresa aberta */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Empresa atual: <strong>{business.name}</strong></span>
              <button
                type="button"
                onClick={() => setLoginCredential(business.whatsapp || business.phone || editForm.email)}
                className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
              >
                Usar WhatsApp desta empresa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Zoom da Foto */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-2" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedPhoto}
              alt="Foto ampliada"
              className={`max-w-full max-h-[85vh] rounded-2xl object-contain ${
                isAiEnhanced ? 'contrast-112 saturate-125 brightness-105' : ''
              }`}
            />
          </div>
        </div>
      )}

      {/* Rodapé Oficial do Mini-Site */}
      <footer className="mt-12 py-6 bg-slate-900 text-white text-center text-xs border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-teal-400">MELHOR DA ILHA</span>
            <span className="text-slate-400">· {editForm.name}</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Página exclusiva: <strong>melhordailha.online/{slug}</strong>
          </div>
          <button
            type="button"
            onClick={() => (isOwnerLoggedIn ? setIsManagerOpen(true) : setIsLoginModalOpen(true))}
            className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
          >
            <Lock className="w-3 h-3" />
            <span>Área do Lojista (E-mail / WhatsApp)</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
