import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { RecurringTransaction } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { FormDialog } from '../../components/FormDialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/StatusBadge';
import { CurrencyInput } from '../../components/Phase4Components';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const RecurringTransactionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');
  const [type, setType] = useState<'Expense' | 'Income' | 'Bill'>('Expense');
  const [amount, setAmount] = useState(450);

  // Queries
  const { data: recurring = [], isLoading } = useQuery({ queryKey: ['recurring-list'], queryFn: () => api.recurringTransactions.getAll() });

  const createMutation = useMutation({
    mutationFn: () => {
      return api.recurringTransactions.create({
        name,
        frequency,
        transactionType: type,
        amount,
        startDate: new Date().toISOString().split('T')[0],
        nextRun: new Date().toISOString().split('T')[0],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-list'] });
      setIsOpen(false);
      setName('');
      setAmount(450);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.recurringTransactions.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-list'] });
      setDeleteId(null);
    },
  });

  const filteredRecurring = recurring.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<RecurringTransaction>[] = [
    { accessorKey: 'name', header: 'Template Name', id: 'name', cell: ({ row }) => <span className="font-bold">{row.original.name}</span> },
    {
      accessorKey: 'transactionType',
      header: 'Type',
      id: 'type',
      cell: ({ row }) => <span className="font-bold text-[10px] bg-secondary px-2 py-0.5 rounded-lg border uppercase">{row.original.transactionType}</span>,
    },
    { accessorKey: 'frequency', header: 'Frequency', id: 'frequency' },
    {
      accessorKey: 'amount',
      header: 'Stipulated Amount',
      id: 'amount',
      cell: ({ row }) => <span>${row.original.amount.toLocaleString()}</span>,
    },
    { accessorKey: 'nextRun', header: 'Next Execution', id: 'nextRun' },
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
          <Trash2 className="w-4.5 h-4.5" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Recurring Transactions"
        description="Verify automated monthly utilities invoices, landscaping drafts, or recurring vendor billing."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Accounting', href: '/accounting' },
          { label: 'Recurring' },
        ]}
        action={{
          label: 'Setup Recurring Transaction',
          onClick: () => setIsOpen(true),
          icon: <Plus className="w-4.5 h-4.5" />,
        }}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search templates..."
        onReset={() => setSearchQuery('')}
      />

      <DataTable columns={columns} data={filteredRecurring} loading={isLoading} />

      {/* CREATE DIALOG */}
      <FormDialog open={isOpen} onOpenChange={setIsOpen} title="Setup Recurring Schedule Template">
        <div className="space-y-4 pt-2">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Template Name</label>
            <Input placeholder="E.g., Monthly Elevator Maintenance" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Schedule Frequency</label>
              <Select value={frequency} onChange={(e: any) => setFrequency(e.target.value)}>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Transaction Type</label>
              <Select value={type} onChange={(e: any) => setType(e.target.value)}>
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
                <option value="Bill">Vendor Bill</option>
              </Select>
            </div>
          </div>

          <CurrencyInput
            label="Schedule Amount ($)"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!name || createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Template
            </Button>
          </div>

        </div>
      </FormDialog>
    </div>
  );
};
export default RecurringTransactionsPage;
