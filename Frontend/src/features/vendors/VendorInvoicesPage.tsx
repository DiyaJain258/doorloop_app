import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { VendorInvoice } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { FormDialog } from '../../components/FormDialog';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { Check, X } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const VendorInvoicesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Dialog state
  const [selectedInvoice, setSelectedInvoice] = useState<VendorInvoice | null>(null);

  // Queries
  const { data: invoices = [], isLoading } = useQuery({ queryKey: ['vendor-invoices-list'], queryFn: () => api.vendorInvoices.getAll() });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.vendorInvoices.update(id, { status: 'Approved' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-invoices-list'] });
      setSelectedInvoice(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.vendorInvoices.update(id, { status: 'Rejected' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-invoices-list'] });
      setSelectedInvoice(null);
    },
  });

  const filteredInvoices = invoices.filter((i) => {
    const searchMatch = i.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) || i.invoiceNumber.includes(searchQuery);
    const statusMatch = statusFilter === '' || i.status === statusFilter;
    return searchMatch && statusMatch;
  });

  const columns: ColumnDef<VendorInvoice>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice Number',
      id: 'number',
      cell: ({ row }) => (
        <span onClick={() => setSelectedInvoice(row.original)} className="font-bold text-primary hover:underline cursor-pointer">
          {row.original.invoiceNumber}
        </span>
      ),
    },
    { accessorKey: 'vendorName', header: 'Vendor Partner', id: 'vendor' },
    { accessorKey: 'workOrderNumber', header: 'Work Order Ref', id: 'woRef', cell: ({ row }) => <span className="font-mono">{row.original.workOrderNumber}</span> },
    { accessorKey: 'propertyName', header: 'Property Location', id: 'property' },
    {
      accessorKey: 'amount',
      header: 'Amount Due',
      id: 'amount',
      cell: ({ row }) => <span className="font-semibold">${row.original.amount.toLocaleString()}</span>,
    },
    { accessorKey: 'dueDate', header: 'Due Date', id: 'dueDate' },
    {
      accessorKey: 'status',
      header: 'Status',
      id: 'status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Approval Action',
      cell: ({ row }) => {
        if (row.original.status === 'Pending' || row.original.status === 'Draft') {
          return (
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => approveMutation.mutate(row.original.id)}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                className="text-emerald-500 hover:bg-emerald-500/10 h-8 w-8"
                title="Approve Invoice"
              >
                <Check className="w-4.5 h-4.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => rejectMutation.mutate(row.original.id)}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                className="text-rose-500 hover:bg-rose-500/10 h-8 w-8"
                title="Reject Invoice"
              >
                <X className="w-4.5 h-4.5" />
              </Button>
            </div>
          );
        }
        return <span className="text-xs text-muted-foreground font-semibold">Audited</span>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Vendor Invoices & Bills"
        description="Verify pending contractor payments, scheduled maintenance bills, and billing statements."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Maintenance', href: '/maintenance' },
          { label: 'Vendor Invoices' },
        ]}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search invoices by number or contractor..."
        filters={[
          {
            key: 'status',
            value: statusFilter,
            placeholder: 'All Statuses',
            options: [
              { label: 'Draft', value: 'Draft' },
              { label: 'Pending', value: 'Pending' },
              { label: 'Approved', value: 'Approved' },
              { label: 'Paid', value: 'Paid' },
              { label: 'Rejected', value: 'Rejected' },
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

      <DataTable columns={columns} data={filteredInvoices.slice(0, 100)} loading={isLoading} />

      {/* DETAIL DIALOG */}
      <FormDialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)} title="Vendor Invoice Details">
        {selectedInvoice && (
          <div className="space-y-4 pt-2 text-xs font-semibold text-foreground">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-extrabold text-sm uppercase">{selectedInvoice.invoiceNumber}</p>
                <p className="text-muted-foreground">Vendor: {selectedInvoice.vendorName}</p>
              </div>
              <StatusBadge status={selectedInvoice.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-[10px]">Stipulated Amount</p>
                <p className="font-extrabold text-sm">${selectedInvoice.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px]">Due Date</p>
                <p className="font-extrabold">{selectedInvoice.dueDate}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedInvoice(null)} disabled={approveMutation.isPending}>Close</Button>
              {selectedInvoice.status !== 'Paid' && selectedInvoice.status !== 'Approved' && (
                <Button onClick={() => approveMutation.mutate(selectedInvoice.id)} loading={approveMutation.isPending}>Approve Invoice</Button>
              )}
            </div>
          </div>
        )}
      </FormDialog>
    </div>
  );
};
export default VendorInvoicesPage;
