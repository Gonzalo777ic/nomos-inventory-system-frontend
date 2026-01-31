import React from 'react';
import { StoreSchedule } from '@/types/store/schedule';
import { Clock, XCircle, CheckCircle2 } from 'lucide-react';

interface Props {
    schedule: StoreSchedule[];
}


const DAY_INITIALS: Record<string, string> = {
    MONDAY: 'L', TUESDAY: 'M', WEDNESDAY: 'M',
    THURSDAY: 'J', FRIDAY: 'V', SATURDAY: 'S', SUNDAY: 'D'
};


const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export const WeeklyScheduleSummary: React.FC<Props> = ({ schedule }) => {
    

    const formatTime = (time: string) => time ? time.slice(0, 5) : '--:--';


    const sortedSchedule = [...schedule].sort(
        (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek)
    );

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            {sortedSchedule.map((day) => (
                <div 
                    key={day.id} 
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        day.isOpen 
                            ? 'bg-white dark:bg-gray-800 border-emerald-200 dark:border-emerald-800/50 shadow-sm' 
                            : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-70'
                    }`}
                >
                    {}
                    <div className="mb-2">
                        <span className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full ${
                            day.isOpen 
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                            {DAY_INITIALS[day.dayOfWeek]}
                        </span>
                    </div>

                    {}
                    {day.isOpen ? (
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Abierto</span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300 font-mono bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded">
                                {formatTime(day.openingTime)} - {formatTime(day.closingTime)}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-2.5">
                            <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> Cerrado
                            </span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};