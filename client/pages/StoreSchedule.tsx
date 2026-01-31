import React, { useEffect, useState } from 'react';
import { ScheduleService } from '@/api/services/scheduleService';
import { StoreSchedule, StoreScheduleException, StoreStatusDTO, ScheduleExceptionPayload } from '@/types/store/schedule';
import { WeeklyScheduleSummary } from '@/components/panels/WeeklyScheduleSummary';
import { ScheduleExceptionForm } from '@/components/forms/ScheduleExceptionForm'; 
import { 
    Clock, Calendar, CheckCircle2, XCircle, 
    Save, Plus, Trash2, Edit, RefreshCw, AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';

const DAYS_TRANSLATION: Record<string, string> = {
    MONDAY: 'Lunes', TUESDAY: 'Martes', WEDNESDAY: 'Miércoles',
    THURSDAY: 'Jueves', FRIDAY: 'Viernes', SATURDAY: 'Sábado', SUNDAY: 'Domingo'
};

const StoreSchedulePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'WEEKLY' | 'EXCEPTIONS'>('WEEKLY');
    const [loading, setLoading] = useState(true);
    

    const [weeklySchedule, setWeeklySchedule] = useState<StoreSchedule[]>([]);
    const [exceptions, setExceptions] = useState<StoreScheduleException[]>([]);
    const [status, setStatus] = useState<StoreStatusDTO | null>(null);


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingException, setEditingException] = useState<StoreScheduleException | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [scheduleData, exceptionsData, statusData] = await Promise.all([
                ScheduleService.getWeeklySchedule(),
                ScheduleService.getUpcomingExceptions(),
                ScheduleService.getCurrentStatus()
            ]);
            setWeeklySchedule(scheduleData);
            setExceptions(exceptionsData);
            setStatus(statusData);
        } catch (error) {
            toast.error("Error cargando configuración de horarios");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);


    
    const handleUpdateDay = async (day: StoreSchedule) => {
        try {

            await ScheduleService.updateDaySchedule(day.id, {
                isOpen: day.isOpen,
                openingTime: day.openingTime,
                closingTime: day.closingTime
            });
            toast.success("Horario actualizado");
            const newStatus = await ScheduleService.getCurrentStatus();
            setStatus(newStatus);
        } catch (error) {
            toast.error("Error al actualizar. Verifica las horas.");
        }
    };

    const handleDayChange = (index: number, field: keyof StoreSchedule, value: any) => {
        const updated = [...weeklySchedule];
        updated[index] = { ...updated[index], [field]: value };
        setWeeklySchedule(updated);
    };



    const handleSaveException = async (payload: ScheduleExceptionPayload) => {
        try {
            if (editingException) {
                await ScheduleService.updateException(editingException.id, payload);
                toast.success("Excepción actualizada");
            } else {
                await ScheduleService.createException(payload);
                toast.success("Excepción creada");
            }
            const [newExceptions, newStatus] = await Promise.all([
                ScheduleService.getUpcomingExceptions(),
                ScheduleService.getCurrentStatus()
            ]);
            setExceptions(newExceptions);
            setStatus(newStatus);
        } catch (error) {
            toast.error("Error al guardar excepción");
            throw error;
        }
    };

    const handleDeleteException = async (id: number) => {
        if (!confirm("¿Eliminar esta configuración especial?")) return;
        try {
            await ScheduleService.deleteException(id);
            toast.success("Eliminado correctamente");
            loadData();
        } catch (error) {
            toast.error("No se pudo eliminar");
        }
    };

    const formatTimeForInput = (time: string) => time ? time.slice(0, 5) : '';
    
    const formatDate = (dateStr: string) => {
        if(!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    return (
        <div className="p-6 space-y-6">
            
            {}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Clock className="h-8 w-8 text-emerald-600" />
                        Horarios de Atención
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Configura la disponibilidad operativa de la tienda para el público.
                    </p>
                </div>

                <div className={`p-4 rounded-xl border flex items-center gap-4 shadow-sm ${
                    status?.status === 'OPEN' 
                        ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' 
                        : 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800'
                }`}>
                    <div className={`p-2 rounded-full ${
                        status?.status === 'OPEN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                        {status?.status === 'OPEN' ? <CheckCircle2 className="w-6 h-6"/> : <XCircle className="w-6 h-6"/>}
                    </div>
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-0.5">
                            Estado Actual (Público)
                        </div>
                        <div className="font-bold text-gray-900 dark:text-gray-100">
                            {status ? status.message : 'Cargando...'}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                            {status?.reason}
                        </div>
                    </div>
                </div>
            </div>

            {}
            {!loading && weeklySchedule.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 ml-1">
                        Vista Previa Semanal
                    </h3>
                    <WeeklyScheduleSummary schedule={weeklySchedule} />
                </div>
            )}

            {}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('WEEKLY')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                            activeTab === 'WEEKLY'
                                ? 'border-emerald-500 text-emerald-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <Clock className="w-4 h-4" /> Horario Semanal (Base)
                    </button>
                    <button
                        onClick={() => setActiveTab('EXCEPTIONS')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                            activeTab === 'EXCEPTIONS'
                                ? 'border-emerald-500 text-emerald-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <Calendar className="w-4 h-4" /> Feriados y Excepciones
                    </button>
                </nav>
            </div>

            {}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center items-center h-64 text-gray-400">
                        <RefreshCw className="w-8 h-8 animate-spin" />
                    </div>
                ) : activeTab === 'WEEKLY' ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Día</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apertura</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cierre</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {weeklySchedule.map((day, idx) => (
                                    <tr key={day.id} className={!day.isOpen ? 'bg-gray-50 dark:bg-gray-900/30' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {DAYS_TRANSLATION[day.dayOfWeek] || day.dayOfWeek}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleDayChange(idx, 'isOpen', !day.isOpen)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    day.isOpen ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-600'
                                                }`}
                                            >
                                                <span className={`${day.isOpen ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/>
                                            </button>
                                            <span className="ml-3 text-sm text-gray-500">{day.isOpen ? 'Abierto' : 'Cerrado'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input 
                                                type="time"
                                                disabled={!day.isOpen}
                                                className="border rounded p-1 dark:bg-gray-700 disabled:opacity-50"
                                                value={formatTimeForInput(day.openingTime)}
                                                onChange={(e) => handleDayChange(idx, 'openingTime', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input 
                                                type="time"
                                                disabled={!day.isOpen}
                                                className="border rounded p-1 dark:bg-gray-700 disabled:opacity-50"
                                                value={formatTimeForInput(day.closingTime)}
                                                onChange={(e) => handleDayChange(idx, 'closingTime', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button 
                                                onClick={() => handleUpdateDay(day)}
                                                className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 p-2 rounded-lg transition-colors"
                                                title="Guardar cambios de este día"
                                            >
                                                <Save className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
                            <div className="flex gap-3">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                <p>
                                    Estas configuraciones tienen prioridad sobre el horario semanal. Úsalas para feriados, mantenimiento o días especiales.
                                </p>
                            </div>
                            <button 
                                onClick={() => { setEditingException(null); setIsModalOpen(true); }}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                            >
                                <Plus className="h-4 w-4" /> Agregar Excepción
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {exceptions.map((ex) => (
                                <div key={ex.id} className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(ex.date)}
                                        </div>
                                        <div className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                                            ex.isClosed 
                                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' 
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                        }`}>
                                            {ex.isClosed ? 'Cerrado' : 'Especial'}
                                        </div>
                                    </div>
                                    
                                    <h3 className="font-bold text-lg mt-2 text-gray-900 dark:text-gray-100">{ex.reason}</h3>
                                    
                                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                        {ex.isClosed ? (
                                            <span className="flex items-center gap-2"><XCircle className="w-4 h-4 text-rose-500"/> Sin atención al público</span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-amber-500"/> 
                                                {formatTimeForInput(ex.openingTime!)} - {formatTimeForInput(ex.closingTime!)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                                        <button 
                                            onClick={() => { setEditingException(ex); setIsModalOpen(true); }}
                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteException(ex.id)}
                                            className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            
                            {exceptions.length === 0 && (
                                <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No hay excepciones futuras registradas.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <ScheduleExceptionForm 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveException}
                initialData={editingException}
            />
        </div>
    );
};

export default StoreSchedulePage;