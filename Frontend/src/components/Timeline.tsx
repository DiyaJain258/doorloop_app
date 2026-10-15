import React from 'react';
import { Calendar, User, Clock, CheckCircle } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  by?: string;
  icon?: React.ReactNode;
  status?: 'success' | 'warning' | 'info' | 'error';
}

interface TimelineProps {
  events: TimelineEvent[];
}

export const Timeline: React.FC<TimelineProps> = ({ events }) => {
  return (
    <div className="flow-root text-foreground">
      {events.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-4">No activities logged yet.</p>
      ) : (
        <ul className="-mb-8">
          {events.map((event, eventIdx) => (
            <li key={event.id}>
              <div className="relative pb-8">
                {eventIdx !== events.length - 1 ? (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-border/80"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground ring-8 ring-card">
                      {event.icon || <Clock className="w-4 h-4 text-primary" />}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {event.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 font-medium leading-relaxed">
                        {event.description}
                      </p>
                      {event.by && (
                        <span className="inline-flex items-center text-[10px] text-muted-foreground/80 font-bold mt-1">
                          <User className="w-3 h-3 mr-0.5" />
                          By {event.by}
                        </span>
                      )}
                    </div>
                    <div className="text-right text-[10px] font-bold whitespace-nowrap text-muted-foreground">
                      <time dateTime={event.time}>{event.time}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default Timeline;
