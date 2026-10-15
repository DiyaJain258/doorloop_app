import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { Plus, Edit, Trash2, Mail, Check, X, Loader2 } from 'lucide-react';

interface RenewalLog {
  id: string;
  leaseId: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  currentRent: number;
  newRent: number;
  expirationDate: string;
  newEndDate: string;
  termMonths: number;
  status: 'PENDING' | 'OFFER_SENT' | 'ACCEPTED' | 'REJECTED';
}

export const RenewalsPage: React.FC = () => {
  // Load Renewals from backend database
  const { data: rawRenewals = [], refetch, isLoading } = useQuery({
    queryKey: ['renewals'],
    queryFn: () => api.renewals.getAll(),
  });

  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingLeaseId, setEditingLeaseId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ newRentAmount: 0, termMonths: 12 });
  const [msg, setMsg] = React.useState('');

  // Map database renewals dynamically
  const renewals: RenewalLog[] = React.useMemo(() => {
    const list: RenewalLog[] = rawRenewals.map((r: any) => ({
      id: r.id,
      leaseId: r.leaseId,
      tenantName: r.lease?.tenant ? `${r.lease.tenant.firstName} ${r.lease.tenant.lastName}` : 'Resident',
      propertyName: r.lease?.property?.name || 'Property',
      unitNumber: r.lease?.unit?.unitNumber || 'Unit',
      currentRent: r.lease?.rentAmount || 0,
      newRent: r.newRentAmount,
      expirationDate: r.lease?.endDate ? r.lease.endDate.split('T')[0] : 'N/A',
      newEndDate: r.newEndDate ? r.newEndDate.split('T')[0] : 'N/A',
      termMonths: r.termMonths || 12,
      status: r.status,
    }));

    return list;
  }, [rawRenewals]);

  // Mutations
  const sendOfferMutation = useMutation({
    mutationFn: (leaseId: string) => api.renewals.sendOffer(leaseId),
    onSuccess: () => {
      refetch();
      setMsg('Renewal proposal terms dispatched to tenant successfully.');
      setTimeout(() => setMsg(''), 3000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ leaseId, data }: { leaseId: string; data: any }) => api.renewals.update(leaseId, data),
    onSuccess: () => {
      refetch();
      setMsg('Renewal proposal terms updated successfully.');
      setTimeout(() => setMsg(''), 3000);
      setShowForm(false);
      setEditingId(null);
      setEditingLeaseId(null);
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (leaseId: string) => api.renewals.accept(leaseId),
    onSuccess: () => {
      refetch();
      setMsg('Renewal agreement signed! A new active lease has been created.');
      setTimeout(() => setMsg(''), 3000);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (leaseId: string) => api.renewals.reject(leaseId),
    onSuccess: () => {
      refetch();
      setMsg('Renewal rejected. Tenant Move-out has been scheduled.');
      setTimeout(() => setMsg(''), 3000);
    },
  });

  const handleEdit = (r: RenewalLog) => {
    setEditingId(r.id);
    setEditingLeaseId(r.leaseId);
    setForm({
      newRentAmount: r.newRent,
      termMonths: r.termMonths,
    });
    setShowForm(true);
  };

  const handleSaveEdit = () => {
    if (!editingLeaseId) return;
    if (editingLeaseId.startsWith('lease-')) {
      setMsg('Renewal proposed terms updated locally (Mock).');
      setTimeout(() => setMsg(''), 3000);
      setShowForm(false);
      setEditingId(null);
      setEditingLeaseId(null);
      return;
    }
    updateMutation.mutate({
      leaseId: editingLeaseId,
      data: {
        newRentAmount: form.newRentAmount,
        termMonths: form.termMonths,
      }
    });
  };

  const handleSendOffer = (leaseId: string, tenantName: string) => {
    if (leaseId.startsWith('lease-')) {
      setMsg(`Renewal proposal terms dispatched to ${tenantName} (Mock).`);
      setTimeout(() => setMsg(''), 3000);
      return;
    }
    sendOfferMutation.mutate(leaseId);
  };

  const handleAccept = (leaseId: string, tenantName: string) => {
    if (leaseId.startsWith('lease-')) {
      setMsg(`Renewal proposal accepted for ${tenantName} (Mock).`);
      setTimeout(() => setMsg(''), 3000);
      return;
    }
    acceptMutation.mutate(leaseId);
  };

  const handleReject = (leaseId: string, tenantName: string) => {
    if (leaseId.startsWith('lease-')) {
      setMsg(`Renewal proposal rejected for ${tenantName}. Move-out scheduled (Mock).`);
      setTimeout(() => setMsg(''), 3000);
      return;
    }
    rejectMutation.mutate(leaseId);
  };

  const mapStatusLabel = (status: RenewalLog['status']) => {
    switch (status) {
      case 'PENDING':
        return 'Pending Offer';
      case 'OFFER_SENT':
        return 'Sent';
      case 'ACCEPTED':
        return 'Accepted';
      case 'REJECTED':
        return 'Declined';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lease Renewals Directory"
        description="Verify upcoming expirations, dispatch proposal rates, and track acceptances."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Leasing', href: '/leasing/leases' },
          { label: 'Renewals' },
        ]}
      />

      {msg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm font-semibold mb-6 flex items-center space-x-2">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {showForm && (
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4 max-w-xl text-foreground">
          <h2 className="text-sm font-extrabold uppercase tracking-wide border-b pb-2">
            Modify Proposed Renewal Terms
          </h2>
          <p className="text-xs text-muted-foreground">Note: Offers can be customized here before dispatching to the tenant.</p>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Proposed Rent ($)</label>
              <input 
                type="number"
                required 
                value={form.newRentAmount} 
                onChange={e => setForm(prev => ({ ...prev, newRentAmount: Number(e.target.value) }))}
                className="w-full p-2.5 rounded border bg-secondary text-xs font-semibold" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Proposed Term / Duration</label>
              <select 
                value={form.termMonths} 
                onChange={e => setForm(prev => ({ ...prev, termMonths: Number(e.target.value) }))}
                className="w-full p-2.5 rounded border bg-secondary text-xs font-semibold focus:outline-none"
              >
                <option value={3}>3 Months</option>
                <option value={6}>6 Months</option>
                <option value={9}>9 Months</option>
                <option value={12}>12 Months (1 Year)</option>
              </select>
            </div>
          </div>
          <div className="border-t pt-4 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); setEditingLeaseId(null); }}>Cancel</Button>
            <Button type="button" onClick={handleSaveEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>
      )}

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/50 border-b text-muted-foreground font-bold uppercase tracking-wider">
                <th className="p-4">Resident</th>
                <th className="p-4">Property Location</th>
                <th className="p-4">Unit #</th>
                <th className="p-4">Current Rent</th>
                <th className="p-4">Proposed Rent</th>
                <th className="p-4">Term Duration</th>
                <th className="p-4">Lease Expiration</th>
                <th className="p-4">Renewal Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y font-medium text-foreground">
              {isLoading && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading upcoming renewals...
                  </td>
                </tr>
              )}
              {!isLoading && renewals.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">No upcoming lease expirations found.</td>
                </tr>
              )}
              {renewals.map((r) => (
                <tr key={r.id} className="hover:bg-accent/40 transition">
                  <td className="p-4 font-bold text-primary">{r.tenantName}</td>
                  <td className="p-4 font-bold">{r.propertyName}</td>
                  <td className="p-4">Unit {r.unitNumber}</td>
                  <td className="p-4 text-muted-foreground font-semibold">${r.currentRent}</td>
                  <td className="p-4 text-emerald-500 font-extrabold">${r.newRent}</td>
                  <td className="p-4 font-bold text-foreground/80">{r.termMonths} Months</td>
                  <td className="p-4 font-mono text-muted-foreground">{r.expirationDate}</td>
                  <td className="p-4">
                    <StatusBadge status={mapStatusLabel(r.status)} />
                  </td>
                  <td className="p-4 text-center space-x-1 whitespace-nowrap">
                    {r.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendOffer(r.leaseId, r.tenantName)}
                        className="text-[10px] font-extrabold py-1 px-2 h-7 inline-flex items-center gap-1 bg-primary/5 border-primary/20 hover:bg-primary/10"
                        disabled={sendOfferMutation.isPending}
                      >
                        <Mail className="w-3.5 h-3.5" /> Send Offer
                      </Button>
                    )}
                    {r.status === 'OFFER_SENT' && (
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAccept(r.leaseId, r.tenantName)}
                          className="text-[10px] font-extrabold py-1 px-2 h-7 inline-flex items-center gap-1 bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                          disabled={acceptMutation.isPending}
                        >
                          <Check className="w-3.5 h-3.5" /> Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(r.leaseId, r.tenantName)}
                          className="text-[10px] font-extrabold py-1 px-2 h-7 inline-flex items-center gap-1 bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                          disabled={rejectMutation.isPending}
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </Button>
                      </div>
                    )}
                    {r.status === 'ACCEPTED' && (
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 py-1 px-2 rounded border border-emerald-500/20">Renewed</span>
                    )}
                    {r.status === 'REJECTED' && (
                      <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 py-1 px-2 rounded border border-rose-500/20">Scheduled Vacate</span>
                    )}
                    {r.status === 'PENDING' && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(r)}><Edit className="w-3.5 h-3.5" /></Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RenewalsPage;
