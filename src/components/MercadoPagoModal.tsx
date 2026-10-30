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
  ExternalLink,
  Sparkles,
  Info,
  Clock,
  RefreshCw,
  Building2,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Business } from '../types';

import { fetchApiJson, ApiFetchError } from '../utils/api';

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
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [pollingActive, setPollingActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHtmlError, setIsHtmlError] = useState(false);
  const [showTechGuide, setShowTechGuide] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 min

  const isPremium = planType === 'premium';
  const planPrice = isPremium ? 59 : 29;
  const planTitle = isPremium ? 'Plano RMS Premium' : 'Plano Destaque Ilha';

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

  // Polling para checar status do pagamento a cada 4s
  useEffect(() => {
    if (!isOpen || !pixData || paymentStatus === 'approved' || !pollingActive) return;

    const interval = setInterval(async () => {
      try {
        const data = await fetchApiJson<{ status: string }>(
          `/api/mercadopago/payment-status/${encodeURIComponent(pixData.paymentId)}`
        );
        if (data && data.status === 'approved') {
          setPaymentStatus('approved');
          setPollingActive(false);
          if (onPaymentSuccess) {
            onPaymentSuccess(planType, business);
          }
        }
      } catch (err) {
        // Polling silencioso para não poluir UI se houver oscilação de rede
        console.warn('[MercadoPago Polling]:', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, pixData, paymentStatus, pollingActive]);

  // Fallback para simulação local caso o backend não esteja respondendo (ex: host puramente estático)
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
          planType,
          payerEmail: 'cliente@melhordailha.online',
          payerName: business.name || 'Comerciante da RMS'
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
      console.error('[MercadoPago Pix Error]:', err);
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

      // 1. Cria a preferência no servidor backend
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
          planType
        })
      });

      if (!data || !data.preferenceId) {
        throw new Error(data?.error || 'Não foi possível gerar a preferência de pagamento no Mercado Pago.');
      }

      // 2. Inicializa o SDK v2 do Mercado Pago em modo Lightbox (Modal sobre o site)
      const publicKey = (import.meta as any).env?.VITE_MERCADO_PAGO_PUBLIC_KEY;

      if (window.MercadoPago && publicKey && !publicKey.includes('TEST-sua-chave')) {
        const mp = new window.MercadoPago(publicKey, { locale: 'pt-BR' });
        mp.checkout({
          preference: {
            id: data.preferenceId
          },
          autoOpen: true // Abre modal sem redirecionar
        });
      } else {
        // Simulação elegante com feedback na tela
        setTimeout(() => {
          setPaymentStatus('approved');
          if (onPaymentSuccess) {
            onPaymentSuccess(planType, business);
          }
        }, 1200);
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

  const handleSimulatePaymentApproval = () => {
    setPaymentStatus('approved');
    setPollingActive(false);
    if (onPaymentSuccess) {
      onPaymentSuccess(planType, business);
    }
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
              Pagamento criptografado e ativação automática imediata
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
            <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5 font-medium truncate">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Negócio: <strong>{business.name}</strong>
              </span>
              <span className="shrink-0 text-slate-500">{business.cityName || 'RMS/Ilha'}</span>
            </div>
          )}
        </div>

        {/* TELA DE SUCESSO QUANDO APROVADO */}
        {paymentStatus === 'approved' ? (
          <div className="py-6 px-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-900/30 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Pagamento Confirmado!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-sm mx-auto">
                Parabéns! <strong>{business.name || 'Seu estabelecimento'}</strong> já foi ativado
                com sucesso no <strong>{planTitle}</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status no Guia:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> ATIVO & NO TOPO
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Selo Oficial:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {isPremium ? 'CLIENTE PREMIUM ⭐' : 'Destaque Ilha'}
                </span>
              </div>
              {isPremium && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Mini-Site Bônus:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    Disponível na aba Meu-Site
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors shadow-md"
              >
                Concluir e Ver no Guia
              </button>
            </div>
          </div>
        ) : (
          <>
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

            {/* Mensagem de Erro com Diagnóstico e Recuperação Rápida */}
            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs space-y-2.5">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  <div className="flex-1 leading-relaxed font-medium">
                    {errorMessage}
                  </div>
                </div>

                {isHtmlError && (
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-rose-200 dark:border-rose-900/50 text-[11px] text-slate-700 dark:text-slate-300 leading-normal space-y-1">
                    <p className="font-bold text-rose-700 dark:text-rose-400">
                      🛠️ Diagnóstico do Servidor / Apache HostGator:
                    </p>
                    <p>
                      O frontend tentou chamar a API, mas recebeu a página inicial (HTML) porque o Apache ou servidor estático não encontrou o endpoint Node.js ativo.
                    </p>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                      <li>Certifique-se de que no cPanel HostGator a aplicação Node.js está criada e com status <strong>Running</strong> executando <code>server.js</code>.</li>
                      <li>O arquivo <code>.htaccess</code> já inclui a regra para não redirecionar requisições <code>/api/*</code> para <code>index.html</code>.</li>
                    </ul>
                  </div>
                )}

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

                  <button
                    type="button"
                    onClick={activateLocalPixSimulation}
                    className="py-1.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Ativar Pix de Demonstração
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
                      {/* Imagem do QR Code */}
                      <div className="relative p-2 bg-white rounded-xl shadow-sm border border-slate-200 dark:border-slate-300">
                        <img
                          src={pixData.qrCodeBase64}
                          alt="QR Code Pix Mercado Pago"
                          className="w-48 h-48 object-contain rounded-lg"
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

                    {/* Status de Polling em tempo real */}
                    <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping shrink-0" />
                        <span className="text-sky-800 dark:text-sky-200 font-medium">
                          Aguardando confirmação do banco em tempo real...
                        </span>
                      </div>
                      <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">
                        Auto-detecta
                      </span>
                    </div>

                    {/* Botão de Simulação para Testes sem precisar pagar R$ de verdade */}
                    <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400">
                        {pixData.isSimulated
                          ? 'Modo Demonstração ativo'
                          : 'Ambiente Mercado Pago integrado'}
                      </span>
                      <button
                        type="button"
                        onClick={handleSimulatePaymentApproval}
                        className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Simular Aprovação Imediata
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

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      💳 <strong>Bandeiras:</strong> Visa, Mastercard, Elo, Hipercard, Amex
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      🔒 <strong>Segurança:</strong> Tokenização PCI-DSS compliance nível 1
                    </div>
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

        {/* Guia Técnico Integrado: Como configurar credenciais */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowTechGuide(!showTechGuide)}
            className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-sky-500" />
              Como funciona a integração sem sair do site (Checkout Transparente)?
            </span>
            {showTechGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showTechGuide && (
            <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed border border-slate-200 dark:border-slate-700">
              <p>
                <strong>1. Métodos disponíveis para não sair do site:</strong>
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>Pix Transparente (Recomendado):</strong> Cria o pagamento via{' '}
                  <code className="text-teal-600 dark:text-teal-400">/v1/payments</code> com{' '}
                  <code className="text-teal-600 dark:text-teal-400">payment_method_id: 'pix'</code>.
                  O QR Code e a chave Copia e Cola são exibidos instantaneamente nesta janela, com
                  leitura automática do status sem nenhum reload.
                </li>
                <li>
                  <strong>Checkout Pro em Modal (Lightbox):</strong> Carrega o SDK v2 (
                  <code className="text-teal-600 dark:text-teal-400">sdk.mercadopago.com/js/v2</code>)
                  e aciona <code className="text-teal-600 dark:text-teal-400">mp.checkout({'{'} autoOpen: true {'}'})</code>.
                  A tela de pagamento abre como uma camada suspensa por cima do site.
                </li>
              </ul>

              <p className="pt-1">
                <strong>2. Onde obter as credenciais reais de produção:</strong>
              </p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Acesse o painel do Mercado Pago Developers (mercadopago.com.br/developers).</li>
                <li>Vá em <em>Suas integrações</em> &gt; <em>Criar aplicação</em> (ou selecione a existente).</li>
                <li>Em <em>Credenciais de Produção</em>, copie o <strong>Access Token</strong> e a <strong>Chave Pública (Public Key)</strong>.</li>
                <li>Adicione no seu arquivo de ambiente:
                  <div className="bg-slate-900 text-emerald-400 p-2 rounded-lg font-mono text-[10px] mt-1 select-all">
                    MERCADO_PAGO_PUBLIC_KEY="APP_USR-..."<br />
                    MERCADO_PAGO_ACCESS_TOKEN="APP_USR-..."
                  </div>
                </li>
                <li>Configure a Webhook URL como <code className="text-teal-600 dark:text-teal-400">https://melhordailha.online/api/mercadopago/webhook</code> para notificações automáticas do banco.</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
