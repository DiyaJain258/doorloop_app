import React, { useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatusBadge } from '../../components/StatusBadge';
import { CreditCard, Wrench, FileText, Bell, Sparkles, Send } from 'lucide-react';

export const PortalPreviewPage: React.FC = () => {
  const [success, setSuccess] = useState('');
  const [reqTitle, setReqTitle] = useState('');

  const handlePay = () => {
    setSuccess('Payment of $1,400.00 submitted successfully! Thank you.');
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleReq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim()) return;
    setSuccess(`Maintenance ticket for "${reqTitle}" submitted successfully to management!`);
    setReqTitle('');
    setTimeout(() => setSuccess(''), 4000);
  };

  return (
    <div className="space-y-6 text-foreground max-w-4xl">
      <PageHeader
        title="Resident Portal Preview"
        description="Verify the resident self-service dashboard interface. Rents, requests, and lease downloads."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tenants', href: '/tenants' },
          { label: 'Portal Preview' },
        ]}
      />

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm font-semibold mb-6 animate-fade-in">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pay Rent widget */}
        <Card className="md:col-span-2 p-6 border-border bg-card space-y-6">
          <div className="flex justify-between items-start border-b pb-3">
            <div>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                DUE ON THE 1ST
              </span>
              <h3 className="font-extrabold text-lg mt-1">Outstanding Rent Balance</h3>
            </div>
            <span className="text-2xl font-black text-rose-500">$1,400.00</span>
          </div>

          <div className="space-y-3 text-xs font-semibold">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Month / Period</span>
              <span>July 2026</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Late Fees Appended</span>
              <span>$0.00</span>
            </div>
          </div>

          <Button onClick={handlePay} className="w-full font-bold flex items-center justify-center gap-1">
            <CreditCard className="w-4 h-4" /> Submit Payment via ACH
          </Button>
        </Card>

        {/* Right side notifications */}
        <Card className="md:col-span-1 p-6 border-border bg-card space-y-4">
          <h4 className="font-bold text-sm border-b pb-2 uppercase tracking-wide flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-primary" /> Alerts
          </h4>
          <div className="space-y-3 text-xs font-semibold">
            <div className="p-3 bg-secondary/30 rounded-lg">
              <p className="text-foreground">Filter replacements tomorrow</p>
              <span className="text-[10px] text-muted-foreground block mt-1">July 20, 2026</span>
            </div>
          </div>
        </Card>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Open maintenance */}
        <Card className="p-6 border-border bg-card space-y-4">
          <h4 className="font-bold text-sm border-b pb-2 uppercase tracking-wide flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-primary" /> Submit Maintenance Request
          </h4>
          <form onSubmit={handleReq} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Problem / Issue Title</label>
              <Input
                placeholder="e.g. Clogged kitchen sink drain"
                value={reqTitle}
                onChange={(e) => setReqTitle(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={!reqTitle.trim()} className="w-full text-xs font-semibold flex items-center justify-center gap-1">
              <Send className="w-3.5 h-3.5" /> Submit Request
            </Button>
          </form>
        </Card>

        {/* Lease Document Download */}
        <Card className="p-6 border-border bg-card space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm border-b pb-2 uppercase tracking-wide flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary" /> My Lease Agreement
            </h4>
            <p className="text-xs text-muted-foreground font-semibold mt-3">
              Standard residential contract valid from <strong>2025-08-01</strong> to <strong>2026-08-01</strong>.
            </p>
          </div>
          <Button variant="outline" className="w-full text-xs font-semibold flex items-center justify-center gap-1 mt-4">
            <FileText className="w-4 h-4" /> Download Lease PDF
          </Button>
        </Card>

      </div>
    </div>
  );
};
export default PortalPreviewPage;
