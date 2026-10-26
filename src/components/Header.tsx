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
  Share2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';

interface HeaderProps {
  onOpenAdvertise: () => void;
  onOpenCategories: () => void;
  onOpenCities: () => void;
  onOpenFavorites: () => void;
  onOpenContact: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAdvertise,
  onOpenCategories,
  onOpenCities,
  onOpenFavorites,
  onOpenContact,
  onGoHome
}) => {
  const { theme, toggleTheme } = useTheme();
  const { favorites } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-3 text-left group focus:outline-none"
          aria-label="Ir para a página inicial do Melhor da Ilha"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="block font-black text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white leading-none">
              MELHOR DA ILHA
            </span>
            <span className="block text-[10px] sm:text-[11px] font-semibold text-teal-700 dark:text-teal-400 tracking-wider uppercase mt-1">
              Guia Ilha de Itaparica & RMS
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            type="button"
            onClick={onGoHome}
            className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Explorar
          </button>
          <button
            type="button"
            onClick={onOpenCategories}
            className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Categorias
          </button>
          <button
            type="button"
            onClick={onOpenCities}
            className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Municípios
          </button>
          <button
            type="button"
            onClick={onOpenAdvertise}
            className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Para Anunciar
          </button>
          <button
            type="button"
            onClick={onOpenContact}
            className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Contato
          </button>
        </nav>

        {/* Actions (Dark Mode, Favorites, Advertise CTA) */}
        <div className="flex items-center gap-2">
          {/* Dark Mode toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>

          {/* Favorites */}
          <button
            type="button"
            onClick={onOpenFavorites}
            aria-label={`Ver favoritos (${favorites.length})`}
            className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Advertise Button Desktop */}
          <button
            type="button"
            onClick={onOpenAdvertise}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-600/20 transition-all hover:scale-102"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Anunciar Negócio</span>
          </button>

          {/* Mobile hamburger menu */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu de navegação'}
            className="md:hidden p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-150">
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
            <span>Todas as Categorias (12)</span>
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
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 text-white font-bold text-sm shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Anunciar meu negócio</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
