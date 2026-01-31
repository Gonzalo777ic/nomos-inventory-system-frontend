import React, { useState, useEffect } from 'react';
import { ScheduleExceptionPayload, StoreScheduleException } from '@/types/store/schedule';
import { X, Save, Calendar, Clock } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ScheduleExceptionPayload) => Promise<void>;
    initialData?: StoreScheduleException | null;
}

export const ScheduleExceptionForm: React.FC<Props> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState<ScheduleExceptionPayload>({
        date: '',
        reason: '',
        isClosed: true,
        openingTime: '',
        closingTime: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    date: initialData.date,
                    reason: initialData.reason,
                    isClosed: initialData.isClosed,
                    openingTime: initialData.openingTime || '',
                    closingTime: initialData.closingTime || ''
                });
            } else {
                // Reset para nuevo registro
                setFormData({
                    date: new Date().toISOString().split('T')[0], // Hoy YYYY-MM-DD
                    reason: '',
                    isClosed: true,
                    openingTime: '09:00',
                    closingTime: '18:00'
                });
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Limpieza de datos: Si está cerrado, mandamos null en las horas
            const payload = {
                ...formData,
                openingTime: formData.isClosed ? null : formData.openingTime,
                closingTime: formData.isClosed ? null : formData.closingTime
            };
            await onSubmit(payload);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 rounded-t-xl">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {initialData ? 'Editar Excepción' : 'Nueva Excepción / Feriado'}
                    </h2>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* FECHA */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input 
                                type="date" required
                                className="pl-9 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 border"
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                                disabled={!!initialData} // No editar fecha si ya existe (mejor borrar y crear)
                            />
                        </div>
                    </div>

                    {/* RAZÓN */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motivo / Descripción</label>
                        <input 
                            type="text" required
                            placeholder="Ej: Feriado Nacional, Inventario..."
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 border"
                            value={formData.reason}
                            onChange={e => setFormData({...formData, reason: e.target.value})}
                        />
                    </div>

                    {/* TIPO DE EXCEPCIÓN (CERRADO / HORARIO ESPECIAL) */}
                    <div className="flex gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                checked={formData.isClosed} 
                                onChange={() => setFormData({...formData, isClosed: true})}
                                className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm font-medium">Cerrado todo el día</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                checked={!formData.isClosed} 
                                onChange={() => setFormData({...formData, isClosed: false})}
                                className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm font-medium">Horario Especial</span>
                        </label>
                    </div>

                    {/* HORAS (SOLO SI NO ESTÁ CERRADO) */}
                    {!formData.isClosed && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Apertura</label>
                                <div className="relative">
                                    <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                    <input 
                                        type="time" required={!formData.isClosed}
                                        className="pl-8 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 border text-sm"
                                        value={formData.openingTime || ''}
                                        onChange={e => setFormData({...formData, openingTime: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Cierre</label>
                                <div className="relative">
                                    <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                    <input 
                                        type="time" required={!formData.isClosed}
                                        className="pl-8 w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 border text-sm"
                                        value={formData.closingTime || ''}
                                        onChange={e => setFormData({...formData, closingTime: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2 transition-colors disabled:opacity-50">
                            <Save className="w-4 h-4" /> {isSubmitting ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};