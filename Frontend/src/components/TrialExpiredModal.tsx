import React from 'react';
import { ShieldAlert, CreditCard, ArrowRight, LogOut, X } from 'lucide-react';
import { Button } from './ui/Button';
import { useAuthStore } from '../store/useStore';

interface TrialExpiredModalProps {
  onUpgrade: () => void;
  onClose?: () => void;
}

export const TrialExpiredModal: React.FC<TrialExpiredModalProps> = ({ onUpgrade, onClose }) => {
  const { logout, user } = useAuthStore();

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-card border border-rose-500/30 rounded-3xl p-8 w-full max-w-lg shadow-2xl space-y-6 text-center text-foreground animate-in fade-in zoom-in duration-300">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-lg transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase rounded-full border border-rose-500/20 tracking-wider">
            Access Suspended
          </span>
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            14-Day Free Trial Expired
          </h2>
          <p className="text-xs text-muted-foreground font-semibold leading-relaxed max-w-md mx-auto">
            Your 14-Day Free Trial for <span className="text-primary font-bold">{user?.companyName || 'your property workspace'}</span> has ended. Upgrade to a paid plan to continue managing your properties, tenants, and accounting.
          </p>
        </div>

        <div className="bg-secondary/60 border rounded-2xl p-4 text-xs font-semibold space-y-2 text-left">
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Expired Plan:</span>
            <span className="font-bold text-foreground">14-Day Free Trial</span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Status:</span>
            <span className="font-bold text-rose-500 uppercase">Subscription Required</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Button
            onClick={onUpgrade}
            className="w-full bg-primary hover:bg-primary/90 text-white font-extrabold h-12 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <CreditCard className="w-4 h-4" />
            <span>Select Paid Plan & Upgrade</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="w-full border-muted text-muted-foreground hover:text-foreground h-10 rounded-xl text-xs flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Account</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
