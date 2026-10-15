import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Trash2, ShieldAlert } from 'lucide-react';

interface ApiKeyCardProps {
  keyItem: {
    id: string;
    name: string;
    createdBy: string;
    createdAt: string;
    lastUsed: string;
    status: string;
  };
  onRevoke: (id: string) => void;
}

export const ApiKeyCard: React.FC<ApiKeyCardProps> = ({ keyItem, onRevoke }) => {
  return (
    <Card className="p-4 border border-border bg-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-primary/40 transition shadow-sm">
      <div className="space-y-1 flex-1">
        <div className="flex items-center space-x-2">
          <h4 className="font-extrabold text-sm text-foreground">{keyItem.name}</h4>
          <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
            keyItem.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-secondary text-muted-foreground'
          }`}>
            {keyItem.status}
          </span>
        </div>
        <div className="text-[11px] font-semibold text-muted-foreground flex flex-wrap gap-x-4">
          <span>Created by: {keyItem.createdBy}</span>
          <span>Date: {keyItem.createdAt}</span>
          <span>Last Used: {keyItem.lastUsed}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onRevoke(keyItem.id)}
          className="text-xs font-semibold text-rose-500 hover:text-rose-600 border-rose-200 hover:bg-rose-50/50 h-8 flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Revoke Key
        </Button>
      </div>
    </Card>
  );
};
export default ApiKeyCard;
