import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { StatusBadge } from './StatusBadge';
import { Star, CheckCircle, Wrench, ShieldAlert, Key } from 'lucide-react';
import { clsx } from 'clsx';

// --- PRIORITY BADGE ---
export const RequestPriorityBadge: React.FC<{ priority: 'Low' | 'Medium' | 'High' | 'Urgent' }> = ({ priority }) => {
  return (
    <span className={clsx(
      'inline-flex items-center text-[10px] font-black px-2 py-0.5 rounded uppercase border',
      priority === 'Urgent' && 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse',
      priority === 'High' && 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      priority === 'Medium' && 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      priority === 'Low' && 'bg-secondary/60 text-foreground border-border'
    )}>
      {priority}
    </span>
  );
};

// --- WORK ORDER STATUS BADGE ---
export const WorkOrderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  return <StatusBadge status={status} />;
};

// --- VENDOR RATING ---
export const VendorRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
      {rating.toFixed(1)}
    </span>
  );
};

// --- CONDITION INDICATOR ---
export const AssetConditionIndicator: React.FC<{ condition: number }> = ({ condition }) => {
  return (
    <div className="flex items-center space-x-1.5 text-xs font-semibold text-foreground">
      <div className="w-12 h-2 rounded bg-secondary overflow-hidden shrink-0">
        <div 
          className={clsx(
            'h-full rounded transition-all',
            condition >= 80 ? 'bg-emerald-500' : condition >= 50 ? 'bg-amber-500' : 'bg-rose-500'
          )}
          style={{ width: `${condition}%` }}
        />
      </div>
      <span>{condition}/100</span>
    </div>
  );
};

// --- INVENTORY STATUS BADGE ---
export const InventoryStatusBadge: React.FC<{ status: 'In Stock' | 'Low Stock' | 'Out of Stock' }> = ({ status }) => {
  return (
    <span className={clsx(
      'inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border',
      status === 'In Stock' && 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      status === 'Low Stock' && 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      status === 'Out of Stock' && 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse'
    )}>
      {status}
    </span>
  );
};

// --- INSPECTION CHECKLIST ---
interface ChecklistItem {
  section: string;
  status: 'Pass' | 'Fail' | 'N/A';
  notes?: string;
}

interface InspectionChecklistProps {
  checklist: ChecklistItem[];
  onChange?: (idx: number, status: 'Pass' | 'Fail' | 'N/A', notes?: string) => void;
  readOnly?: boolean;
}

export const InspectionChecklist: React.FC<InspectionChecklistProps> = ({
  checklist,
  onChange,
  readOnly = false,
}) => {
  return (
    <div className="space-y-3.5 text-foreground text-xs font-semibold">
      {checklist.map((item, idx) => (
        <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-3.5 bg-secondary/10 border rounded-xl space-y-2 md:space-y-0">
          <div>
            <p className="font-bold">{item.section}</p>
            {item.notes && <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Notes: {item.notes}</p>}
          </div>

          <div className="flex space-x-1.5">
            {['Pass', 'Fail', 'N/A'].map((opt) => (
              <Button
                key={opt}
                type="button"
                variant={item.status === opt ? 'default' : 'outline'}
                size="sm"
                disabled={readOnly}
                onClick={() => onChange && onChange(idx, opt as any, item.notes)}
                className="h-8 text-[10px] font-bold px-2.5"
              >
                {opt}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
