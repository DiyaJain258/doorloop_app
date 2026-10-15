import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { CheckCheck } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const CommNotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  // Queries
  const { data: notifications = [], isLoading } = useQuery({ queryKey: ['comm-notifications-list'], queryFn: () => api.notifications.getAll() });

  const markMutation = useMutation({
    mutationFn: (id: string) => api.notifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comm-notifications-list'] });
    },
  });

  const filteredNotif = notifications.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'createdAt', header: 'Created At', id: 'date' },
    { accessorKey: 'type', header: 'Alert Type', id: 'type', cell: ({ row }) => <span className="font-extrabold text-[9px] uppercase bg-secondary border px-2 py-0.5 rounded">{row.original.type}</span> },
    { accessorKey: 'title', header: 'Subject Alert', id: 'title', cell: ({ row }) => <span className="font-bold">{row.original.title}</span> },
    { accessorKey: 'body', header: 'Message Context Detail', id: 'body', cell: ({ row }) => <span className="font-medium text-muted-foreground">{row.original.body}</span> },
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
        row.original.status === 'Unread' ? (
          <Button variant="ghost" size="icon" onClick={() => markMutation.mutate(row.original.id)} title="Mark as read">
            <CheckCheck className="w-4 h-4 text-emerald-500" />
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="System Alerts & Notifications"
        description="Verify automated rent receipt clears alerts, document uploads notices, or chat tickets pings."
        breadcrumbs={[
          { label: 'Home', href: '/communication' },
          { label: 'Notifications' },
        ]}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search notifications..."
        onReset={() => setSearchQuery('')}
      />

      <DataTable columns={columns} data={filteredNotif.slice(0, 100)} loading={isLoading} />
    </div>
  );
};
export default CommNotificationsPage;
