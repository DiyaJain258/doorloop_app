import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { ChannelBadge } from '../../components/CommunicationComponents';
import { StatusBadge } from '../../components/StatusBadge';
import { ColumnDef } from '@tanstack/react-table';

export const CommConversationsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Queries
  const { data: conversations = [], isLoading } = useQuery({ queryKey: ['comm-conversations-list'], queryFn: () => api.conversations.getAll() });

  const filteredConv = conversations.filter((c) =>
    c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'contactName', header: 'Contact Name', id: 'name', cell: ({ row }) => <span className="font-bold">{row.original.contactName}</span> },
    { accessorKey: 'lastMessage', header: 'Last Message', id: 'lastMessage', cell: ({ row }) => <span className="truncate max-w-[200px] inline-block font-semibold">{row.original.lastMessage}</span> },
    {
      accessorKey: 'channel',
      header: 'Channel Type',
      id: 'channel',
      cell: ({ row }) => <ChannelBadge channel={row.original.channel} />,
    },
    { accessorKey: 'assignedUser', header: 'Assigned User', id: 'agent' },
    {
      accessorKey: 'status',
      header: 'Status',
      id: 'status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    { accessorKey: 'lastActivity', header: 'Last Activity', id: 'activity' },
  ];

  return (
    <div>
      <PageHeader
        title="Conversations Logs Registry"
        description="Verify direct dispatches channels history, assignees, and active tickets statuses."
        breadcrumbs={[
          { label: 'Home', href: '/communication' },
          { label: 'Conversations' },
        ]}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search conversations..."
        onReset={() => setSearchQuery('')}
      />

      <DataTable columns={columns} data={filteredConv.slice(0, 100)} loading={isLoading} />
    </div>
  );
};
export default CommConversationsPage;
