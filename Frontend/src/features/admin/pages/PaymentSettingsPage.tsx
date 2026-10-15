import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../../components/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Sparkles, Save, Mail, Clock, DollarSign, CheckCircle2 } from 'lucide-react';
import { api } from '../../../api';

export const PaymentSettingsPage: React.FC = () => {
  const [emailPref, setEmailPref] = useState(true);
  const [smsPref, setSmsPref] = useState(true);
  const [savedMsg, setSavedMsg] = useState('');

  // Late Fee Settings state
  const [graceDays, setGraceDays] = useState<number>(10);
  const [lateFeeAmount, setLateFeeAmount] = useState<number>(50);
  const [lateFeeType, setLateFeeType] = useState<string>('FLAT');
  const [isLateFeeEnabled, setIsLateFeeEnabled] = useState<boolean>(true);
  const [isEditingLateFee, setIsEditingLateFee] = useState<boolean>(false);
  const [loadingLateFee, setLoadingLateFee] = useState<boolean>(false);
  const [lateFeeBackup, setLateFeeBackup] = useState<any>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem('auto_deliver_email');
    const savedSms = localStorage.getItem('auto_deliver_sms');
    if (savedEmail !== null) setEmailPref(savedEmail === 'true');
    if (savedSms !== null) setSmsPref(savedSms === 'true');

    // Fetch company late fee settings from backend
    api.company.getSettings().then((settings) => {
      if (settings) {
        if (settings.lateFeeGraceDays !== undefined) setGraceDays(settings.lateFeeGraceDays);
        if (settings.lateFeeAmount !== undefined) setLateFeeAmount(settings.lateFeeAmount);
        if (settings.lateFeeType !== undefined) setLateFeeType(settings.lateFeeType);
        if (settings.isLateFeeEnabled !== undefined) setIsLateFeeEnabled(settings.isLateFeeEnabled);
      }
    }).catch(console.error);
  }, []);

  const handleStartEditLateFee = () => {
    setLateFeeBackup({ graceDays, lateFeeAmount, lateFeeType, isLateFeeEnabled });
    setIsEditingLateFee(true);
  };

  const handleCancelLateFee = () => {
    if (lateFeeBackup) {
      setGraceDays(lateFeeBackup.graceDays);
      setLateFeeAmount(lateFeeBackup.lateFeeAmount);
      setLateFeeType(lateFeeBackup.lateFeeType);
      setIsLateFeeEnabled(lateFeeBackup.isLateFeeEnabled);
    }
    setIsEditingLateFee(false);
  };

  const handleSaveCredentials = () => {
    setSavedMsg('Payment Gateway credentials updated successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleSaveDeliveryPrefs = () => {
    localStorage.setItem('auto_deliver_email', String(emailPref));
    localStorage.setItem('auto_deliver_sms', String(smsPref));
    setSavedMsg('Invoice delivery options updated successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleSaveLateFeeSettings = async () => {
    try {
      setLoadingLateFee(true);
      const updated = await api.company.updateSettings({
        lateFeeGraceDays: graceDays,
        lateFeeAmount,
        lateFeeType,
        isLateFeeEnabled,
      });

      if (updated) {
        if (updated.lateFeeGraceDays !== undefined) setGraceDays(updated.lateFeeGraceDays);
        if (updated.lateFeeAmount !== undefined) setLateFeeAmount(updated.lateFeeAmount);
        if (updated.lateFeeType !== undefined) setLateFeeType(updated.lateFeeType);
        if (updated.isLateFeeEnabled !== undefined) setIsLateFeeEnabled(updated.isLateFeeEnabled);
      }

      setIsEditingLateFee(false); // Lock (mute) fields back to view mode
      setSavedMsg(`Late Fee Settings updated successfully! Inputs are now locked.`);
      setTimeout(() => setSavedMsg(''), 4000);
    } catch (err: any) {
      alert('Failed to save settings: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoadingLateFee(false);
    }
  };

  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title="Payment & Late Fee Settings"
        description="Integrate merchant accounts, configure invoice delivery rules, and set company-wide late fee grace period rules."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Admin' }, { label: 'Payment Settings' }]}
      />

      {savedMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm font-semibold max-w-4xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Late Fee & Grace Period Settings (Company Level) */}
      <div className="bg-card border border-primary/30 p-6 rounded-2xl space-y-6 shadow-sm bg-gradient-to-br from-primary/5 via-card to-card">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Late Fee & Grace Period Policy
            {isEditingLateFee ? (
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase font-bold">
                Editing Mode
              </span>
            ) : (
              <span className="text-[10px] bg-secondary text-muted-foreground border border-border px-2 py-0.5 rounded-full uppercase font-bold">
                Locked (Muted)
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            {!isEditingLateFee && (
              <Button
                onClick={handleStartEditLateFee}
                variant="outline"
                className="text-xs font-bold border-primary text-primary hover:bg-primary/10 flex items-center gap-1.5 h-8 px-3"
              >
                ✏️ Edit Policy
              </Button>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
          Set the grace period and late fee amount applied automatically to unpaid tenant invoices after due dates.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
          <div className="space-y-1">
            <label className="text-muted-foreground uppercase text-[10px] font-bold">Grace Period (Days)</label>
            <Input
              type="number"
              min="0"
              max="90"
              disabled={!isEditingLateFee}
              value={graceDays}
              onChange={(e) => setGraceDays(parseInt(e.target.value) || 0)}
              className="bg-background font-bold text-sm disabled:bg-secondary/40 disabled:text-muted-foreground disabled:cursor-not-allowed disabled:border-border/30 transition"
              placeholder="e.g. 10"
            />
            <span className="text-[10px] text-muted-foreground">Default: 10 days grace period</span>
          </div>

          <div className="space-y-1">
            <label className="text-muted-foreground uppercase text-[10px] font-bold">Late Fee Amount</label>
            <div className="relative">
              <Input
                type="number"
                min="0"
                disabled={!isEditingLateFee}
                value={lateFeeAmount}
                onChange={(e) => setLateFeeAmount(parseFloat(e.target.value) || 0)}
                className="bg-background font-bold text-sm pl-7 disabled:bg-secondary/40 disabled:text-muted-foreground disabled:cursor-not-allowed disabled:border-border/30 transition"
                placeholder="50"
              />
              <DollarSign className="w-3.5 h-3.5 absolute left-2.5 top-3 text-muted-foreground" />
            </div>
            <span className="text-[10px] text-muted-foreground">Charge amount per invoice</span>
          </div>

          <div className="space-y-1">
            <label className="text-muted-foreground uppercase text-[10px] font-bold">Fee Calculation Type</label>
            <Select
              disabled={!isEditingLateFee}
              value={lateFeeType}
              onChange={(e) => setLateFeeType(e.target.value)}
              className="bg-background font-semibold text-xs disabled:bg-secondary/40 disabled:text-muted-foreground disabled:cursor-not-allowed disabled:border-border/30 transition"
            >
              <option value="FLAT">Flat Fee ($)</option>
              <option value="PERCENTAGE">Percentage of Rent (%)</option>
            </Select>
            <span className="text-[10px] text-muted-foreground">FLAT or % fee</span>
          </div>

          <div className="space-y-1">
            <label className="text-muted-foreground uppercase text-[10px] font-bold">Automation Status</label>
            <Select
              disabled={!isEditingLateFee}
              value={isLateFeeEnabled ? 'ENABLED' : 'DISABLED'}
              onChange={(e) => setIsLateFeeEnabled(e.target.value === 'ENABLED')}
              className="bg-background font-semibold text-xs disabled:bg-secondary/40 disabled:text-muted-foreground disabled:cursor-not-allowed disabled:border-border/30 transition"
            >
              <option value="ENABLED">Active (Auto-Apply)</option>
              <option value="DISABLED">Disabled</option>
            </Select>
            <span className="text-[10px] text-muted-foreground">Daily cron job check</span>
          </div>
        </div>

        <div className="pt-3 border-t border-border/40 flex justify-between items-center">
          <span className="text-xs font-semibold text-muted-foreground">
            Current Rule: <strong className="text-foreground">{isLateFeeEnabled ? `Apply $${lateFeeAmount} after ${graceDays} Days` : 'Disabled'}</strong>
          </span>

          <div className="flex items-center gap-2">
            {isEditingLateFee ? (
              <>
                <Button
                  onClick={handleCancelLateFee}
                  variant="outline"
                  disabled={loadingLateFee}
                  className="text-xs font-bold text-muted-foreground border-border hover:bg-secondary h-9"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveLateFeeSettings}
                  disabled={loadingLateFee}
                  className="bg-primary text-primary-foreground font-semibold flex items-center gap-1.5 text-xs h-9"
                >
                  <Save className="w-3.5 h-3.5" /> {loadingLateFee ? 'Saving...' : 'Save Late Fee Settings'}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleStartEditLateFee}
                className="bg-primary text-primary-foreground font-semibold flex items-center gap-1.5 text-xs h-9"
              >
                ✏️ Edit Policy
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Gateway Credentials */}
        <div className="bg-card border border-border p-6 rounded-2xl space-y-6 shadow-sm">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border/40 pb-2">
            <Sparkles className="w-4 h-4 text-primary" /> Merchant Gateway Credentials
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
            <div className="space-y-1">
              <label className="text-muted-foreground uppercase text-[10px]">Environment Mode</label>
              <Select defaultValue="sandbox">
                <option value="sandbox">Sandbox Test Mode</option>
                <option value="production">Production Live Mode</option>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground uppercase text-[10px]">Gateway Merchant ID</label>
              <Input type="text" defaultValue="merch_19A019X88b" />
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground uppercase text-[10px]">Secret API Key</label>
              <Input type="password" defaultValue="sk_test_51Kxyz..." />
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground uppercase text-[10px]">Reconciliation Webhook URL</label>
              <Input type="text" defaultValue="https://app.whatslandlord.com/api/v1/payments/webhook" />
            </div>
          </div>

          <div className="pt-4 border-t border-border/40 flex justify-end">
            <Button onClick={handleSaveCredentials} className="bg-primary text-primary-foreground font-semibold flex items-center gap-1.5 text-xs h-9">
              <Save className="w-3.5 h-3.5" /> Save Credentials
            </Button>
          </div>
        </div>

        {/* Invoice Delivery Preferences */}
        <div className="bg-card border border-border p-6 rounded-2xl space-y-6 shadow-sm">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border/40 pb-2">
            <Mail className="w-4 h-4 text-primary" /> Invoice Delivery Options
          </h3>

          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            Configure automated distribution rules. When enabled, monthly invoices will be automatically generated and sent to the respective residents.
          </p>

          <div className="space-y-4 text-xs font-semibold">
            <label className="flex items-center space-x-3 p-3 bg-secondary/15 rounded-xl border border-border/40 hover:bg-secondary/25 transition cursor-pointer">
              <input
                type="checkbox"
                checked={emailPref}
                onChange={(e) => setEmailPref(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border bg-background"
              />
              <div>
                <p className="font-extrabold text-foreground">Auto-Send Invoices via Email</p>
                <p className="text-[10px] text-muted-foreground font-medium">Deliver monthly statements directly to tenant's registered email inbox.</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-secondary/15 rounded-xl border border-border/40 hover:bg-secondary/25 transition cursor-pointer">
              <input
                type="checkbox"
                checked={smsPref}
                onChange={(e) => setSmsPref(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border bg-background"
              />
              <div>
                <p className="font-extrabold text-foreground">Auto-Send Invoices via SMS/Text</p>
                <p className="text-[10px] text-muted-foreground font-medium">Deliver instant text alerts to tenant's mobile phone number.</p>
              </div>
            </label>
          </div>

          <div className="pt-4 border-t border-border/40 flex justify-end">
            <Button onClick={handleSaveDeliveryPrefs} className="bg-primary text-primary-foreground font-semibold flex items-center gap-1.5 text-xs h-9">
              <Save className="w-3.5 h-3.5" /> Save Delivery Preferences
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
export default PaymentSettingsPage;
