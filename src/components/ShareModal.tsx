import React, { useState } from 'react';
import { X, Check, Copy, Share2, MessageCircle, Send } from 'lucide-react';
import { Business } from '../types';
import { useFavorites } from '../context/FavoritesContext';

interface ShareModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ business, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useFavorites();

  if (!isOpen || !business) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://melhordailha.com.br';
  const shareTitle = `${business.name} - ${business.tagline} | MELHOR DA ILHA`;
  const shareText = `Confira ${business.name} (${business.categoryName}) em ${business.cityName} no guia MELHOR DA ILHA: ${currentUrl}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      showToast('Link copiado para a área de transferência! 📋');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Não foi possível copiar o link.');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: currentUrl
        });
      } catch {
        // user cancelled
      }
    } else {
      copyToClipboard();
    }
  };

  const shareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 transition-all duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
      >
        <button
          onClick={onClose}
          aria-label="Fechar modal de compartilhamento"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 id="share-modal-title" className="font-bold text-lg text-slate-900 dark:text-white">
              Compartilhar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Divulgue este negócio com seus amigos e familiares
            </p>
          </div>
        </div>

        <div className="p-3 mb-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1">
            {business.name}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
            {business.cityName} · {business.neighborhood}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          <button
            onClick={shareWhatsApp}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors group"
          >
            <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">WhatsApp</span>
          </button>

          <button
            onClick={shareFacebook}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors group"
          >
            <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
              <span className="font-bold text-xl">f</span>
            </div>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Facebook</span>
          </button>

          <button
            onClick={shareTwitter}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
          >
            <div className="w-11 h-11 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="font-bold text-sm">𝕏</span>
            </div>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">X (Twitter)</span>
          </button>

          <button
            onClick={shareTelegram}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-colors group"
          >
            <div className="w-11 h-11 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Send className="w-5 h-5 ml-0.5" />
            </div>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Telegram</span>
          </button>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <input
            type="text"
            readOnly
            value={currentUrl}
            className="flex-1 px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 focus:outline-none"
          />
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>

        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="w-full mt-3 py-2 text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline text-center"
          >
            Ou use as opções nativas do seu aparelho
          </button>
        )}
      </div>
    </div>
  );
};
