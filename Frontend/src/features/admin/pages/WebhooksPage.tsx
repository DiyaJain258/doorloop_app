import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api';
import { PageHeader } from '../../../components/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Sparkles, Plus, Layers } from 'lucide-react';

const EVENTS = [
  'Payment Received', 'Tenant Created', 'Property Created', 'Lease Signed', 'Maintenance Completed', 'Document Uploaded'
];

export const WebhooksPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [endpoint, setEndpoint] = useState('');
  const [event, setEvent] = useState(EVENTS[0]);

  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ['admin-webhooks-list'],
    queryFn: () => api.webhooks.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (newHook: any) => api.webhooks.create(newHook),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-webhooks-list'] });
      setEndpoint('');
      alert('Webhook subscription deployed!');
    },
  });

  const handleCreate = () => {
    if (!endpoint.trim()) {
      alert('Please enter a target endpoint URL.');
      return;
    }
    createMutation.mutate({ endpoint, event });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Webhooks"
        description="Deploy callback endpoint URLs to receive instant HTTP post notifications for payment events or occupant additions."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Admin' }, { label: 'Webhooks' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Webhooks list */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border bg-muted/10">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-primary" /> Registered Webhooks
              </h3>
            </div>

            {isLoading ? (
              <div className="p-5 text-xs text-muted-foreground">Loading endpoints...</div>
            ) : (
              <div className="divide-y divide-border">
                {webhooks.map((item) => (
                  <div key={item.id} className="p-4 space-y-2 hover:bg-secondary/10 transition text-xs font-semibold">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground truncate pr-4">{item.endpoint}</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded uppercase">
                        {item.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                      <span>Event: {item.event}</span>
                      <span>Secret: {item.secret}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Create Webhook Form */}
        <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm h-fit">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border pb-2">
            <Sparkles className="w-4 h-4 text-primary" /> Create Webhook
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Target Endpoint URL</label>
            <Input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="https://api.thirdparty.com/events" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Notification Event</label>
            <Select value={event} onChange={(e) => setEvent(e.target.value)}>
              {EVENTS.map((ev) => (
                <option key={ev} value={ev}>
                  {ev}
                </option>
              ))}
            </Select>
          </div>

          <Button onClick={handleCreate} className="w-full bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-1">
            <Plus className="w-4 h-4" /> Subscribe Webhook
          </Button>
        </div>
      </div>
    </div>
  );
};
export default WebhooksPage;
