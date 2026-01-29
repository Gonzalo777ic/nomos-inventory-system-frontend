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

    

    return (
        <div className="p-6 space-y-6">
            
        </div>
    );
};

export default AnnouncementsPage;