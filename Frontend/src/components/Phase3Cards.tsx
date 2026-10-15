import React from 'react';
import { Card } from './ui/Card';
import { TenantAvatar } from './TenantAvatar';
import { StatusBadge } from './StatusBadge';
import { Building, DollarSign, Calendar, Landmark, MessageSquare } from 'lucide-react';

// --- TENANT CARD ---
export interface TenantCardProps {
  name: string;
  property?: string;
  unit?: string;
  rent?: number;
  balance?: number;
  status: string;
  onClick?: () => void;
}

export const TenantCard: React.FC<TenantCardProps> = ({
  name,
  property,
  unit,
  rent,
  balance = 0,
  status,
  onClick,
}) => {
  return (
    <Card 
      onClick={onClick}
      className="p-5 border-border hover:shadow-md transition-all cursor-pointer bg-card flex flex-col justify-between h-full"
    >
      <div className="flex items-center space-x-3">
        <TenantAvatar name={name} size="md" />
        <div className="overflow-hidden">
          <h4 className="font-bold text-sm text-foreground truncate">{name}</h4>
          <span className="text-[10px] text-muted-foreground font-semibold flex items-center mt-0.5">
            <Building className="w-3.5 h-3.5 text-primary mr-0.5" />
            {property ? `${property} • Unit ${unit}` : 'Not assigned'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t text-[11px] font-semibold text-muted-foreground">
        <div>
          <p className="text-[9px] uppercase tracking-wide">Rent</p>
          <p className="font-extrabold text-foreground text-sm mt-0.5">${rent?.toLocaleString()}/mo</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wide">Outstanding</p>
          <p className={`font-extrabold text-sm mt-0.5 ${balance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
            ${balance.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-dashed">
        <StatusBadge status={status} />
      </div>
    </Card>
  );
};

// --- LEASE SUMMARY CARD ---
export interface LeaseSummaryCardProps {
  leaseId: string;
  tenantName: string;
  property: string;
  unit: string;
  startDate: string;
  endDate: string;
  rent: number;
  status: string;
}

export const LeaseSummaryCard: React.FC<LeaseSummaryCardProps> = ({
  leaseId,
  tenantName,
  property,
  unit,
  startDate,
  endDate,
  rent,
  status,
}) => {
  return (
    <Card className="p-5 border-border bg-card space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
            Lease {leaseId}
          </span>
          <h4 className="font-bold text-sm text-foreground mt-1 truncate">{tenantName}</h4>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-[10px] uppercase">Property Location</span>
          <span className="text-foreground mt-0.5 truncate">{property} - Unit {unit}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-[10px] uppercase">Term Dates</span>
          <span className="text-foreground mt-0.5 truncate">{startDate} to {endDate}</span>
        </div>
      </div>

      <div className="pt-3 border-t flex justify-between items-center text-xs">
        <div>
          <p className="text-[10px] text-muted-foreground font-semibold">Monthly Rent</p>
          <p className="font-extrabold text-foreground text-sm">${rent.toLocaleString()}</p>
        </div>
      </div>
    </Card>
  );
};

// --- LEAD CARD ---
export interface LeadCardProps {
  name: string;
  source: string;
  budget: number;
  propertyOfInterest?: string;
  status: string;
  onClick?: () => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  name,
  source,
  budget,
  propertyOfInterest,
  status,
  onClick,
}) => {
  return (
    <Card 
      onClick={onClick}
      className="p-5 border-border hover:shadow-md transition-all cursor-pointer bg-card flex flex-col justify-between h-full"
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-bold text-sm text-foreground truncate">{name}</h4>
          <span className="inline-flex text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded mt-1 uppercase">
            {source}
          </span>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-4 pt-3 border-t text-xs font-semibold">
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Target Budget</span>
          <span className="text-foreground font-extrabold text-sm">${budget.toLocaleString()}/mo</span>
        </div>
        <div className="flex justify-between items-center text-muted-foreground mt-1.5">
          <span>Interested Asset</span>
          <span className="text-foreground truncate max-w-[120px]">{propertyOfInterest || 'General Inquiry'}</span>
        </div>
      </div>
    </Card>
  );
};
