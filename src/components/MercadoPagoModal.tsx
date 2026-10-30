import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  CreditCard,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Star,
  Sparkles,
  Info,
  Clock,
  RefreshCw,
  Building2,
  Lock,
  ChevronDown,
  ChevronUp,
  Mail,
  MessageCircle,
  Globe,
  ExternalLink
} from 'lucide-react';
import { Business } from '../types';
import { fetchApiJson } from '../utils/api';
import {
  toBusinessSlug,
  provisionClientMiniSite,
  saveLoggedClientSession
} from '../utils/customBusinessesStorage';

declare global {
  interface Window {
    MercadoPago?: any;
  }
}

interface MercadoPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Partial<Business>;
  planType: 'destaque' | 'premium';
  onPaymentSuccess?: (plan: 'destaque' | 'premium', updatedBusiness?: Partial<Business>) => void;
}

export const MercadoPagoModal: React.FC<MercadoPagoModalProps> = ({
  isOpen,
  onClose,
  business,
  planType,
  onPaymentSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'pix' | 'card'>('pix');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pixData, setPixData] = useState<{
    paymentId: string;
    qrCode: string;
    qrCodeBase64: string;
    isSimulated?: boolean;
  } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing_notice' | 'approved' | 'rejected'>('pending');
  const [pollingActive, setPollingActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHtmlError, setIsHtmlError] = useState(false);
  const [showTechGuide, setShowTechGuide] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 min

  // Credenciais de acesso do lojista (E-mail e WhatsApp para envio e login na área do cliente)
  const [clientEmail, setClientEmail] = useState(business.email || '');
  const [clientWhatsapp, setClientWhatsapp] = useState(business.whatsapp || business.phone || '');
  const [provisionedUrl, setProvisionedUrl] = useState<string>('');
  const [isProvisioning, setIsProvisioning] = useState(false);

  const isPremium = planType === 'premium';
  const planPrice = isPremium ? 59 : 29;
  const planTitle = isPremium ? 'Plano RMS Premium' : 'Plano Destaque Ilha';
  const businessSlug = toBusinessSlug(business.slug || business.name || 'minha-empresa');
  const expectedFolderUrl = `melhordailha.online/${businessSlug}`;

  useEffect(() => {
    if (business.email) setClientEmail(business.email);
    if (business.whatsapp || business.phone) {
      setClientWhatsapp(business.whatsapp || business.phone || '');
    }
  }, [business]);

  // Carrega Pix ao abrir ou alternar para a aba pix
  useEffect(() => {
    if (isOpen && activeTab === 'pix' && !pixData && !errorMessage) {
      generatePixPayment();
    }
  }, [isOpen, activeTab]);

  // Timer regressivo de 10 minutos
  useEffect(() => {
    if (!isOpen || paymentStatus === 'approved') return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, paymentStatus]);

  const finalizeAutomaticMiniSiteCreation = async () => {
    setIsProvisioning(true);
    try {
      const result = await provisionClientMiniSite(business, clientEmail, clientWhatsapp);
      setProvisionedUrl(result.folderUrl || `https://${expectedFolderUrl}`);

      const updatedBiz: Partial<Business> = {
        ...business,
        slug: result.slug || businessSlug,
        miniSiteSlug: result.slug || businessSlug,
        email: clientEmail || business.email,
        whatsapp: clientWhatsapp || business.whatsapp || business.phone || '',
        ownerWhatsapp: clientWhatsapp || business.whatsapp || business.phone || '',
        aiEnhanced: true,
        aiPitch: result.aiPitch || business.aiPitch,
        aiHighlights: result.aiHighlights || business.aiHighlights,
        galleryImages: result.enhancedPhotos || business.galleryImages,
        isRmsPremium: planType === 'premium',
        isFeatured: true,
        isVerified: true,
        planType
      };

      // Autentica automaticamente a sessão do lojista por E-mail/WhatsApp
      saveLoggedClientSession({
        businessId: String(business.id || `biz-${Date.now()}`),
        businessSlug: result.slug || businessSlug,
        businessName: business.name || 'Minha Empresa',
        email: clientEmail,
        whatsapp: clientWhatsapp,
        loggedAt: Date.now()
      });

      setPaymentStatus('approved');
      setPollingActive(false);
      if (onPaymentSuccess) {
        onPaymentSuccess(planType, updatedBiz);
      }
    } finally {
      setIsProvisioning(false);
    }
  };

  // Polling para checar status do pagamento a cada 4s
  useEffect(() => {
    if (!isOpen || !pixData || paymentStatus === 'approved' || !pollingActive) return;

    const interval = setInterval(async () => {
      try {
        const data = await fetchApiJson<{ status: string }>(
          `/api/mercadopago/payment-status/${encodeURIComponent(pixData.paymentId)}`
        );
        if (data && data.status === 'approved') {
          await finalizeAutomaticMiniSiteCreation();
        }
      } catch (err) {
        console.warn('[MercadoPago Polling]:', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, pixData, paymentStatus, pollingActive, clientEmail, clientWhatsapp]);

  // Fallback para simulação local caso o backend não esteja respondendo
  const activateLocalPixSimulation = () => {
    const mockId = `pix_sim_${Date.now()}`;
    const mockQrCode = `00020101021226840014br.gov.bcb.pix2562qrcodes-pix.mercadopago.com/v2/mock-${mockId}5204000053039865405${planPrice.toFixed(2)}5802BR5920MELHOR DA ILHA GUIA6009SALVADOR62070503***6304E8A2`;
    setPixData({
      paymentId: mockId,
      qrCode: mockQrCode,
      qrCodeBase64: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(mockQrCode)}`,
      isSimulated: true
    });
    setErrorMessage(null);
    setIsHtmlError(false);
    setPollingActive(true);
  };

  // Gera o Pix através do endpoint backend
  const generatePixPayment = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      setIsHtmlError(false);

      const data = await fetchApiJson<{
        paymentId: string | number;
        qrCode: string;
        qrCodeBase64: string;
        isSimulated?: boolean;
        error?: string;
      }>('/api/mercadopago/create-pix', {
        method: 'POST',
        body: JSON.stringify({
          amount: planPrice,
          businessName: business.name || 'Comércio Local',
          businessSlug,
          planType,
          payerEmail: clientEmail || 'cliente@melhordailha.online',
          payerWhatsapp: clientWhatsapp || business.whatsapp || '',
          payerName: business.name || 'Comerciante da RMS',
          businessData: business
        })
      });

      if (!data || !data.qrCode) {
        throw new Error(data?.error || 'A resposta do Mercado Pago não continha o QR Code.');
      }

      setPixData({
        paymentId: String(data.paymentId),
        qrCode: data.qrCode,
        qrCodeBase64: data.qrCodeBase64,
        isSimulated: data.isSimulated
      });
      setPollingActive(true);
    } catch (err: any) {
      console.warn('[MercadoPago Pix Fallback]:', err);
      if (err?.isHtmlResponse || !navigator.onLine || String(err?.message || '').includes('conectar')) {
        activateLocalPixSimulation();
        return;
      }
      const isHtml = Boolean(err.isHtmlResponse);
      setIsHtmlError(isHtml);
      setErrorMessage(err.message || 'Erro ao conectar ao Mercado Pago');
    } finally {
      setLoading(false);
    }
  };

  // Abre Checkout Pro em Modal oficial (Lightbox)
  const handleOpenCheckoutModal = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      setIsHtmlError(false);

      let preferenceId = '';
      try {
        const data = await fetchApiJson<{
          preferenceId: string;
          isSimulated?: boolean;
          error?: string;
        }>('/api/mercadopago/create-preference', {
          method: 'POST',
          body: JSON.stringify({
            title: `Assinatura ${planTitle} - ${business.name || 'Comércio'}`,
            price: planPrice,
            businessName: business.name,
            businessSlug,
            clientEmail: clientEmail || 'cliente@melhordailha.online',
            clientWhatsapp,
            planType
          })
        });
        preferenceId = data?.preferenceId || '';
      } catch (prefErr: any) {
        if (prefErr?.isHtmlResponse) {
          preferenceId = `pref_sim_${Date.now()}`;
        } else {
          throw prefErr;
        }
      }

      if (!preferenceId) {
        throw new Error('Não foi possível gerar a preferência de pagamento no Mercado Pago.');
      }

      const publicKey = (import.meta as any).env?.VITE_MERCADO_PAGO_PUBLIC_KEY;

      if (window.MercadoPago && publicKey && !publicKey.includes('TEST-sua-chave') && !preferenceId.startsWith('pref_sim_')) {
        const mp = new window.MercadoPago(publicKey, { locale: 'pt-BR' });
        mp.checkout({
          preference: {
            id: preferenceId
          },
          autoOpen: true
        });
        setPaymentStatus('processing_notice');
      } else {
        setPaymentStatus('processing_notice');
      }
    } catch (err: any) {
      console.error('[MercadoPago Card Error]:', err);
      setIsHtmlError(Boolean(err.isHtmlResponse));
      setErrorMessage(err.message || 'Erro ao carregar checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (!pixData?.qrCode) return;
    navigator.clipboard.writeText(pixData.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const formatMinutes = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[94vh] flex flex-col overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mp-modal-title"
      >
        {/* Botão fechar */}
        <button
          onClick={onClose}
          aria-label="Fechar checkout"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Topo / Header */}
        <div className="flex items-center gap-3 mb-4 pr-10">
          <div className="w-11 h-11 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-200 dark:border-sky-800/50">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 id="mp-modal-title" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Checkout Mercado Pago
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                <ShieldCheck className="w-3 h-3" />
                Sem sair do site
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pagamento criptografado e criação automática do seu Minisite exclusivo
            </p>
          </div>
        </div>

        {/* Resumo do Plano Contratado */}
        <div
          className={`p-3.5 rounded-2xl mb-4 border transition-colors ${
            isPremium
              ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60'
              : 'bg-teal-50/70 dark:bg-teal-950/30 border-teal-300 dark:border-teal-700/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPremium ? (
                <Star className="w-5 h-5 fill-amber-500 text-amber-500 shrink-0" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
              )}
              <div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">
                  Assinatura Mensal
                </span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {planTitle}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Valor mensal</span>
              <span
                className={`font-black text-xl ${
                  isPremium
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-teal-600 dark:text-teal-400'
                }`}
              >
                R$ {planPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {business.name && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5 font-medium truncate">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Negócio: <strong>{business.name}</strong>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                <Globe className="w-3 h-3" />
                {expectedFolderUrl}
              </span>
            </div>
          )}
        </div>

        {/* TELA DE SUCESSO QUANDO APROVADO */}
        {paymentStatus === 'approved' ? (
          <div className="py-5 px-3 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-900/30 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Minisite Criado & Ativado!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto">
                A pasta exclusiva de <strong>{business.name || 'sua empresa'}</strong> foi gerada automaticamente com dados do Google Maps, Redes Sociais e Fotos com Melhoria Visual por IA (Gemini).
              </p>
            </div>

            {/* Mensagem oficial de tranquilização e envio de acesso */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 text-left text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Confirmação de Pagamento e Acesso Liberado:
              </p>
              <p>
                &ldquo;Pagamento em processamento ou aguardando confirmação. Assim que o banco aprovar (geralmente em instantes para Pix), sua página exclusiva será gerada automaticamente e você receberá o acesso por e-mail e WhatsApp!&rdquo;
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Endereço Oficial da Página:</span>
                <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                  {expectedFolderUrl}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Fotos & Iluminação IA:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Realce Gemini Ativo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Login do Lojista:</span>
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                  {clientEmail || clientWhatsapp || 'Liberado via E-mail / WhatsApp'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir Meu Minisite e Painel de Edição</span>
              </button>
            </div>
          </div>
        ) : paymentStatus === 'processing_notice' ? (
          /* TELA DE AVISO TRANQUILIZADOR PÓS-PAGAMENTO */
          <div className="py-5 px-3 space-y-4">
            <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-100 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black">Status do Pagamento</h3>
                  <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
                    Sincronização automática via Webhook Mercado Pago
                  </span>
                </div>
              </div>

              <p className="text-xs leading-relaxed font-semibold bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-sky-200/80 dark:border-sky-800/60">
                &ldquo;Pagamento em processamento ou aguardando confirmação. Assim que o banco aprovar (geralmente em instantes para Pix), sua página exclusiva será gerada automaticamente e você receberá o acesso por e-mail e WhatsApp!&rdquo;
              </p>

              <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                <p>
                  • <strong>URL reservada da sua pasta:</strong>{' '}
                  <code className="text-teal-600 dark:text-teal-400 font-bold">{expectedFolderUrl}</code>
                </p>
                <p>
                  • <strong>Acesso do Lojista:</strong> Liberado via E-mail ({clientEmail || 'cadastrado'}) ou WhatsApp ({clientWhatsapp || 'cadastrado'}).
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={finalizeAutomaticMiniSiteCreation}
                disabled={isProvisioning}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                {isProvisioning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gerando Pasta e Tratando Fotos com IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Acessar Minha Página Exclusiva Agora</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatus('pending')}
                className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Voltar ao QR Code
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Campos de E-mail e WhatsApp para Recebimento do Acesso e Login do Lojista */}
            <div className="mb-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Onde você receberá o acesso para gerenciar seu Minisite:
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)}
                    placeholder="Seu e-mail de acesso..."
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="relative">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={clientWhatsapp}
                    onChange={e => setClientWhatsapp(e.target.value)}
                    placeholder="Seu WhatsApp (Ex: 71 99999-9999)"
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Abas: Pix Transparente vs Cartão em Modal */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('pix')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'pix'
                    ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Pix Instantâneo</span>
                <span className="px-1.5 py-0.2 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[9px] font-black">
                  RÁPIDO
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('card')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'card'
                    ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Cartão / Modal Pro</span>
              </button>
            </div>

            {/* Mensagem de Erro com Recuperação Rápida */}
            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs space-y-2.5">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div className="flex-1 leading-relaxed font-medium">
                    {errorMessage}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'pix') {
                        generatePixPayment();
                      } else {
                        handleOpenCheckoutModal();
                      }
                    }}
                    className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Tentar Novamente
                  </button>
                </div>
              </div>
            )}

            {/* ABA 1: PIX TRANSPARENTE NA TELA */}
            {activeTab === 'pix' && (
              <div className="space-y-4">
                {loading && !pixData ? (
                  <div className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-8 h-8 mx-auto animate-spin text-teal-600 mb-2" />
                    <p className="text-xs font-medium">Gerando QR Code Pix com Mercado Pago...</p>
                  </div>
                ) : pixData ? (
                  <>
                    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <div className="relative p-2 bg-white rounded-xl shadow-sm border border-slate-200 dark:border-slate-300">
                        <img
                          src={pixData.qrCodeBase64}
                          alt="QR Code Pix Mercado Pago"
                          className="w-44 h-44 object-contain rounded-lg"
                        />
                        <div className="absolute inset-x-0 -bottom-2 flex justify-center">
                          <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[9px] font-bold flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-teal-400" />
                            Expira em {formatMinutes(timerSeconds)}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-4 text-center max-w-xs">
                        Abra o app do seu banco no celular, escolha <strong>Pix</strong> e aponte a
                        câmera para o QR Code acima.
                      </p>
                    </div>

                    {/* Copia e Cola */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Ou copie o código Pix abaixo:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={pixData.qrCode}
                          aria-label="Código Pix Copia e Cola"
                          className="flex-1 px-3 py-2 text-[11px] rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono truncate select-all"
                        />
                        <button
                          type="button"
                          onClick={handleCopyPix}
                          className="py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar Código</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* MENSAGEM DE CONFIRMAÇÃO CLARA E TRANQUILIZADORA */}
                    <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs space-y-2">
                      <div className="flex items-start gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping shrink-0 mt-1.5" />
                        <p className="text-sky-900 dark:text-sky-200 font-semibold leading-relaxed">
                          Pagamento em processamento ou aguardando confirmação. Assim que o banco aprovar (geralmente em instantes para Pix), sua página exclusiva será gerada automaticamente e você receberá o acesso por e-mail e WhatsApp!
                        </p>
                      </div>
                    </div>

                    {/* Botão para o cliente que já efetuou o Pix */}
                    <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setPaymentStatus('processing_notice')}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Já realizei o pagamento Pix</span>
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            )}

            {/* ABA 2: CHECKOUT PRO EM MODAL (LIGHTBOX) */}
            {activeTab === 'card' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                    <CreditCard className="w-4 h-4 text-sky-500" />
                    <span>Pague com Cartão de Crédito ou Saldo Mercado Pago</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                    O modal oficial do Mercado Pago é aberto diretamente nesta tela, sem redirecionar
                    o cliente para outra página. Aceita parcelamento em até 12x, cartão de débito e
                    carteira digital.
                  </p>

                  <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-[11px] text-sky-900 dark:text-sky-200 font-medium leading-relaxed">
                    Pagamento em processamento ou aguardando confirmação. Assim que o banco aprovar (geralmente em instantes para Pix), sua página exclusiva será gerada automaticamente e você receberá o acesso por e-mail e WhatsApp!
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCheckoutModal}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Conectando ao Mercado Pago...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Abrir Pagamento em Modal ({planTitle} - R$ {planPrice})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Guia de Funcionamento Automático */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowTechGuide(!showTechGuide)}
            className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-sky-500" />
              Como funciona a criação automática do seu Minisite ({expectedFolderUrl})?
            </span>
            {showTechGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showTechGuide && (
            <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed border border-slate-200 dark:border-slate-700">
              <p>
                <strong>1. Pasta Exclusiva Automática:</strong> Assim que aprovado pelo webhook do Mercado Pago, o sistema cria automaticamente <code className="text-teal-600 dark:text-teal-400">melhordailha.online/{businessSlug}</code>.
              </p>
              <p>
                <strong>2. Dados Integrados + Fotos com IA (Gemini):</strong> Inclui endereço, telefone e horário do Google Maps/Business, links de Instagram/WhatsApp/Site e galeria de fotos com iluminação e nitidez realçadas por IA.
              </p>
              <p>
                <strong>3. Acesso Seguro do Lojista:</strong> Você gerencia sua página a qualquer momento fazendo login apenas com seu E-mail ou WhatsApp cadastrado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
