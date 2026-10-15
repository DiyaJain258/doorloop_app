import React from 'react';
import { PageHeader } from '../../../components/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Sparkles, Save } from 'lucide-react';

export const FinancialSettingsPage: React.FC = () => {
  const handleSave = () => {
    alert('Financial ledger configuration settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Settings"
        description="Configure tax rates, invoice number prefixes, fiscal period definitions, and default payment terms."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Admin' }, { label: 'Financial Settings' }]}
      />

      <div className="bg-card border border-border p-6 rounded-2xl max-w-2xl space-y-6 shadow-sm">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border pb-2">
          <Sparkles className="w-4 h-4 text-primary" /> Corporate Financial Policies
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground font-semibold">Invoice Number Format</label>
            <Input defaultValue="INV-YYYY-XXXX" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground font-semibold">Standard Tax Rate (%)</label>
            <Input type="number" defaultValue="8.25" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground font-semibold">Payment Terms (Days)</label>
            <Select defaultValue="net30">
              <option value="due">Due upon Receipt</option>
              <option value="net15">Net 15</option>
              <option value="net30">Net 30</option>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground font-semibold">Accounting Period Mode</label>
            <Select defaultValue="calendar">
              <option value="calendar">Standard Calendar Year</option>
              <option value="fiscal">Custom Fiscal Cycle</option>
            </Select>
          </div>
        </div>

        <div className="pt-4 border-t border-border/80 flex justify-end">
          <Button onClick={handleSave} className="bg-primary text-primary-foreground font-semibold flex items-center gap-1.5">
            <Save className="w-4 h-4" /> Save Financial Parameters
          </Button>
        </div>
      </div>
    </div>
  );
};
export default FinancialSettingsPage;
