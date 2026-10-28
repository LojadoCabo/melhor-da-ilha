import React, { useState, useMemo } from 'react';
import { X, MapPin, Compass, Search } from 'lucide-react';
import { CITIES } from '../data/cities';

interface CitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCity: (cityId: string, neighborhood?: string) => void;
  cityCounts: Record<string, number>;
}

export const CitiesModal: React.FC<CitiesModalProps> = ({
  isOpen,
  onClose,
  onSelectCity,
  cityCounts
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'Ilha de Itaparica' | 'Região Metropolitana de Salvador'>('all');

  const filteredCities = useMemo(() => {
    return CITIES.filter(city => {
      if (selectedRegion !== 'all' && city.region !== selectedRegion) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = city.name.toLowerCase().includes(term);
        const matchesBairro = city.neighborhoods.some(nb => nb.toLowerCase().includes(term));
        return matchesName || matchesBairro;
      }
      return true;
    });
  }, [searchTerm, selectedRegion]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto overflow-x-hidden">
      <div
        className="relative w-full max-w-[calc(100vw-1rem)] mx-auto max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[90vh] flex flex-col transition-all duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cities-modal-title"
      >
        <button
          onClick={onClose}
          aria-label="Fechar modal de cidades"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 pr-10">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h2 id="cities-modal-title" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Municípios da RMS & Ilha
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Explore 13 cidades com mais de 75 comércios e prestadores de serviços mapeados
            </p>
          </div>
        </div>

        {/* Search & Region Filter Row */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cidade ou bairro (ex: Simões Filho, Suape, Pituba...)"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedRegion('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
                selectedRegion === 'all'
                  ? 'bg-slate-900 text-white dark:bg-teal-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Todos (13 Municípios)
            </button>
            <button
              type="button"
              onClick={() => setSelectedRegion('Região Metropolitana de Salvador')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
                selectedRegion === 'Região Metropolitana de Salvador'
                  ? 'bg-slate-900 text-white dark:bg-teal-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              RMS Continental (11)
            </button>
            <button
              type="button"
              onClick={() => setSelectedRegion('Ilha de Itaparica')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
                selectedRegion === 'Ilha de Itaparica'
                  ? 'bg-slate-900 text-white dark:bg-teal-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Ilha de Itaparica (2)
            </button>
          </div>
        </div>

        <div className="space-y-3 overflow-y-auto overflow-x-hidden pr-1 flex-1">
          {filteredCities.map(city => {
            const count = cityCounts[city.id] || 0;
            return (
              <div
                key={city.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80"
              >
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => {
                      onSelectCity(city.id, 'all');
                      onClose();
                    }}
                    className="flex items-center gap-2 group text-left"
                  >
                    <Compass className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {city.name} - {city.state}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {count} {count === 1 ? 'negócio' : 'negócios'}
                    </span>
                  </button>
                  <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-md">
                    {city.region}
                  </span>
                </div>

                {/* Neighborhoods tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {city.neighborhoods.map(nb => (
                    <button
                      key={nb}
                      onClick={() => {
                        onSelectCity(city.id, nb);
                        onClose();
                      }}
                      className="px-2 py-0.5 text-[11px] font-medium rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                    >
                      {nb}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredCities.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">
              Nenhum município ou bairro encontrado para "{searchTerm}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
