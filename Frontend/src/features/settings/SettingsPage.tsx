import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Loader2 } from 'lucide-react';

const settingsSchema = zod.object({
  companyName: zod.string().min(1, 'Company Name is required'),
  contactEmail: zod.string().email('Invalid contact email'),
  currency: zod.string().min(1, 'Currency is required'),
  dateFormat: zod.string().min(1, 'Date Format is required'),
  enableSmsNotifications: zod.boolean(),
  enableEmailNotifications: zod.boolean(),
});

type SettingsFormValues = zod.infer<typeof settingsSchema>;

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.settings.get(),
  });

  const updateMutation = useMutation({
    mutationFn: (values: SettingsFormValues) => api.settings.update(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSuccessMessage('Settings updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    values: settings, // dynamically load queried data
  });

  const onSubmit = (values: SettingsFormValues) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Settings"
        description="Configure agency rules, branding, default dates, and communications notifications."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Settings' },
        ]}
      />

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm font-semibold mb-6 animate-fade-in">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 border border-border rounded-2xl shadow-sm text-foreground">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Company Name</label>
            <Input {...register('companyName')} />
            {errors.companyName && <p className="text-rose-500 text-xs">{errors.companyName.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Contact Email</label>
            <Input type="email" {...register('contactEmail')} />
            {errors.contactEmail && <p className="text-rose-500 text-xs">{errors.contactEmail.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">System Currency</label>
            <Select {...register('currency')}>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Date Format</label>
            <Select {...register('dateFormat')}>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </Select>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h3 className="font-bold text-sm text-foreground uppercase border-b pb-2">Notifications Setup</h3>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enableEmail"
              {...register('enableEmailNotifications')}
              className="rounded border-border text-primary focus:ring-primary h-4 w-4"
            />
            <label htmlFor="enableEmail" className="text-sm font-semibold cursor-pointer">
              Enable dispatch of automated email receipts to tenants
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enableSms"
              {...register('enableSmsNotifications')}
              className="rounded border-border text-primary focus:ring-primary h-4 w-4"
            />
            <label htmlFor="enableSms" className="text-sm font-semibold cursor-pointer">
              Enable SMS notifications for maintenance work assignments
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
export default SettingsPage;
