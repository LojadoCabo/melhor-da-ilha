import React from 'react';
import {
  Compass,
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
  Heart,
  ArrowUp,
  MapPin,
  Phone,
  PhoneCall
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { CITIES } from '../data/cities';

interface FooterProps {
  onSelectCategory: (catId: string) => void;
  onSelectCity: (cityId: string) => void;
  onOpenAdvertise: () => void;
  onOpenContact: () => void;
  onOpenTestimonials?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onSelectCity,
  onOpenAdvertise,
  onOpenContact,
  onOpenTestimonials
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-slate-900 text-slate-300 pt-14 pb-24 md:pb-14 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand & Contacts Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <span className="block font-black text-lg text-white tracking-tight">
                  MELHOR DA ILHA
                </span>
                <span className="block text-[11px] font-semibold text-teal-400 tracking-wider uppercase">
                  Guia Local Ilha & Região Metropolitana
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              O catálogo comercial e de serviços mais completo da Ilha de Itaparica (Vera Cruz e Itaparica) e dos 13 municípios da Região Metropolitana de Salvador. Avaliações reais, rotas e contato direto.
            </p>

            {/* Official Phones Box */}
            <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-2 max-w-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Nossos Telefones & WhatsApp</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Central / WhatsApp:</span>
                  <a
                    href="https://wa.me/5571991171830"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-400 hover:underline"
                  >
                    (71) 99117-1830
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Comercial / Anúncios:</span>
                  <a
                    href="https://wa.me/5571999545085"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-teal-400 hover:underline"
                  >
                    (71) 99954-5085
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Suporte Ilha & RMS:</span>
                  <a
                    href="https://wa.me/5571983821218"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-sky-400 hover:underline"
                  >
                    (71) 98382-1218
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Oficial"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-pink-600 hover:text-white text-slate-300 flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Oficial"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/5571991171830"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Oficial (71) 99117-1830"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 flex items-center justify-center transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Canal YouTube"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 flex items-center justify-center transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Categories links */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-3">
              Categorias
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {CATEGORIES.slice(0, 6).map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelectCategory(cat.id)}
                    className="hover:text-teal-400 transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* More Categories */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-3">
              Mais Segmentos
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {CATEGORIES.slice(6, 12).map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelectCategory(cat.id)}
                    className="hover:text-teal-400 transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Municipalities & Quick links */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-white mb-3">
              Municípios & Acesso
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400 mb-4">
              {CITIES.map(city => (
                <li key={city.id}>
                  <button
                    onClick={() => onSelectCity(city.id)}
                    className="hover:text-teal-400 transition-colors text-left"
                  >
                    {city.name} ({city.state})
                  </button>
                </li>
              ))}
            </ul>

            <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs">
              <button
                onClick={onOpenAdvertise}
                className="block text-teal-400 hover:underline font-semibold"
              >
                + Cadastrar Meu Negócio
              </button>
              {onOpenTestimonials && (
                <button
                  onClick={onOpenTestimonials}
                  className="block text-slate-400 hover:text-white transition-colors"
                >
                  Avaliações no Google Maps
                </button>
              )}
              <button
                onClick={onOpenContact}
                className="block text-slate-400 hover:text-white transition-colors"
              >
                Fale Conosco: (71) 99117-1830
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MELHOR DA ILHA. Todos os direitos reservados. Telefones: (71) 99117-1830 · (71) 99954-5085 · (71) 98382-1218.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Feito com <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> para a Ilha de Itaparica e toda a RMS
            </span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              aria-label="Voltar ao topo"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
