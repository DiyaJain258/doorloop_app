import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { OwnerSupportTicket } from '../../types';
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

export const OwnerSupportPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog state
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Billing');
  const [priority, setPriority] = useState('Normal');
  const [description, setDescription] = useState('');

  // Queries
  const { data: tickets = [], isLoading } = useQuery({ queryKey: ['owner-support-tickets'], queryFn: () => api.ownerPortal.getSupportTickets() });

  const createMutation = useMutation({
    mutationFn: () => {
      return api.ownerPortal.createSupportTicket({
        subject,
        category,
        priority,
        description,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-support-tickets'] });
      setIsOpen(false);
      setSubject('');
      setDescription('');
    },
  });

  const filteredTickets = tickets.filter((t) =>
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<OwnerSupportTicket>[] = [
    { accessorKey: 'id', header: 'Ticket ID', id: 'id', cell: ({ row }) => <span className="font-bold">#{row.original.id.replace('st-', '')}</span> },
    { accessorKey: 'subject', header: 'Subject Inquiry', id: 'subject', cell: ({ row }) => <span className="font-bold">{row.original.subject}</span> },
    { accessorKey: 'category', header: 'Category', id: 'category' },
    { accessorKey: 'priority', header: 'Priority', id: 'priority' },
    { accessorKey: 'createdAt', header: 'Submitted Date', id: 'createdAt' },
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
        title="Help & Support Desk"
        description="Verify active support inquiries, billing questions, and direct requests resolved status."
        breadcrumbs={[
          { label: 'Home', href: '/owner' },
          { label: 'Support Desk' },
        ]}
        action={{
          label: 'Create Support Ticket',
          onClick: () => setIsOpen(true),
          icon: <Plus className="w-4.5 h-4.5" />,
        }}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search support tickets..."
        onReset={() => setSearchQuery('')}
      />

      <DataTable columns={columns} data={filteredTickets} loading={isLoading} />

      {/* CREATE DIALOG */}
      <FormDialog open={isOpen} onOpenChange={setIsOpen} title="Create Support Ticket">
        <div className="space-y-4 pt-2 text-xs font-semibold">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Subject Inquiry</label>
            <Input placeholder="E.g., Discrepancy on July statement" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Inquiry Category</label>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Billing">Billing & Distributions</option>
                <option value="Maintenance">Maintenance Costs</option>
                <option value="Portal">Portal Access issue</option>
                <option value="General">General Inquiry</option>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Priority</label>
              <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Detailed Description</label>
            <textarea
              className="w-full min-h-[100px] p-2.5 rounded-lg border bg-card text-foreground"
              placeholder="Describe your inquiry or adjustments requested..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!subject || !description || createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Create Ticket
            </Button>
          </div>

        </div>
      </FormDialog>
    </div>
  );
};
export default OwnerSupportPage;
