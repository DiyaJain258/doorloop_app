import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { CampaignCard } from '../../components/CommunicationComponents';
import { FormDialog } from '../../components/FormDialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Plus, Loader2 } from 'lucide-react';

export const CommCampaignsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<'Email' | 'SMS' | 'Mixed'>('Email');
  const [audience, setAudience] = useState('All Tenants');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  // Queries
  const { data: campaigns = [], isLoading } = useQuery({ queryKey: ['comm-campaigns-list'], queryFn: () => api.campaigns.getAll() });

  const createMutation = useMutation({
    mutationFn: () => {
      return api.campaigns.create({
        name,
        type,
        audience,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comm-campaigns-list'] });
      setIsOpen(false);
      setWizardStep(1);
      setName('');
      setSubject('');
      setContent('');
    },
  });

  if (isLoading) {
    return <LoadingSkeleton type="card" />;
  }

  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title="Mixed Marketing Campaigns"
        description="Verify active email/SMS campaigns, open rates metrics, click rates, or schedule new dispatches."
        breadcrumbs={[
          { label: 'Home', href: '/communication' },
          { label: 'Campaigns' },
        ]}
        action={{
          label: 'Create Campaign',
          onClick: () => setIsOpen(true),
          icon: <Plus className="w-4.5 h-4.5" />,
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((camp) => (
          <CampaignCard
            key={camp.id}
            name={camp.name}
            type={camp.type}
            audience={camp.audience}
            sentCount={camp.sentCount}
            openRate={camp.openRate}
            clickRate={camp.clickRate}
            status={camp.status}
          />
        ))}
      </div>

      {/* 5-STEP CAMPAIGN WIZARD */}
      <FormDialog open={isOpen} onOpenChange={setIsOpen} title={`Create Campaign Wizard (Step ${wizardStep} of 5)`}>
        <div className="space-y-4 pt-2 text-xs font-semibold text-foreground">
          
          {wizardStep === 1 && (
            <div className="space-y-4">
              <p className="text-muted-foreground font-medium">Step 1: Set campaign name and communication channel type.</p>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Campaign Name</label>
                <Input placeholder="E.g., Winter lease renewals promo" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Channel Type</label>
                <Select value={type} onChange={(e: any) => setType(e.target.value)}>
                  <option value="Email">Email Outbound only</option>
                  <option value="SMS">SMS Notice alerts</option>
                  <option value="Mixed">Mixed (Email + SMS follow-up)</option>
                </Select>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-4">
              <p className="text-muted-foreground font-medium">Step 2: Filter recipient target audience group.</p>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Recipient Audience Group</label>
                <Select value={audience} onChange={(e: any) => setAudience(e.target.value)}>
                  <option value="All Tenants">All Tenants Residents</option>
                  <option value="Owners">Portfolio Owners</option>
                  <option value="Vendors">Registered Contractors</option>
                </Select>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-4">
              <p className="text-muted-foreground font-medium">Step 3: Define dispatch subject and body content.</p>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Campaign Subject / SMS Hook</label>
                <Input placeholder="E.g., Lock in your low rate" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Rich content body</label>
                <textarea
                  className="w-full min-h-[100px] p-3 rounded-xl border bg-card text-foreground font-semibold"
                  placeholder="Enter notice content details..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>
          )}

          {wizardStep === 4 && (
            <div className="space-y-4">
              <p className="text-muted-foreground font-medium">Step 4: Configure dispatch date schedule.</p>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Release Date</label>
                <Input type="date" defaultValue="2026-08-01" />
              </div>
            </div>
          )}

          {wizardStep === 5 && (
            <div className="space-y-4">
              <p className="text-muted-foreground font-medium">Step 5: Review settings and dispatch campaign.</p>
              <div className="space-y-2 bg-secondary/15 p-3 rounded-xl border">
                <p><strong>Name:</strong> {name}</p>
                <p><strong>Channel:</strong> {type}</p>
                <p><strong>Audience:</strong> {audience}</p>
                <p><strong>Subject:</strong> {subject}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            {wizardStep > 1 ? (
              <Button variant="outline" onClick={() => setWizardStep(prev => prev - 1)}>Back</Button>
            ) : (
              <div />
            )}
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => { setIsOpen(false); setWizardStep(1); }}>Cancel</Button>
              {wizardStep < 5 ? (
                <Button onClick={() => setWizardStep(prev => prev + 1)}>Continue</Button>
              ) : (
                <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Launch Campaign
                </Button>
              )}
            </div>
          </div>

        </div>
      </FormDialog>
    </div>
  );
};
export default CommCampaignsPage;
