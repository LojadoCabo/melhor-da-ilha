/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Testimonial, TESTIMONIALS } from '../data/testimonials';
import {
  Star,
  Quote,
  ThumbsUp,
  CheckCircle2,
  MapPin,
  MessageSquareHeart,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Send,
  Building2,
  Award,
  PhoneCall
} from 'lucide-react';

interface TestimonialsSectionProps {
  onSelectBusiness?: (businessId: string) => void;
  onOpenContact?: () => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  onSelectBusiness,
  onOpenContact
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'urgencia' | 'morador' | 'empresa' | 'turista'>('all');
  const [helpfulMap, setHelpfulMap] = useState<Record<string, boolean>>({});
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    TESTIMONIALS.forEach(t => {
      initial[t.id] = t.helpfulCount;
    });
    return initial;
  });

  const handleToggleHelpful = (id: string) => {
    setHelpfulMap(prev => {
      const isAlready = Boolean(prev[id]);
      const nextState = !isAlready;
      setHelpfulCounts(c => ({
        ...c,
        [id]: (c[id] || 0) + (nextState ? 1 : -1)
      }));
      return { ...prev, [id]: nextState };
    });
  };

  const filteredTestimonials = TESTIMONIALS.filter(item => {
    if (selectedFilter === 'all') return true;
    return item.category === selectedFilter;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8" aria-label="Depoimentos e Avaliações Reais do Google Maps">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 dark:bg-teal-400/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
            <MessageSquareHeart className="w-3.5 h-3.5" />
            <span>Avaliações & Depoimentos Reais do Google Maps</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            O que dizem sobre as empresas do <span className="text-teal-600 dark:text-teal-400">MELHOR DA ILHA</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Depoimentos autênticos extraídos diretamente de avaliações verificadas no Google Maps de quem precisou de socorro na rodovia, comprou de indústrias no Polo ou experimentou a gastronomia na Ilha e RMS.
          </p>
        </div>

        {/* Aggregate trust stats */}
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs shrink-0">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex flex-col items-center justify-center font-bold">
            <span className="text-base leading-none">4.9</span>
            <span className="text-[10px] text-amber-600 font-extrabold">★ GOOGLE</span>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              Avaliações Verificadas no Maps
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Clientes reais de Ilha de Itaparica e RMS
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs by Category */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedFilter === 'all'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60'
          }`}
        >
          Todas as Avaliações ({TESTIMONIALS.length})
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('urgencia')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedFilter === 'urgencia'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60'
          }`}
        >
          🚨 Socorro & Oficinas
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('morador')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedFilter === 'morador'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60'
          }`}
        >
          🏘️ Moradores Locais
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('empresa')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedFilter === 'empresa'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60'
          }`}
        >
          🏭 Empresas, Indústria & Serviços
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('turista')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedFilter === 'turista'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60'
          }`}
        >
          🏖️ Turistas & Gastronomia
        </button>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTestimonials.map(t => {
          const isMarkedHelpful = Boolean(helpfulMap[t.id]);
          const currentHelpfulCount = helpfulCounts[t.id] ?? t.helpfulCount;

          return (
            <article
              key={t.id}
              className="group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="space-y-4">
                {/* Header: User Profile with Avatar & Verification Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={t.avatarUrl}
                        alt={`Foto de ${t.name}`}
                        className="w-13 h-13 rounded-2xl object-cover ring-2 ring-teal-500/30 dark:ring-teal-400/20 shadow-sm"
                        loading="lazy"
                      />
                      <span
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs"
                        title="Avaliador Verificado no Google Maps"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug truncate">
                        {t.name}
                      </h3>
                      {t.reviewerLevel && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          <Award className="w-3 h-3 shrink-0" />
                          <span className="truncate">{t.reviewerLevel}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span className="truncate max-w-[170px]">{t.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Google Maps Badge */}
                  <div className="shrink-0 flex flex-col items-end">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Google Maps
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 mt-1">
                      {t.date}
                    </span>
                  </div>
                </div>

                {/* Rating Stars & Badge */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                      {t.rating}.0
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate max-w-[190px]">
                    {t.tag}
                  </span>
                </div>

                {/* Highlight Title */}
                <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug pt-0.5">
                  "{t.highlight}"
                </h4>

                {/* Quote Text */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              {/* Card Footer: Business Mentioned & Helpful Action */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <Building2 className="w-3 h-3 text-teal-600" />
                    <span>Empresa no Guia</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (t.businessId && onSelectBusiness) {
                        onSelectBusiness(t.businessId);
                      }
                    }}
                    className="text-xs font-bold text-teal-600 dark:text-teal-400 truncate hover:underline text-left flex items-center gap-1 group/btn"
                    title={`Ver detalhes de ${t.businessMentioned}`}
                  >
                    <span className="truncate">{t.businessMentioned}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover/btn:opacity-100 transition-opacity shrink-0" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleHelpful(t.id)}
                  aria-label={`Marcar avaliação de ${t.name} como útil`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    isMarkedHelpful
                      ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${isMarkedHelpful ? 'fill-teal-600 dark:fill-teal-400' : ''}`} />
                  <span>Útil ({currentHelpfulCount})</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Callout Footer: Submit Testimonial & Contact Official Phones */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-3xl bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border border-teal-200/70 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Sua empresa também atende na Ilha de Itaparica ou na RMS?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Envie sua avaliação ou fale direto com nossa equipe pelos telefones oficiais: <strong>(71) 99117-1830</strong>, <strong>(71) 99954-5085</strong> ou <strong>(71) 98382-1218</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
          <a
            href="https://wa.me/5571991171830?text=Ol%C3%A1%20equipe%20MELHOR%20DA%20ILHA!%20Gostaria%20de%20enviar%20um%20depoimento%20ou%20cadastrar%20minha%20empresa."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>(71) 99117-1830</span>
          </a>

          <button
            type="button"
            onClick={() => {
              if (onOpenContact) onOpenContact();
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm transition-all hover:scale-102"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Fale com a Equipe</span>
          </button>
        </div>
      </div>
    </section>
  );
};
