import React from 'react';
import { Unit } from '../types';
import { Card } from './ui/Card';
import { StatusBadge } from './StatusBadge';
import { Bed, Bath, Sparkles, User } from 'lucide-react';
import { clsx } from 'clsx';

interface UnitCardProps {
  unit: Unit;
  onClick?: () => void;
}

export const UnitCard: React.FC<UnitCardProps> = ({ unit, onClick }) => {
  return (
    <Card 
      onClick={onClick}
      className="p-5 hover:shadow-lg hover:border-primary/40 transition-all duration-200 cursor-pointer bg-card border-border flex flex-col justify-between h-full"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded">
            Unit {unit.unitNumber}
          </span>
          <h4 className="font-bold text-base text-foreground mt-1.5 truncate max-w-[160px]">
            {unit.propertyName}
          </h4>
        </div>
        <StatusBadge status={unit.status} />
      </div>

      <div className="flex items-center space-x-4 my-4 text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-1">
          <Bed className="w-4 h-4 text-muted-foreground/60" />
          {unit.bedrooms} Bed
        </span>
        <span className="flex items-center gap-1">
          <Bath className="w-4 h-4 text-muted-foreground/60" />
          {unit.bathrooms} Bath
        </span>
        <span className="flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-muted-foreground/60" />
          {unit.squareFootage} sqft
        </span>
      </div>

      <div className="pt-3 border-t border-border/60 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase">Monthly Rent</p>
          <p className="text-base font-extrabold text-foreground">
            ${unit.rentAmount.toLocaleString()}
          </p>
        </div>

        <div className="flex items-center space-x-1 text-xs font-semibold text-muted-foreground max-w-[120px] truncate">
          <User className="w-3.5 h-3.5" />
          <span>{unit.tenantName || 'Vacant'}</span>
        </div>
      </div>
    </Card>
  );
};
export default UnitCard;
