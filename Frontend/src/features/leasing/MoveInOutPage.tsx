import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import { useNavigate } from '@tanstack/react-router';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { Eye, Edit, Trash2, Calendar, ClipboardList, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export const MoveInOutPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>(''); // empty means all

  // Load Move Ins from backend database
  const { data: moveIns = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['moveIns', statusFilter],
    queryFn: () => api.moveIns.getAll(statusFilter),
  });

  const completeMutation = useMutation({
    mutationFn: (moveInId: string) => api.moveIns.complete(moveInId),
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['moveIns'] });
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });

  const statusFilters = [
    { label: 'All Moves', value: '' },
    { label: 'Scheduled', value: 'SCHEDULED' },
    { label: 'Inspection In Progress', value: 'INSPECTION_IN_PROGRESS' },
    { label: 'Inspection Completed', value: 'INSPECTION_COMPLETED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Move In Workflow Registry"
        description="Monitor upcoming tenant move-in schedules, checklist templates, and condition review signoffs."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Leasing', href: '/leasing/move-in' },
          { label: 'Move In Registry' },
        ]}
        action={{
          label: isFetching ? 'Refreshing...' : 'Refresh Registry',
          onClick: () => refetch(),
          icon: <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
        }}
      />

      {/* FILTER TABS */}
      <div className="flex flex-wrap gap-1.5 border-b pb-4">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setStatusFilter(filter.value)}
            className={`text-xs font-extrabold px-3.5 py-2 rounded-xl transition-all ${
              statusFilter === filter.value
                ? 'bg-primary text-white shadow-sm shadow-primary/20 scale-102'
                : 'bg-card border text-muted-foreground hover:text-foreground'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm text-foreground">
        {isLoading ? (
          <div className="py-12 text-center text-xs font-semibold text-muted-foreground">Loading registry entries...</div>
        ) : moveIns.length === 0 ? (
          <div className="py-12 text-center text-xs font-semibold text-muted-foreground space-y-3">
            <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="font-extrabold text-sm text-foreground">No Moves Found</h3>
            <p className="text-[10px] text-muted-foreground max-w-sm mx-auto">Create a lease agreement to schedule and generate a move-in checklist record automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/50 border-b text-muted-foreground font-bold uppercase tracking-wider">
                  <th className="p-4">Resident</th>
                  <th className="p-4">Property</th>
                  <th className="p-4">Unit</th>
                  <th className="p-4">Scheduled Date</th>
                  <th className="p-4">Workflow Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y font-semibold text-foreground">
                {moveIns.map((m: any) => {
                  const lease = m.lease || {};
                  const tenant = lease.tenant || {};
                  const unit = m.unit || {};
                  const property = unit.property || {};
                  
                  const tenantName = tenant.firstName ? `${tenant.firstName} ${tenant.lastName}` : 'Resident';
                  const propertyName = property.name || 'Property';
                  const unitNumber = unit.unitNumber || 'Unit';

                  return (
                    <tr key={m.id} className="hover:bg-accent/40 transition">
                      <td className="p-4 font-bold text-primary">{tenantName}</td>
                      <td className="p-4 font-bold">{propertyName}</td>
                      <td className="p-4">{unitNumber}</td>
                      <td className="p-4 font-mono text-muted-foreground">{new Date(m.scheduledDate).toLocaleDateString()}</td>
                      <td className="p-4">
                        <StatusBadge status={m.status} />
                      </td>
                      <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                        {m.status === 'SCHEDULED' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => completeMutation.mutate(m.id)}
                            disabled={completeMutation.isPending}
                            className="border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 font-bold"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Skip Inspection
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate({ to: `/leasing/move-in/${m.id}` })}
                        >
                          <Eye className="w-4 h-4 mr-1" /> View Workflow
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoveInOutPage;
