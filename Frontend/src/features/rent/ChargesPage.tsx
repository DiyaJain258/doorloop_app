import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import api from '../../api';
import { Charge } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { FormDialog } from '../../components/FormDialog';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/StatusBadge';
import { CurrencyInput } from '../../components/Phase4Components';
import { Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

const chargeSchema = zod.object({
  tenantId: zod.string().min(1, 'Tenant is required'),
  name: zod.string().min(1, 'Charge Name is required'),
  type: zod.string().min(1, 'Type is required'),
  frequency: zod.enum(['One Time', 'Weekly', 'Monthly', 'Quarterly', 'Annually']),
  amount: zod.number().min(1, 'Amount must be positive'),
});

type ChargeFormValues = zod.infer<typeof chargeSchema>;

export const ChargesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Queries
  const { data: charges = [], isLoading } = useQuery({ queryKey: ['charges-list'], queryFn: () => api.charges.getAll() });
  const { data: tenants = [] } = useQuery({ queryKey: ['tenants'], queryFn: () => api.tenant.getAll() });

  const createMutation = useMutation({
    mutationFn: (newChg: ChargeFormValues) => {
      const ten = tenants.find((t) => t.id === newChg.tenantId);
      return api.charges.create({
        ...newChg,
        tenantName: ten ? `${ten.firstName} ${ten.lastName}` : 'Tenant',
        propertyId: ten?.propertyId || 'prop-1',
        propertyName: ten?.propertyName || 'Property',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charges-list'] });
      setIsFormOpen(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.charges.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charges-list'] });
      setDeleteId(null);
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChargeFormValues>({
    resolver: zodResolver(chargeSchema),
    defaultValues: { frequency: 'Monthly', amount: 150, type: 'Utility' },
  });

  const onSubmit = (values: ChargeFormValues) => {
    createMutation.mutate(values);
  };

  const filteredCharges = charges.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tenantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<Charge>[] = [
    { accessorKey: 'name', header: 'Charge Name', id: 'name', cell: ({ row }) => <span className="font-bold">{row.original.name}</span> },
    { accessorKey: 'tenantName', header: 'Tenant', id: 'tenant' },
    { accessorKey: 'propertyName', header: 'Property', id: 'property' },
    {
      accessorKey: 'frequency',
      header: 'Frequency',
      id: 'frequency',
      cell: ({ row }) => <span className="text-[10px] font-bold bg-secondary/80 px-2 py-0.5 rounded-lg border uppercase">{row.original.frequency}</span>,
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      id: 'amount',
      cell: ({ row }) => <span className="font-extrabold text-foreground">${row.original.amount.toLocaleString()}</span>,
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
        <Button variant="ghost" size="icon" onClick={() => setDeleteId(row.original.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Charges & Assessments"
        description="Verify recurring utilities levies, HOA assessments, and one-time cleaning charges."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Rent Collection', href: '/rent' },
          { label: 'Charges' },
        ]}
        action={{
          label: 'Add Charge',
          onClick: () => setIsFormOpen(true),
          icon: <Plus className="w-4.5 h-4.5" />,
        }}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search charges by name or tenant..."
        onReset={() => setSearchQuery('')}
      />

      <DataTable columns={columns} data={filteredCharges} loading={isLoading} />

      {/* CREATE CHARGE DIALOG */}
      <FormDialog open={isFormOpen} onOpenChange={setIsFormOpen} title="Setup Charge Assessment">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Resident / Tenant</label>
            <Select {...register('tenantId')}>
              <option value="">Select Resident...</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
              ))}
            </Select>
            {errors.tenantId && <p className="text-rose-500 text-xs">{errors.tenantId.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Charge Assessment Name</label>
            <Input placeholder="Parking Slot B Monthly Charge" {...register('name')} />
            {errors.name && <p className="text-rose-500 text-xs">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Charge Type</label>
              <Select {...register('type')}>
                <option value="Rent">Rent</option>
                <option value="Utility">Utility</option>
                <option value="Parking">Parking</option>
                <option value="Pet">Pet</option>
                <option value="Storage">Storage</option>
                <option value="HOA">HOA</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Late Fee">Late Fee</option>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Frequency</label>
              <Select {...register('frequency')}>
                <option value="One Time">One Time</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annually">Annually</option>
              </Select>
            </div>
          </div>

          <CurrencyInput
            label="Assessment Amount ($)"
            {...register('amount', { valueAsNumber: true })}
            error={errors.amount?.message}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Charge
            </Button>
          </div>

        </form>
      </FormDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Charge Assessment"
        description="Are you sure you want to delete this charge? If recurring, it will disable future invoices."
        confirmText="Delete Charge"
        variant="destructive"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
};
export default ChargesPage;
