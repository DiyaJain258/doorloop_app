import React from 'react';
import { PageHeader } from '../../../components/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Sparkles, Save } from 'lucide-react';

export const PropertiesSettingsPage: React.FC = () => {
  const handleSave = () => {
    alert('Properties configuration defaults saved successfully!');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Properties Settings"
        description="Configure rental policy boundaries, late fee grace periods, and notice delivery templates."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Admin' }, { label: 'Properties Settings' }]}
      />

      <div className="bg-card border border-border p-6 rounded-2xl max-w-2xl space-y-6 shadow-sm">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border pb-2">
          <Sparkles className="w-4 h-4 text-primary" /> Rental Policies & Lease Defaults
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground font-semibold">Default Property Type</label>
            <Select defaultValue="residential">
              <option value="residential">Residential Apartment</option>
              <option value="commercial">Commercial Office</option>
              <option value="storage">Storage Units</option>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground font-semibold">Grace Period (Days)</label>
            <Input type="number" defaultValue="5" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground font-semibold">Late Fee Amount ($)</label>
            <Input type="number" defaultValue="50" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground font-semibold">Default Security Deposit Multiplier</label>
            <Select defaultValue="1.5">
              <option value="1">1x Monthly Rent</option>
              <option value="1.5">1.5x Monthly Rent</option>
              <option value="2">2x Monthly Rent</option>
            </Select>
          </div>
        </div>

        <div className="pt-4 border-t border-border/80 flex justify-end">
          <Button onClick={handleSave} className="bg-primary text-primary-foreground font-semibold flex items-center gap-1.5">
            <Save className="w-4 h-4" /> Save Default Policy
          </Button>
        </div>
      </div>
    </div>
  );
};
export default PropertiesSettingsPage;
