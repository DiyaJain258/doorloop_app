import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { GeneralLedgerRecord } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { Button } from '../../components/ui/Button';
import { Download } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const GeneralLedgerPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [accountFilter, setAccountFilter] = useState('');

  // Queries
  const { data: ledger = [], isLoading } = useQuery({ queryKey: ['general-ledger-list'], queryFn: () => api.generalLedger.getAll() });
  const { data: accounts = [] } = useQuery({ queryKey: ['coa-accounts-list'], queryFn: () => api.accounts.getAll() });

  const filteredLedger = ledger.filter((item) => {
    const searchMatch = item.description.toLowerCase().includes(searchQuery.toLowerCase()) || item.reference?.includes(searchQuery);
    const accountMatch = accountFilter === '' || item.accountId === accountFilter;
    return searchMatch && accountMatch;
  });

  const handleExport = () => {
    const headers = 'Date,Account,Description,Reference,Debit,Credit,Balance\n';
    const rows = filteredLedger
      .slice(0, 500)
      .map(
        (g) =>
          `"${g.date}","${g.accountName}","${g.description}","${g.reference || ''}",${g.debit},${g.credit},${g.balance}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'General_Ledger_Audit.csv');
    a.click();
  };

  const columns: ColumnDef<GeneralLedgerRecord>[] = [
    { accessorKey: 'date', header: 'Date', id: 'date' },
    { accessorKey: 'accountName', header: 'Ledger Account', id: 'account' },
    { accessorKey: 'description', header: 'Transaction Description', id: 'description' },
    { accessorKey: 'reference', header: 'Journal Ref', id: 'reference', cell: ({ row }) => <span className="font-mono font-bold text-primary">{row.original.reference || '-'}</span> },
    {
      accessorKey: 'debit',
      header: 'Debit (+)',
      id: 'debit',
      cell: ({ row }) => row.original.debit > 0 ? <span className="text-emerald-500 font-bold">+${row.original.debit.toLocaleString()}</span> : '-',
    },
    {
      accessorKey: 'credit',
      header: 'Credit (-)',
      id: 'credit',
      cell: ({ row }) => row.original.credit > 0 ? <span className="text-rose-500 font-bold">-${row.original.credit.toLocaleString()}</span> : '-',
    },
    {
      accessorKey: 'balance',
      header: 'Running Balance',
      id: 'balance',
      cell: ({ row }) => <span className="font-extrabold text-foreground">${row.original.balance.toLocaleString()}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="General Ledger Ledger"
        description="Verify comprehensive audit ledger trails, debit allocations, and cash flows."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Accounting', href: '/accounting' },
          { label: 'General Ledger' },
        ]}
      />

      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold text-muted-foreground uppercase">
          Ledger contains {filteredLedger.length} Posting Lines
        </span>
        <Button variant="outline" size="sm" onClick={handleExport} className="text-xs font-semibold flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </Button>
      </div>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search general ledger..."
        filters={[
          {
            key: 'account',
            value: accountFilter,
            placeholder: 'Filter by Account',
            options: accounts.slice(0, 30).map((a) => ({ label: a.accountName, value: a.id })),
          },
        ]}
        onFilterChange={(key, val) => {
          if (key === 'account') setAccountFilter(val);
        }}
        onReset={() => {
          setSearchQuery('');
          setAccountFilter('');
        }}
      />

      <DataTable columns={columns} data={filteredLedger.slice(0, 100)} loading={isLoading} />
    </div>
  );
};
export default GeneralLedgerPage;
