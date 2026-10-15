import React, { useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { ApplicationStepper } from '../../components/ApplicationStepper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, ArrowRight, CheckCircle, ShieldAlert } from 'lucide-react';

export const YearEndPage: React.FC = () => {
  const [step, setStep] = useState(0);
  const steps = ['Review Entries', 'Lock Fiscal Period', 'Generate Closing Entries', 'Archive Ledger'];

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleComplete = () => {
    alert('Fiscal year-end closing successfully posted.');
    setStep(0);
  };

  return (
    <div className="max-w-2xl space-y-6 text-foreground">
      <PageHeader
        title="Year-End Fiscal Closing"
        description="Run operating closures, lock transaction periods, and post adjusting year-end journal entries."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Accounting', href: '/accounting' },
          { label: 'Year-End' },
        ]}
      />

      <Card className="p-6 border bg-card space-y-6">
        <ApplicationStepper steps={steps} currentStep={step} />

        {/* Step 1: Review */}
        {step === 0 && (
          <div className="space-y-3 text-xs font-semibold">
            <h3 className="font-extrabold text-sm uppercase">Review Unposted Transactions</h3>
            <p className="text-muted-foreground">Please confirm all pending vendor bills, draft journal entries, and bank statements match perfectly before locking the period.</p>
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>All bank reconciliation match audits verified.</span>
            </div>
          </div>
        )}

        {/* Step 2: Lock */}
        {step === 1 && (
          <div className="space-y-3 text-xs font-semibold">
            <h3 className="font-extrabold text-sm uppercase">Lock Fiscal Period</h3>
            <p className="text-muted-foreground">Locking the period prevents any user from posting, editing, or deleting transaction records within the fiscal year 2026.</p>
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>Warning: This action is permanent and cannot be undone. Only senior audit managers can adjust locked periods.</span>
            </div>
          </div>
        )}

        {/* Step 3: Closing Entries */}
        {step === 2 && (
          <div className="space-y-3 text-xs font-semibold">
            <h3 className="font-extrabold text-sm uppercase">Generate Closing Entries</h3>
            <p className="text-muted-foreground">Closing entries clear temporary accounts (Income and Expenses) and transfer the balances directly to Equity (Retained Earnings).</p>
          </div>
        )}

        {/* Step 4: Archive */}
        {step === 3 && (
          <div className="space-y-3 text-xs font-semibold">
            <h3 className="font-extrabold text-sm uppercase">Archive & Post Ledger</h3>
            <p className="text-muted-foreground">Post year-end statements, compile PDF backups, and archive all ledger accounts. Ready to finalize closing.</p>
          </div>
        )}

        {/* FOOTER */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button variant="ghost" onClick={handlePrev} disabled={step === 0} className="flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={handleNext} className="flex items-center gap-1">
              Next Step <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete}>Post Fiscal Close</Button>
          )}
        </div>
      </Card>
    </div>
  );
};
export default YearEndPage;
