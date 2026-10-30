/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider, useFavorites } from './context/FavoritesContext';
import { Business, FilterState } from './types';
import { BUSINESSES as initialBusinesses } from './data/businesses';
import { CITIES } from './data/cities';
import { filterBusinesses, sortBusinesses, getCategoryCounts, getCityCounts } from './utils/filter';
import { mergeWithStoredBusinesses, saveCustomBusiness } from './utils/customBusinessesStorage';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryChips } from './components/CategoryChips';
import { FilterBar } from './components/FilterBar';
import { BusinessCard } from './components/BusinessCard';
import { BusinessModal } from './components/BusinessModal';
import { ShareModal } from './components/ShareModal';
import { CategoriesModal } from './components/CategoriesModal';
import { CitiesModal } from './components/CitiesModal';
import { AdvertiseModal } from './components/AdvertiseModal';
import { ContactModal } from './components/ContactModal';
import { GoogleWorkspaceModal } from './components/GoogleWorkspaceModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ClientMiniSite } from './components/ClientMiniSite';
import { MapView } from './components/MapView';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import {
  Compass,
  SearchX,
  Heart,
  RotateCcw,
  Sparkles,
  MapPin,
  HelpCircle,
  PlusCircle,
  MessageCircle
} from 'lucide-react';

const defaultFilters: FilterState = {
  query: '',
  categoryId: 'all',
  cityId: 'all',
  neighborhood: 'all',
  openNowOnly: false,
  verifiedOnly: false,
  deliveryOnly: false,
  whatsappOnly: false,
  websiteFilter: 'all',
  minRating: 0,
  priceLevel: 'all',
  sortBy: 'featured'
};

