import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { ChannelBadge } from '../../components/CommunicationComponents';
import { StatusBadge } from '../../components/StatusBadge';
import { ColumnDef } from '@tanstack/react-table';

export const CommScheduledPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Queries
  const { data: emails = [] } = useQuery({ queryKey: ['comm-emails-list'], queryFn: () => api.email.getAll() });
  const { data: sms = [] } = useQuery({ queryKey: ['comm-sms-list'], queryFn: () => api.sms.getAll() });

  // Filter scheduled
  const scheduledEmails = emails.filter(e => e.status === 'Scheduled').map(e => ({
    id: e.id,
    type: 'Email',
    recipient: e.to,
    subject: e.subject,
    releaseDate: e.sentAt,
    status: e.status,
  }));

  const scheduledSms = sms.filter(s => s.status === 'Scheduled').map(s => ({
    id: s.id,
    type: 'SMS',
    recipient: s.recipient,
    subject: s.message,
    releaseDate: s.sentAt,
    status: s.status,
  }));

  const scheduledList = [...scheduledEmails, ...scheduledSms].filter(item =>
    item.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'releaseDate', header: 'Scheduled Release Date', id: 'date' },
    { accessorKey: 'type', header: 'Type', id: 'type', cell: ({ row }) => <ChannelBadge channel={row.original.type} /> },
    { accessorKey: 'recipient', header: 'Recipient Contact', id: 'recipient', cell: ({ row }) => <span className="font-bold">{row.original.recipient}</span> },
    { accessorKey: 'subject', header: 'Draft Message Summary / Subject', id: 'subject', cell: ({ row }) => <span className="font-semibold truncate max-w-[250px] inline-block">{row.original.subject}</span> },
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
        title="Scheduled Outbox Messages"
        description="Verify scheduled announcements alerts, tenant payments reminders, or mix campaigns delays."
        breadcrumbs={[
          { label: 'Home', href: '/communication' },
          { label: 'Scheduled Outbox' },
        ]}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search scheduled recipients..."
        onReset={() => setSearchQuery('')}
      />

      <DataTable columns={columns} data={scheduledList} />
    </div>
  );
};
export default CommScheduledPage;
