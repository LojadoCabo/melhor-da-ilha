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
  MessageSquareHeart,
  LogIn,
  LogOut,
  User as UserIcon,
  Loader2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenAdvertise: () => void;
  onOpenCategories: () => void;
  onOpenCities: () => void;
  onOpenFavorites: () => void;
  onOpenContact: () => void;
  onGoHome: () => void;
  onOpenTestimonials?: () => void;
  onOpenMiniSite?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAdvertise,
  onOpenCategories,
  onOpenCities,
  onOpenFavorites,
  onOpenContact,
  onGoHome,
  onOpenTestimonials,
  onOpenMiniSite
}) => {
  const { theme, toggleTheme } = useTheme();
  const { favorites } = useFavorites();
  const { user, loading, loginWithGoogle, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);

  const handleLogin = async () => {
    try {
      setAuthBusy(true);
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleLogout = async () => {
    try {
      setAuthBusy(true);
      await logout();
    } catch (err) {
      console.error(err);
    } finally {
      setAuthBusy(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand / Logo - Optimized for Mobile & Desktop */}
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-2 sm:gap-3 text-left group focus:outline-none shrink-0 cursor-pointer select-none py-1"
          aria-label="Ir para a página inicial do Melhor da Ilha"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 aspect-square rounded-xl sm:rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <span className="block font-black text-[15px] sm:text-xl tracking-tight text-slate-900 dark:text-white leading-none whitespace-nowrap">
              MELHOR DA ILHA
            </span>
            <span className="block text-[9px] sm:text-[11px] font-semibold text-teal-700 dark:text-teal-400 tracking-wider uppercase mt-1 leading-none whitespace-nowrap">
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
          {onOpenTestimonials && (
            <button
              type="button"
              onClick={onOpenTestimonials}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Depoimentos
            </button>
          )}


          {/* Meu-site Premium Bonus Link */}
          {onOpenMiniSite && (
            <button
              type="button"
              onClick={onOpenMiniSite}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-black text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-700/60 hover:bg-amber-100 transition-colors"
              title="Acessar bônus do Plano Premium: melhordailha.online/meu-site"
            >
              <span className="text-amber-500">⭐</span>
              <span className="font-mono">meu-site</span>
            </button>
          )}

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

        {/* Actions (Dark Mode, Favorites, Auth, Advertise CTA) */}
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

          {/* User Authentication Status */}
          {user ? (
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all border border-slate-200/80 dark:border-slate-700"
                title={`Conectado como ${user.displayName || user.email}`}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="hidden lg:inline max-w-[100px] truncate">
                  {user.displayName?.split(' ')[0] || 'Minha Conta'}
                </span>
              </button>
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 hidden group-hover:block z-50">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user.displayName || 'Usuário'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenFavorites}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-2 mt-1"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Favoritos na Nuvem</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={authBusy}
                  className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors flex items-center gap-2 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair da Conta</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading || authBusy}
              aria-label="Entrar com Google"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
            >
              {authBusy ? (
                <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
              ) : (
                <LogIn className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              )}
              <span className="hidden sm:inline">Entrar</span>
            </button>
          )}

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

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {!user ? (
              <button
                type="button"
                onClick={() => {
                  handleLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm border border-slate-200 dark:border-slate-700"
              >
                <LogIn className="w-4 h-4 text-teal-600" />
                <span>Entrar com Google</span>
              </button>
            ) : (
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-between">
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user.displayName || user.email}
                  </p>
                  <p className="text-[10px] text-teal-600 dark:text-teal-400">
                    Sincronizado na Nuvem
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

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