function MainAppContent() {
  const [businesses, setBusinesses] = useState<Business[]>(() => mergeWithStoredBusinesses(initialBusinesses));
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [sharingBusiness, setSharingBusiness] = useState<Business | null>(null);

  // Modals
  const [isAdvertiseOpen, setIsAdvertiseOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isCitiesOpen, setIsCitiesOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [workspaceSelectedBiz, setWorkspaceSelectedBiz] = useState<Business | null>(null);

  // Dedicated Client Mini-Site View (/meu-site)
  const [miniSiteBusiness, setMiniSiteBusiness] = useState<Business | null>(null);
  const [isMiniSiteOpen, setIsMiniSiteOpen] = useState(false);

  const { favorites, showToast } = useFavorites();

  // Dynamic Route Listener for /perfil/:slug, /p/:slug, /meu-site, direct /:slug, or query ?business=:id
  React.useEffect(() => {
    const checkPath = () => {
      const pathname = window.location.pathname.replace(/\/+$/, '');
      const hash = window.location.hash;
      const search = window.location.search;

      let targetSlug = '';

      if (pathname.startsWith('/perfil/')) {
        targetSlug = decodeURIComponent(pathname.replace('/perfil/', ''));
      } else if (pathname.startsWith('/p/')) {
        targetSlug = decodeURIComponent(pathname.replace('/p/', ''));
      } else if (pathname === '/meu-site' || hash.includes('/meu-site') || search.includes('meu-site')) {
        const urlParams = new URLSearchParams(window.location.search);
        targetSlug = urlParams.get('biz') || '';
      } else if (pathname && pathname !== '/' && pathname !== '/index.html') {
        const potentialSlug = decodeURIComponent(pathname.slice(1));
        if (businesses.some(b => b.slug === potentialSlug || b.id === potentialSlug)) {
          targetSlug = potentialSlug;
        }
      }

      if (targetSlug || pathname.startsWith('/perfil/') || pathname === '/meu-site') {
        const match =
          businesses.find(b => b.slug === targetSlug || b.id === targetSlug) ||
          businesses.find(b => b.isRmsPremium) ||
          businesses[0];
        setMiniSiteBusiness(match || businesses[0]);
        setIsMiniSiteOpen(true);
      } else if (pathname === '' || pathname === '/' || pathname === '/index.html') {
        setIsMiniSiteOpen(false);
      }

      // Suporte a deep link para abrir o modal do estabelecimento (?business=id, ?empresa=id, ?b=id)
      const urlParams = new URLSearchParams(window.location.search);
      const businessQuery = urlParams.get('business') || urlParams.get('empresa') || urlParams.get('b') || urlParams.get('id');

      if (businessQuery) {
        const queryLower = decodeURIComponent(businessQuery).trim().toLowerCase();
        const matchedBiz = businesses.find(
          b => b.id.toLowerCase() === queryLower || (b.slug && b.slug.toLowerCase() === queryLower)
        );
        if (matchedBiz) {
          setSelectedBusiness(matchedBiz);
        }
      } else if (hash) {
        const cleanHash = hash.replace(/^#\/?/, '');
        const hashParams = new URLSearchParams(cleanHash.includes('?') ? cleanHash.split('?')[1] : cleanHash);
        const hashBiz = hashParams.get('business') || hashParams.get('b');
        if (hashBiz) {
          const val = decodeURIComponent(hashBiz).trim().toLowerCase();
          const matchedBiz = businesses.find(
            b => b.id.toLowerCase() === val || (b.slug && b.slug.toLowerCase() === val)
          );
          if (matchedBiz) setSelectedBusiness(matchedBiz);
        }
      }

      if (search.includes('anuncio') || search.includes('anunciar') || search.includes('cadastro') || search.includes('plano')) {
        setIsAdvertiseOpen(true);
      }
    };
    checkPath();
    window.addEventListener('popstate', checkPath);
    window.addEventListener('hashchange', checkPath);
    return () => {
      window.removeEventListener('popstate', checkPath);
      window.removeEventListener('hashchange', checkPath);
    };
  }, [businesses]);

  const handleSelectBusiness = (biz: Business | null) => {
    setSelectedBusiness(biz);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (biz) {
        url.searchParams.set('business', biz.slug || biz.id);
        window.history.replaceState({}, '', url.toString());
      } else {
        if (url.searchParams.has('business') || url.searchParams.has('b') || url.searchParams.has('empresa') || url.searchParams.has('id')) {
          url.searchParams.delete('business');
          url.searchParams.delete('b');
          url.searchParams.delete('empresa');
          url.searchParams.delete('id');
          const newSearch = url.searchParams.toString();
          window.history.replaceState({}, '', url.pathname + (newSearch ? `?${newSearch}` : '') + url.hash);
        }
      }
    }
  };

  const handleOpenMiniSite = (biz?: Business) => {
    const target = biz || businesses.find(b => b.isRmsPremium) || businesses[0];
    setMiniSiteBusiness(target);
    setIsMiniSiteOpen(true);
    const targetSlug = target.slug || target.id;
    window.history.pushState({}, '', `/${targetSlug}`);
  };

  const handleCloseMiniSite = () => {
    setIsMiniSiteOpen(false);
    window.history.pushState({}, '', '/');
  };

  // Mobile Bottom Navigation
  const [mobileTab, setMobileTab] = useState<'home' | 'categories' | 'cities' | 'favorites' | 'advertise'>('home');

  // Handle business addition from Advertise modal
  const handleBusinessAdded = (newBiz: Business) => {
    saveCustomBusiness(newBiz);
    setBusinesses(prev => [newBiz, ...prev.filter(b => b.id !== newBiz.id)]);

    if (newBiz.isRmsPremium) {
      setFilters(prev => ({
        ...prev,
        sortBy: 'featured',
        cityId: 'all',
        categoryId: 'all',
        query: ''
      }));
      setShowFavoritesOnly(false);
      showToast(`🌟 Minisite ${newBiz.name} ativo em melhordailha.online/${newBiz.slug}!`);
    } else {
      showToast(`Negócio ${newBiz.name} cadastrado com sucesso!`);
    }

    setTimeout(() => {
      const resultsEl = document.getElementById('directory-results');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 250);
  };

  // Filter updates
  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
    setShowFavoritesOnly(false);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setShowFavoritesOnly(false);
  };

  const handleQuickSearch = (term: string) => {
    setFilters(prev => ({ ...prev, query: term }));
    setShowFavoritesOnly(false);
    // Smooth scroll down to results
    const resultsEl = document.getElementById('directory-results');
    if (resultsEl) {
      resultsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Compute category and city counts for badges
  const categoryCounts = useMemo(() => getCategoryCounts(businesses), [businesses]);
  const cityCounts = useMemo(() => getCityCounts(businesses), [businesses]);

  const [visibleCount, setVisibleCount] = useState(24);

  // Reset pagination to 24 when filters change
  React.useEffect(() => {
    setVisibleCount(24);
  }, [filters, showFavoritesOnly]);

  // Compute filtered list
  const filteredList = useMemo(() => {
    let list = businesses;

    if (showFavoritesOnly) {
      list = list.filter(b => favorites.includes(b.id));
    }

    const filtered = filterBusinesses(list, filters);
    return sortBusinesses(filtered, filters.sortBy);
  }, [businesses, filters, showFavoritesOnly, favorites]);

  const displayedBusinesses = useMemo(() => {
    return filteredList.slice(0, visibleCount);
  }, [filteredList, visibleCount]);

  // Handle mobile bottom nav clicks
  const handleSelectMobileTab = (tab: 'home' | 'categories' | 'cities' | 'favorites' | 'advertise') => {
    setMobileTab(tab);
    if (tab === 'home') {
      setShowFavoritesOnly(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'categories') {
      setIsCategoriesOpen(true);
    } else if (tab === 'cities') {
      setIsCitiesOpen(true);
    } else if (tab === 'favorites') {
      setShowFavoritesOnly(true);
      const resultsEl = document.getElementById('directory-results');
      if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'advertise') {
      setIsAdvertiseOpen(true);
    }
  };

  if (isMiniSiteOpen && miniSiteBusiness) {
    return (
      <ClientMiniSite
        business={miniSiteBusiness}
        onBackToDirectory={handleCloseMiniSite}
        onSelectAnotherBusiness={biz => handleOpenMiniSite(biz)}
        allBusinesses={businesses}
        onBusinessUpdated={updated => {
          setMiniSiteBusiness(updated);
          setBusinesses(prev => [updated, ...prev.filter(b => b.id !== updated.id)]);
          showToast(`✅ Página melhordailha.online/${updated.slug} atualizada!`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] dark:bg-[#0b1320] text-slate-800 dark:text-slate-100 transition-colors duration-200 overflow-x-hidden">
      {/* Toast Notification */}
      <Toast />

      {/* Header */}
      <Header
        onOpenAdvertise={() => setIsAdvertiseOpen(true)}
        onOpenCategories={() => setIsCategoriesOpen(true)}
        onOpenCities={() => setIsCitiesOpen(true)}
        onOpenFavorites={() => {
          setShowFavoritesOnly(true);
          const resultsEl = document.getElementById('directory-results');
          if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenContact={() => setIsContactOpen(true)}
        onGoHome={() => {
          setShowFavoritesOnly(false);
          setFilters(defaultFilters);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenTestimonials={() => {
          const el = document.getElementById('depoimentos-usuarios');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenMiniSite={biz => handleOpenMiniSite(biz)}
        businesses={businesses}
        onOpenWorkspace={() => {
          setWorkspaceSelectedBiz(null);
          setIsWorkspaceOpen(true);
        }}
      />

      <main className="flex-1">
        {/* Hero Banner Section */}
        <HeroSection
          searchQuery={filters.query}
          onSearchChange={q => handleFilterChange({ query: q })}
          onQuickSearch={handleQuickSearch}
          totalCount={businesses.length}
        />

        {/* Map View */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <MapView businesses={filteredList} onMarkerClick={handleSelectBusiness} />
        </div>

        {/* Directory Content Area */}
        <section id="directory-results" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Favorites Header Banner if Favorites tab active */}
          {showFavoritesOnly && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">
                    Seus Negócios Salvos ({favorites.length})
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Locais e serviços que você marcou com a estrela de favorito
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFavoritesOnly(false)}
                className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Ver Todos
              </button>
            </div>
          )}

          {/* Horizontal Category Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Segmentos na Ilha & RMS
              </h2>
              <button
                type="button"
                onClick={() => setIsCategoriesOpen(true)}
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
              >
                Ver todas as 12 categorias
              </button>
            </div>
            <CategoryChips
              selectedCategoryId={filters.categoryId}
              onSelectCategory={catId => handleFilterChange({ categoryId: catId })}
              categoryCounts={categoryCounts}
              totalCount={businesses.length}
            />
          </div>

          {/* Advanced Filter Bar (City, Neighborhood, Open Now, Rating, Sort) */}
          <FilterBar
            filters={filters}
            onChangeFilters={handleFilterChange}
            onResetFilters={handleResetFilters}
            totalFiltered={filteredList.length}
          />

          {/* Results Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Mostrando{' '}
              <span className="text-teal-600 dark:text-teal-400 font-extrabold">
                {filteredList.length}
              </span>{' '}
              {filteredList.length === 1 ? 'resultado' : 'resultados'}
              {filters.cityId !== 'all' && (
                <span> em <span className="font-bold text-slate-900 dark:text-white">{CITIES.find(c => c.id === filters.cityId)?.name || filters.cityId}</span></span>
              )}
              {filters.query && (
                <span> para "<em>{filters.query}</em>"</span>
              )}
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Dica: clique no card para ver horários e serviços completos</span>
            </div>
          </div>

          {/* Business Listings Grid */}
          {filteredList.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedBusinesses.map(business => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    onSelect={biz => handleSelectBusiness(biz)}
                    onShare={biz => setSharingBusiness(biz)}
                    onOpenMiniSite={biz => handleOpenMiniSite(biz)}
                  />
                ))}
              </div>

              {visibleCount < filteredList.length && (
                <div className="pt-8 pb-4 text-center space-y-3">
                  <p className="text-xs text-slate-500 font-medium">
                    Exibindo {displayedBusinesses.length} de {filteredList.length} estabelecimentos
                  </p>
                  <button
                    type="button"
                    onClick={() => setVisibleCount(prev => prev + 24)}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm shadow-lg shadow-teal-700/20 hover:scale-102 transition-all cursor-pointer"
                  >
                    <span>Carregar Mais Empresas (+24)</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="py-16 text-center space-y-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <SearchX className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {showFavoritesOnly ? 'Você ainda não salvou nenhum negócio' : 'Nenhum resultado encontrado'}
              </h3>
              <p className="max-w-md mx-auto text-sm text-slate-500 dark:text-slate-400">
                {showFavoritesOnly
                  ? 'Clique no ícone de coração em qualquer comércio ou serviço para salvá-lo aqui e ter acesso rápido.'
                  : 'Tente buscar por termos mais genéricos, limpar os filtros selecionados ou selecionar outro município.'}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Limpar Filtros e Ver Todos</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdvertiseOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all"
                >
                  <PlusCircle className="w-4 h-4 text-teal-600" />
                  <span>Cadastrar este negócio no guia</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Featured Callout Section: For Local Merchants */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-8 sm:p-12 shadow-xl">
            <div className="max-w-2xl relative z-10 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                Destaque seu Negócio
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Você tem uma oficina, loja, restaurante ou presta serviços na Ilha?
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Junte-se ao <strong>MELHOR DA ILHA</strong> e apareça para quem procura exatamente o que você oferece em Vera Cruz, Itaparica e RMS. Receba chamadas e contatos diretos no seu WhatsApp.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdvertiseOpen(true)}
                  className="px-6 py-3 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 transition-all hover:scale-102"
                >
                  Cadastrar meu negócio agora
                </button>
                <button
                  type="button"
                  onClick={() => setIsContactOpen(true)}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm transition-colors"
                >
                  Falar com suporte
                </button>
              </div>
            </div>
            {/* Decorative icon background */}
            <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none hidden md:block">
              <Compass className="w-72 h-72 text-white" />
            </div>
          </div>
        </section>

        {/* User Testimonials Section: "Depoimentos de Usuários" */}
        <div id="depoimentos-usuarios">
          <TestimonialsSection
            onSelectBusiness={businessId => {
              const matched = businesses.find(b => b.id === businessId || b.name.toLowerCase().includes(businessId.toLowerCase()));
              if (matched) {
                handleSelectBusiness(matched);
              }
            }}
            onOpenContact={() => setIsContactOpen(true)}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={catId => {
          handleFilterChange({ categoryId: catId });
          const resultsEl = document.getElementById('directory-results');
          if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectCity={cityId => {
          handleFilterChange({ cityId });
          const resultsEl = document.getElementById('directory-results');
          if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenAdvertise={() => setIsAdvertiseOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        onOpenTestimonials={() => {
          const el = document.getElementById('depoimentos-usuarios');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        currentTab={mobileTab}
        onSelectTab={handleSelectMobileTab}
      />

      {/* Business Details Modal */}
      <BusinessModal
        business={selectedBusiness}
        isOpen={Boolean(selectedBusiness)}
        onClose={() => handleSelectBusiness(null)}
        onShare={biz => setSharingBusiness(biz)}
        onOpenMiniSite={biz => handleOpenMiniSite(biz)}
        onOpenWorkspaceWithBiz={biz => {
          setWorkspaceSelectedBiz(biz);
          setIsWorkspaceOpen(true);
        }}
      />

      {/* Social Share Modal */}
      <ShareModal
        business={sharingBusiness}
        isOpen={Boolean(sharingBusiness)}
        onClose={() => setSharingBusiness(null)}
      />

      {/* Categories Explorer Modal */}
      <CategoriesModal
        isOpen={isCategoriesOpen}
        onClose={() => setIsCategoriesOpen(false)}
        onSelectCategory={catId => {
          handleFilterChange({ categoryId: catId });
          const resultsEl = document.getElementById('directory-results');
          if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth' });
        }}
        categoryCounts={categoryCounts}
      />

      {/* Cities Explorer Modal */}
      <CitiesModal
        isOpen={isCitiesOpen}
        onClose={() => setIsCitiesOpen(false)}
        onSelectCity={(cityId, neighborhood) => {
          handleFilterChange({
            cityId,
            neighborhood: neighborhood || 'all'
          });
          const resultsEl = document.getElementById('directory-results');
          if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth' });
        }}
        cityCounts={cityCounts}
      />

      {/* Advertise Registration Modal */}
      <AdvertiseModal
        isOpen={isAdvertiseOpen}
        onClose={() => setIsAdvertiseOpen(false)}
        onBusinessAdded={handleBusinessAdded}
        businesses={businesses}
        onOpenMiniSite={handleOpenMiniSite}
      />

      {/* Contact Support Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {/* Google Workspace Modal (Sheets, Calendar, Docs) */}
      <GoogleWorkspaceModal
        isOpen={isWorkspaceOpen}
        onClose={() => {
          setIsWorkspaceOpen(false);
          setWorkspaceSelectedBiz(null);
        }}
        businesses={businesses}
        currentFilteredBusinesses={filteredList}
        preselectedBusiness={workspaceSelectedBiz}
        onShowToast={showToast}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FavoritesProvider>
          <MainAppContent />
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
