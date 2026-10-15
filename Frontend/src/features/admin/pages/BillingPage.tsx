import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api';
import { useAuthStore } from '../../../store/useStore';
import { PageHeader } from '../../../components/PageHeader';
import { BillingCard } from '../components/BillingCard';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Check, Sparkles } from 'lucide-react';


export const BillingPage: React.FC = () => {
  const { user } = useAuthStore();
  const { data: apiSubscription, isLoading } = useQuery({
    queryKey: ['admin-billing-sub'],
    queryFn: () => api.billing.getSubscription(),
  });

  const { data: plansData } = useQuery({
    queryKey: ['available-plans'],
    queryFn: () => api.plans.getAll(),
  });

  const rawPlans = (plansData && plansData.length > 0) ? plansData : [
    { name: 'Monthly Plan', price: 15, features: 'Unlimited Properties & Units, Full Accounting & General Ledger, 1-Week Grace Period' },
    { name: 'Yearly Plan', price: 120, features: 'Unlimited Properties & Units, Full Accounting & Financial Reports, 1-Week Grace Period ($10/mo)' },
  ];

  const availablePlans = rawPlans.filter((p: any) => p.price > 0 && !p.name.toLowerCase().includes('free') && !p.name.toLowerCase().includes('trial'));


  const defaultPrice = user?.planType === 'FREE_TRIAL' ? 0 : (user?.planType === 'YEARLY' ? 120 : 15);
  const activePlan = {
    planName: apiSubscription?.planName || user?.planName || 'Monthly Plan',
    price: apiSubscription?.price || defaultPrice,
    billingCycle: apiSubscription?.billingCycle || (user?.planType === 'YEARLY' ? 'Annual' : 'Monthly'),
    nextInvoice: apiSubscription?.nextInvoice ? apiSubscription.nextInvoice.split('T')[0] : '2026-10-01',
    usageLimit: 'Unlimited Properties & Units',
    paymentMethod: apiSubscription?.paymentMethod || 'Visa ending 4242',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Billing"
        description="Verify invoicing transaction histories, upgrade operational tier limits, or replace active credit cards."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Admin' }, { label: 'Billing' }]}
      />

      {isLoading ? (
        <div className="h-40 flex items-center justify-center text-muted-foreground">Mapping billing details...</div>
      ) : (
        <div className="space-y-8">
          {/* Top: Active Plan Detail */}
          <div className="max-w-4xl">
            <h3 className="font-bold text-sm text-foreground mb-3">Current Company Active Subscription</h3>
            <BillingCard subscription={activePlan} />
          </div>

          {/* Bottom: Left-to-Right Horizontal Scroll for SuperAdmin Subscription Tiers */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" /> Available Subscription Tiers (SuperAdmin Plans)
              </h3>
              <span className="text-[11px] text-muted-foreground font-medium">Scroll right to view all tiers →</span>
            </div>

            <div className="flex overflow-x-auto gap-4 pb-4 pt-1 scrollbar-thin">
              {availablePlans.map((p: any) => {
                const isActive = activePlan.planName === p.name || (p.name.toLowerCase().includes('monthly') && activePlan.planName.toLowerCase().includes('monthly'));
                const featuresList = typeof p.features === 'string' ? p.features.split(',').map((f: string) => f.trim()) : (Array.isArray(p.features) ? p.features : ['Unlimited Properties & Units']);
                return (
                  <Card
                    key={p.id || p.name}
                    className={`min-w-[280px] max-w-[320px] p-5 border bg-card flex flex-col justify-between space-y-4 shrink-0 transition ${
                      isActive ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-md' : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start border-b border-border pb-3 mb-3">
                        <div>
                          <span className="text-foreground font-extrabold text-sm">{p.name}</span>
                          {isActive && (
                            <span className="block text-[9px] bg-primary text-primary-foreground font-black px-1.5 py-0.5 rounded mt-1 uppercase w-max">
                              Active Plan
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-foreground">${p.price}</span>
                          <span className="text-[10px] text-muted-foreground block font-semibold">
                            {p.price === 0 ? '/ 14 days free' : (p.price === 120 ? '/ year ($10/mo)' : '/ month')}
                          </span>
                        </div>
                      </div>

                      <ul className="text-xs text-muted-foreground font-semibold list-none space-y-2">
                        {featuresList.map((f: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-border/50 text-center">
                      <span className="text-[10px] text-muted-foreground font-medium italic">
                        {isActive ? 'Currently Active Tier' : 'SuperAdmin Configured Plan'}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default BillingPage;
