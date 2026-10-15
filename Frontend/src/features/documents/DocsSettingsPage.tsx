import React from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Save, Shield, Bell, Zap, FileText } from 'lucide-react';

export const DocsSettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 text-foreground max-w-3xl">
      <PageHeader
        title="Document Management Settings"
        description="Configure upload limits, retention policies, notification preferences, and signature providers."
        breadcrumbs={[{ label: 'Documents', href: '/documents' }, { label: 'Settings' }]}
      />

      {/* Upload Settings */}
      <Card className="p-6 border bg-card space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="font-extrabold text-sm uppercase">Upload Configuration</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
          <div className="space-y-1"><label className="text-[10px] text-muted-foreground uppercase font-bold">Max File Size</label><Input defaultValue="50 MB" /></div>
          <div className="space-y-1"><label className="text-[10px] text-muted-foreground uppercase font-bold">Allowed File Types</label><Input defaultValue="PDF, DOCX, XLSX, PNG, JPG" /></div>
          <div className="space-y-1"><label className="text-[10px] text-muted-foreground uppercase font-bold">Total Storage Limit</label><Input defaultValue="100 GB" /></div>
          <div className="space-y-1"><label className="text-[10px] text-muted-foreground uppercase font-bold">Auto-Archive After (Days)</label><Input type="number" defaultValue="365" /></div>
        </div>
      </Card>

      {/* Retention Policy */}
      <Card className="p-6 border bg-card space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <Shield className="w-4 h-4 text-emerald-500" />
          <h3 className="font-extrabold text-sm uppercase">Retention & Security Policies</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
          <div className="space-y-1"><label className="text-[10px] text-muted-foreground uppercase font-bold">Document Retention Period</label><Input defaultValue="7 Years" /></div>
          <div className="space-y-1"><label className="text-[10px] text-muted-foreground uppercase font-bold">Audit Log Retention</label><Input defaultValue="3 Years" /></div>
          <div className="space-y-1"><label className="text-[10px] text-muted-foreground uppercase font-bold">Default Share Link Expiry (Days)</label><Input type="number" defaultValue="30" /></div>
        </div>
      </Card>

      {/* Signature Provider */}
      <Card className="p-6 border bg-card space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <Zap className="w-4 h-4 text-amber-500" />
          <h3 className="font-extrabold text-sm uppercase">Digital Signature Provider</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
          <div className="space-y-1"><label className="text-[10px] text-muted-foreground uppercase font-bold">Provider</label><Input defaultValue="HelloSign (Dropbox Sign)" /></div>
          <div className="space-y-1"><label className="text-[10px] text-muted-foreground uppercase font-bold">API Key</label><Input type="password" defaultValue="hs_api_xxxxxxxxxxxx" /></div>
          <div className="space-y-1"><label className="text-[10px] text-muted-foreground uppercase font-bold">Default Reminder (Days)</label><Input type="number" defaultValue="3" /></div>
          <div className="space-y-1"><label className="text-[10px] text-muted-foreground uppercase font-bold">Default Expiry (Days)</label><Input type="number" defaultValue="14" /></div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6 border bg-card space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <Bell className="w-4 h-4 text-purple-500" />
          <h3 className="font-extrabold text-sm uppercase">Notification Triggers</h3>
        </div>
        <div className="space-y-3 text-xs font-semibold">
          {['Document uploaded', 'Signature request sent', 'Signature completed', 'Document expiring (30 days)', 'Share link created', 'Version conflict detected'].map(trigger => (
            <label key={trigger} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" defaultChecked className="rounded accent-primary" />
              <span className="text-foreground">{trigger}</span>
            </label>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button size="sm" className="flex items-center gap-1.5"><Save className="w-4 h-4" /> Save Settings</Button>
      </div>
    </div>
  );
};
export default DocsSettingsPage;
