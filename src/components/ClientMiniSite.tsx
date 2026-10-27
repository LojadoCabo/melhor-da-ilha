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
  Check
} from 'lucide-react';
import { Business } from '../types';

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

  const cleanWhatsapp = (business.whatsapp || '71991171830').replace(/\D/g, '');
  const siteUrl = `melhordailha.online/meu-site?biz=${business.slug || business.id}`;
  const fullWebUrl = `https://melhordailha.online/meu-site?biz=${business.slug || business.id}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(fullWebUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `Olá ${business.name}! Acessei sua página oficial em melhordailha.online/meu-site.\n\nNome: ${quoteName}\nTelefone: ${quotePhone}\nMensagem/Pedido: ${quoteMessage}`
    );
    window.open(`https://wa.me/55${cleanWhatsapp}?text=${text}`, '_blank');
    setQuoteSent(true);
    setTimeout(() => setQuoteSent(false), 4000);
  };

  const premiumClients = allBusinesses.filter(b => b.isRmsPremium || b.isFeatured).slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Floating Browser Address Bar / Header */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToDirectory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar ao Guia Geral</span>
            <span className="sm:hidden">Guia</span>
          </button>

          {/* Browser-like URL Pill */}
          <div className="flex-1 max-w-md mx-2 flex items-center justify-between px-3 py-1.5 rounded-full bg-slate-950/80 border border-slate-700/80 text-xs font-mono text-emerald-400">
            <div className="flex items-center gap-1.5 truncate">
              <Globe className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="text-slate-400">https://</span>
              <strong className="text-emerald-300 font-bold">melhordailha.online/meu-site</strong>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copiar link da página"
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0 ml-2"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950">
              <Star className="w-3 h-3 fill-slate-950" />
              Bônus RMS Premium
            </span>
            <a
              href={`https://wa.me/55${cleanWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Mini-Site Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Hero Banner Section */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-2xl border border-slate-200 dark:border-slate-800">
          <div className="relative h-64 sm:h-80 w-full overflow-hidden">
            <img
              src={business.coverImage}
              alt={business.name}
              className="w-full h-full object-cover opacity-60 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

            {/* Top Badge Overlay */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 shadow-lg border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-slate-950" />
                CLIENTE PREMIUM ⭐
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-600/90 text-white backdrop-blur-md">
                Página Oficial Exclusiva
              </span>
            </div>

            {/* Bottom Hero Header Info */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/90 text-white flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Empresa Verificada
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {business.cityName} · {business.neighborhood}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
                    {business.name}
                  </h1>
                  <p className="text-sm sm:text-base text-slate-200 mt-1 max-w-2xl leading-relaxed">
                    {business.tagline}
                  </p>
                </div>

                {/* Rating Badge */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 bg-slate-950/80 backdrop-blur-md p-3 rounded-2xl border border-slate-700/60 shrink-0">
                  <div className="flex items-center gap-1 text-amber-400 font-black text-lg">
                    <Star className="w-5 h-5 fill-amber-400" />
                    <span>{business.rating.toFixed(1)}</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    {business.reviewCount} avaliações reais
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick CTA Action Bar */}
          <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Atendimento Imediato
              </span>
              {business.hasDelivery && (
                <span className="inline-flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg">
                  <Truck className="w-3.5 h-3.5 text-sky-400" /> Faz Entregas / Domicílio
                </span>
              )}
              <span className="inline-flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> {business.openingHoursText}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={`https://wa.me/55${cleanWhatsapp}?text=${encodeURIComponent('Olá! Acessei sua página em melhordailha.online/meu-site e gostaria de um atendimento.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all hover:scale-102"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Conversar no WhatsApp</span>
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
              {business.googleMapsUrl && (
                <a
                  href={business.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 transition-colors"
                  title="Ver no Google Maps"
                >
                  <MapPin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Main Section: Details + WhatsApp Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: About, Services, Highlights */}
          <div className="lg:col-span-2 space-y-6">
            {/* About card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Sobre Nossa Empresa
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {business.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
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

            {/* Services / Products List */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Serviços e Especialidades em Destaque
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

            {/* Differentials Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/50">
                <div className="font-bold text-xs text-teal-800 dark:text-teal-300">Atendimento Rápido</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">Resposta direta no WhatsApp por profissionais dedicados.</div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                <div className="font-bold text-xs text-amber-800 dark:text-amber-300">Garantia & Confiança</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">Verificado no guia com procedência e nota máxima.</div>
              </div>
              <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50">
                <div className="font-bold text-xs text-sky-800 dark:text-sky-300">Localização Privilegiada</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">Fácil acesso na Ilha de Itaparica e Região Metropolitana.</div>
              </div>
            </div>
          </div>

          {/* Right Column: Direct Contact Form & Local Info */}
          <div className="space-y-6">
            {/* WhatsApp Request Box */}
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

            {/* Address & Hours card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Endereço & Atendimento
              </h3>
              <div className="text-xs space-y-2">
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

        {/* Switcher to preview other businesses */}
        {onSelectAnotherBusiness && premiumClients.length > 1 && (
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Alternar Visualização de Mini-Sites do Plano Premium:
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

      {/* Footer */}
      <footer className="mt-12 py-6 bg-slate-900 text-white text-center text-xs border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-teal-400">MELHOR DA ILHA</span>
            <span className="text-slate-400">· Página do Cliente: {business.name}</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Hospedado no portal <strong>melhordailha.online/meu-site</strong> · Bônus exclusivo do Plano RMS Premium
          </div>
          <button
            type="button"
            onClick={onBackToDirectory}
            className="text-xs font-bold text-teal-400 hover:underline"
          >
            ← Voltar ao Guia Comercial
          </button>
        </div>
      </footer>
    </div>
  );
};
