import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { VendorBill } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { FormDialog } from '../../components/FormDialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatusBadge } from '../../components/StatusBadge';
import { CurrencyInput } from '../../components/Phase4Components';
import { Plus, Eye, Loader2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const VendorBillsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Dialog state
  const [selectedBill, setSelectedBill] = useState<VendorBill | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [vendorName, setVendorName] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState(650);

  // Queries
  const { data: bills = [], isLoading } = useQuery({ queryKey: ['bills-list'], queryFn: () => api.vendorBills.getAll() });

  const createMutation = useMutation({
    mutationFn: () => {
      return api.vendorBills.create({
        billNumber: `BILL-${100000 + bills.length + 1}`,
        vendorName,
        dueDate,
        amount,
        lineItems: [
          { description: 'Supplies Supplier Deliveries', amount: amount * 0.4 },
          { description: 'On-site Technician Hours', amount: amount * 0.6 },
        ]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills-list'] });
      setIsCreateOpen(false);
      setVendorName('');
      setAmount(650);
    },
  });

  const filteredBills = bills.filter((b) => {
    const searchMatch = b.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) || b.billNumber.includes(searchQuery);
    const statusMatch = statusFilter === '' || b.status === statusFilter;
    return searchMatch && statusMatch;
  });

  const columns: ColumnDef<VendorBill>[] = [
    {
      accessorKey: 'billNumber',
      header: 'Bill Number',
      id: 'billNumber',
      cell: ({ row }) => (
        <span onClick={() => setSelectedBill(row.original)} className="font-bold text-primary hover:underline cursor-pointer">
          {row.original.billNumber}
        </span>
      ),
    },
    { accessorKey: 'vendorName', header: 'Vendor / Partner', id: 'vendor' },
    { accessorKey: 'dueDate', header: 'Due Date', id: 'dueDate' },
    {
      accessorKey: 'amount',
      header: 'Bill Amount',
      id: 'amount',
      cell: ({ row }) => <span className="font-semibold">${row.original.amount.toLocaleString()}</span>,
    },
    {
      accessorKey: 'balance',
      header: 'Outstanding Balance',
      id: 'balance',
      cell: ({ row }) => (
        <span className={row.original.balance > 0 ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>
          ${row.original.balance.toLocaleString()}
        </span>
      ),
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
        <Button variant="ghost" size="icon" onClick={() => setSelectedBill(row.original)} title="View Details">
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Vendor Invoices & Bills"
        description="Verify pending contractor payments, scheduled labor invoice claims, and past due bills."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Accounting', href: '/accounting' },
          { label: 'Vendor Bills' },
        ]}
        action={{
          label: 'Record Vendor Bill',
          onClick: () => setIsCreateOpen(true),
          icon: <Plus className="w-4.5 h-4.5" />,
        }}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search bills by vendor name or NO..."
        filters={[
          {
            key: 'status',
            value: statusFilter,
            placeholder: 'All Statuses',
            options: [
              { label: 'Draft', value: 'Draft' },
              { label: 'Approved', value: 'Approved' },
              { label: 'Paid', value: 'Paid' },
              { label: 'Overdue', value: 'Overdue' },
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

      <DataTable columns={columns} data={filteredBills.slice(0, 100)} loading={isLoading} />

      {/* CREATE BILL DIALOG */}
      <FormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} title="Record Vendor Bill">
        <div className="space-y-4 pt-2">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Vendor / Partner</label>
            <Input placeholder="E.g., Northside Electrics" value={vendorName} onChange={(e) => setVendorName(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Due Date</label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <CurrencyInput
            label="Invoiced Amount ($)"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!vendorName || createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Bill
            </Button>
          </div>

        </div>
      </FormDialog>

      {/* BILL DETAILS DIALOG */}
      <FormDialog open={!!selectedBill} onOpenChange={(open) => !open && setSelectedBill(null)} title="Vendor Invoice Details">
        {selectedBill && (
          <div className="space-y-4 pt-2 text-xs font-semibold text-foreground">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-extrabold text-sm uppercase">{selectedBill.billNumber}</p>
                <p className="text-muted-foreground">Vendor: {selectedBill.vendorName}</p>
              </div>
              <StatusBadge status={selectedBill.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-[10px]">Stipulated Amount</p>
                <p className="font-extrabold">${selectedBill.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px]">Due Date</p>
                <p className="font-extrabold">{selectedBill.dueDate}</p>
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <p className="text-[10px] uppercase text-muted-foreground">Line Items</p>
              <div className="divide-y border rounded-xl overflow-hidden bg-secondary/10">
                {(selectedBill.lineItems || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between p-3">
                    <span>{item.description}</span>
                    <span className="font-bold">${(item.amount || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedBill(null)}>Close</Button>
            </div>
          </div>
        )}
      </FormDialog>
    </div>
  );
};
export default VendorBillsPage;
