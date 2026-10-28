import React, { useState } from 'react';
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
  ChevronRight,
  Send,
  Calendar,
  Sparkles,
  Copy,
  Check,
  Instagram,
  Wand2,
  Eye,
  SlidersHorizontal,
  Maximize2,
  X,
  BadgeCheck,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { Business } from '../types';
import { getCategoryCoverImage } from '../utils/categoryImages';

interface ClientMiniSiteProps {
  business: Business;
  onBackToDirectory: () => void;
  onSelectAnotherBusiness?: (biz: Business) => void;
  allBusinesses?: Business[];
}

export const ClientMiniSite: React.FC<ClientMiniSiteProps> = ({
  business,
  onBackToDirectory,
  onSelectAnotherBusiness,
  allBusinesses = []
}) => {
  const [copied, setCopied] = useState(false);
  const [quoteName, setQuoteName] = useState('');
  const [quotePhone, setQuotePhone] = useState('');
  const [quoteMessage, setQuoteMessage] = useState('');
  const [quoteSent, setQuoteSent] = useState(false);

  // IA Photo Enhancement toggle
  const [isAiEnhanced, setIsAiEnhanced] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // IA Copy/Pitch generation
  const [aiPitch, setAiPitch] = useState<string | null>(business.aiPitch || null);
  const [aiHighlights, setAiHighlights] = useState<string[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const rawWhatsapp = (business.whatsapp || '71991171830').replace(/\D/g, '');
  const cleanWhatsapp = rawWhatsapp.startsWith('55') ? rawWhatsapp : `55${rawWhatsapp}`;
  const slug = business.slug || business.id || 'cliente-premium';
  const siteUrl = `melhordailha.online/perfil/${slug}`;
  const fullWebUrl = `https://melhordailha.online/perfil/${slug}`;

  // Galeria de fotos associada à categoria ou fotos padrão
  const galleryPhotos = business.galleryImages && business.galleryImages.length > 0
    ? business.galleryImages
    : [
        business.coverImage,
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      ];

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(fullWebUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Conheça o mini-site oficial de ${business.name} no Guia Melhor da Ilha: ${fullWebUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `Olá ${business.name}! Acessei seu mini-site oficial em melhordailha.online/perfil/${slug}.\n\nNome: ${quoteName}\nTelefone: ${quotePhone}\nMensagem/Pedido: ${quoteMessage}`
    );
    window.open(`https://wa.me/${cleanWhatsapp}?text=${text}`, '_blank');
    setQuoteSent(true);
    setTimeout(() => setQuoteSent(false), 4000);
  };

  const handleGenerateAiEnhancement = async () => {
    try {
      setIsGeneratingAi(true);
      const res = await fetch('/api/ai/enhance-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: business.name,
          category: business.categoryName,
          city: business.cityName,
          currentDescription: business.description,
          services: business.services.join(', ')
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.enhancedPitch) setAiPitch(data.enhancedPitch);
        if (data.keyHighlights) setAiHighlights(data.keyHighlights);
      }
    } catch (err) {
      console.warn('Erro ao otimizar com IA:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const premiumClients = allBusinesses.filter(b => b.isRmsPremium || b.isFeatured).slice(0, 10);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. TOP FLOATING BROWSER ADDRESS BAR & DYNAMIC ROUTE PILL */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onBackToDirectory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar ao Guia Geral</span>
            <span className="sm:hidden">Guia</span>
          </button>

          {/* Browser Address Bar with Dynamic Route /perfil/:slug */}
          <div className="flex-1 max-w-lg mx-1 sm:mx-2 flex items-center justify-between px-3 py-1.5 rounded-full bg-slate-950/90 border border-slate-700/80 text-xs font-mono text-emerald-400 overflow-hidden shadow-inner">
            <div className="flex items-center gap-1.5 truncate">
              <Globe className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="text-slate-500 hidden md:inline">https://</span>
              <strong className="text-emerald-300 font-bold truncate">
                melhordailha.online/perfil/{slug}
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

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-sm">
              <Star className="w-3 h-3 fill-slate-950" />
              CLIENTE PREMIUM ⭐
            </span>
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(`Olá ${business.name}! Acessei seu mini-site em melhordailha.online/perfil/${slug} e gostaria de informações.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all hover:scale-102"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTAINER */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-8">
        
        {/* HERO BANNER & CABEÇALHO */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-2xl border border-slate-200 dark:border-slate-800">
          <div className="relative h-72 sm:h-96 w-full overflow-hidden">
            <img
              src={business.coverImage || getCategoryCoverImage(business.categoryId, business.name)}
              alt={business.name}
              className={`w-full h-full object-cover transition-all duration-700 ${
                isAiEnhanced
                  ? 'brightness-105 contrast-110 saturate-120 scale-102'
                  : 'opacity-70 scale-100'
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
                  Verificado no Guia
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
                title="Alterna o filtro inteligente de iluminação, nitidez e cores vibrantes"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAiEnhanced ? 'Modo IA Ativo ✨' : 'Ativar Modo IA'}</span>
              </button>
            </div>

            {/* Informações Centrais do Cabeçalho */}
            <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/90 text-white">
                      {business.categoryName}
                    </span>
                    <span className="text-xs text-slate-200 font-semibold bg-black/40 px-2.5 py-0.5 rounded-md backdrop-blur-sm border border-white/10 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      {business.cityName} · {business.neighborhood}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">
                    {business.name}
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
                    {business.reviewCount} avaliações reais
                  </div>
                  <span className="text-[9px] text-emerald-400 font-black uppercase tracking-wider">
                    Nota Máxima RMS
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Bar abaixo da foto de capa */}
          <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/80">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Aberto & Atendendo
              </span>
              {business.hasDelivery && (
                <span className="inline-flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg">
                  <Truck className="w-3.5 h-3.5 text-sky-400" /> Entregas em Domicílio
                </span>
              )}
              <span className="inline-flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> {business.openingHoursText}
              </span>
            </div>

            {/* CTAs Primários */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(`Olá ${business.name}! Acessei seu mini-site em melhordailha.online/perfil/${slug} e gostaria de fazer um pedido/orçamento.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-900/30 transition-all hover:scale-102"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Falar no WhatsApp</span>
              </a>

              {business.phone && (
                <a
                  href={`tel:${business.phone.replace(/\D/g, '')}`}
                  className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  title="Ligar para o estabelecimento"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}

              {business.instagram && (
                <a
                  href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center p-2.5 rounded-xl bg-gradient-to-tr from-amber-600 via-pink-600 to-purple-600 text-white transition-all hover:opacity-90"
                  title={`Instagram: ${business.instagram}`}
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}

              {business.googleMapsUrl && (
                <a
                  href={business.googleMapsUrl}
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

        {/* 3. GALERIA DE FOTOS COM APRIMORAMENTO AUTOMÁTICO DE IA */}
        <section className="bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Galeria de Fotos da Empresa
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Fotos do ambiente, produtos e serviços em alta resolução
              </p>
            </div>

            {/* Interruptor de IA: Filtros de Iluminação, Nitidez e Cores */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setIsAiEnhanced(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  !isAiEnhanced
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                Original
              </button>
              <button
                type="button"
                onClick={() => setIsAiEnhanced(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                  isAiEnhanced
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-purple-600'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Modo IA Aprimorado</span>
              </button>
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
                  alt={`${business.name} foto ${idx + 1}`}
                  className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                    isAiEnhanced
                      ? 'contrast-110 saturate-125 brightness-105 filter drop-shadow'
                      : 'contrast-100 saturate-100 brightness-100'
                  }`}
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Maximize2 className="w-6 h-6" />
                </div>

                {isAiEnhanced && (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-purple-900/90 text-purple-200 text-[9px] font-black tracking-wider uppercase backdrop-blur-md border border-purple-400/40 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                    HD IA
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 text-[11px] text-purple-900 dark:text-purple-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
              <span><strong>Aprimoramento por IA:</strong> Fotos tratadas automaticamente com correção de luz de estúdio, equilíbrio de cores e nitidez profissional.</span>
            </span>
          </div>
        </section>

        {/* 4. SEÇÃO DE APRESENTAÇÃO COMPLETA & CONTATO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna Esquerda: Sobre a Empresa, Diferenciais e Especialidades */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Card Sobre */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span>Apresentação & Diferenciais</span>
                </h2>

                {/* Botão de gerar pitch com IA */}
                <button
                  type="button"
                  onClick={handleGenerateAiEnhancement}
                  disabled={isGeneratingAi}
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1.5 transition-colors"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingAi ? 'Otimizando...' : 'Otimizar com Gemini IA'}</span>
                </button>
              </div>

              {/* Pitch Otimizado por IA ou Descrição Original */}
              <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-800/40">
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium">
                  {aiPitch || business.description}
                </p>
              </div>

              {/* Destaques gerados por IA */}
              {aiHighlights.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Pontos Fortes Exclusivos (IA):
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

              {/* Tags de Palavras-Chave */}
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                {business.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Card Serviços e Especialidades */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Serviços e Especialidades Disponíveis</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {business.services.map((srv, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {srv}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Diferenciais de Confiança */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/50">
                <div className="font-bold text-xs text-teal-800 dark:text-teal-300">Atendimento Prioritário</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">Contato direto no WhatsApp para respostas imediatas.</div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                <div className="font-bold text-xs text-amber-800 dark:text-amber-300">Garantia & Procedência</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">Verificado no guia com padrão de excelência e segurança.</div>
              </div>
              <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50">
                <div className="font-bold text-xs text-sky-800 dark:text-sky-300">Localização Privilegiada</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">Fácil acesso na Ilha de Itaparica e Região Metropolitana.</div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Caixa de Contato & Informações Locais */}
          <div className="space-y-6">
            
            {/* Box de Contato WhatsApp Rápido */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-md">
              <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <MessageCircle className="w-5 h-5" />
                <span>Solicitar Atendimento Online</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Envie seus dados abaixo para iniciar um atendimento prioritário direto no WhatsApp da empresa:
              </p>

              {quoteSent ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-center text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                  ✓ Abrindo WhatsApp... Aguarde um instante!
                </div>
              ) : (
                <form onSubmit={handleSendQuote} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Seu Nome
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Maria Souza"
                      value={quoteName}
                      onChange={e => setQuoteName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Seu WhatsApp / Telefone
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: (71) 98888-7777"
                      value={quotePhone}
                      onChange={e => setQuotePhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Mensagem ou Pedido de Orçamento
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Ex: Gostaria de saber os valores e disponibilidade..."
                      value={quoteMessage}
                      onChange={e => setQuoteMessage(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-102"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar para o WhatsApp</span>
                  </button>
                </form>
              )}
            </div>

            {/* Endereço, Redes e Horários */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Endereço & Contato Oficial
              </h3>
              
              <div className="text-xs space-y-2.5">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {business.address}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {business.phone}
                  </span>
                </div>

                {business.instagram && (
                  <div className="flex items-start gap-2">
                    <Instagram className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                    <a
                      href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 dark:text-pink-400 font-bold hover:underline"
                    >
                      {business.instagram} ↗
                    </a>
                  </div>
                )}

                {business.website && (
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 dark:text-sky-400 font-bold hover:underline truncate"
                    >
                      {business.website.replace(/^https?:\/\//, '')} ↗
                    </a>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {business.openingHoursText}
                  </span>
                </div>
              </div>

              {business.googleMapsUrl && (
                <div className="pt-2">
                  <a
                    href={business.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-500 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-teal-600 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-teal-500" />
                    <span>Abrir Rota no Google Maps</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5. SWITCHER PARA OUTROS CLIENTES RMS PREMIUM */}
        {onSelectAnotherBusiness && premiumClients.length > 1 && (
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>Ver Outros Mini-Sites do Plano RMS Premium:</span>
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

      {/* 6. BOTÃO DE CTA FLUTUANTE NO WHATSAPP (SEMPRE VISÍVEL) */}
      <div className="fixed bottom-6 right-5 z-40">
        <a
          href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(`Olá ${business.name}! Acessei seu mini-site em melhordailha.online/perfil/${slug} e gostaria de atendimento imediato.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs shadow-2xl hover:scale-105 transition-all ring-4 ring-emerald-400/30"
          aria-label="Conversar no WhatsApp"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping" />
          </div>
          <span className="hidden sm:inline">Conversar no WhatsApp</span>
          <span className="sm:hidden">WhatsApp</span>
        </a>
      </div>

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
                isAiEnhanced ? 'contrast-110 saturate-125 brightness-105' : ''
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
            <span className="text-slate-400">· Mini-Site: {business.name}</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Hospedado em <strong>melhordailha.online/perfil/{slug}</strong> · Plano RMS Premium
          </div>
          <button
            type="button"
            onClick={onBackToDirectory}
            className="text-xs font-bold text-teal-400 hover:underline"
          >
            ← Voltar ao Guia Geral
          </button>
        </div>
      </footer>
    </div>
  );
};
