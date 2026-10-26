import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';

export const Toast: React.FC = () => {
  const { toastMessage, closeToast } = useFavorites();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        closeToast();
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, closeToast]);

  if (!toastMessage) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900/95 dark:bg-slate-800/95 text-white shadow-2xl backdrop-blur-md rounded-2xl border border-slate-700/60 text-sm font-medium transition-all duration-200"
    >
      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      <span>{toastMessage}</span>
      <button
        onClick={closeToast}
        aria-label="Fechar notificação"
        className="p-1 hover:bg-slate-700/80 rounded-md transition-colors text-slate-300 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
