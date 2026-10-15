import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { ColumnDef } from '@tanstack/react-table';

export const DocsSharedPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: shares = [], isLoading } = useQuery({ queryKey: ['docs-shares'], queryFn: () => api.shares.getAll() });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => api.shares.revoke(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docs-shares'] }),
  });

  const filtered = shares.filter(s =>
    s.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.sharedWith.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'documentName', header: 'Document', id: 'doc', cell: ({ row }) => <span className="font-bold">{row.original.documentName}</span> },
    { accessorKey: 'sharedBy', header: 'Shared By', id: 'by' },
    { accessorKey: 'sharedWith', header: 'Shared With', id: 'with' },
    { accessorKey: 'permissions', header: 'Permissions', id: 'perms', cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.permissions.map((p: string) => (
          <span key={p} className="text-[8px] font-black uppercase bg-secondary border px-1.5 py-0.5 rounded">{p}</span>
        ))}
      </div>
    )},
    { accessorKey: 'expiresAt', header: 'Expires', id: 'exp', cell: ({ row }) => row.original.expiresAt || '—' },
    { accessorKey: 'status', header: 'Status', id: 'status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { id: 'actions', header: 'Actions', cell: ({ row }) => (
      row.original.status === 'Active' ? (
        <Button variant="ghost" size="sm" className="text-[9px] text-rose-500" onClick={() => revokeMutation.mutate(row.original.id)}>Revoke</Button>
      ) : null
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Shared Documents Registry"
        description="Manage active share links, access permissions, and expiration policies for shared documents."
        breadcrumbs={[{ label: 'Documents', href: '/documents' }, { label: 'Shared With Me' }]}
      />
      <FilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search shared documents..." onReset={() => setSearchQuery('')} />
      <DataTable columns={columns} data={filtered} loading={isLoading} />
    </div>
  );
};
export default DocsSharedPage;
