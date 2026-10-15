import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { ColumnDef } from '@tanstack/react-table';

interface RefundItem {
  id: string;
  tenantName: string;
  paymentId: string;
  amount: number;
  method: string;
  status: string;
  date: string;
}

export const RefundsPage: React.FC = () => {
  const { data: refunds = [], isLoading } = useQuery({
    queryKey: ['refunds-list'],
    queryFn: () => api.refunds.getAll(),
  });

  const columns: ColumnDef<RefundItem>[] = [
    { accessorKey: 'id', header: 'Refund Number', id: 'id', cell: ({ row }) => <span className="font-bold">{row.original.id}</span> },
    { accessorKey: 'tenantName', header: 'Resident', id: 'tenant' },
    { accessorKey: 'paymentId', header: 'Associated Receipt ID', id: 'paymentId' },
    {
      accessorKey: 'amount',
      header: 'Refunded Amount',
      id: 'amount',
      cell: ({ row }) => <span className="font-extrabold text-rose-500">${row.original.amount.toLocaleString()}</span>,
    },
    { accessorKey: 'method', header: 'Refund Method', id: 'method' },
    { accessorKey: 'date', header: 'Processing Date', id: 'date' },
    {
      accessorKey: 'status',
      header: 'Status',
      id: 'status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Refunds Ledger"
        description="Verify issued rent reversals, refund processing logs, and payment reversals."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Rent Collection', href: '/rent' },
          { label: 'Refunds' },
        ]}
      />
      <DataTable columns={columns} data={refunds} loading={isLoading} />
    </div>
  );
};
export default RefundsPage;
