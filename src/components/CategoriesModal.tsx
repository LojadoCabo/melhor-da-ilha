import React from 'react';
import { X, Layers, ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (categoryId: string) => void;
  categoryCounts: Record<string, number>;
}

export const CategoriesModal: React.FC<CategoriesModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
  categoryCounts
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[90vh] flex flex-col transition-all duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="categories-modal-title"
      >
        <button
          onClick={onClose}
          aria-label="Fechar modal de categorias"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 pr-10">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 id="categories-modal-title" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Categorias do Guia
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Explore os principais segmentos de comércio e serviços na Ilha e RMS
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto pr-1">
          {CATEGORIES.map(category => {
            const count = categoryCounts[category.id] || 0;
            return (
              <button
                key={category.id}
                onClick={() => {
                  onSelectCategory(category.id);
                  onClose();
                }}
                className="flex items-start gap-3 p-3.5 rounded-2xl text-left bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/30 border border-slate-200/80 dark:border-slate-700/80 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <CategoryIcon name={category.iconName} className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
                      {category.name}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                      ({count})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                    {category.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            onClick={() => {
              onSelectCategory('all');
              onClose();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
          >
            <span>Ver todos os negócios cadastrados</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
