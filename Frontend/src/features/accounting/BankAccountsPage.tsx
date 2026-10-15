import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { BankAccount } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { FormDialog } from '../../components/FormDialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/StatusBadge';
import { CurrencyInput } from '../../components/Phase4Components';
import { Plus, Landmark, Loader2, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const BankAccountsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form states
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [type, setType] = useState<'Checking' | 'Savings' | 'Escrow' | 'Trust'>('Checking');
  const [openingBalance, setOpeningBalance] = useState(5000);

  // Queries
  const { data: bankAccounts = [], isLoading } = useQuery({ queryKey: ['bank-accounts-list'], queryFn: () => api.bankAccounts.getAll() });

  const createMutation = useMutation({
    mutationFn: () => {
      return api.bankAccounts.create({
        bankName,
        accountName,
        accountNumber: accountNumber.slice(-4), // mock mask
        accountType: type,
        openingBalance,
        currency: 'USD',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts-list'] });
      setIsOpen(false);
      setBankName('');
      setAccountName('');
      setAccountNumber('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.bankAccounts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts-list'] });
      setDeleteId(null);
    },
  });

  const filteredBanks = bankAccounts.filter((b) =>
    b.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.accountName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<BankAccount>[] = [
    {
      accessorKey: 'bankName',
      header: 'Bank',
      id: 'bank',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2 font-bold text-foreground">
          <Landmark className="w-4 h-4 text-primary shrink-0" />
          <span>{row.original.bankName}</span>
        </div>
      ),
    },
    { accessorKey: 'accountName', header: 'Account Name', id: 'name' },
    { accessorKey: 'accountNumber', header: 'Account (Masked)', id: 'number', cell: ({ row }) => <span className="font-mono">{row.original.accountNumber}</span> },
    { accessorKey: 'accountType', header: 'Account Type', id: 'type' },
    {
      accessorKey: 'currentBalance',
      header: 'Cleared Balance',
      id: 'balance',
      cell: ({ row }) => <span className="font-extrabold text-emerald-500">${row.original.currentBalance.toLocaleString()}</span>,
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
          <Trash2 className="w-4.5 h-4.5" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Escrow & Checking Bank Accounts"
        description="Verify active escrow holdings accounts, primary operating banks, and trust ledgers."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Accounting', href: '/accounting' },
          { label: 'Bank Accounts' },
        ]}
        action={{
          label: 'Register Bank Account',
          onClick: () => setIsOpen(true),
          icon: <Plus className="w-4.5 h-4.5" />,
        }}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search bank accounts..."
        onReset={() => setSearchQuery('')}
      />

      <DataTable columns={columns} data={filteredBanks} loading={isLoading} />

      {/* CREATE DIALOG */}
      <FormDialog open={isOpen} onOpenChange={setIsOpen} title="Register Bank Account">
        <div className="space-y-4 pt-2">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Bank Name</label>
            <Input placeholder="E.g., Chase Bank" value={bankName} onChange={(e) => setBankName(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Account Label</label>
            <Input placeholder="E.g., Escrow Rent Holding" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Account Number</label>
              <Input placeholder="E.g., 987654321" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Account Type</label>
              <Select value={type} onChange={(e: any) => setType(e.target.value)}>
                <option value="Checking">Checking Account</option>
                <option value="Savings">Savings Account</option>
                <option value="Escrow">Escrow Trust Account</option>
                <option value="Trust">Trust Ledger</option>
              </Select>
            </div>
          </div>

          <CurrencyInput
            label="Opening Deposit ($)"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(Number(e.target.value))}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!bankName || !accountNumber || createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Account
            </Button>
          </div>

        </div>
      </FormDialog>
    </div>
  );
};
export default BankAccountsPage;
