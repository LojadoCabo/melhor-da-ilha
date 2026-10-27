import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Send,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  Building2,
  Clock
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

  const phoneContacts = [
    {
      label: 'Central WhatsApp & Atendimento',
      numberDisplay: '(71) 99117-1830',
      numberClean: '5571991171830',
      badge: 'Principal',
      color: 'emerald'
    },
    {
      label: 'Comercial & Novos Anúncios',
      numberDisplay: '(71) 99954-5085',
      numberClean: '5571999545085',
      badge: 'Comercial',
      color: 'teal'
    },
    {
      label: 'Suporte Regional Ilha & RMS',
      numberDisplay: '(71) 98382-1218',
      numberClean: '5571983821218',
      badge: 'Suporte',
      color: 'sky'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      showToast('Por favor preencha seu nome e mensagem.');
      return;
    }
    // Persist to Firestore
    try {
      const inqId = `inq-${Date.now()}`;
      import('../lib/firebase').then(({ db, doc, setDoc }) => {
        setDoc(doc(db, 'inquiries', inqId), {
          name: name.trim(),
          email: contact.includes('@') ? contact.trim() : `${name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'usuario'}@contato.local`,
          phone: contact.trim(),
          message: message.trim(),
          type: 'contact',
          createdAt: new Date().toISOString()
        }).catch(err => console.warn('Inquiry Firestore write error:', err));
      });
    } catch (e) {
      console.warn(e);
    }

    setSent(true);
    showToast('Mensagem enviada com sucesso! Retornaremos em breve.');
  };

  const handleOpenWhatsApp = (cleanNumber: string) => {
    const text = encodeURIComponent('Olá equipe do MELHOR DA ILHA! Gostaria de falar com o suporte/atendimento.');
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[92vh] flex flex-col overflow-y-auto transition-all duration-200"
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

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pr-10">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h2 id="contact-modal-title" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Fale com a Equipe
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              MELHOR DA ILHA · Telefones e canais oficiais de atendimento na Ilha e RMS
            </p>
          </div>
        </div>

        {/* Official 3 Phone Numbers Grid */}
        <div className="mb-6 space-y-2.5">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
            <span>Nossos Telefones & WhatsApp Oficiais</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {phoneContacts.map(p => (
              <div
                key={p.numberClean}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-3 hover:border-teal-500/50 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                      {p.badge}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Online
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-tight">
                    {p.label}
                  </h4>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                    {p.numberDisplay}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-750">
                  <button
                    type="button"
                    onClick={() => handleOpenWhatsApp(p.numberClean)}
                    className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <a
                    href={`tel:+${p.numberClean}`}
                    className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
                    title={`Ligar para ${p.numberDisplay}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form or Success State */}
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Ou Envie uma Mensagem Direta
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mensagem ou Dúvida
              </label>
              <textarea
                rows={3}
                required
                placeholder="Escreva sua dúvida, sugestão ou solicitação de cadastro..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all mt-1"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Mensagem para a Equipe</span>
            </button>
          </form>
        ) : (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-lg text-slate-900 dark:text-white">Mensagem Enviada!</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Agradecemos o contato. Nossa equipe responderá o mais rápido possível através do seu WhatsApp ou telefone.
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

        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Base operacional na Ilha de Itaparica (Vera Cruz) e Região Metropolitana de Salvador - BA</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Seg a Sáb: 08h às 19h</span>
          </div>
        </div>
      </div>
    </div>
  );
};
