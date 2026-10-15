import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FormDialog } from '../../components/FormDialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Plus, Mail, Loader2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const CommEmailPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Queries
  const { data: emails = [], isLoading: loadEmails } = useQuery({ queryKey: ['comm-emails-list'], queryFn: () => api.email.getAll() });
  const { data: templates = [] } = useQuery({ queryKey: ['comm-templates-list'], queryFn: () => api.templates.getAll() });

  const sendMutation = useMutation({
    mutationFn: () => {
      return api.email.send({
        from: 'office@skyline-luxury.com',
        to,
        subject,
        body,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comm-emails-list'] });
      setIsOpen(false);
      setTo('');
      setSubject('');
      setBody('');
    },
  });

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'sentAt', header: 'Sent Date', id: 'date' },
    { accessorKey: 'to', header: 'Recipient Email', id: 'recipient', cell: ({ row }) => <span className="font-bold">{row.original.to}</span> },
    { accessorKey: 'subject', header: 'Subject', id: 'subject', cell: ({ row }) => <span className="font-semibold">{row.original.subject}</span> },
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
        title="Email Center Dispatcher"
        description="Verify sent emails, schedule automated messages, or compose direct notifications."
        breadcrumbs={[
          { label: 'Home', href: '/communication' },
          { label: 'Email Center' },
        ]}
        action={{
          label: 'Compose Outbound Email',
          onClick: () => setIsOpen(true),
          icon: <Plus className="w-4.5 h-4.5" />,
        }}
      />

      <DataTable columns={columns} data={emails} loading={loadEmails} />

      {/* COMPOSE DIALOG */}
      <FormDialog open={isOpen} onOpenChange={setIsOpen} title="Compose Outbound Email">
        <div className="space-y-4 pt-2 text-xs font-semibold text-foreground">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Recipient Email</label>
            <Input placeholder="E.g., resident@skyline.com" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Insert Template</label>
            <Select onChange={(e: any) => {
              const tm = templates.find(t => t.id === e.target.value);
              if (tm) {
                setSubject(tm.title);
                setBody(tm.body);
              }
            }}>
              <option value="">-- Choose pre-saved templates --</option>
              {templates.slice(0, 5).map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Subject Title</label>
            <Input placeholder="Enter email subject..." value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Email Body</label>
            <textarea
              className="w-full min-h-[150px] p-3 rounded-xl border bg-card text-foreground font-semibold"
              placeholder="Type message content here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={() => sendMutation.mutate()} disabled={!to || !subject || !body || sendMutation.isPending}>
              {sendMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Send Email
            </Button>
          </div>

        </div>
      </FormDialog>
    </div>
  );
};
export default CommEmailPage;
