import React, { useEffect, useState } from 'react';
import { Announcement, AnnouncementDTO, AnnouncementType } from '@/types/store/announcement';
import { X, Save } from 'lucide-react';

interface AnnouncementFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AnnouncementDTO) => Promise<void>;
    initialData: Announcement | null;
}

const DEFAULT_FORM_DATA: AnnouncementDTO = {
    title: '', 
    content: '', 
    type: 'BANNER',
    startDate: '', 
    endDate: '', 
    isActive: false, 
    targetAudience: 'ALL'
};

export const AnnouncementForm: React.FC<AnnouncementFormProps> = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    initialData 
}) => {
    const [formData, setFormData] = useState<AnnouncementDTO>(DEFAULT_FORM_DATA);
    const [isSubmitting, setIsSubmitting] = useState(false);


    useEffect(() => {
        if (isOpen) {
            if (initialData) {

                setFormData({
                    title: initialData.title,
                    content: initialData.content,
                    type: initialData.type,
                    startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : '',
                    endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : '',
                    isActive: initialData.isActive,
                    targetAudience: initialData.targetAudience || 'ALL'
                });
            } else {

                setFormData({
                    ...DEFAULT_FORM_DATA,
                    startDate: new Date().toISOString().slice(0, 16),
                    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                    isActive: false
                });
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {


        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {initialData ? 'Editar Anuncio' : 'Nuevo Anuncio'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                        <input 
                            required
                            type="text" 
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-emerald-500 focus:border-emerald-500 p-2 border"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            placeholder="Ej: Mantenimiento Programado"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contenido</label>
                        <textarea 
                            required
                            rows={3}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-emerald-500 focus:border-emerald-500 p-2 border"
                            value={formData.content}
                            onChange={e => setFormData({...formData, content: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                            <select 
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2 border"
                                value={formData.type}
                                onChange={e => setFormData({...formData, type: e.target.value as AnnouncementType})}
                            >
                                <option value="BANNER">Banner Superior</option>
                                <option value="POPUP">Ventana Emergente</option>
                                <option value="SYSTEM">Aviso de Sistema</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Audiencia</label>
                            <select 
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2 border"
                                value={formData.targetAudience}
                                onChange={e => setFormData({...formData, targetAudience: e.target.value})}
                            >
                                <option value="ALL">Todos los Usuarios</option>
                                <option value="ADMINS">Solo Administradores</option>
                                <option value="CASHIERS">Cajeros</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inicio Vigencia</label>
                            <input 
                                type="datetime-local" 
                                required
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2 border"
                                value={formData.startDate}
                                onChange={e => setFormData({...formData, startDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fin Vigencia</label>
                            <input 
                                type="datetime-local" 
                                required
                                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2 border"
                                value={formData.endDate}
                                onChange={e => setFormData({...formData, endDate: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Estado de Publicación</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formData.isActive 
                                    ? 'El anuncio será visible inmediatamente' 
                                    : 'Se guardará como borrador (Oculto)'}
                            </span>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={formData.isActive}
                            onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                                formData.isActive ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-600'
                            }`}
                        >
                            <span
                                className={`${
                                    formData.isActive ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                        </button>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> {isSubmitting ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};