import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { OwnerStatement } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { FormDialog } from '../../components/FormDialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/StatusBadge';
import { CurrencyInput } from '../../components/Phase4Components';
import { Plus, Eye, Loader2, Printer } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const OwnerStatementsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [selectedStatement, setSelectedStatement] = useState<OwnerStatement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [ownerName, setOwnerName] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [income, setIncome] = useState(8500);
  const [expenses, setExpenses] = useState(1200);

  // Queries
  const { data: statements = [], isLoading } = useQuery({ queryKey: ['owner-statements-list'], queryFn: () => api.ownerStatements.getAll() });

  const generateMutation = useMutation({
    mutationFn: () => {
      return api.ownerStatements.generate({
        ownerName,
        propertyName,
        period: 'July 2026',
        income,
        expenses,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-statements-list'] });
      setIsOpen(false);
      setOwnerName('');
      setPropertyName('');
    },
  });

  const filteredStatements = statements.filter((s) =>
    s.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.propertyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<OwnerStatement>[] = [
    {
      accessorKey: 'ownerName',
      header: 'Owner',
      id: 'owner',
      cell: ({ row }) => (
        <span onClick={() => setSelectedStatement(row.original)} className="font-bold text-primary hover:underline cursor-pointer">
          {row.original.ownerName}
        </span>
      ),
    },
    { accessorKey: 'propertyName', header: 'Property Managed', id: 'property' },
    { accessorKey: 'period', header: 'Stipulated Period', id: 'period' },
    {
      accessorKey: 'income',
      header: 'Gross Income',
      id: 'income',
      cell: ({ row }) => <span>${row.original.income.toLocaleString()}</span>,
    },
    {
      accessorKey: 'expenses',
      header: 'Total Expenses',
      id: 'expenses',
      cell: ({ row }) => <span className="text-rose-500 font-semibold">${row.original.expenses.toLocaleString()}</span>,
    },
    {
      accessorKey: 'netDistribution',
      header: 'Net Distribution',
      id: 'netDistribution',
      cell: ({ row }) => <span className="font-extrabold text-emerald-500">${row.original.netDistribution.toLocaleString()}</span>,
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
        <Button variant="ghost" size="icon" onClick={() => setSelectedStatement(row.original)} title="View PDF">
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Owner Financial Statements"
        description="Verify property portfolios profit distributions, net distributions, and period statements."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Accounting', href: '/accounting' },
          { label: 'Owner Statements' },
        ]}
        action={{
          label: 'Generate Statement',
          onClick: () => setIsOpen(true),
          icon: <Plus className="w-4.5 h-4.5" />,
        }}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search owner statements..."
        onReset={() => setSearchQuery('')}
      />

      <DataTable columns={columns} data={filteredStatements.slice(0, 100)} loading={isLoading} />

      {/* CREATE DIALOG */}
      <FormDialog open={isOpen} onOpenChange={setIsOpen} title="Generate Owner Statement">
        <div className="space-y-4 pt-2">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Owner Name</label>
            <Input placeholder="E.g., David Miller Estates" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Property Managed</label>
            <Input placeholder="E.g., Northside Tower A" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CurrencyInput
              label="Gross Income ($)"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
            />
            <CurrencyInput
              label="Total Expenses ($)"
              value={expenses}
              onChange={(e) => setExpenses(Number(e.target.value))}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={() => generateMutation.mutate()} disabled={!ownerName || !propertyName || generateMutation.isPending}>
              {generateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Generate Statement
            </Button>
          </div>

        </div>
      </FormDialog>

      {/* DETAILED STATEMENT SHEET DIALOG */}
      <FormDialog
        open={!!selectedStatement}
        onOpenChange={(open) => !open && setSelectedStatement(null)}
        title="Owner Distribution Statement"
      >
        {selectedStatement && (
          <div className="space-y-6 pt-3 text-xs font-semibold text-foreground">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h4 className="font-extrabold text-sm uppercase">Statement Report</h4>
                <p className="text-[10px] text-muted-foreground font-bold mt-1">Period: {selectedStatement.period}</p>
              </div>
              <StatusBadge status={selectedStatement.status} />
            </div>

            <div className="space-y-1">
              <p className="text-[10px] uppercase text-muted-foreground">Property Owner</p>
              <p className="text-sm font-bold">{selectedStatement.ownerName}</p>
              <p className="text-muted-foreground">Portfolio: {selectedStatement.propertyName}</p>
            </div>

            <div className="space-y-3 pt-3 border-t">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Operating Revenues</span>
                <span>${selectedStatement.income.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b pb-2 text-rose-500">
                <span>Operating Expenditures</span>
                <span>-${selectedStatement.expenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-black">
                <span>Net Distribution Payout</span>
                <span className="text-emerald-500">${selectedStatement.netDistribution.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedStatement(null)}>Close</Button>
              <Button variant="outline" onClick={() => window.print()} className="flex items-center gap-1">
                <Printer className="w-4 h-4" /> Print Statement
              </Button>
            </div>
          </div>
        )}
      </FormDialog>
    </div>
  );
};
export default OwnerStatementsPage;
