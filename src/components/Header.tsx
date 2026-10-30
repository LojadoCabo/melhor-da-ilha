import React, { useState } from 'react';
import {
  Compass,
  Heart,
  Moon,
  Sun,
  Menu,
  X,
  PlusCircle,
  Phone,
  Layers,
  MapPin,
  Sparkles,
  MessageSquareHeart
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { Business } from '../types';

interface HeaderProps {
  onOpenAdvertise: () => void;
  onOpenCategories: () => void;
  onOpenCities: () => void;
  onOpenFavorites: () => void;
  onOpenContact: () => void;
  onGoHome: () => void;
  onOpenTestimonials?: () => void;
  onOpenMiniSite?: (biz?: Business) => void;
  onOpenWorkspace?: () => void;
  businesses?: Business[];
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAdvertise,
  onOpenCategories,
  onOpenCities,
  onOpenFavorites,
  onOpenContact,
  onGoHome,
  onOpenTestimonials,
  onOpenMiniSite,
  onOpenWorkspace
}) => {
  const { theme, toggleTheme } = useTheme();
  const { favorites } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left group focus:outline-none shrink-0 cursor-pointer select-none py-1"
          aria-label="Ir para a página inicial do Melhor da Ilha"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-sm">
            <Compass className="w-5 h-5" />
          </div>
          <span className="font-black text-base sm:text-xl tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
            MELHOR DA ILHA
          </span>
        </button>

        {/* Zone 2: Clean Single-Line Navigation Links (Visitors browse freely) */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7">
          <button
            type="button"
            onClick={onGoHome}
            className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0"
          >
            Explorar
          </button>
          <button
            type="button"
            onClick={onOpenCategories}
            className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0"
          >
            Categorias
          </button>
          <button
            type="button"
            onClick={onOpenCities}
            className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0"
          >
            Municípios
          </button>
          {onOpenTestimonials && (
            <button
              type="button"
              onClick={onOpenTestimonials}
              className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0"
            >
              Depoimentos
            </button>
          )}
          <button
            type="button"
            onClick={onOpenContact}
            className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors whitespace-nowrap shrink-0"
          >
            Contato
          </button>
        </nav>

        {/* Zone 3: Right Actions (Theme, Favorites, and Single Lojista / Anunciar CTA) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Dark Mode toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>

          {/* Favorites (Local or Saved, no login required) */}
          <button
            type="button"
            onClick={onOpenFavorites}
            aria-label={`Ver favoritos (${favorites.length})`}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white tabular-nums">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Primary Action for Business Owners: Anunciar / Área do Lojista */}
          <button
            type="button"
            onClick={onOpenAdvertise}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-[11px] sm:text-xs font-bold shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Anunciar / Lojista</span>
            <span className="sm:hidden">Anunciar</span>
          </button>

          {/* Mobile hamburger menu */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu de navegação'}
            className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2 shadow-xl">
          <button
            type="button"
            onClick={() => {
              onGoHome();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Compass className="w-4 h-4 text-teal-600" />
            <span>Explorar Início</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenCategories();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Todas as Categorias</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenCities();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>Municípios & Bairros</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenFavorites();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Meus Favoritos ({favorites.length})</span>
          </button>

          {onOpenTestimonials && (
            <button
              type="button"
              onClick={() => {
                onOpenTestimonials();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <MessageSquareHeart className="w-4 h-4 text-teal-600" />
              <span>Depoimentos de Usuários</span>
            </button>
          )}

          {onOpenMiniSite && (
            <button
              type="button"
              onClick={() => {
                onOpenMiniSite();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Vitrine Mini-Sites RMS</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onOpenContact();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Phone className="w-4 h-4 text-sky-500" />
            <span>Fale Conosco / Contato</span>
          </button>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                onOpenAdvertise();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 text-white font-bold text-sm shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Anunciar Negócio / Área do Lojista</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
