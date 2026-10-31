import React, { useState } from 'react';
import { Business } from '../types';
import { X, Loader2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface EditBusinessModalProps {
  business: Business;
  onClose: () => void;
  onSave: (updatedBusiness: Partial<Business>) => Promise<void>;
}

export const EditBusinessModal: React.FC<EditBusinessModalProps> = ({ business, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Business>>(business);
  const [isLoading, setIsLoading] = useState(false);
  const { user, loginWithGoogle } = useAuth();

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl w-full max-w-sm text-center">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Acesso Necessário</h2>
          <p className="mb-6 dark:text-slate-300">Você precisa fazer login para editar o anúncio deste negócio.</p>
          <button 
            onClick={() => loginWithGoogle()}
            className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg font-bold"
          >
            Fazer Login com Google
          </button>
          <button onClick={onClose} className="mt-4 w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">Cancelar</button>
        </div>
      </div>
    );
  }

  // Owner check
  const isOwner = user.email === business.email || user.email === 'filocriacoes@gmail.com'; // Admin bypass

  if (!isOwner) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl w-full max-w-sm text-center">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Acesso Negado</h2>
          <p className="mb-6 dark:text-slate-300">Este e-mail ({user.email}) não está vinculado como proprietário deste negócio. Entre em contato com o suporte se isso for um erro.</p>
          <button onClick={onClose} className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg font-bold">Fechar</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onSave(formData);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold dark:text-white">Editar: {business.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">WhatsApp de Contato</label>
              <input
                type="text"
                value={formData.whatsapp || ''}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="Ex: 71999999999"
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">Instagram (@usuario)</label>
              <input
                type="text"
                value={formData.instagram || ''}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="Ex: @minhaempresa"
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Slogan / Frase Curta</label>
            <input
              type="text"
              value={formData.tagline || ''}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Descrição Completa</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-slate-300">Galeria de Fotos (Até 6 links de imagens)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <div key={idx} className="space-y-1">
                  <div className="aspect-video rounded-lg bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                    {formData.galleryImages?.[idx] ? (
                      <img src={formData.galleryImages[idx]} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-400">Vazio</span>
                    )}
                  </div>
                  <input
                    type="url"
                    placeholder="Link da foto..."
                    value={formData.galleryImages?.[idx] || ''}
                    onChange={(e) => {
                      const newGallery = [...(formData.galleryImages || [])];
                      // Ensure array is at least 6 long
                      while(newGallery.length <= idx) newGallery.push('');
                      newGallery[idx] = e.target.value;
                      setFormData({ ...formData, galleryImages: newGallery.filter(u => u || idx >= newGallery.length - 1) });
                    }}
                    className="w-full px-2 py-1 text-[10px] border rounded bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Dica: Use links diretos de imagens (terminados em .jpg, .png) para melhor resultado.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Link do Google Maps</label>
            <input
              type="text"
              value={formData.googleMapsUrl || ''}
              onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          <div className="pt-4 flex gap-3">
             <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold transition-colors"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
