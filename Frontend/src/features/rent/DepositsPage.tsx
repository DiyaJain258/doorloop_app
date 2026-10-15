import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { SecurityDeposit } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { FormDialog } from '../../components/FormDialog';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/StatusBadge';
import { CurrencyInput } from '../../components/Phase4Components';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Plus, Eye, RefreshCw, Key, ShieldCheck, Loader2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const DepositsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Dialog states
  const [selectedDep, setSelectedDep] = useState<SecurityDeposit | null>(null);
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  
  // Record deposit form states
  const [recordTenantId, setRecordTenantId] = useState('');
  const [recordAmount, setRecordAmount] = useState(1500);

  // Queries
  const { data: deposits = [], isLoading } = useQuery({ queryKey: ['deposits-list'], queryFn: () => api.deposits.getAll() });
  const { data: tenants = [] } = useQuery({ queryKey: ['tenants'], queryFn: () => api.tenant.getAll() });

  const createMutation = useMutation({
    mutationFn: () => {
      const ten = tenants.find((t) => t.id === recordTenantId);
      return api.deposits.create({
        tenantId: recordTenantId,
        tenantName: ten ? `${ten.firstName} ${ten.lastName}` : 'Tenant',
        propertyId: ten?.propertyId || 'prop-1',
        propertyName: ten?.propertyName || 'Property',
        amount: recordAmount,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposits-list'] });
      setIsRecordOpen(false);
      setRecordTenantId('');
    },
  });

  const filteredDeposits = deposits.filter((dep) => {
    const nameMatch = dep.tenantName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === '' || dep.status === statusFilter;
    return nameMatch && matchesStatus;
  });

  const columns: ColumnDef<SecurityDeposit>[] = [
    {
      accessorKey: 'tenantName',
      header: 'Resident',
      id: 'tenant',
      cell: ({ row }) => (
        <span onClick={() => setSelectedDep(row.original)} className="font-bold text-primary hover:underline cursor-pointer">
          {row.original.tenantName}
        </span>
      ),
    },
    { accessorKey: 'propertyName', header: 'Property Preference', id: 'property' },
    {
      accessorKey: 'amount',
      header: 'Deposit Amount',
      id: 'amount',
      cell: ({ row }) => <span className="font-semibold">${row.original.amount.toLocaleString()}</span>,
    },
    {
      accessorKey: 'heldBalance',
      header: 'Held Balance',
      id: 'heldBalance',
      cell: ({ row }) => <span className="font-extrabold text-foreground">${row.original.heldBalance.toLocaleString()}</span>,
    },
    {
      accessorKey: 'refundableAmount',
      header: 'Refundable',
      id: 'refundableAmount',
      cell: ({ row }) => <span className="font-semibold text-emerald-500">${row.original.refundableAmount.toLocaleString()}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      id: 'status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" onClick={() => setSelectedDep(row.original)} title="View Details">
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Security Deposits Escrow"
        description="Verify resident escrow held deposits, refund claims, and forfeit logs."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Rent Collection', href: '/rent' },
          { label: 'Deposits' },
        ]}
        action={{
          label: 'Record Escrow Deposit',
          onClick: () => setIsRecordOpen(true),
          icon: <Plus className="w-4.5 h-4.5" />,
        }}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search deposits by resident name..."
        filters={[
          {
            key: 'status',
            value: statusFilter,
            placeholder: 'All Statuses',
            options: [
              { label: 'Held', value: 'Held' },
              { label: 'Refunded', value: 'Refunded' },
              { label: 'Partially Refunded', value: 'Partially Refunded' },
              { label: 'Forfeited', value: 'Forfeited' },
            ],
          },
        ]}
        onFilterChange={(key, val) => {
          if (key === 'status') setStatusFilter(val);
        }}
        onReset={() => {
          setSearchQuery('');
          setStatusFilter('');
        }}
      />

      <DataTable columns={columns} data={filteredDeposits} loading={isLoading} />

      {/* RECORD DEPOSIT MODAL */}
      <FormDialog open={isRecordOpen} onOpenChange={setIsRecordOpen} title="Record Escrow Deposit">
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Resident / Tenant</label>
            <Select value={recordTenantId} onChange={(e) => setRecordTenantId(e.target.value)}>
              <option value="">Select Resident...</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
              ))}
            </Select>
          </div>

          <CurrencyInput
            label="Security Deposit Held ($)"
            value={recordAmount}
            onChange={(e) => setRecordAmount(Number(e.target.value))}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsRecordOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!recordTenantId || createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Deposit
            </Button>
          </div>
        </div>
      </FormDialog>

      {/* DEPOSIT DETAILS DIALOG */}
      <FormDialog
        open={!!selectedDep}
        onOpenChange={(open) => !open && setSelectedDep(null)}
        title="Deposit Escrow Account"
      >
        {selectedDep && (
          <div className="space-y-6 pt-3 text-xs font-semibold text-foreground">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h4 className="font-extrabold text-sm uppercase">{selectedDep.tenantName}</h4>
                <p className="text-[10px] text-muted-foreground font-bold mt-1">{selectedDep.propertyName}</p>
              </div>
              <StatusBadge status={selectedDep.status} />
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="refunds">Refund Ledger</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-[10px]">Stipulated Amount</p>
                    <p className="text-sm font-extrabold mt-0.5">${selectedDep.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px]">Held Escrow Balance</p>
                    <p className="text-sm font-extrabold mt-0.5">${selectedDep.heldBalance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px]">Refundable Portion</p>
                    <p className="text-sm font-extrabold text-emerald-500 mt-0.5">${selectedDep.refundableAmount.toLocaleString()}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="refunds" className="space-y-2">
                <div className="p-3 bg-secondary/20 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-bold">Initial Deposit Cleared</p>
                    <span className="text-[10px] text-muted-foreground">REF: {selectedDep.id}</span>
                  </div>
                  <span className="font-bold text-emerald-500">+${selectedDep.amount.toLocaleString()}</span>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedDep(null)}>Close</Button>
            </div>
          </div>
        )}
      </FormDialog>
    </div>
  );
};
export default DepositsPage;
