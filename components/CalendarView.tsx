import React, { useState, useEffect } from 'react';
import { 
  format, 
  endOfMonth, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  isToday 
} from 'date-fns';
import startOfMonth from 'date-fns/startOfMonth';
import startOfWeek from 'date-fns/startOfWeek';
import subMonths from 'date-fns/subMonths';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const CalendarView: React.FC = () => {
  const { selectedDate, setSelectedDate, t, locale, fetchMonthlyStats, monthlyStats } = useAppContext();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch stats when month changes
  useEffect(() => {
    fetchMonthlyStats(currentMonth);
  }, [currentMonth]);

  const onNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const onPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale });
  const endDate = endOfWeek(monthEnd, { locale });

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = eachDayOfInterval({
    start: startOfWeek(new Date(), { locale }),
    end: endOfWeek(new Date(), { locale })
  }).map(day => format(day, 'EEEEE', { locale }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-dark text-lg capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale })}
        </h3>
        <div className="flex space-x-2">
          <button onClick={onPrevMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
            <ChevronLeft size={20} />
          </button>
          <button onClick={onNextMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((d, i) => (
          <div key={i} className="text-center text-xs font-semibold text-gray-400 py-1 uppercase">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDate = isToday(day);
          const dateKey = format(day, 'yyyy-MM-dd');
          const stat = monthlyStats[dateKey];
          
          // Determine dot color based on completion status
          let dotClass = '';
          if (stat && stat.total > 0) {
              if (stat.completed === stat.total) {
                  dotClass = 'bg-secondary'; // All done - Green
              } else if (stat.completed > 0) {
                  dotClass = 'bg-orange-300'; // Partially done
              } else {
                  dotClass = 'bg-gray-300'; // Not started
              }
          }

          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(day)}
              className={`
                relative h-10 w-10 mx-auto flex flex-col items-center justify-center rounded-full text-sm transition-all
                ${!isCurrentMonth ? 'text-gray-300' : 'text-dark'}
                ${isSelected ? 'bg-primary text-white shadow-md transform scale-105' : 'hover:bg-gray-100'}
                ${isTodayDate && !isSelected ? 'border border-primary text-primary font-bold' : ''}
              `}
            >
              <span className="leading-none">{format(day, 'd')}</span>
              
              {/* Status Dot */}
              {dotClass && !isSelected && (
                <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
              )}
              {/* If selected, show white dot if there is data */}
              {dotClass && isSelected && (
                 <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white/70`}></span>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
         <button 
            onClick={() => {
                const today = new Date();
                setSelectedDate(today);
                setCurrentMonth(today);
            }}
            className="text-xs text-primary font-medium hover:underline"
         >
             {t('go_today')}
         </button>
      </div>
    </div>
  );
};

export default CalendarView;