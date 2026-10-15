import React from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, Mail, Bell } from 'lucide-react';

export const TenantSettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 text-foreground max-w-3xl">
      <PageHeader
        title="Settings & Privacy"
        description="Verify notifications setups, password updates, two-factor authentication, or linked device logs."
        breadcrumbs={[
          { label: 'Home', href: '/tenant' },
          { label: 'Settings' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
        
        {/* Notifications setups */}
        <Card className="p-6 border bg-card space-y-4">
          <div className="flex items-center space-x-2 border-b pb-2">
            <Bell className="w-5 h-5 text-primary shrink-0" />
            <h4 className="font-extrabold uppercase">Notifications Preferences</h4>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">Rent Invoice alerts</p>
                <p className="text-[10px] text-muted-foreground">Receive updates when rent periods statements release.</p>
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-black uppercase">SMS & Email</span>
            </div>
            <div className="flex justify-between items-center border-t pt-3">
              <div>
                <p className="font-bold">Package delivery alerts</p>
                <p className="text-[10px] text-muted-foreground">Receive SMS when couriers drop off packages.</p>
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-black uppercase">SMS</span>
            </div>
          </div>
        </Card>

        {/* Security Setups */}
        <Card className="p-6 border bg-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b pb-2">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
              <h4 className="font-extrabold uppercase">Portal Security</h4>
            </div>
            <p className="text-muted-foreground mt-3 leading-relaxed">Ensure account safety by configuring multi-factor authentication (MFA) or updating passwords.</p>
          </div>

          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline" className="text-xs uppercase font-bold" onClick={() => alert('Opening password edit modal...')}>
              Update Password
            </Button>
            <Button size="sm" className="text-xs uppercase font-bold" onClick={() => alert('MFA enabled successfully.')}>
              Setup 2FA
            </Button>
          </div>
        </Card>

      </div>
    </div>
  );
};
export default TenantSettingsPage;
