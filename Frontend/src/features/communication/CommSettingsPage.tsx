import React from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { MessageSquare, Mail, ShieldAlert } from 'lucide-react';

export const CommSettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 text-foreground max-w-3xl">
      <PageHeader
        title="Communication Center Settings"
        description="Verify brand email signatures, automated auto-replies setups, and default outbound templates."
        breadcrumbs={[
          { label: 'Home', href: '/communication' },
          { label: 'Settings' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
        
        {/* Email signature */}
        <Card className="p-6 border bg-card space-y-4">
          <div className="flex items-center space-x-2 border-b pb-2">
            <Mail className="w-5 h-5 text-primary shrink-0" />
            <h4 className="font-extrabold uppercase">Email branding signature</h4>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Default Outbound Sender name</label>
              <Input defaultValue="Skyline Luxury Lofts Office" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Signature footer HTML</label>
              <textarea
                className="w-full min-h-[100px] p-2.5 rounded-lg border bg-card text-foreground font-mono"
                defaultValue="Best Regards,&#10;Skyline Lofts Management team&#10;office@skyline-luxury.com"
              />
            </div>
          </div>
        </Card>

        {/* Auto replies */}
        <Card className="p-6 border bg-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b pb-2">
              <MessageSquare className="w-5 h-5 text-primary shrink-0" />
              <h4 className="font-extrabold uppercase">Automated Auto-replies</h4>
            </div>
            <p className="text-muted-foreground mt-3 leading-relaxed">Configure automated SMS or Email responses when tenants submit tickets outside business hours.</p>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
            <Button size="sm" variant="outline" className="text-xs uppercase font-bold" onClick={() => alert('Saved auto-replies preferences.')}>
              Save preferences
            </Button>
          </div>
        </Card>

      </div>
    </div>
  );
};
export default CommSettingsPage;
