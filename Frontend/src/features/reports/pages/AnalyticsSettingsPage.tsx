import React from 'react';
import { PageHeader } from '../../../components/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';

export const AnalyticsSettingsPage: React.FC = () => {
  const handleSave = () => {
    alert('Analytics settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics Settings"
        description="Configure reporting defaults, metrics parameters, and decimal format boundaries."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reports' }, { label: 'Settings' }]}
      />

      <div className="bg-card border border-border p-6 rounded-2xl max-w-2xl space-y-6">
        <h3 className="font-bold text-base text-foreground border-b border-border pb-2">Default Preferences</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Default Landing Dashboard</label>
            <Select defaultValue="executive">
              <option value="executive">Executive Dashboard</option>
              <option value="custom-1">Executive Overview Dashboard</option>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Default Date Range</label>
            <Select defaultValue="ytd">
              <option value="this-month">This Month</option>
              <option value="ytd">Year to Date (YTD)</option>
              <option value="all-time">All Time</option>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Currency Symbol</label>
            <Select defaultValue="usd">
              <option value="usd">USD ($)</option>
              <option value="eur">EUR (€)</option>
              <option value="gbp">GBP (£)</option>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Number Format</label>
            <Select defaultValue="comma">
              <option value="comma">1,234,567.89</option>
              <option value="dot">1.234.567,89</option>
            </Select>
          </div>
        </div>

        <div className="pt-6 border-t border-border flex justify-end">
          <Button onClick={handleSave} className="bg-primary text-primary-foreground font-semibold">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};
export default AnalyticsSettingsPage;
