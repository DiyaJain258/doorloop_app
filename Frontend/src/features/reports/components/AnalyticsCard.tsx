import React from 'react';
import { Card } from '../../../components/ui/Card';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: number; // percentage change, e.g. 5.4 or -2.3
  trend?: 'up' | 'down' | 'flat';
  description?: string;
  loading?: boolean;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  change,
  trend,
  description,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-card border border-border p-6 rounded-lg animate-pulse">
        <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-muted rounded w-5/6"></div>
      </div>
    );
  }

  const isUp = trend === 'up';
  const isDown = trend === 'down';

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        {title}
      </h4>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {change !== undefined && (
          <span
            className={`inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded ${
              isUp
                ? 'text-emerald-600 bg-emerald-500/10'
                : isDown
                ? 'text-rose-600 bg-rose-500/10'
                : 'text-slate-500 bg-slate-500/10'
            }`}
          >
            {isUp && <ArrowUpRight className="w-3 h-3 mr-0.5" />}
            {isDown && <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            {!isUp && !isDown && <Minus className="w-3 h-3 mr-0.5" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-2 font-medium">{description}</p>
      )}
    </div>
  );
};
export default AnalyticsCard;
