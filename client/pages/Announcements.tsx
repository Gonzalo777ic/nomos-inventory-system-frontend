import React, { useEffect, useState } from 'react';
import { AnnouncementService } from '@/api/services/announcementService';
import { Announcement, AnnouncementDTO } from '@/types/store/announcement';
import { 
    Megaphone, Plus, Calendar, Eye, EyeOff, Trash2, Edit, AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';

import { AnnouncementForm } from '../components/forms/AnnouncementForm';

interface ConfirmState {
    isOpen: boolean;
    type: 'DELETE' | 'TOGGLE' | null;
    id: number | null;
    title: string;
    message: string;
    confirmBtnText: string;
    confirmBtnStyle: 'danger' | 'warning' | 'primary';
}

const AnnouncementsPage: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);


    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);


    const [confirmState, setConfirmState] = useState<ConfirmState>({
        isOpen: false, type: null, id: null, title: '', message: '', 
        confirmBtnText: '', confirmBtnStyle: 'primary'
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await AnnouncementService.getAll();
            setAnnouncements(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar los anuncios");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);


    
    const handleCreateClick = () => {
        setSelectedAnnouncement(null);
        setIsFormModalOpen(true);
    };

    const handleEditClick = (ann: Announcement) => {
        setSelectedAnnouncement(ann);
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = async (data: AnnouncementDTO) => {
        try {
            if (selectedAnnouncement) {
                await AnnouncementService.update(selectedAnnouncement.id, data);
                toast.success("Anuncio actualizado");
            } else {
                await AnnouncementService.create(data);
                toast.success("Anuncio creado");
            }
            loadData();

        } catch (error) {
            toast.error("Error al guardar. Verifica las fechas.");
            throw error;
        }
    };



    const requestDelete = (id: number) => {
        setConfirmState({
            isOpen: true, type: 'DELETE', id,
            title: '¿Eliminar Anuncio?',
            message: 'Esta acción es irreversible. El anuncio dejará de ser visible inmediatamente.',
            confirmBtnText: 'Sí, Eliminar', confirmBtnStyle: 'danger'
        });
    };

    const requestToggle = (ann: Announcement) => {
        const action = ann.isActive ? 'Desactivar' : 'Activar';
        setConfirmState({
            isOpen: true, type: 'TOGGLE', id: ann.id,
            title: `¿${action} Anuncio?`,
            message: `Estás a punto de ${action.toLowerCase()} el anuncio "${ann.title}".`,
            confirmBtnText: `Sí, ${action}`,
            confirmBtnStyle: ann.isActive ? 'warning' : 'primary'
        });
    };

    const executeConfirmation = async () => {
        if (!confirmState.id || !confirmState.type) return;
        try {
            if (confirmState.type === 'DELETE') {
                await AnnouncementService.delete(confirmState.id);
                toast.success("Anuncio eliminado correctamente");
            } else if (confirmState.type === 'TOGGLE') {
                await AnnouncementService.toggleActive(confirmState.id);
                toast.success("Estado actualizado correctamente");
            }
            setConfirmState({ ...confirmState, isOpen: false });
            loadData();
        } catch (error) {
            toast.error("Ocurrió un error al procesar la solicitud");
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Megaphone className="h-8 w-8 text-emerald-600" />
                        Anuncios y Comunicados
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Gestiona los avisos visibles para los usuarios del sistema.</p>
                </div>
                <button 
                    onClick={handleCreateClick}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5" /> Nuevo Anuncio
                </button>
            </div>

            {}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 animate-pulse">Cargando anuncios...</div>
                ) : announcements.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No hay anuncios registrados.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-3">Título / Contenido</th>
                                    <th className="px-6 py-3">Tipo</th>
                                    <th className="px-6 py-3">Vigencia</th>
                                    <th className="px-6 py-3">Estado</th>
                                    <th className="px-6 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {announcements.map((ann) => (
                                    <tr key={ann.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 dark:text-gray-100">{ann.title}</div>
                                            <div className="text-gray-500 truncate max-w-xs">{ann.content}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border
                                                ${ann.type === 'BANNER' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                                                  ann.type === 'POPUP' ? 'bg-purple-100 text-purple-800 border-purple-200' : 
                                                  'bg-amber-100 text-amber-800 border-amber-200'}`}>
                                                {ann.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs">
                                            <div className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {formatDate(ann.startDate)}</div>
                                            <div className="flex items-center gap-1 mt-1"><Calendar className="w-3 h-3"/> {formatDate(ann.endDate)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => requestToggle(ann)}
                                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-colors
                                                ${ann.isActive 
                                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200' 
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'}`}
                                            >
                                                {ann.isActive ? <><Eye className="w-3 h-3"/> Activo</> : <><EyeOff className="w-3 h-3"/> Inactivo</>}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => handleEditClick(ann)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => requestDelete(ann.id)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {}
            {confirmState.isOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700 scale-100 transform transition-all">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className={`p-3 rounded-full ${confirmState.confirmBtnStyle === 'danger' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    {confirmState.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    {confirmState.message}
                                </p>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <button 
                                    onClick={() => setConfirmState({...confirmState, isOpen: false})}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 font-medium"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={executeConfirmation}
                                    className={`flex-1 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-colors
                                        ${confirmState.confirmBtnStyle === 'danger' ? 'bg-red-600 hover:bg-red-700' : 
                                          confirmState.confirmBtnStyle === 'warning' ? 'bg-amber-600 hover:bg-amber-700' : 
                                          'bg-emerald-600 hover:bg-emerald-700'}`}
                                >
                                    {confirmState.confirmBtnText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {}
            <AnnouncementForm 
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedAnnouncement}
            />
        </div>
    );
};

export default AnnouncementsPage;