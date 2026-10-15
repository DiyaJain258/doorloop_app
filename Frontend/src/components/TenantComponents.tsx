import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { StatusBadge } from './StatusBadge';
import { Megaphone, Package, Shield, Users, CreditCard, Wrench, Download } from 'lucide-react';

// --- ANNOUNCEMENT CARD ---
interface AnnouncementCardProps {
  title: string;
  category: string;
  publishDate: string;
  body: string;
  priority: string;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  title,
  category,
  publishDate,
  body,
  priority,
}) => {
  return (
    <Card className="p-5 border bg-card text-foreground space-y-3">
      <div className="flex justify-between items-start border-b pb-2">
        <div className="flex items-center space-x-2">
          <Megaphone className="w-5 h-5 text-primary shrink-0" />
          <div>
            <h4 className="font-extrabold text-sm uppercase">{title}</h4>
            <span className="text-[9px] font-bold text-muted-foreground uppercase">{category} • {publishDate}</span>
          </div>
        </div>
        {priority === 'Emergency' && (
          <span className="text-[9px] font-black uppercase text-white bg-rose-500 px-2 py-0.5 rounded border border-rose-600">
            Emergency Notice
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground font-semibold leading-relaxed">{body}</p>
    </Card>
  );
};

// --- PACKAGE CARD ---
interface PackageCardProps {
  carrier: string;
  trackingNumber: string;
  deliveredDate: string;
  pickupStatus: string;
  onPickup?: () => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  carrier,
  trackingNumber,
  deliveredDate,
  pickupStatus,
  onPickup,
}) => {
  return (
    <Card className="p-4 border bg-card flex justify-between items-center text-xs font-semibold">
      <div className="flex items-center space-x-3">
        <Package className="w-5 h-5 text-amber-500 shrink-0" />
        <div>
          <p className="font-bold">{carrier} package delivered</p>
          <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">Tracking: {trackingNumber}</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">Delivered: {deliveredDate}</p>
        </div>
      </div>
      <div className="text-right space-y-2">
        <StatusBadge status={pickupStatus} />
        {pickupStatus === 'Pending' && onPickup && (
          <div>
            <Button size="sm" onClick={onPickup} className="text-[9px] uppercase px-2 py-1 h-auto font-black">
              Pick Up package
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

// --- VISITOR CARD ---
interface VisitorCardProps {
  visitorName: string;
  visitDate: string;
  arrivalTime: string;
  status: string;
}

export const VisitorCard: React.FC<VisitorCardProps> = ({
  visitorName,
  visitDate,
  arrivalTime,
  status,
}) => {
  return (
    <Card className="p-4 border bg-card flex justify-between items-center text-xs font-semibold">
      <div className="flex items-center space-x-3">
        <UsersIcon className="w-5 h-5 text-indigo-500 shrink-0" />
        <div>
          <p className="font-bold">{visitorName}</p>
          <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">Scheduled Date: {visitDate}</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">ETA Arrival: {arrivalTime}</p>
        </div>
      </div>
      <StatusBadge status={status} />
    </Card>
  );
};

// Simple Fallback Helper for Users Icon
const UsersIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
