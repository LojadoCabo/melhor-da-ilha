import React from 'react';
import { Compass, Layers, MapPin, Heart, PlusCircle } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';

interface MobileBottomNavProps {
  currentTab: 'home' | 'categories' | 'cities' | 'favorites' | 'advertise';
  onSelectTab: (tab: 'home' | 'categories' | 'cities' | 'favorites' | 'advertise') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab
}) => {
  const { favorites } = useFavorites();

  return (
    <nav
      aria-label="Navegação rápida mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe pt-1.5 px-2 flex items-center justify-around shadow-2xl transition-colors"
    >
      <button
        type="button"
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
          currentTab === 'home'
            ? 'text-teal-600 dark:text-teal-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <Compass className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Início</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('categories')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
          currentTab === 'categories'
            ? 'text-teal-600 dark:text-teal-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <Layers className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Categorias</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('advertise')}
        className="flex flex-col items-center justify-center -mt-4"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-700 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-teal-700/30">
          <PlusCircle className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 mt-0.5">
          Anunciar
        </span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('cities')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
          currentTab === 'cities'
            ? 'text-teal-600 dark:text-teal-400 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <MapPin className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Cidades</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('favorites')}
        className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
          currentTab === 'favorites'
            ? 'text-rose-500 font-bold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <Heart className={`w-5 h-5 mb-0.5 ${favorites.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
          {favorites.length > 0 && (
            <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
              {favorites.length}
            </span>
          )}
        </div>
        <span className="text-[10px]">Salvos</span>
      </button>
    </nav>
  );
};
