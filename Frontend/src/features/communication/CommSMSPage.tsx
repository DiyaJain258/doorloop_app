import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FormDialog } from '../../components/FormDialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { StatusBadge } from '../../components/StatusBadge';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Plus, Phone, Loader2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const CommSMSPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');

  // Queries
  const { data: sms = [], isLoading: loadSms } = useQuery({ queryKey: ['comm-sms-list'], queryFn: () => api.sms.getAll() });

  const sendMutation = useMutation({
    mutationFn: () => {
      return api.sms.send({
        recipient,
        message,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comm-sms-list'] });
      setIsOpen(false);
      setRecipient('');
      setMessage('');
    },
  });

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'sentAt', header: 'Sent Date', id: 'date' },
    { accessorKey: 'recipient', header: 'Recipient Phone', id: 'recipient', cell: ({ row }) => <span className="font-bold">{row.original.recipient}</span> },
    { accessorKey: 'message', header: 'Text Message Content', id: 'message', cell: ({ row }) => <span className="font-semibold">{row.original.message}</span> },
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
        title="SMS Dispatch Center"
        description="Verify outbound text message alerts delivery states, scheduled notifications, or dispatch immediate SMS."
        breadcrumbs={[
          { label: 'Home', href: '/communication' },
          { label: 'SMS Center' },
        ]}
        action={{
          label: 'Send SMS Alert',
          onClick: () => setIsOpen(true),
          icon: <Plus className="w-4.5 h-4.5" />,
        }}
      />

      <DataTable columns={columns} data={sms} loading={loadSms} />

      {/* COMPOSE DIALOG */}
      <FormDialog open={isOpen} onOpenChange={setIsOpen} title="Send SMS Alert">
        <div className="space-y-4 pt-2 text-xs font-semibold text-foreground">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Recipient Phone Number</label>
            <Input placeholder="E.g., (512) 555-0199" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-muted-foreground uppercase">SMS Message Content</label>
              <span className="text-[9px] text-muted-foreground">{message.length} / 160 characters</span>
            </div>
            <textarea
              className="w-full min-h-[100px] p-3 rounded-xl border bg-card text-foreground font-semibold"
              placeholder="Type message content here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={160}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={() => sendMutation.mutate()} disabled={!recipient || !message || sendMutation.isPending}>
              {sendMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Send SMS Alert
            </Button>
          </div>

        </div>
      </FormDialog>
    </div>
  );
};
export default CommSMSPage;
