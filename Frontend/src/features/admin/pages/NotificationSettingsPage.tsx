import React from 'react';
import { PageHeader } from '../../../components/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Sparkles, Save } from 'lucide-react';

export const NotificationSettingsPage: React.FC = () => {
  const handleSave = () => {
    alert('System notification preferences saved successfully!');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Settings"
        description="Toggle automated SMS messages, tenant invoice reminders, maintenance task dispatches, and push alerts."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Admin' }, { label: 'Notification Settings' }]}
      />

      <div className="bg-card border border-border p-6 rounded-2xl max-w-2xl space-y-6 shadow-sm">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border pb-2">
          <Sparkles className="w-4 h-4 text-primary" /> System Notification Triggers
        </h3>

        <div className="space-y-4">
          {[
            { label: 'Rent Reminders', desc: 'Auto-sends notice 3 days before rent payment due.' },
            { label: 'Lease Expirations', desc: 'Warns managers and tenants 60 days before contract expiry.' },
            { label: 'Maintenance Updates', desc: 'Alerts residents of vendor arrival times and job status adjustments.' },
            { label: 'Payment Failures', desc: 'Triggers alert email when bank transfer returns check exceptions.' },
          ].map((item, idx) => (
            <div key={idx} className="flex justify-between items-start border-b border-border/60 pb-3 last:border-b-0 last:pb-0">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">{item.label}</span>
                <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed">{item.desc}</p>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center space-x-1.5 cursor-pointer text-[10px] font-bold text-muted-foreground">
                  <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5" />
                  <span>Email</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer text-[10px] font-bold text-muted-foreground">
                  <input type="checkbox" defaultChecked className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5" />
                  <span>SMS</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border/80 flex justify-end">
          <Button onClick={handleSave} className="bg-primary text-primary-foreground font-semibold flex items-center gap-1.5">
            <Save className="w-4 h-4" /> Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
};
export default NotificationSettingsPage;
