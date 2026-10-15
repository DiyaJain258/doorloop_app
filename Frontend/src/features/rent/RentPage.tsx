import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { RentPayment } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/ui/Button';
import { CreditCard, Loader2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const RentPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: rentPayments = [], isLoading } = useQuery({
    queryKey: ['rent-payments'],
    queryFn: () => api.rent.getAll(),
  });

  const payMutation = useMutation({
    mutationFn: (id: string) => api.rent.payRent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rent-payments'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });

  const columns: ColumnDef<RentPayment>[] = [
    { accessorKey: 'tenantName', header: 'Tenant', id: 'tenant', cell: ({ row }) => <span className="font-bold">{row.original.tenantName}</span> },
    { accessorKey: 'propertyName', header: 'Property', id: 'property' },
    { accessorKey: 'unitNumber', header: 'Unit', id: 'unit' },
    { accessorKey: 'dueDate', header: 'Due Date', id: 'dueDate' },
    {
      accessorKey: 'amount',
      header: 'Amount',
      id: 'amount',
      cell: ({ row }) => <span className="font-semibold">${row.original.amount.toLocaleString()}</span>,
    },
    { accessorKey: 'status', header: 'Status', id: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const isUnpaid = row.original.status === 'Unpaid' || row.original.status === 'Overdue';
        return isUnpaid ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => payMutation.mutate(row.original.id)}
            disabled={payMutation.isPending}
            className="text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30"
          >
            {payMutation.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <CreditCard className="w-3 h-3" />
            )}
            Pay Rent
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground italic">Paid on {row.original.paidDate}</span>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Rent Collection"
        description="Monitor tenant invoices, outstanding rent balances, and record manual payments."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Rent Collection' },
        ]}
      />
      <DataTable
        columns={columns}
        data={rentPayments}
        loading={isLoading}
        emptyStateMessage="No rent invoices generated."
      />
    </div>
  );
};
export default RentPage;
