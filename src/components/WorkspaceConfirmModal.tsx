import React from 'react';
import { AlertCircle, FileSpreadsheet, Calendar, FileText, CheckCircle2, Loader2, X } from 'lucide-react';

export interface WorkspaceConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  type: 'sheets' | 'calendar' | 'docs' | 'delete';
  title: string;
  description: string;
  affectedCount?: number;
  targetName?: string;
  confirmLabel?: string;
  isProcessing?: boolean;
}

export const WorkspaceConfirmModal: React.FC<WorkspaceConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  title,
  description,
  affectedCount,
  targetName,
  confirmLabel = 'Confirmar e Continuar',
  isProcessing = false
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'sheets':
        return (
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        );
      case 'calendar':
        return (
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        );
      case 'docs':
        return (
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        );
      case 'delete':
        return (
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        );
    }
  };

  const getBadge = () => {
    switch (type) {
      case 'sheets':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
            Google Sheets
          </span>
        );
      case 'calendar':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
            Google Calendar
          </span>
        );
      case 'docs':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
            Google Docs
          </span>
        );
      case 'delete':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
            Ação Irreversível
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden relative">
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          {getIcon()}
          <div>
            <div className="mb-1">{getBadge()}</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {title}
            </h3>
          </div>
        </div>

        <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2 mb-6">
          <p>{description}</p>
          {targetName && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Destino: </span>
              <span className="text-slate-600 dark:text-slate-300">{targetName}</span>
            </div>
          )}
          {typeof affectedCount === 'number' && (
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Registros / itens selecionados: <strong className="text-teal-600 dark:text-teal-400">{affectedCount}</strong>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md flex items-center gap-2 transition-all disabled:opacity-50 ${
              type === 'delete'
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                : 'bg-teal-600 hover:bg-teal-500 shadow-teal-600/20'
            }`}
          >
            {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isProcessing ? 'Processando...' : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
