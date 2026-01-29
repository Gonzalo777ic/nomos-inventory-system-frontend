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

            
        </div>
    );
};

export default AnnouncementsPage;