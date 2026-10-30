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
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Slogan</label>
            <input
              type="text"
              value={formData.tagline || ''}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Descrição</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white h-24"
            />
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold transition-colors"
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
