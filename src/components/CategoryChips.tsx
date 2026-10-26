import React from 'react';
import { CATEGORIES } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';
import { LayoutGrid } from 'lucide-react';

interface CategoryChipsProps {
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategoryId,
  onSelectCategory,
  categoryCounts,
  totalCount
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
        {/* All button */}
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
            selectedCategoryId === 'all'
              ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-teal-500'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Todas</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              selectedCategoryId === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {totalCount}
          </span>
        </button>

        {/* 12 Local Categories */}
        {CATEGORIES.map(category => {
          const count = categoryCounts[category.id] || 0;
          const isSelected = selectedCategoryId === category.id;

          return (
            <button
              type="button"
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all border ${
                isSelected
                  ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20 font-semibold'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500'
              }`}
            >
              <CategoryIcon name={category.iconName} className="w-4 h-4 shrink-0" />
              <span>{category.name}</span>
              {count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
