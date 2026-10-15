import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { TaxRate } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { FormDialog } from '../../components/FormDialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatusBadge } from '../../components/StatusBadge';
import { Plus, Loader2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const TaxesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog state
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [percentage, setPercentage] = useState(6.25);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);

  // Queries
  const { data: taxes = [], isLoading } = useQuery({ queryKey: ['taxes-list'], queryFn: () => api.taxes.getAll() });

  const createMutation = useMutation({
    mutationFn: () => {
      return api.taxes.create({
        name,
        percentage,
        effectiveDate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes-list'] });
      setIsOpen(false);
      setName('');
      setPercentage(6.25);
    },
  });

  const filteredTaxes = taxes.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<TaxRate>[] = [
    { accessorKey: 'name', header: 'Tax Name', id: 'name', cell: ({ row }) => <span className="font-bold">{row.original.name}</span> },
    { accessorKey: 'percentage', header: 'Rate Percentage', id: 'rate', cell: ({ row }) => <span>{row.original.percentage}%</span> },
    { accessorKey: 'effectiveDate', header: 'Effective Date', id: 'date' },
    {
      accessorKey: 'status',
      header: 'Status',
      id: 'status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tax Categories & Rates"
        description="Verify state tax rates, municipal tax levies, and transaction tax brackets."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Accounting', href: '/accounting' },
          { label: 'Taxes' },
        ]}
        action={{
          label: 'Setup Tax Rate',
          onClick: () => setIsOpen(true),
          icon: <Plus className="w-4.5 h-4.5" />,
        }}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search tax names..."
        onReset={() => setSearchQuery('')}
      />

      <DataTable columns={columns} data={filteredTaxes} loading={isLoading} />

      {/* CREATE DIALOG */}
      <FormDialog open={isOpen} onOpenChange={setIsOpen} title="Setup Tax Rate Definition">
        <div className="space-y-4 pt-2">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Tax Levy Label</label>
            <Input placeholder="E.g., State Sales Payout Tax" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Rate Percentage (%)</label>
              <Input type="number" step="0.01" value={percentage} onChange={(e) => setPercentage(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Effective Date</label>
              <Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!name || createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Tax Rate
            </Button>
          </div>

        </div>
      </FormDialog>
    </div>
  );
};
export default TaxesPage;
