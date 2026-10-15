import React from 'react';
import { PageHeader } from '../../../components/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Sparkles, Save } from 'lucide-react';

export const SystemPreferencesPage: React.FC = () => {
  const handleSave = () => {
    alert('System preferences updated!');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Preferences"
        description="Toggle localized language translations, default landing screens, dark themes, and developer feature flags."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Admin' }, { label: 'Preferences' }]}
      />

      <div className="bg-card border border-border p-6 rounded-2xl max-w-2xl space-y-6 shadow-sm">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border pb-2">
          <Sparkles className="w-4 h-4 text-primary" /> Application Customizations
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground font-semibold">Default Language</label>
            <Select defaultValue="en">
              <option value="en">English (US)</option>
              <option value="es">Español (ES)</option>
              <option value="fr">Français (FR)</option>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground font-semibold">Landing Dashboard Route</label>
            <Select defaultValue="executive">
              <option value="executive">Executive Dashboard</option>
              <option value="leasing">Leasing Overview</option>
              <option value="maintenance">Maintenance center</option>
            </Select>
          </div>

          <div className="space-y-2 col-span-1 sm:col-span-2 pt-2 border-t border-border/80">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
              Developer Feature Flags
            </span>
            {[
              { label: 'AI Platform Center', desc: 'Exposes assistant chat terminals and automation builders.' },
              { label: 'Developer Webhooks', desc: 'Allows callbacks to third-party endpoints.' },
            ].map((flag, idx) => (
              <label key={idx} className="flex justify-between items-start cursor-pointer hover:bg-secondary/15 p-2 rounded-lg">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground">{flag.label}</span>
                  <p className="text-[11px] text-muted-foreground font-medium">{flag.desc}</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4 mt-1"
                />
              </label>
            ))}
          </div>
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
export default SystemPreferencesPage;
