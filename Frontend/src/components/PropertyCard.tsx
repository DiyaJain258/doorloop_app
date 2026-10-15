import React from 'react';
import { Property } from '../types';
import { Card } from './ui/Card';
import { StatusBadge } from './StatusBadge';
import { Building2, Landmark, ShieldCheck } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
  return (
    <Card 
      onClick={onClick}
      className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group bg-card border-border flex flex-col h-full"
    >
      <div className="relative h-44 overflow-hidden bg-slate-900">
        <img 
          src={property.imageUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'} 
          alt={property.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          <StatusBadge status={property.status} />
          <StatusBadge status={property.type} className="bg-primary/90 text-white border-none" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/80 to-transparent p-4">
          <h3 className="text-white font-extrabold text-lg truncate group-hover:text-primary transition-colors">
            {property.name}
          </h3>
          <p className="text-slate-300 text-xs truncate font-medium">
            {property.streetAddress}, {property.city}
          </p>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Core Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-secondary/40 p-2.5 rounded-lg border border-border/40">
            <p className="text-muted-foreground font-semibold">Occupancy Rate</p>
            <p className="font-extrabold text-base text-foreground mt-0.5">
              {property.occupancyRate}%
            </p>
            <div className="w-full bg-muted rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${property.occupancyRate}%` }}
              />
            </div>
          </div>
          <div className="bg-secondary/40 p-2.5 rounded-lg border border-border/40">
            <p className="text-muted-foreground font-semibold">Monthly Revenue</p>
            <p className="font-extrabold text-base text-emerald-500 mt-0.5">
              ${property.monthlyRevenue.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">Gross Invoiced</p>
          </div>
        </div>

        {/* Footer Details */}
        <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs font-semibold text-muted-foreground">
          <span className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            {property.unitsCount} Units
          </span>
          <span className="flex items-center gap-1 truncate max-w-[120px]">
            <Landmark className="w-3.5 h-3.5 text-muted-foreground/60" />
            {property.owner && typeof property.owner === 'object' ? property.owner.name : (property.owner || 'No Owner')}
          </span>
        </div>
      </div>
    </Card>
  );
};
export default PropertyCard;
