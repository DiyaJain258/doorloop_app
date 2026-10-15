import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { FormDialog } from '../../components/FormDialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/StatusBadge';
import { Plus, Loader2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const DocsRequestsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [recipient, setRecipient] = useState('');
  const [recipientType, setRecipientType] = useState('Tenant');
  const [dueDate, setDueDate] = useState('');

  const { data: requests = [], isLoading } = useQuery({ queryKey: ['docs-requests'], queryFn: () => api.documentRequests.getAll() });

  const createMutation = useMutation({
    mutationFn: () => api.documentRequests.create({ title, recipient, recipientType, dueDate, description: `Please submit required documents by ${dueDate}.`, requiredDocuments: ['Government ID', 'Proof of Income'] }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['docs-requests'] }); setIsOpen(false); setTitle(''); setRecipient(''); },
  });

  const filtered = requests.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'createdAt', header: 'Created', id: 'date' },
    { accessorKey: 'title', header: 'Request Title', id: 'title', cell: ({ row }) => <span className="font-bold">{row.original.title}</span> },
    { accessorKey: 'recipient', header: 'Recipient', id: 'recipient' },
    { accessorKey: 'recipientType', header: 'Type', id: 'type', cell: ({ row }) => <span className="text-[9px] font-black uppercase bg-secondary border px-2 py-0.5 rounded">{row.original.recipientType}</span> },
    { accessorKey: 'dueDate', header: 'Due Date', id: 'due' },
    { accessorKey: 'status', header: 'Status', id: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Document Requests Registry"
        description="Send document collection requests to tenants, owners, vendors, or applicants with due dates."
        breadcrumbs={[{ label: 'Documents', href: '/documents' }, { label: 'Document Requests' }]}
        action={{ label: 'Create Request', onClick: () => setIsOpen(true), icon: <Plus className="w-4 h-4" /> }}
      />
      <FilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search document requests..." onReset={() => setSearchQuery('')} />
      <DataTable columns={columns} data={filtered} loading={isLoading} />

      <FormDialog open={isOpen} onOpenChange={setIsOpen} title="Create Document Request">
        <div className="space-y-4 pt-2 text-xs font-semibold text-foreground">
          <div className="space-y-1"><label className="text-[10px] font-bold text-muted-foreground uppercase">Request Title</label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="E.g., Lease renewal documents" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[10px] font-bold text-muted-foreground uppercase">Recipient Name</label><Input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="E.g., Sarah Connor" /></div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-muted-foreground uppercase">Recipient Type</label>
              <Select value={recipientType} onChange={(e: any) => setRecipientType(e.target.value)}>
                {['Tenant', 'Owner', 'Vendor', 'Applicant'].map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-muted-foreground uppercase">Due Date</label><Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!title || !recipient || createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Send Request
            </Button>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};
export default DocsRequestsPage;
