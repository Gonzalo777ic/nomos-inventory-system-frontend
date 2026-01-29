import React, { useEffect, useState } from 'react';
import { AnnouncementService } from '@/api/services/announcementService';
import { Announcement, AnnouncementDTO, AnnouncementType } from '@/types/store/announcement';
import { 
    Megaphone, Plus, Calendar, Eye, EyeOff, Trash2, Edit, X, Save 
} from 'lucide-react';
import { toast } from 'sonner';


const AnnouncementsPage: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [formData, setFormData] = useState<AnnouncementDTO>({
        title: '',
        content: '',
        type: 'BANNER',
        startDate: new Date().toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        isActive: true,
        targetAudience: 'ALL'
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

    useEffect(() => {
        loadData();
    }, []);


    const handleCreateClick = () => {
        setEditingId(null);
        setFormData({
            title: '',
            content: '',
            type: 'BANNER',
            startDate: new Date().toISOString().slice(0, 16),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
            isActive: true,
            targetAudience: 'ALL'
        });
        setIsModalOpen(true);
    };

    const handleEditClick = (announcement: Announcement) => {
        setEditingId(announcement.id);
        setFormData({
            title: announcement.title,
            content: announcement.content,
            type: announcement.type,
            startDate: announcement.startDate ? new Date(announcement.startDate).toISOString().slice(0, 16) : '',
            endDate: announcement.endDate ? new Date(announcement.endDate).toISOString().slice(0, 16) : '',
            isActive: announcement.isActive,
            targetAudience: announcement.targetAudience || 'ALL'
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Estás seguro de eliminar este anuncio?")) return;
        try {
            await AnnouncementService.delete(id);
            toast.success("Anuncio eliminado");
            loadData();
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    const handleToggle = async (id: number) => {
        try {
            await AnnouncementService.toggleActive(id);
            toast.success("Estado actualizado");
            loadData();
        } catch (error) {
            toast.error("No se pudo cambiar el estado");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await AnnouncementService.update(editingId, formData);
                toast.success("Anuncio actualizado correctamente");
            } else {
                await AnnouncementService.create(formData);
                toast.success("Anuncio creado correctamente");
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            toast.error("Error al guardar. Verifica las fechas.");
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-PE', { 
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' 
        });
    };
    

    return (
        <div className="p-6 space-y-6">
            {}
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
                    <Plus className="h-5 w-5" />
                    Nuevo Anuncio
                </button>
            </div>

            {}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Cargando anuncios...</div>
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
                                                onClick={() => handleToggle(ann.id)}
                                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-colors
                                                ${ann.isActive 
                                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            >
                                                {ann.isActive ? <><Eye className="w-3 h-3"/> Activo</> : <><EyeOff className="w-3 h-3"/> Inactivo</>}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => handleEditClick(ann)} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(ann.id)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50">
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

            
        </div>
    );
};

export default AnnouncementsPage;