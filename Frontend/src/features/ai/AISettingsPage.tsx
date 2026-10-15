import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/ui/Button';
import { Sparkles, Shield, Clock } from 'lucide-react';

const settingsSchema = z.object({
  enableAssistant: z.boolean(),
  allowHistory: z.boolean(),
  retention: z.enum(['30 Days', '90 Days', '180 Days', 'Forever']),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export const AISettingsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: initialSettings, isLoading } = useQuery({
    queryKey: ['ai-settings'],
    queryFn: () => api.aiSettings.getSettings(),
  });

  const updateMutation = useMutation({
    mutationFn: (values: SettingsFormValues) => api.aiSettings.updateSettings(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-settings'] });
      alert('AI preferences updated successfully!');
    },
  });

  const { register, handleSubmit, reset, setValue, watch } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      enableAssistant: true,
      allowHistory: true,
      retention: '90 Days',
    },
  });

  React.useEffect(() => {
    if (initialSettings) {
      reset(initialSettings as SettingsFormValues);
    }
  }, [initialSettings, reset]);

  const onSubmit = (values: SettingsFormValues) => {
    updateMutation.mutate(values);
  };

  const handleReset = () => {
    if (initialSettings) {
      reset(initialSettings as SettingsFormValues);
    } else {
      reset({
        enableAssistant: true,
        allowHistory: true,
        retention: '90 Days',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-xs text-muted-foreground font-semibold">
        Loading settings...
      </div>
    );
  }

  const enableAssistant = watch('enableAssistant');
  const allowHistory = watch('allowHistory');

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Assistant Settings"
        description="Manage your preferences, data privacy limits, and conversation logs policies for the AI Copilot."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'AI Center' }, { label: 'Settings' }]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="bg-card border border-border p-6 rounded-2xl max-w-2xl space-y-6 shadow-sm">
        {/* General Settings */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border pb-2">
            <Sparkles className="w-4 h-4 text-primary" /> General Preferences
          </h3>
          <div className="flex justify-between items-center py-1">
            <div className="space-y-0.5">
              <label className="text-xs font-extrabold text-foreground">Enable AI Assistant</label>
              <p className="text-[10px] text-muted-foreground font-medium">Allow the AI Assistant chatbot interface to load in operations dashboard.</p>
            </div>
            <button
              type="button"
              onClick={() => setValue('enableAssistant', !enableAssistant)}
              className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${enableAssistant ? 'bg-primary justify-end' : 'bg-muted justify-start'}`}
            >
              <div className="bg-white w-3 h-3 rounded-full shadow-md" />
            </button>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border pb-2">
            <Shield className="w-4 h-4 text-primary" /> Data Privacy & Access
          </h3>
          <div className="flex justify-between items-center py-1">
            <div className="space-y-0.5">
              <label className="text-xs font-extrabold text-foreground">Allow Conversation History</label>
              <p className="text-[10px] text-muted-foreground font-medium">Store previous conversations and chats for future manager reference.</p>
            </div>
            <button
              type="button"
              onClick={() => setValue('allowHistory', !allowHistory)}
              className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors ${allowHistory ? 'bg-primary justify-end' : 'bg-muted justify-start'}`}
            >
              <div className="bg-white w-3 h-3 rounded-full shadow-md" />
            </button>
          </div>
        </div>

        {/* History / Retention */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border pb-2">
            <Clock className="w-4 h-4 text-primary" /> Log Retention Policies
          </h3>
          <div className="space-y-1 max-w-xs text-xs">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Conversation Retention Duration</label>
            <select
              {...register('retention')}
              className="w-full p-2.5 rounded border bg-secondary font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="30 Days">30 Days</option>
              <option value="90 Days">90 Days</option>
              <option value="180 Days">180 Days</option>
              <option value="Forever">Forever</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-border flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={handleReset} className="font-semibold text-xs">
            Reset
          </Button>
          <Button type="submit" className="bg-primary text-primary-foreground font-semibold text-xs">
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AISettingsPage;
