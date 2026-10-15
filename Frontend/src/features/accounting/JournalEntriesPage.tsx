import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { JournalEntry } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { FormDialog } from '../../components/FormDialog';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { JournalEntryEditor } from '../../components/AccountingComponents';
import { Plus, Eye, RefreshCw, AlertOctagon } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const JournalEntriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Dialog states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [reverseId, setReverseId] = useState<string | null>(null);

  // Queries
  const { data: entries = [], isLoading } = useQuery({ queryKey: ['journal-entries-list'], queryFn: () => api.journalEntries.getAll() });
  const { data: accounts = [] } = useQuery({ queryKey: ['coa-accounts-list'], queryFn: () => api.accounts.getAll() });

  const createMutation = useMutation({
    mutationFn: (values: { date: string; description: string; lines: any[] }) => {
      return api.journalEntries.create({
        date: values.date,
        description: values.description,
        lines: values.lines,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries-list'] });
      setIsEditorOpen(false);
    },
  });

  const postMutation = useMutation({
    mutationFn: (id: string) => api.journalEntries.post(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries-list'] });
      setSelectedEntry(null);
    },
  });

  const reverseMutation = useMutation({
    mutationFn: (id: string) => api.journalEntries.reverse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries-list'] });
      setReverseId(null);
    },
  });

  const filteredEntries = entries.filter((e) => {
    const searchMatch = e.description.toLowerCase().includes(searchQuery.toLowerCase()) || e.entryNumber.includes(searchQuery);
    const statusMatch = statusFilter === '' || e.status === statusFilter;
    return searchMatch && statusMatch;
  });

  const columns: ColumnDef<JournalEntry>[] = [
    {
      accessorKey: 'entryNumber',
      header: 'Entry Number',
      id: 'entryNumber',
      cell: ({ row }) => (
        <span onClick={() => setSelectedEntry(row.original)} className="font-bold text-primary hover:underline cursor-pointer">
          {row.original.entryNumber}
        </span>
      ),
    },
    { accessorKey: 'date', header: 'Date', id: 'date' },
    { accessorKey: 'description', header: 'Description', id: 'description' },
    {
      accessorKey: 'lines',
      header: 'Total Balance',
      id: 'balance',
      cell: ({ row }) => {
        const deb = row.original.lines.reduce((sum, l) => sum + l.debit, 0);
        return <span className="font-semibold">${deb.toLocaleString()}</span>;
      },
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
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" onClick={() => setSelectedEntry(row.original)} title="View Lines">
            <Eye className="w-4 h-4" />
          </Button>
          {row.original.status === 'Posted' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setReverseId(row.original.id)}
              className="text-amber-500 hover:bg-amber-500/10"
              title="Reverse Entry"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Journal Entries"
        description="Verify manual double-entry adjustments, amortization write-offs, and balance adjustments."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Accounting', href: '/accounting' },
          { label: 'Journal Entries' },
        ]}
        action={{
          label: 'Add Journal Entry',
          onClick: () => setIsEditorOpen(true),
          icon: <Plus className="w-4.5 h-4.5" />,
        }}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search journal entries..."
        filters={[
          {
            key: 'status',
            value: statusFilter,
            placeholder: 'All Statuses',
            options: [
              { label: 'Draft', value: 'Draft' },
              { label: 'Posted', value: 'Posted' },
              { label: 'Reversed', value: 'Reversed' },
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

      <DataTable columns={columns} data={filteredEntries.slice(0, 100)} loading={isLoading} />

      {/* CREATE JOURNAL ENTRY DIALOG */}
      <FormDialog open={isEditorOpen} onOpenChange={setIsEditorOpen} title="Setup Double-Entry Journal Adjustments">
        <JournalEntryEditor
          accounts={accounts}
          onSave={(lines, desc, date) => createMutation.mutate({ lines, description: desc, date })}
          onCancel={() => setIsEditorOpen(false)}
        />
      </FormDialog>

      {/* VIEW JOURNAL LINES DIALOG */}
      <FormDialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)} title="Journal Transaction Ledger Lines">
        {selectedEntry && (
          <div className="space-y-4 pt-2 text-xs font-semibold text-foreground">
            <div className="flex justify-between border-b pb-2">
              <div>
                <p className="font-extrabold text-sm uppercase">{selectedEntry.entryNumber}</p>
                <p className="text-muted-foreground">{selectedEntry.description}</p>
              </div>
              <StatusBadge status={selectedEntry.status} />
            </div>

            <div className="border rounded-xl overflow-hidden divide-y">
              {selectedEntry.lines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-3 p-3 bg-secondary/10">
                  <span>{line.accountName}</span>
                  <span className="text-right text-emerald-500">{line.debit > 0 ? `$${line.debit.toLocaleString()}` : '-'}</span>
                  <span className="text-right text-rose-500">{line.credit > 0 ? `$${line.credit.toLocaleString()}` : '-'}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-[10px] text-muted-foreground">Logged by: {selectedEntry.createdBy} on {selectedEntry.date}</span>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setSelectedEntry(null)}>Close</Button>
                {selectedEntry.status === 'Draft' && (
                  <Button onClick={() => postMutation.mutate(selectedEntry.id)}>Post Entry</Button>
                )}
              </div>
            </div>
          </div>
        )}
      </FormDialog>

      <ConfirmDialog
        open={!!reverseId}
        onOpenChange={(open) => !open && setReverseId(null)}
        title="Reverse Journal Entry"
        description="Are you sure you want to reverse this entry? Reversals create opposite credit/debit balances in the General Ledger."
        confirmText="Confirm Reversal"
        onConfirm={() => reverseId && reverseMutation.mutate(reverseId)}
      />
    </div>
  );
};
export default JournalEntriesPage;
