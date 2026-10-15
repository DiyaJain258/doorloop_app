import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface AIResponseCardProps {
  suggestedActions?: string[];
  relatedRecords?: string[];
}

export const AIResponseCard: React.FC<AIResponseCardProps> = ({
  suggestedActions = [],
  relatedRecords = [],
}) => {
  const navigate = useNavigate();

  if (suggestedActions.length === 0 && relatedRecords.length === 0) return null;

  const handleActionClick = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('reminder')) {
      alert('Late payment reminder sent successfully to the delinquent tenants!');
      navigate({ to: '/communication/sms' });
    } else if (act.includes('invoice')) {
      navigate({ to: '/invoices' });
    } else if (act.includes('lease')) {
      navigate({ to: '/leasing/leases' });
    } else if (act.includes('property')) {
      navigate({ to: '/properties' });
    } else if (act.includes('maintenance')) {
      navigate({ to: '/maintenance' });
    } else if (act.includes('report')) {
      navigate({ to: '/reports' });
    } else {
      alert(`Triggered action: ${action}`);
    }
  };

  const handleRecordClick = (record: string) => {
    const rec = record.toLowerCase();
    if (rec.includes('jordan') || rec.includes('spears') || rec.includes('johnson')) {
      navigate({ to: '/tenants' });
    } else if (rec.includes('villas') || rec.includes('loft') || rec.includes('heights')) {
      navigate({ to: '/properties' });
    } else if (rec.includes('apt') || rec.includes('unit')) {
      navigate({ to: '/units' });
    } else if (rec.includes('inv-')) {
      navigate({ to: '/invoices' });
    } else if (rec.includes('financial') || rec.includes('roll') || rec.includes('statement')) {
      navigate({ to: '/reports' });
    } else {
      navigate({ to: '/' });
    }
  };

  return (
    <div className="mt-2 ml-12 space-y-3 max-w-xl">
      {/* Contextual Actions Panel */}
      {suggestedActions.length > 0 && (
        <Card className="p-3 border-l-4 border-l-primary border-border bg-card space-y-2">
          <h5 className="font-extrabold text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Suggested Actions
          </h5>
          <div className="flex flex-wrap gap-2 pt-1">
            {suggestedActions.map((action, i) => (
              <Button
                key={i}
                variant="ghost"
                size="sm"
                onClick={() => handleActionClick(action)}
                className="text-[10px] font-extrabold bg-primary/10 text-primary hover:text-primary hover:bg-primary/15 py-1.5 px-3 rounded-lg border-0"
              >
                {action} <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Related Records Links */}
      {relatedRecords.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center text-[11px] font-semibold text-muted-foreground bg-secondary/25 border border-border p-2.5 rounded-lg">
          <span className="font-extrabold text-[10px] uppercase tracking-wider">Related Records:</span>
          {relatedRecords.map((record, i) => (
            <button
              key={i}
              onClick={() => handleRecordClick(record)}
              className="inline-flex items-center gap-0.5 text-primary hover:underline font-bold bg-transparent border-0 cursor-pointer"
            >
              {record}
              <ExternalLink className="w-2.5 h-2.5" />
              {i < relatedRecords.length - 1 && <span className="text-muted-foreground/40 ml-1 font-normal">•</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIResponseCard;
