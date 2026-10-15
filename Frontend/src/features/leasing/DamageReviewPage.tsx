import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import { useNavigate } from '@tanstack/react-router';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/ui/Button';
import { AlertCircle, ArrowLeft, CheckCircle2, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DamageReviewPageProps {
  id: string;
}

export const DamageReviewPage: React.FC<DamageReviewPageProps> = ({ id }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch Move Out details
  const { data: moveOut, isLoading, refetch } = useQuery({
    queryKey: ['moveOut', id],
    queryFn: () => api.moveOuts.getById(id),
  });

  const [notes, setNotes] = useState('');
  const [decisions, setDecisions] = useState<Record<string, { decision: string; chargeAmount: string }>>({});

  // Mutations
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      const itemsPayload = itemsToReview.map((item: any) => {
        const itemDecision = decisions[item.id] || { decision: 'NO_CHARGE', chargeAmount: '0' };
        return {
          inspectionItemId: item.id,
          roomName: item.roomName,
          itemLabel: item.label,
          condition: item.condition,
          notes: item.notes,
          decision: itemDecision.decision,
          chargeAmount: parseFloat(itemDecision.chargeAmount || '0'),
        };
      });

      // Calculate totals
      const totalCharges = itemsPayload.reduce((acc, curr) => acc + curr.chargeAmount, 0);
      const originalDeposit = moveOut?.lease?.depositAmount || 0;
      const refundAmount = Math.max(0, originalDeposit - totalCharges);

      // Submit damage reviews
      await api.moveOuts.reviewDamage(id, itemsPayload);

      // Submit deposit summary
      await api.moveOuts.saveDepositSummary(id, {
        originalDeposit,
        totalCharges,
        refundAmount,
        notes,
        approvedBy: 'Property Manager',
      });

      // Update move out status to READY_FOR_COMPLETION
      await api.moveOuts.update(id, { status: 'READY_FOR_COMPLETION' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moveOut', id] });
      queryClient.invalidateQueries({ queryKey: ['moveOuts'] });
      navigate({ to: `/leasing/move-out/${id}` });
    },
  });

  if (isLoading) {
    return <div className="py-12 text-center text-xs font-semibold text-muted-foreground">Loading damage items...</div>;
  }

  if (!moveOut) {
    return (
      <div className="py-12 text-center text-xs font-semibold text-rose-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-rose-500" />
        Move Out record not found.
      </div>
    );
  }

  const { lease, inspections = [] } = moveOut;
  const activeInspection = inspections[0];

  // Gather all items rated POOR or FAIR
  const itemsToReview: any[] = [];
  if (activeInspection && activeInspection.rooms) {
    activeInspection.rooms.forEach((room: any) => {
      if (room.items) {
        room.items.forEach((item: any) => {
          if (item.condition === 'POOR' || item.condition === 'FAIR') {
            itemsToReview.push({
              ...item,
              roomName: room.name,
            });
          }
        });
      }
    });
  }

  const handleDecisionChange = (itemId: string, decision: string) => {
    setDecisions((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || { chargeAmount: '0' }),
        decision,
        ...(decision !== 'CHARGE_TENANT' ? { chargeAmount: '0' } : {}),
      },
    }));
  };

  const handleChargeChange = (itemId: string, chargeAmount: string) => {
    setDecisions((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || { decision: 'CHARGE_TENANT' }),
        chargeAmount,
      },
    }));
  };

  // Live Calculations
  const originalDeposit = lease?.depositAmount || 0;
  const totalCharges = Object.values(decisions).reduce((acc, curr) => {
    return acc + parseFloat(curr.chargeAmount || '0');
  }, 0);
  const finalRefund = Math.max(0, originalDeposit - totalCharges);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate({ to: `/leasing/move-out/${id}` })}
          className="p-2 rounded-xl bg-card border hover:bg-accent/40 text-foreground transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <PageHeader
          title="Security Deposit Settlement & Damage Review"
          description="Assess damaged rooms/items flagged in the inspection checklist, set tenant charges, and compute the refund."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Leasing', href: '/leasing/move-out' },
            { label: 'Move Out Details', href: `/leasing/move-out/${id}` },
            { label: 'Damage Review' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Damage Checklist Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wider border-b pb-4 text-primary">Flagged Items ({itemsToReview.length})</h2>

            {itemsToReview.length === 0 ? (
              <div className="py-12 text-center text-xs font-semibold text-muted-foreground space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="font-extrabold text-sm text-foreground">No Damages Found</h3>
                <p className="text-[10px] text-muted-foreground">All items in the inspection were marked as EXCELLENT or GOOD. You can submit without penalty deductions.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {itemsToReview.map((item: any) => {
                  const state = decisions[item.id] || { decision: 'NO_CHARGE', chargeAmount: '0' };
                  return (
                    <div key={item.id} className="border rounded-2xl p-6 bg-secondary/10 space-y-4">
                      <div className="flex justify-between items-start border-b pb-3">
                        <div>
                          <p className="font-bold text-sm text-primary">{item.roomName} — {item.label}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase mt-1 inline-block ${
                            item.condition === 'POOR' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>Condition: {item.condition}</span>
                        </div>
                      </div>

                      {item.notes && (
                        <div className="text-xs font-semibold bg-card p-3 border rounded-xl text-muted-foreground">
                          <span className="text-[10px] uppercase font-bold block mb-1 text-muted-foreground">Inspection Notes:</span>
                          "{item.notes}"
                        </div>
                      )}

                      {item.photos && item.photos.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                          {item.photos.map((ph: any) => (
                            <img key={ph.id} src={ph.url} alt={ph.caption || 'Damage photo'} className="w-full h-16 object-cover rounded-lg border bg-card" />
                          ))}
                        </div>
                      )}

                      {/* Decision Inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Decision</label>
                          <select
                            value={state.decision}
                            onChange={(e) => handleDecisionChange(item.id, e.target.value)}
                            className="w-full p-2 rounded border bg-card text-xs font-semibold focus:outline-none"
                          >
                            <option value="NO_CHARGE">No Charge (Wear & Tear)</option>
                            <option value="CHARGE_TENANT">Charge Tenant</option>
                            <option value="MAINTENANCE_REPAIR">Property Repair (Owner/Staff Expense)</option>
                          </select>
                        </div>

                        {state.decision === 'CHARGE_TENANT' && (
                          <div>
                            <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Charge Amount ($)</label>
                            <input
                              type="number"
                              required
                              placeholder="0.00"
                              value={state.chargeAmount}
                              onChange={(e) => handleChargeChange(item.id, e.target.value)}
                              className="w-full p-2 rounded border bg-card text-xs font-semibold focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Live Deposit Calculator & Submit */}
        <div className="space-y-6">
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6 text-foreground">
            <h2 className="text-sm font-extrabold uppercase tracking-wider border-b pb-4 text-primary">Refund Settlement</h2>

            <div className="space-y-4 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original Deposit Held:</span>
                <span className="font-bold">${originalDeposit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-500">
                <span>Deductions Charged:</span>
                <span className="font-bold">-${totalCharges.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-500 border-t pt-3 text-sm font-extrabold">
                <span>Settled Refund Amount:</span>
                <span>${finalRefund.toLocaleString()}</span>
              </div>

              <div className="space-y-1.5 pt-3">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Settlement Notes</label>
                <textarea
                  placeholder="Details regarding deposit deductions, wear-and-tear explanations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded border bg-secondary text-xs focus:outline-none h-28"
                />
              </div>

              <Button
                onClick={() => submitReviewMutation.mutate()}
                disabled={submitReviewMutation.isPending}
                className="w-full bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10 font-bold"
              >
                <DollarSign className="w-4 h-4 mr-2" /> Approve Settlement Summary
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DamageReviewPage;
