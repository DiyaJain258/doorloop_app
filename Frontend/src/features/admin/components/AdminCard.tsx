import React from 'react';
import { Card } from '../../../components/ui/Card';

interface AdminCardProps {
  title: string;
  value: string | number;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const AdminCard: React.FC<AdminCardProps> = ({ title, value, loading, icon }) => {
  return (
    <Card className="p-5 border-border bg-card flex items-center justify-between shadow-sm">
      <div className="space-y-1">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
        {loading ? (
          <div className="h-7 w-20 bg-muted/60 animate-pulse rounded"></div>
        ) : (
          <p className="text-2xl font-black text-foreground">{value}</p>
        )}
      </div>
      {icon && <div className="p-2.5 rounded-xl bg-primary/10 text-primary">{icon}</div>}
    </Card>
  );
};
export default AdminCard;
