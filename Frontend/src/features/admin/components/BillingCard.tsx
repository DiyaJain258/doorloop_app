import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Sparkles, Calendar, Check } from 'lucide-react';

interface BillingCardProps {
  subscription: {
    planName: string;
    price: number;
    billingCycle: string;
    nextInvoice: string;
    usageLimit: string;
    paymentMethod: string;
  };
}

export const BillingCard: React.FC<BillingCardProps> = ({ subscription }) => {
  return (
    <Card className="p-6 border border-border bg-card space-y-6 shadow-sm">
      <div className="flex justify-between items-start border-b border-border pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded mr-2">
            Active Plan
          </span>
          <h3 className="font-extrabold text-base text-foreground mt-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" /> {subscription.planName}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-foreground">${subscription.price}</p>
          <span className="text-[10px] text-muted-foreground font-semibold">per month</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-muted-foreground">
        <div className="p-3 bg-secondary/15 rounded-xl border border-border space-y-1">
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Billing Cycle</span>
          <p className="text-foreground font-bold">{subscription.billingCycle}</p>
        </div>
        <div className="p-3 bg-secondary/15 rounded-xl border border-border space-y-1">
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Next Renewal Invoice</span>
          <p className="text-foreground font-bold">{subscription.nextInvoice}</p>
        </div>
        <div className="p-3 bg-secondary/15 rounded-xl border border-border space-y-1">
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Tenant / Property Limits</span>
          <p className="text-foreground font-bold">{subscription.usageLimit}</p>
        </div>
        <div className="p-3 bg-secondary/15 rounded-xl border border-border space-y-1">
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Active Payment Card</span>
          <p className="text-foreground font-bold">{subscription.paymentMethod}</p>
        </div>
      </div>
    </Card>
  );
};
export default BillingCard;
