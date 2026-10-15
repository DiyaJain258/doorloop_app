import React from 'react';
import { Card } from './ui/Card';
import { RefreshCw } from 'lucide-react';

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  loading?: boolean;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  children,
  loading = false,
}) => {
  return (
    <Card className="p-6 flex flex-col h-full bg-card border-border">
      <div className="flex flex-col space-y-1 mb-4">
        <h3 className="font-bold text-lg tracking-tight text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground font-medium">{description}</p>
        )}
      </div>

      <div className="flex-1 min-h-[240px] flex items-center justify-center relative w-full">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm z-10 rounded-lg">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : null}
        <div className="w-full h-full flex items-center justify-center">
          {children}
        </div>
      </div>
    </Card>
  );
};
export default ChartCard;
