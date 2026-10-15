import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { StatusBadge } from './StatusBadge';
import { ArrowLeft, ArrowRight, User, DollarSign, Calendar } from 'lucide-react';
import { clsx } from 'clsx';

export interface KanbanItem {
  id: string;
  title: string;
  subtitle?: string;
  budget?: string | number;
  date?: string;
  status: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent' | string;
}

interface KanbanBoardProps {
  columns: { label: string; value: string }[];
  items: KanbanItem[];
  onStatusChange: (itemId: string, newStatus: string) => void;
  onItemClick?: (itemId: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  columns,
  items,
  onStatusChange,
  onItemClick,
}) => {
  const getColItems = (statusVal: string) => items.filter((item) => item.status === statusVal);

  const moveItem = (itemId: string, currentStatus: string, dir: 'left' | 'right') => {
    const currentIdx = columns.findIndex((col) => col.value === currentStatus);
    if (currentIdx === -1) return;
    const nextIdx = dir === 'right' ? currentIdx + 1 : currentIdx - 1;
    if (nextIdx >= 0 && nextIdx < columns.length) {
      onStatusChange(itemId, columns[nextIdx].value);
    }
  };

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4 w-full text-foreground scrollbar-thin">
      {columns.map((col) => {
        const colItems = getColItems(col.value);
        return (
          <div
            key={col.value}
            className="flex-1 min-w-[280px] max-w-[320px] bg-secondary/30 border rounded-2xl p-3.5 flex flex-col h-[65vh] overflow-hidden shrink-0"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b mb-3">
              <span className="font-bold text-xs uppercase tracking-wide truncate pr-2">
                {col.label}
              </span>
              <span className="bg-muted text-foreground/80 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                {colItems.length}
              </span>
            </div>

            {/* Column Items list */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {colItems.length === 0 ? (
                <div className="text-center text-[10px] text-muted-foreground italic py-10 font-semibold">
                  No items in this stage
                </div>
              ) : (
                colItems.map((item) => (
                  <Card
                    key={item.id}
                    className="p-3.5 border-border hover:border-primary/50 hover:shadow-md transition-all space-y-3 cursor-pointer group bg-card relative"
                    onClick={() => onItemClick?.(item.id)}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors max-w-[140px] truncate">
                          {item.title}
                        </h4>
                        {item.priority && (
                          <StatusBadge status={item.priority} className="text-[9px] px-1.5 py-0" />
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-[10px] text-muted-foreground font-semibold mt-0.5 truncate">
                          {item.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground pt-1.5 border-t border-border/40">
                      {item.budget !== undefined && (
                        <span className="flex items-center text-foreground font-bold">
                          <DollarSign className="w-3 h-3 text-emerald-500 mr-0.5" />
                          {Number(item.budget).toLocaleString()}/mo
                        </span>
                      )}
                      {item.date && (
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 text-muted-foreground/60 mr-0.5" />
                          {item.date}
                        </span>
                      )}
                    </div>

                    {/* Column Shift buttons */}
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-dashed">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:bg-secondary disabled:opacity-40"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItem(item.id, item.status, 'left');
                        }}
                        disabled={columns.findIndex((c) => c.value === item.status) === 0}
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:bg-secondary disabled:opacity-40"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItem(item.id, item.status, 'right');
                        }}
                        disabled={
                          columns.findIndex((c) => c.value === item.status) === columns.length - 1
                        }
                      >
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default KanbanBoard;
