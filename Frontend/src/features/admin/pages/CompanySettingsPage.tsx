import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api';
import { PageHeader } from '../../../components/PageHeader';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Sparkles, Save, Edit3, CheckCircle2, X, Clock, DollarSign, ShieldAlert } from 'lucide-react';
import { useCompanyStore } from '../../../store/useStore';

export const CompanySettingsPage: React.FC = () => {
  const { companyName, companyAddress, timezone, currency, setCompanyProfile } = useCompanyStore();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(companyName);
  const [address, setAddress] = useState(companyAddress);
  const [tz, setTz] = useState(timezone);
  const [curr, setCurr] = useState(currency);

  // Late Fee Settings state
  const [lateFeeGraceDays, setLateFeeGraceDays] = useState<number>(10);
  const [lateFeeAmount, setLateFeeAmount] = useState<number>(50);
  const [lateFeeType, setLateFeeType] = useState<string>('FLAT');
  const [isLateFeeEnabled, setIsLateFeeEnabled] = useState<boolean>(true);

  const [notification, setNotification] = useState<string | null>(null);

  // Sync state with global store
  useEffect(() => {
    setName(companyName);
    setAddress(companyAddress);
    setTz(timezone);
    setCurr(currency);
  }, [companyName, companyAddress, timezone, currency]);

  // Sync with API backend for Company & Late Fee settings
  const { refetch } = useQuery({
    queryKey: ['company-settings-data'],
    queryFn: async () => {
      try {
        const res = await api.company.getSettings();
        if (res) {
          if (res.name) setName(res.name);
          if (res.lateFeeGraceDays !== undefined) setLateFeeGraceDays(Number(res.lateFeeGraceDays));
          if (res.lateFeeAmount !== undefined) setLateFeeAmount(Number(res.lateFeeAmount));
          if (res.lateFeeType) setLateFeeType(res.lateFeeType);
          if (res.isLateFeeEnabled !== undefined) setIsLateFeeEnabled(Boolean(res.isLateFeeEnabled));
        }
        return res;
      } catch (e) {
        return null;
      }
    },
  });

  const handleSave = async () => {
    // 1. Update global store & localStorage instantly
    setCompanyProfile({
      companyName: name,
      companyAddress: address,
      timezone: tz,
      currency: curr,
    });

    // 2. Persist to API backend (including Late Fee settings)
    try {
      await api.company.updateSettings({
        name,
        address,
        timezone: tz,
        currency: curr,
        lateFeeGraceDays,
        lateFeeAmount,
        lateFeeType,
        isLateFeeEnabled,
      });
      refetch();
    } catch (e) {
      console.error('Failed to update company settings on backend:', e);
    }

    setIsEditing(false);
    setNotification(`Company Settings saved! Grace Period set to ${lateFeeGraceDays} days.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCancel = () => {
    setName(companyName);
    setAddress(companyAddress);
    setTz(timezone);
    setCurr(currency);
    setIsEditing(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Profile & Settings"
        description="Configure default branding profile, regional timezones, base currency, and automated late fee grace period rules."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Admin' }, { label: 'Company Profile' }]}
      />

      {notification && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 max-w-2xl animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* GENERAL CONFIGURATIONS */}
      <div className="bg-card border border-border p-6 rounded-2xl max-w-2xl space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" /> Corporate Profile & Regional Preferences
          </h3>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-xs font-bold flex items-center gap-1.5 h-8 border-primary/40 text-primary hover:bg-primary/5"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile & Rules
            </Button>
          ) : (
            <span className="text-[10px] font-extrabold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full uppercase tracking-wider">
              Editing Mode Active
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Company Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing}
              className={!isEditing ? 'bg-muted/40 text-muted-foreground font-medium border-border/60 opacity-80 cursor-not-allowed select-none' : 'bg-background font-bold border-primary focus:ring-2 focus:ring-primary'}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Corporate Headquarters Address</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!isEditing}
              className={!isEditing ? 'bg-muted/40 text-muted-foreground font-medium border-border/60 opacity-80 cursor-not-allowed select-none' : 'bg-background font-bold border-primary focus:ring-2 focus:ring-primary'}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">System Timezone</label>
            <Select
              value={tz}
              onChange={(e) => setTz(e.target.value)}
              disabled={!isEditing}
              className={!isEditing ? 'bg-muted/40 text-muted-foreground font-medium border-border/60 opacity-80 cursor-not-allowed select-none' : 'bg-background font-bold border-primary'}
            >
              <option value="EST">EST (Eastern Standard Time)</option>
              <option value="PST">PST (Pacific Standard Time)</option>
              <option value="GMT">GMT (Greenwich Mean Time)</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Base Currency</label>
            <Select
              value={curr}
              onChange={(e) => setCurr(e.target.value)}
              disabled={!isEditing}
              className={!isEditing ? 'bg-muted/40 text-muted-foreground font-medium border-border/60 opacity-80 cursor-not-allowed select-none' : 'bg-background font-bold border-primary'}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </Select>
          </div>
        </div>
      </div>

      {/* LATE FEE & BILLING AUTOMATION SETTINGS */}
      <div className="bg-card border border-border p-6 rounded-2xl max-w-2xl space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-500" /> Late Fee & Grace Period Settings (Manager Configuration)
          </h3>
          <span className="text-xs font-bold text-slate-500">
            Current Grace: <strong className="text-indigo-600 dark:text-indigo-400">{lateFeeGraceDays} Days</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Grace Period Days */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" /> Grace Period (Days After Due Date)
            </label>
            <Input
              type="number"
              min="0"
              max="90"
              value={lateFeeGraceDays}
              onChange={(e) => setLateFeeGraceDays(parseInt(e.target.value) || 0)}
              disabled={!isEditing}
              placeholder="10"
              className={!isEditing ? 'bg-muted/40 text-muted-foreground font-medium border-border/60 opacity-80 cursor-not-allowed' : 'bg-background font-bold border-primary'}
            />
            <p className="text-[11px] text-muted-foreground">Default is 10 days. Late fee invoices trigger automatically after this period.</p>
          </div>

          {/* Late Fee Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Late Fee Charge Amount
            </label>
            <Input
              type="number"
              min="0"
              value={lateFeeAmount}
              onChange={(e) => setLateFeeAmount(parseFloat(e.target.value) || 0)}
              disabled={!isEditing}
              placeholder="50"
              className={!isEditing ? 'bg-muted/40 text-muted-foreground font-medium border-border/60 opacity-80 cursor-not-allowed' : 'bg-background font-bold border-primary'}
            />
            <p className="text-[11px] text-muted-foreground">Charge value applied when grace period is exceeded.</p>
          </div>

          {/* Late Fee Calculation Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Late Fee Type</label>
            <Select
              value={lateFeeType}
              onChange={(e) => setLateFeeType(e.target.value)}
              disabled={!isEditing}
              className={!isEditing ? 'bg-muted/40 text-muted-foreground font-medium border-border/60 opacity-80 cursor-not-allowed' : 'bg-background font-bold border-primary'}
            >
              <option value="FLAT">Flat Amount ($)</option>
              <option value="PERCENTAGE">Percentage (%) of Rent</option>
            </Select>
          </div>

          {/* Enable Automated Late Fees Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Automated Late Fee Cron</label>
            <Select
              value={isLateFeeEnabled ? 'enabled' : 'disabled'}
              onChange={(e) => setIsLateFeeEnabled(e.target.value === 'enabled')}
              disabled={!isEditing}
              className={!isEditing ? 'bg-muted/40 text-muted-foreground font-medium border-border/60 opacity-80 cursor-not-allowed' : 'bg-background font-bold border-primary'}
            >
              <option value="enabled">Enabled (Auto-apply after grace period)</option>
              <option value="disabled">Disabled (Manual late fees only)</option>
            </Select>
          </div>
        </div>

        {isEditing && (
          <div className="pt-4 border-t border-border/80 flex items-center justify-end gap-2 animate-fade-in">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="text-xs font-semibold flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary text-primary-foreground font-bold flex items-center gap-1.5 text-xs"
            >
              <Save className="w-3.5 h-3.5" /> Save Configurations
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanySettingsPage;
