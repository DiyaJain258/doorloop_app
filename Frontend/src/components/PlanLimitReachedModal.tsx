import React from 'react';
import { ShieldAlert, Zap, X } from 'lucide-react';
import { Button } from './ui/Button';

interface PlanLimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  title?: string;
  message?: string;
  limitType?: 'properties' | 'units';
  currentPlan?: string;
  maxLimit?: number;
}

export const PlanLimitReachedModal: React.FC<PlanLimitReachedModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  title = 'Subscription Plan Limit Reached',
  message,
  limitType = 'properties',
  currentPlan = 'Starter Plan',
  maxLimit = 5,
}) => {
  if (!isOpen) return null;

  const defaultMessage = `Your current subscription plan (${currentPlan}) permits up to ${maxLimit} ${limitType}. To create additional ${limitType}, please upgrade to a higher tier plan.`;

  return (
    <div className="fixed inset-0 z-[999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-amber-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5 text-left text-foreground animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center shadow-sm">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1.5">
          <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase rounded-full border border-amber-500/20">
            Action Restricted
          </span>
          <h3 className="text-lg font-black tracking-tight text-foreground">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
            {message || defaultMessage}
          </p>
        </div>

        <div className="bg-secondary/70 border rounded-2xl p-3.5 text-xs font-semibold space-y-2">
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Current Active Plan:</span>
            <span className="font-bold text-foreground">{currentPlan}</span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Maximum Permitted {limitType === 'properties' ? 'Properties' : 'Units'}:</span>
            <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400">{maxLimit} Max</span>
          </div>
        </div>

        <div className="pt-2 border-t flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} className="h-10 text-xs">
            Cancel
          </Button>
          <Button
            onClick={onUpgrade}
            className="bg-primary hover:bg-primary/95 text-white font-extrabold h-10 px-5 text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-primary/20"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Upgrade Plan</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
