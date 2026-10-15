import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

interface IntegrationCardProps {
  logo?: string;
  name: string;
  category: string;
  description: string;
  status: string;
  onToggle: () => void;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  logo,
  name,
  category,
  description,
  status,
  onToggle,
}) => {
  const isConnected = status === 'Connected';

  return (
    <Card className="p-5 border border-border bg-card flex flex-col justify-between space-y-4 hover:border-primary/40 transition shadow-sm">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl p-1 bg-secondary/30 rounded-lg">{logo || '🔌'}</span>
            <div>
              <h4 className="font-extrabold text-sm text-foreground">{name}</h4>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">{category}</span>
            </div>
          </div>
          <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
            isConnected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-secondary text-muted-foreground'
          }`}>
            {status}
          </span>
        </div>
        <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex justify-end gap-2 border-t border-border/80 pt-3">
        <Button
          size="sm"
          variant={isConnected ? 'outline' : 'default'}
          onClick={onToggle}
          className="text-xs font-semibold px-3 h-8"
        >
          {isConnected ? 'Disconnect' : 'Connect API'}
        </Button>
      </div>
    </Card>
  );
};
export default IntegrationCard;
