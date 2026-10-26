import React from 'react';
import { CITIES } from '../data/cities';
import { FilterState } from '../types';
import {
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  MessageCircle,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Globe
} from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onChangeFilters: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalFiltered: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChangeFilters,
  onResetFilters,
  totalFiltered
}) => {
  const currentCity = CITIES.find(c => c.id === filters.cityId);
  const neighborhoods = currentCity ? currentCity.neighborhoods : [];

  const isAnyFilterActive =
    filters.query !== '' ||
    filters.categoryId !== 'all' ||
    filters.cityId !== 'all' ||
    filters.neighborhood !== 'all' ||
    filters.openNowOnly ||
    filters.verifiedOnly ||
    filters.deliveryOnly ||
    filters.whatsappOnly ||
    (filters.websiteFilter && filters.websiteFilter !== 'all') ||
    filters.minRating > 0 ||
    filters.priceLevel !== 'all';

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
      {/* City selector row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto py-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            Município:
          </span>
          <button
            type="button"
            onClick={() => onChangeFilters({ cityId: 'all', neighborhood: 'all' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              filters.cityId === 'all'
                ? 'bg-slate-900 text-white dark:bg-teal-600 dark:text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Todos os Municípios
          </button>
          {CITIES.map(city => (
            <button
              type="button"
              key={city.id}
              onClick={() => onChangeFilters({ cityId: city.id, neighborhood: 'all' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                filters.cityId === city.id
                  ? 'bg-slate-900 text-white dark:bg-teal-600 dark:text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>

        {/* Neighborhood dropdown if a city is selected */}
        {neighborhoods.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="neighborhood-select" className="text-xs text-slate-500 shrink-0 font-medium">
              Bairro/Local:
            </label>
            <select
              id="neighborhood-select"
              value={filters.neighborhood}
              onChange={e => onChangeFilters({ neighborhood: e.target.value })}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">Todos os Bairros de {currentCity?.name}</option>
              {neighborhoods.map(nb => (
                <option key={nb} value={nb}>
                  {nb}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Advanced Filter Toggles and Sorting Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Open Now Toggle */}
          <button
            type="button"
            onClick={() => onChangeFilters({ openNowOnly: !filters.openNowOnly })}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filters.openNowOnly
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-400'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Aberto Agora</span>
          </button>

          {/* Verified Toggle */}
          <button
            type="button"
            onClick={() => onChangeFilters({ verifiedOnly: !filters.verifiedOnly })}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filters.verifiedOnly
                ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-400'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verificados</span>
          </button>

          {/* Delivery Toggle */}
          <button
            type="button"
            onClick={() => onChangeFilters({ deliveryOnly: !filters.deliveryOnly })}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filters.deliveryOnly
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-400'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Delivery</span>
          </button>

          {/* WhatsApp Direct Toggle */}
          <button
            type="button"
            onClick={() => onChangeFilters({ whatsappOnly: !filters.whatsappOnly })}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filters.whatsappOnly
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-400'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          {/* Website Presence Filter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <select
              value={filters.websiteFilter || 'all'}
              onChange={e => onChangeFilters({ websiteFilter: e.target.value as FilterState['websiteFilter'] })}
              aria-label="Filtro de presença web e sites"
              className="bg-transparent text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="all" className="bg-white dark:bg-slate-800">Presença Web (Todas)</option>
              <option value="has_website" className="bg-white dark:bg-slate-800">Com Site Próprio</option>
              <option value="outdated_website" className="bg-white dark:bg-slate-800">Site em Atualização</option>
              <option value="direct_whatsapp" className="bg-white dark:bg-slate-800">Sem Site (WhatsApp)</option>
            </select>
          </div>

          {/* Minimum Rating Selector */}
          <select
            value={filters.minRating}
            onChange={e => onChangeFilters({ minRating: Number(e.target.value) })}
            aria-label="Avaliação mínima"
            className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
          >
            <option value="0" className="bg-white dark:bg-slate-800">Qualquer Avaliação</option>
            <option value="4.5" className="bg-white dark:bg-slate-800">★ 4.5 ou mais</option>
            <option value="4.8" className="bg-white dark:bg-slate-800">★ 4.8 ou mais</option>
          </select>

          {/* Reset Filters button */}
          {isAnyFilterActive && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            Ordenar:
          </label>
          <select
            id="sort-select"
            value={filters.sortBy}
            onChange={e => onChangeFilters({ sortBy: e.target.value as FilterState['sortBy'] })}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none"
          >
            <option value="featured">Destaques</option>
            <option value="rating">Melhor Avaliação</option>
            <option value="reviews">Mais Avaliados</option>
            <option value="name">Nome (A - Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
