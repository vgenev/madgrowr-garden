import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Sprout, CheckSquare, Square } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { Planting, Task, Bed } from '@shared/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
type CalendarEvent = {
  type: 'planting' | 'task';
  date: Date;
  data: Planting | Task;
};
export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { data: plantings, isLoading: plantingsLoading } = useQuery<Planting[]>({
    queryKey: ['plantings'],
    queryFn: () => api('/api/plantings'),
  });
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => api('/api/tasks'),
  });
  const { data: beds, isLoading: bedsLoading } = useQuery<Bed[]>({
    queryKey: ['beds'],
    queryFn: () => api('/api/beds'),
  });
  const bedsById = useMemo(() => {
    if (!beds) return new Map();
    return new Map(beds.map(b => [b.id, b]));
  }, [beds]);
  const events = useMemo(() => {
    const allEvents: CalendarEvent[] = [];
    plantings?.forEach(p => allEvents.push({ type: 'planting', date: new Date(p.plantingDate), data: p }));
    tasks?.forEach(t => allEvents.push({ type: 'task', date: new Date(t.dueDate), data: t }));
    return allEvents;
  }, [plantings, tasks]);
  const isLoading = plantingsLoading || tasksLoading || bedsLoading;
  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);
  const startingDayIndex = getDay(days[0]);
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="font-display text-5xl md:text-6xl text-brand-green">Garden Calendar</h1>
          <p className="text-lg text-brand-green/80">Your garden's schedule at a glance.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-brand-green/10 transition-colors">
            <ChevronLeft className="h-6 w-6 text-brand-green" />
          </button>
          <h2 className="font-display text-3xl text-brand-green w-48 text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-brand-green/10 transition-colors">
            <ChevronRight className="h-6 w-6 text-brand-green" />
          </button>
        </div>
      </header>
      {isLoading ? (
        <Skeleton className="h-[70vh] w-full rounded-lg bg-brand-green/10" />
      ) : (
        <Card className="border-brand-green/20 shadow-lg bg-brand-cream">
          <CardContent className="p-2 md:p-4">
            <div className="grid grid-cols-7 text-center font-bold text-brand-green/80 border-b border-brand-green/20 pb-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day}>{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-5 gap-2">
              {Array.from({ length: startingDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="border-r border-b border-brand-green/10" />
              ))}
              {days.map(day => {
                const dayEvents = events.filter(e => isSameDay(e.date, day));
                return (
                  <div key={day.toString()} className={cn(
                    "p-2 border-r border-b border-brand-green/10 min-h-[120px] transition-colors",
                    isToday(day) ? 'bg-brand-ochre/20' : 'hover:bg-brand-green/5'
                  )}>
                    <div className={cn(
                      "font-bold",
                      isToday(day) ? 'text-brand-ochre' : 'text-brand-green/70'
                    )}>
                      {format(day, 'd')}
                    </div>
                    <div className="mt-1 space-y-1">
                      {dayEvents.map(event => (
                        <div key={event.data.id} className="text-xs p-1 rounded-md animate-fade-in">
                          {event.type === 'planting' ? (
                            <Badge variant="secondary" className="w-full justify-start bg-green-100 text-green-800 hover:bg-green-200">
                              <Sprout className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">Planted: {(event.data as Planting).cropName}</span>
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="w-full justify-start bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                              {(event.data as Task).completed ? <CheckSquare className="h-3 w-3 mr-1 flex-shrink-0" /> : <Square className="h-3 w-3 mr-1 flex-shrink-0" />}
                              <span className="truncate">{(event.data as Task).title}</span>
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}