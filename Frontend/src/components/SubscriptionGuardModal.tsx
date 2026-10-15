import React, { useState } from 'react';
import { useAuthStore } from '../store/useStore';
import api from '../api';
import { apiClient } from '../api/client';
import { ShieldAlert, CreditCard, Check, Sparkles, AlertTriangle, Lock, Loader2, ArrowRight, LogOut, X } from 'lucide-react';
import { Button } from './ui/Button';

interface SubscriptionGuardModalProps {
  onSuccess?: () => void;
}

export const SubscriptionGuardModal: React.FC<SubscriptionGuardModalProps> = ({ onSuccess }) => {
  const { user, updateUser, logout } = useAuthStore();

  const [selectedPlan, setSelectedPlan] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showGraceBannerOnly, setShowGraceBannerOnly] = useState<boolean>(!user?.isAccessBlocked && !!user?.isInGracePeriod);

  if (!user || user.role === 'Super Admin') {
    return null; // Super Admin bypasses subscription guard
  }

  const isBlocked = user.isAccessBlocked || user.isTrialExpired;
  const isInGrace = user.isInGracePeriod;

  if (!isBlocked && !isInGrace) {
    return null; // Normal active subscription
  }

  // Grace Period Warning Banner (Non-blocking mode)
  if (isInGrace && !isBlocked && showGraceBannerOnly) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-2.5 shadow-lg border-b border-amber-400/30 flex items-center justify-between text-xs font-semibold animate-in slide-in-from-top duration-300">
        <div className="flex items-center space-x-2.5 max-w-4xl">
          <div className="p-1 bg-white/20 rounded-full animate-pulse">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-extrabold uppercase tracking-wide bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full mr-2">1-Week Extension Active</span>
            <span>Your plan has expired! You are in a 1-week grace period. Please renew your plan before service is shut OFF.</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={() => setShowGraceBannerOnly(false)}
            className="bg-white text-amber-900 hover:bg-amber-50 font-extrabold text-[11px] h-7 px-3 shadow"
          >
            Renew Plan Now <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  const amount = selectedPlan === 'YEARLY' ? 120 : 15;

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!cardNumber || cardNumber.replace(/\s+/g, '').length < 13) {
      setErrorMessage('Please enter a valid credit card number.');
      return;
    }
    if (!cardExpiry || !cardCvv) {
      setErrorMessage('Please complete all credit card expiration & CVV details.');
      return;
    }

    try {
      setLoading(true);
      const response: any = await apiClient.post('/superadmin/process-payment', {
        companyId: user.companyId,
        planType: selectedPlan,
        cardNumber,
        cardExpiry,
        cardCvv,
        cardName: cardName || user.name,
      });

      if (response && response.data && response.data.success) {
        const updatedComp = response.data.data.company;
        setSuccessMessage('Payment successful! Subscription plan updated.');
        
        updateUser({
          planName: updatedComp.planName,
          planType: updatedComp.planType,
          isTrialExpired: false,
          isInGracePeriod: false,
          isAccessBlocked: false,
          planEndsAt: updatedComp.planEndsAt,
          graceEndsAt: updatedComp.graceEndsAt,
        });

        setTimeout(() => {
          if (onSuccess) onSuccess();
          window.location.reload();
        }, 1200);
      } else {
        setErrorMessage(response.data?.message || 'Payment processing failed. Please check card details.');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      const msg = err.response?.data?.message || err.message || 'Payment failed. Please verify your card details.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto">
      <div className="bg-card border border-primary/20 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary via-indigo-600 to-purple-700 text-white p-6 relative">
          <button
            type="button"
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-white/20"
            title="Sign out & return to landing page"
          >
            <LogOut className="w-3.5 h-3.5" /> <span>Sign Out</span>
          </button>
          <div className="flex items-center space-x-3 pr-24">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="bg-white/20 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                {user.isTrialExpired ? 'Free Trial Expired' : 'Plan Expiration Guard'}
              </span>
              <h2 className="text-xl font-extrabold mt-1 text-white">Select a Subscription Plan to Continue</h2>
              <p className="text-xs text-white/80 font-medium">Your subscription or trial has ended. Please choose a plan to unlock access.</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-xs font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-500 text-xs font-semibold flex items-center space-x-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Plan Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly Card */}
            <div
              onClick={() => setSelectedPlan('MONTHLY')}
              className={`cursor-pointer border-2 rounded-xl p-5 transition relative flex flex-col justify-between ${
                selectedPlan === 'MONTHLY'
                  ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-muted-foreground/30'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-base text-foreground">Monthly Plan</h3>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mt-0.5">Billed Monthly</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'MONTHLY' ? 'border-primary bg-primary text-white' : 'border-muted-foreground/40'}`}>
                    {selectedPlan === 'MONTHLY' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-extrabold text-foreground">$15</span>
                  <span className="text-xs text-muted-foreground font-semibold ml-1">/ month</span>
                </div>

                <ul className="mt-4 space-y-2 text-xs font-semibold text-muted-foreground">
                  <li className="flex items-center space-x-1.5"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> <span>Unlimited Properties & Units</span></li>
                  <li className="flex items-center space-x-1.5"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> <span>1-Week Grace Period on Expiry</span></li>
                  <li className="flex items-center space-x-1.5"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> <span>Full Accounting & Tenant Portals</span></li>
                </ul>
              </div>
            </div>

            {/* Yearly Card */}
            <div
              onClick={() => setSelectedPlan('YEARLY')}
              className={`cursor-pointer border-2 rounded-xl p-5 transition relative flex flex-col justify-between ${
                selectedPlan === 'YEARLY'
                  ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-muted-foreground/30'
              }`}
            >
              <div className="absolute -top-3 right-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow">
                Save 33% (Best Value)
              </div>

              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-base text-foreground">Yearly Plan</h3>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mt-0.5">Billed $120 Annually</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'YEARLY' ? 'border-primary bg-primary text-white' : 'border-muted-foreground/40'}`}>
                    {selectedPlan === 'YEARLY' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-extrabold text-foreground">$10</span>
                  <span className="text-xs text-muted-foreground font-semibold ml-1">/ month ($120/yr)</span>
                </div>

                <ul className="mt-4 space-y-2 text-xs font-semibold text-muted-foreground">
                  <li className="flex items-center space-x-1.5"><Check className="w-3.5 h-3.5 text-purple-600 shrink-0" /> <span>Unlimited Properties & Units</span></li>
                  <li className="flex items-center space-x-1.5"><Check className="w-3.5 h-3.5 text-purple-600 shrink-0" /> <span>1-Week Grace Period on Expiry</span></li>
                  <li className="flex items-center space-x-1.5"><Check className="w-3.5 h-3.5 text-purple-600 shrink-0" /> <span>Priority Support & Features</span></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Credit Card Payment Form */}
          <form onSubmit={handleProcessPayment} className="bg-secondary/40 border border-border/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-extrabold uppercase tracking-wide flex items-center space-x-1.5 text-foreground">
                <CreditCard className="w-4 h-4 text-primary" />
                <span>Credit / Debit Card Details</span>
              </span>
              <span className="text-[11px] font-bold text-primary">Total: ${amount}.00</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Cardholder Name</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full p-2.5 rounded-lg border bg-background text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Card Number</label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4000 1234 5678 9010"
                  className="w-full p-2.5 rounded-lg border bg-background text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Expiration Date</label>
                <input
                  type="text"
                  required
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="w-full p-2.5 rounded-lg border bg-background text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">CVV Security Code</label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  placeholder="123"
                  className="w-full p-2.5 rounded-lg border bg-background text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  logout();
                  window.location.href = '/login';
                }}
                className="text-xs text-muted-foreground hover:text-rose-500"
              >
                Log Out
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-white px-6 font-extrabold text-xs shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing ${amount}...
                  </>
                ) : (
                  <>Pay ${amount}.00 & Unlock Access</>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
