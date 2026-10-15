import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Wrench } from 'lucide-react';
import { clsx } from 'clsx';

export const MaintenanceCalendarPage: React.FC = () => {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  // Queries
  const { data: workOrders = [], isLoading } = useQuery({ queryKey: ['work-orders-list'], queryFn: () => api.workOrders.getAll() });

  if (isLoading) {
    return <LoadingSkeleton type="card" />;
  }

  // Group events by day of week or mock calendar days
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const dayNum = i - 4; // offset to match month starts
    const dateStr = dayNum > 0 && dayNum <= 31 ? `2026-07-${dayNum.toString().padStart(2, '0')}` : '';
    const events = workOrders.filter((w) => w.scheduledDate === dateStr);
    return { dayNum, dateStr, events };
  });

  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title="Maintenance Calendar Scheduler"
        description="Verify technician dispatch dates, scheduled inspector visits, and recurring preventive schedules."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Maintenance', href: '/maintenance' },
          { label: 'Calendar' },
        ]}
      />

      {/* VIEW CONTROLS */}
      <div className="flex justify-between items-center bg-card border p-3 rounded-2xl">
        <div className="flex space-x-1">
          {['month', 'week', 'day'].map((v) => (
            <Button
              key={v}
              variant={view === v ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView(v as any)}
              className="text-xs uppercase font-bold px-3 h-8"
            >
              {v}
            </Button>
          ))}
        </div>

        <div className="flex items-center space-x-2 font-bold text-sm uppercase">
          <Button variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="w-4.5 h-4.5" /></Button>
          <span>July 2026</span>
          <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="w-4.5 h-4.5" /></Button>
        </div>
      </div>

      {/* MONTH VIEW GRID */}
      {view === 'month' && (
        <Card className="border bg-card overflow-hidden">
          <div className="grid grid-cols-7 border-b bg-secondary/15 text-center text-[10px] font-black uppercase tracking-wider text-muted-foreground p-3">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 grid-rows-5 divide-x divide-y border-t min-h-[500px] text-xs font-semibold">
            {calendarDays.map((day, idx) => (
              <div key={idx} className="p-2 flex flex-col justify-between min-h-[90px] bg-card hover:bg-secondary/5 transition">
                <span className={clsx(
                  'text-[10px] font-bold text-muted-foreground',
                  day.dayNum === 19 && 'bg-primary text-primary-foreground w-5 h-5 flex items-center justify-center rounded-full font-black'
                )}>
                  {day.dayNum > 0 && day.dayNum <= 31 ? day.dayNum : ''}
                </span>

                <div className="space-y-1 mt-1">
                  {day.events.slice(0, 2).map((evt) => (
                    <div key={evt.id} className="p-1 rounded bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary truncate leading-tight">
                      {evt.vendorName}
                    </div>
                  ))}
                  {day.events.length > 2 && (
                    <p className="text-[8px] font-bold text-muted-foreground text-center">+{day.events.length - 2} more</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* WEEK & DAY VIEWS MOCK */}
      {view !== 'month' && (
        <Card className="p-6 border bg-card text-center text-xs text-muted-foreground font-semibold">
          Week/Day layouts grouped by time. Switch to Month View to audit dispatches.
        </Card>
      )}
    </div>
  );
};
export default MaintenanceCalendarPage;
