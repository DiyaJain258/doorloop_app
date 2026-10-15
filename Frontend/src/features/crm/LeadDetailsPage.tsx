import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from '@tanstack/react-router';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { CommunicationPanel } from '../../components/CommunicationPanel';
import { Timeline, TimelineEvent } from '../../components/Timeline';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { 
  ArrowLeft, Calendar, Mail, Phone, DollarSign, 
  Clock, Award, HelpCircle, Loader2 
} from 'lucide-react';

export const LeadDetailsPage: React.FC = () => {
  const { id } = useParams({ from: '/leads/$id' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState('');

  // Queries
  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const all = await api.leasing.getLeads();
      return all.find((l) => l.id === id);
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: (stage: string) => {
      return api.leasing.createLead({ id, status: stage });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      setSuccessMsg(`Stage updated successfully to: ${lead?.status}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    },
  });

  if (isLoading || !lead) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const resolvedName = lead.name || `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unnamed Lead';
  const resolvedProperty = lead.property || lead.propertyName || 'Unknown Property';
  const resolvedBudget = lead.budget !== undefined && lead.budget !== null ? `$${lead.budget.toLocaleString()} / mo` : 'N/A';
  const resolvedSource = lead.source || 'Portal';
  const resolvedAgent = lead.assignedAgent || 'Unassigned';

  const timelineEvents: TimelineEvent[] = [
    { id: '1', title: 'Inquiry Received', description: `Lead registered looking for properties in ${resolvedProperty}.`, time: lead.createdAt.split('T')[0], by: 'System Integration' },
  ];

  return (
    <div className="space-y-6 text-foreground">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/leasing/leads' })}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="text-sm font-semibold text-muted-foreground">Back to Leads Pipeline</span>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm font-semibold mb-6">
          {successMsg}
        </div>
      )}

      {/* HEADER BLOCK */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 pb-6 border-b">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-extrabold tracking-tight">{resolvedName}</h1>
            <StatusBadge status={lead.status} />
          </div>
          <p className="text-sm text-muted-foreground font-semibold">
            Interested Asset: {resolvedProperty} • Contact: {lead.phone} • {lead.email}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => updateStageMutation.mutate('Lost')} className="text-rose-500 hover:bg-rose-500/10 border-rose-500/30">
            Mark Lost
          </Button>
          <Button size="sm" onClick={() => updateStageMutation.mutate('Tour Scheduled')} className="flex items-center gap-1">
            <Calendar className="w-4 h-4" /> Book Viewing
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: COMMUNICATION & DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 space-y-4 border-border">
            <h3 className="font-bold text-base border-b pb-2 uppercase tracking-wide">Lead Overview</h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <p className="text-muted-foreground">Target Budget Range</p>
                <p className="text-foreground mt-0.5">{resolvedBudget}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Lead Source Channel</p>
                <p className="text-foreground mt-0.5">{resolvedSource}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Assigned Leasing Agent</p>
                <p className="text-foreground mt-0.5">{resolvedAgent}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Expected Move-in Date</p>
                <p className="text-foreground mt-0.5">{lead.moveInDate || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created Date</p>
                <p className="text-foreground mt-0.5">{lead.createdAt}</p>
              </div>
              {lead.notes && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Internal Notes</p>
                  <p className="text-foreground mt-0.5 whitespace-pre-wrap font-normal">{lead.notes}</p>
                </div>
              )}
            </div>
          </Card>

          <CommunicationPanel
            entityName={resolvedName}
            initialLogs={[
              { id: '1', type: 'Email', message: `Hi ${resolvedName.split(' ')[0]}, let us know what day is best for a viewing.`, recipientOrAuthor: 'To: Lead', timestamp: 'Just now' },
            ]}
          />
        </div>

        {/* RIGHT COLUMN: HISTORY ACTIVITY */}
        <div className="lg:col-span-1">
          <Card className="p-5 border-border">
            <h3 className="font-bold text-sm uppercase border-b pb-3 mb-4 tracking-wide">Lead Activity Log</h3>
            <Timeline events={timelineEvents} />
          </Card>
        </div>

      </div>
    </div>
  );
};
export default LeadDetailsPage;
