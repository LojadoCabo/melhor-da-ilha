import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Send,
  CheckCircle2
} from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useFavorites();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      showToast('Por favor preencha seu nome e mensagem.');
      return;
    }
    setSent(true);
    showToast('Mensagem enviada com sucesso! Retornaremos em breve.');
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent('Olá equipe do MELHOR DA ILHA! Gostaria de falar com o suporte/atendimento.');
    window.open(`https://wa.me/5571988421920?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[90vh] flex flex-col overflow-y-auto transition-all duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
      >
        <button
          onClick={onClose}
          aria-label="Fechar contato"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pr-10">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h2 id="contact-modal-title" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Fale com a Equipe
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              MELHOR DA ILHA · Suporte a usuários e anunciantes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100/70 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">WhatsApp Oficial</div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">(71) 98842-1920</div>
            </div>
          </button>

          <a
            href="mailto:silveiramotos@gmail.com"
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/60 hover:bg-sky-100/70 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white">E-mail Direto</div>
              <div className="text-[11px] text-sky-700 dark:text-sky-300 font-semibold truncate">silveiramotos@gmail.com</div>
            </div>
          </a>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Seu Nome
              </label>
              <input
                type="text"
                required
                placeholder="Como podemos te chamar?"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Seu Telefone ou WhatsApp
              </label>
              <input
                type="text"
                placeholder="(71) 99999-9999"
                value={contact}
                onChange={e => setContact(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mensagem ou Dúvida
              </label>
              <textarea
                rows={3}
                required
                placeholder="Escreva sua mensagem aqui..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all mt-2"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Mensagem</span>
            </button>
          </form>
        ) : (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-lg text-slate-900 dark:text-white">Mensagem Enviada!</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Agradecemos o contato. Nossa equipe responderá o mais rápido possível pelo seu WhatsApp ou e-mail.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="px-4 py-2 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
            >
              Enviar outra mensagem
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
          <span>Atendimento com base na Ilha de Itaparica (Vera Cruz) e Salvador - BA.</span>
        </div>
      </div>
    </div>
  );
};
