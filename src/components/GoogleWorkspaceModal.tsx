import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Calendar as CalendarIcon,
  FileText,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Sparkles,
  Download,
  Building2,
  CalendarCheck2,
  ArrowRight
} from 'lucide-react';
import { Business } from '../types';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from './GoogleSignInButton';
import { WorkspaceConfirmModal } from './WorkspaceConfirmModal';
import {
  exportBusinessesToGoogleSheets,
  createCrmGoogleSheet,
  createGoogleCalendarEvent,
  listUpcomingGoogleCalendarEvents,
  deleteGoogleCalendarEvent,
  createBusinessGoogleDoc,
  createRegionGuideGoogleDoc,
  createCommercialContractGoogleDoc,
  CalendarEvent,
  CreatedWorkspaceResource
} from '../services/googleWorkspace';

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: Business[];
  currentFilteredBusinesses?: Business[];
  preselectedBusiness?: Business | null;
  onShowToast: (msg: string) => void;
}

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  isOpen,
  onClose,
  businesses,
  currentFilteredBusinesses = [],
  preselectedBusiness = null,
  onShowToast
}) => {
  const { user, accessToken, ensureGoogleWorkspaceToken, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'sheets' | 'calendar' | 'docs'>('sheets');
  const [createdResources, setCreatedResources] = useState<CreatedWorkspaceResource[]>([]);

  // Calendar State
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [selectedBizId, setSelectedBizId] = useState<string>(preselectedBusiness?.id || (businesses[0]?.id || ''));
  const [eventTitle, setEventTitle] = useState('Reunião Comercial & Alinhamento');
  const [eventDate, setEventDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [eventStartTime, setEventStartTime] = useState('10:00');
  const [eventEndTime, setEventEndTime] = useState('11:00');
  const [eventNotes, setEventNotes] = useState('');

  // Confirmation Modal State
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    type: 'sheets' | 'calendar' | 'docs' | 'delete';
    title: string;
    description: string;
    affectedCount?: number;
    targetName?: string;
    confirmLabel?: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    type: 'sheets',
    title: '',
    description: '',
    action: async () => {}
  });
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Update selected business when prop changes
  useEffect(() => {
    if (preselectedBusiness) {
      setSelectedBizId(preselectedBusiness.id);
      setEventTitle(`Visita / Reunião - ${preselectedBusiness.name}`);
    }
  }, [preselectedBusiness]);

  // Load calendar events if authenticated and on calendar tab
  useEffect(() => {
    if (isOpen && activeTab === 'calendar' && accessToken) {
      loadCalendarEvents();
    }
  }, [isOpen, activeTab, accessToken]);

  const loadCalendarEvents = async () => {
    if (!accessToken) return;
    try {
      setLoadingCalendar(true);
      const events = await listUpcomingGoogleCalendarEvents(accessToken, 8);
      setCalendarEvents(events);
    } catch (err) {
      console.warn('Could not load calendar events:', err);
    } finally {
      setLoadingCalendar(false);
    }
  };

  if (!isOpen) return null;

  const currentSelectedBiz = businesses.find(b => b.id === selectedBizId) || preselectedBusiness || businesses[0];
  const exportTargetList = currentFilteredBusinesses.length > 0 ? currentFilteredBusinesses : businesses;

  // ----------------------------------------------------
  // Google Sheets Actions
  // ----------------------------------------------------
  const handleExportCatalog = () => {
    setConfirmModalConfig({
      isOpen: true,
      type: 'sheets',
      title: 'Exportar Catálogo para o Google Sheets',
      description: `Será criada uma nova planilha no seu Google Sheets contendo ${exportTargetList.length} estabelecimentos com todas as colunas de dados (endereço, WhatsApp, telefone, avaliação e diferenciais).`,
      affectedCount: exportTargetList.length,
      targetName: 'Sua conta Google Drive / Sheets',
      confirmLabel: 'Criar Planilha no Sheets',
      action: async () => {
        try {
          setIsProcessingAction(true);
          const token = await ensureGoogleWorkspaceToken();
          const title = exportTargetList.length < businesses.length
            ? 'Melhor da Ilha - Seleção de Estabelecimentos'
            : 'Melhor da Ilha - Catálogo Geral Brotas & RMS';
          const result = await exportBusinessesToGoogleSheets(token, exportTargetList, title);

          const newRes: CreatedWorkspaceResource = {
            type: 'sheets',
            id: result.spreadsheetId,
            title: `Planilha: ${title}`,
            url: result.spreadsheetUrl,
            createdAt: new Date().toLocaleTimeString('pt-BR'),
            details: `${result.rowCount} estabelecimentos exportados com formatação completa`
          };

          setCreatedResources(prev => [newRes, ...prev]);
          onShowToast(`Planilha Google Sheets criada com sucesso! (${result.rowCount} linhas)`);
          setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          console.error(err);
          onShowToast(err.message || 'Erro ao exportar para o Google Sheets.');
        } finally {
          setIsProcessingAction(false);
        }
      }
    });
  };

  const handleCreateCrm = () => {
    setConfirmModalConfig({
      isOpen: true,
      type: 'sheets',
      title: 'Criar Planilha CRM de Gestão Comercial',
      description: 'Uma nova planilha estruturada será criada na sua conta Google com abas dedicadas para "Prospecção & Parceiros" e "Reuniões & Visitas".',
      targetName: 'Sua conta Google Drive / Sheets',
      confirmLabel: 'Criar Planilha CRM',
      action: async () => {
        try {
          setIsProcessingAction(true);
          const token = await ensureGoogleWorkspaceToken();
          const result = await createCrmGoogleSheet(token);

          const newRes: CreatedWorkspaceResource = {
            type: 'sheets',
            id: result.spreadsheetId,
            title: 'CRM de Gestão & Parceiros',
            url: result.spreadsheetUrl,
            createdAt: new Date().toLocaleTimeString('pt-BR'),
            details: 'Abas de Prospecção e Reuniões prontas para uso'
          };

          setCreatedResources(prev => [newRes, ...prev]);
          onShowToast('Planilha CRM criada no Google Sheets!');
          setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          console.error(err);
          onShowToast(err.message || 'Erro ao criar planilha CRM.');
        } finally {
          setIsProcessingAction(false);
        }
      }
    });
  };

  // ----------------------------------------------------
  // Google Calendar Actions
  // ----------------------------------------------------
  const handleCreateEvent = () => {
    if (!eventTitle.trim()) {
      onShowToast('Por favor, informe o título do compromisso.');
      return;
    }

    const startDateTime = `${eventDate}T${eventStartTime}:00`;
    const endDateTime = `${eventDate}T${eventEndTime}:00`;

    setConfirmModalConfig({
      isOpen: true,
      type: 'calendar',
      title: 'Agendar no Google Calendar',
      description: `O evento "${eventTitle}" será agendado na sua agenda principal para o dia ${new Date(eventDate).toLocaleDateString('pt-BR')} das ${eventStartTime} às ${eventEndTime}.`,
      targetName: `Google Calendar (${currentSelectedBiz ? currentSelectedBiz.name : 'Agenda Pessoal'})`,
      confirmLabel: 'Agendar no Google Calendar',
      action: async () => {
        try {
          setIsProcessingAction(true);
          const token = await ensureGoogleWorkspaceToken();

          const description = [
            `Compromisso via Guia Comercial Melhor da Ilha.`,
            currentSelectedBiz ? `Estabelecimento: ${currentSelectedBiz.name}` : '',
            currentSelectedBiz ? `Endereço: ${currentSelectedBiz.address} - ${currentSelectedBiz.neighborhood}, ${currentSelectedBiz.cityName}` : '',
            currentSelectedBiz?.whatsapp ? `WhatsApp: ${currentSelectedBiz.whatsapp}` : '',
            eventNotes ? `Pauta / Observações: ${eventNotes}` : ''
          ]
            .filter(Boolean)
            .join('\n');

          const location = currentSelectedBiz
            ? `${currentSelectedBiz.address}, ${currentSelectedBiz.neighborhood}, ${currentSelectedBiz.cityName}`
            : 'Salvador / Ilha de Itaparica';

          const result = await createGoogleCalendarEvent(token, {
            summary: eventTitle,
            description,
            location,
            startDateTime,
            endDateTime
          });

          const newRes: CreatedWorkspaceResource = {
            type: 'calendar',
            id: result.id,
            title: `Evento: ${result.summary}`,
            url: result.htmlLink,
            createdAt: new Date().toLocaleTimeString('pt-BR'),
            details: `Agendado para ${eventDate} às ${eventStartTime}`
          };

          setCreatedResources(prev => [newRes, ...prev]);
          onShowToast('Compromisso agendado no seu Google Calendar!');
          loadCalendarEvents();
          setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          console.error(err);
          onShowToast(err.message || 'Erro ao agendar no Google Calendar.');
        } finally {
          setIsProcessingAction(false);
        }
      }
    });
  };

  const handleDeleteEvent = (eventId: string, summary: string) => {
    setConfirmModalConfig({
      isOpen: true,
      type: 'delete',
      title: 'Remover Evento do Google Calendar',
      description: `Tem certeza que deseja remover o evento "${summary}" da sua agenda? Esta ação não pode ser desfeita.`,
      targetName: 'Sua agenda principal no Google Calendar',
      confirmLabel: 'Sim, Remover Evento',
      action: async () => {
        try {
          setIsProcessingAction(true);
          const token = await ensureGoogleWorkspaceToken();
          await deleteGoogleCalendarEvent(token, eventId);
          setCalendarEvents(prev => prev.filter(e => e.id !== eventId));
          onShowToast('Evento removido do Google Calendar.');
          setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          console.error(err);
          onShowToast(err.message || 'Erro ao remover evento.');
        } finally {
          setIsProcessingAction(false);
        }
      }
    });
  };

  // ----------------------------------------------------
  // Google Docs Actions
  // ----------------------------------------------------
  const handleGenerateBizDoc = (biz: Business) => {
    setConfirmModalConfig({
      isOpen: true,
      type: 'docs',
      title: 'Gerar Dossiê no Google Docs',
      description: `Um documento completo e formatado será gerado no seu Google Docs para "${biz.name}", com visão geral, dados de contato, notas Google e plano de crescimento digital.`,
      targetName: 'Sua conta Google Drive / Docs',
      confirmLabel: 'Gerar Documento no Docs',
      action: async () => {
        try {
          setIsProcessingAction(true);
          const token = await ensureGoogleWorkspaceToken();
          const result = await createBusinessGoogleDoc(token, biz);

          const newRes: CreatedWorkspaceResource = {
            type: 'docs',
            id: result.documentId,
            title: result.title,
            url: result.documentUrl,
            createdAt: new Date().toLocaleTimeString('pt-BR'),
            details: `Dossiê executivo de ${biz.name}`
          };

          setCreatedResources(prev => [newRes, ...prev]);
          onShowToast(`Documento gerado com sucesso no Google Docs!`);
          setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          console.error(err);
          onShowToast(err.message || 'Erro ao gerar documento no Google Docs.');
        } finally {
          setIsProcessingAction(false);
        }
      }
    });
  };

  const handleGenerateGuideDoc = () => {
    const regionName = 'Salvador & Região de Brotas';
    setConfirmModalConfig({
      isOpen: true,
      type: 'docs',
      title: 'Gerar Guia Regional no Google Docs',
      description: `Será gerado um Guia Comercial e Roteiro Turístico no seu Google Docs com a lista selecionada de estabelecimentos, endereços e contatos prontos para impressão ou compartilhamento.`,
      targetName: 'Sua conta Google Drive / Docs',
      confirmLabel: 'Gerar Guia no Docs',
      action: async () => {
        try {
          setIsProcessingAction(true);
          const token = await ensureGoogleWorkspaceToken();
          const result = await createRegionGuideGoogleDoc(token, regionName, exportTargetList);

          const newRes: CreatedWorkspaceResource = {
            type: 'docs',
            id: result.documentId,
            title: result.title,
            url: result.documentUrl,
            createdAt: new Date().toLocaleTimeString('pt-BR'),
            details: `Guia com ${exportTargetList.length} estabelecimentos de Salvador e RMS`
          };

          setCreatedResources(prev => [newRes, ...prev]);
          onShowToast('Guia Regional gerado no Google Docs!');
          setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          console.error(err);
          onShowToast(err.message || 'Erro ao gerar Guia Regional.');
        } finally {
          setIsProcessingAction(false);
        }
      }
    });
  };

  const handleGenerateContractDoc = (biz: Business) => {
    setConfirmModalConfig({
      isOpen: true,
      type: 'docs',
      title: 'Gerar Minuta de Contrato Comercial no Google Docs',
      description: `Será criado um contrato/proposta de parceria pronto para assinar no seu Google Docs para "${biz.name}" com plano comercial e cláusulas de divulgação.`,
      targetName: 'Sua conta Google Drive / Docs',
      confirmLabel: 'Criar Minuta no Docs',
      action: async () => {
        try {
          setIsProcessingAction(true);
          const token = await ensureGoogleWorkspaceToken();
          const result = await createCommercialContractGoogleDoc(token, biz);

          const newRes: CreatedWorkspaceResource = {
            type: 'docs',
            id: result.documentId,
            title: result.title,
            url: result.documentUrl,
            createdAt: new Date().toLocaleTimeString('pt-BR'),
            details: `Minuta comercial para ${biz.name}`
          };

          setCreatedResources(prev => [newRes, ...prev]);
          onShowToast('Minuta de contrato gerada no Google Docs!');
          setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          console.error(err);
          onShowToast(err.message || 'Erro ao gerar minuta.');
        } finally {
          setIsProcessingAction(false);
        }
      }
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-gradient-to-r from-teal-50/50 via-white to-blue-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-500 to-blue-600 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Google Workspace
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Integração nativa com <strong>Google Sheets</strong>, <strong>Calendar</strong> e <strong>Docs</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Account & Connection Bar */}
          <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-600 dark:text-slate-300">
                {user ? (
                  <>
                    Conectado como <strong>{user.email || user.displayName}</strong>
                  </>
                ) : (
                  'Conecte sua conta Google para autorizar exportações e sincronizações'
                )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!accessToken ? (
                <GoogleSignInButton
                  onClick={async () => {
                    try {
                      await ensureGoogleWorkspaceToken();
                      onShowToast('Conta Google Workspace conectada com sucesso!');
                    } catch (err: any) {
                      onShowToast(err.message || 'Falha ao conectar.');
                    }
                  }}
                  label="Conectar Google Workspace"
                  className="!py-1.5 !px-3 !text-xs !rounded-xl"
                />
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  OAuth Ativo
                </span>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              type="button"
              onClick={() => setActiveTab('sheets')}
              className={`flex items-center gap-2 py-3.5 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                activeTab === 'sheets'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Google Sheets</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 py-3.5 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                activeTab === 'calendar'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Google Calendar</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-2 py-3.5 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                activeTab === 'docs'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Google Docs</span>
            </button>
          </div>

          {/* Modal Content Scrollable Area */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {/* TAB 1: GOOGLE SHEETS */}
            {activeTab === 'sheets' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1: Exportar Catálogo */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                        Exportar Catálogo de Estabelecimentos
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        Gera uma planilha no seu Google Sheets com dados estruturados (nome, categoria, endereço, WhatsApp, notas e diferenciais).
                      </p>
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
                        Selecionados: <strong className="text-emerald-600 dark:text-emerald-400">{exportTargetList.length} estabelecimentos</strong> (inclui Salvador & Brotas)
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleExportCatalog}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exportar para Google Sheets</span>
                    </button>
                  </div>

                  {/* Card 2: Planilha CRM */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                        Criar Planilha CRM & Prospecção
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        Cria uma planilha inteligente com abas prontas para gestão de parceiros, agendamentos, pipeline de vendas e valores acordados.
                      </p>
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mb-4">
                        Inclui colunas de status, contato, planos comerciais e histórico de visitas.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCreateCrm}
                      className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Criar Planilha CRM no Sheets</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: GOOGLE CALENDAR */}
            {activeTab === 'calendar' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Scheduler Form */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <CalendarCheck2 className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        Agendar Visita ou Reunião
                      </h3>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Estabelecimento Vinculado
                      </label>
                      <select
                        value={selectedBizId}
                        onChange={e => {
                          setSelectedBizId(e.target.value);
                          const biz = businesses.find(b => b.id === e.target.value);
                          if (biz) {
                            setEventTitle(`Visita / Reunião - ${biz.name}`);
                          }
                        }}
                        className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                      >
                        {businesses.slice(0, 150).map(b => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.neighborhood}, {b.cityName})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Título do Evento
                      </label>
                      <input
                        type="text"
                        value={eventTitle}
                        onChange={e => setEventTitle(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Reunião Comercial & Alinhamento"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Data
                        </label>
                        <input
                          type="date"
                          value={eventDate}
                          onChange={e => setEventDate(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Início
                        </label>
                        <input
                          type="time"
                          value={eventStartTime}
                          onChange={e => setEventStartTime(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Término
                        </label>
                        <input
                          type="time"
                          value={eventEndTime}
                          onChange={e => setEventEndTime(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Pauta / Notas
                      </label>
                      <textarea
                        rows={2}
                        value={eventNotes}
                        onChange={e => setEventNotes(e.target.value)}
                        placeholder="Apresentação do Guia Melhor da Ilha, proposta do plano parceiro, etc."
                        className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleCreateEvent}
                      className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <CalendarIcon className="w-4 h-4" />
                      <span>Agendar no Google Calendar</span>
                    </button>
                  </div>

                  {/* Upcoming Events List */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>Próximos Compromissos na Agenda</span>
                      </h3>
                      {accessToken && (
                        <button
                          type="button"
                          onClick={loadCalendarEvents}
                          className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                        >
                          Atualizar
                        </button>
                      )}
                    </div>

                    {loadingCalendar ? (
                      <div className="flex-1 flex items-center justify-center py-10 text-xs text-slate-400">
                        Carregando agenda do Google Calendar...
                      </div>
                    ) : calendarEvents.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-10 text-center px-4">
                        <CalendarIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Nenhum compromisso futuro retornado ou agenda vazia.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                        {calendarEvents.map(evt => {
                          const startStr = evt.start?.dateTime
                            ? new Date(evt.start.dateTime).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : evt.start?.date || 'Dia todo';

                          return (
                            <div
                              key={evt.id}
                              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
                            >
                              <div className="min-w-0">
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                  {evt.summary}
                                </h4>
                                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                                  {startStr}
                                </div>
                                {evt.location && (
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                                    <span>{evt.location}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <a
                                  href={evt.htmlLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-800"
                                  title="Abrir no Google Calendar"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEvent(evt.id, evt.summary)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                                  title="Remover evento"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: GOOGLE DOCS */}
            {activeTab === 'docs' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Dossiê do Estabelecimento */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                        Dossiê Comercial
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        Gera um documento no Google Docs com ficha técnica, métricas e posicionamento de <strong>{currentSelectedBiz?.name}</strong>.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGenerateBizDoc(currentSelectedBiz)}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Gerar Dossiê no Docs</span>
                    </button>
                  </div>

                  {/* Card 2: Guia Regional Salvador & Brotas */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                        Guia Regional Brotas & Salvador
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        Cria um documento editorial no Google Docs com roteiro comercial e turístico dos principais estabelecimentos.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateGuideDoc}
                      className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Gerar Guia no Docs</span>
                    </button>
                  </div>

                  {/* Card 3: Minuta de Contrato Comercial */}
                  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                        Minuta de Contrato
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        Gera proposta e contrato formal de divulgação no Guia pronto para revisão e assinatura para <strong>{currentSelectedBiz?.name}</strong>.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGenerateContractDoc(currentSelectedBiz)}
                      className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Gerar Contrato no Docs</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Session Resources Created */}
            {createdResources.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Arquivos Criados Nesta Sessão</span>
                </h4>
                <div className="space-y-2">
                  {createdResources.map((res, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {res.type === 'sheets' && <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />}
                        {res.type === 'calendar' && <CalendarIcon className="w-4 h-4 text-blue-500 shrink-0" />}
                        {res.type === 'docs' && <FileText className="w-4 h-4 text-amber-500 shrink-0" />}
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{res.title}</div>
                          {res.details && <div className="text-[11px] text-slate-400">{res.details}</div>}
                        </div>
                      </div>

                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center gap-1.5 shrink-0"
                      >
                        <span>Abrir</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Operações sincronizadas diretamente na sua conta Google via OAuth 2.0
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <WorkspaceConfirmModal
        isOpen={confirmModalConfig.isOpen}
        onClose={() => setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalConfig.action}
        type={confirmModalConfig.type}
        title={confirmModalConfig.title}
        description={confirmModalConfig.description}
        affectedCount={confirmModalConfig.affectedCount}
        targetName={confirmModalConfig.targetName}
        confirmLabel={confirmModalConfig.confirmLabel}
        isProcessing={isProcessingAction}
      />
    </>
  );
};
