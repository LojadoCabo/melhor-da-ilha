import React from 'react';
import { Search, X, Compass, Sparkles, Shield, PhoneCall } from 'lucide-react';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onQuickSearch: (query: string) => void;
  totalCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  onQuickSearch,
  totalCount
}) => {
  const quickSearches = [
    'Motos & Peças',
    'Moquecarias',
    'Materiais de Construção',
    'Eletricista',
    'Dentista',
    'Boutique Praia',
    'Farmácia'
  ];

  const handleClear = () => {
    onSearchChange('');
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-10 md:pt-14 md:pb-16 bg-gradient-to-b from-teal-500/10 via-amber-500/5 to-transparent dark:from-teal-950/30 dark:via-transparent dark:to-transparent border-b border-slate-200/60 dark:border-slate-800/60">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-teal-400/10 dark:bg-teal-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 xs:gap-2 px-2.5 xs:px-3.5 py-1.5 rounded-full bg-teal-100/80 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 text-[10px] xs:text-xs font-bold xs:font-semibold mb-4 shadow-xs max-w-full">
          <Compass className="w-3 h-3 xs:w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="truncate">GUIA LOCAL OFICIAL · {totalCount} NEGÓCIOS NA RMS</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
          Tem por aqui.{' '}
          <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-amber-500 bg-clip-text text-transparent">
            Encontre por perto.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-8">
          Encontre com facilidade empresas, prestadores de serviços, oficinas, restaurantes e saúde em toda a <strong>Região Metropolitana de Salvador</strong>. O guia completo para facilitar o seu dia a dia na RMS.
        </p>

        {/* Search Input Box */}
        <div className="max-w-2xl mx-auto relative mb-5">
          <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-teal-900/5 dark:shadow-none border-2 border-teal-500/30 dark:border-slate-700 focus-within:border-teal-500 dark:focus-within:border-teal-400 transition-all p-1.5 sm:p-2">
            <div className="pl-3 text-slate-400 dark:text-slate-500">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="O que você está procurando? Ex: oficina, moqueca, eletricista, cimento..."
              className="w-full px-3 py-2 text-sm sm:text-base bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
              aria-label="Buscar comércio ou serviço"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Limpar busca"
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg mr-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-600/25 transition-all shrink-0"
            >
              <span>Buscar</span>
            </button>
          </div>
        </div>

        {/* Quick searches chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Populares:
          </span>
          {quickSearches.map(item => (
            <button
              type="button"
              key={item}
              onClick={() => onQuickSearch(item)}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors shadow-2xs"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 max-w-xl mx-auto mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/60 gap-4 text-center">
          <div>
            <div className="flex justify-center text-teal-600 dark:text-teal-400 mb-1">
              <Shield className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">Negócios Verificados</div>
            <div className="text-[11px] text-slate-500">Dados conferidos na região</div>
          </div>
          <div>
            <div className="flex justify-center text-emerald-600 dark:text-emerald-400 mb-1">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">WhatsApp Direto</div>
            <div className="text-[11px] text-slate-500">Fale sem intermediários</div>
          </div>
          <div>
            <div className="flex justify-center text-amber-500 mb-1">
              <Compass className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">Ilha & RMS</div>
            <div className="text-[11px] text-slate-500">De Vera Cruz a Salvador</div>
          </div>
        </div>
      </div>
    </section>
  );
};
