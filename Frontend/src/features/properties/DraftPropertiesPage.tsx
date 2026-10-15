import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import api from '../../api';
import { Property } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2, CheckCircle2, FileText, Plus } from 'lucide-react';

export const DraftPropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch all properties and filter drafts
  const { data: allProperties = [], isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => api.property.getAll(),
  });

  const drafts = allProperties.filter((p: Property) => p.status === 'Draft');

  // Mutation to Publish Draft (change status to Active)
  const publishMutation = useMutation({
    mutationFn: (id: string) => api.property.update(id, { status: 'Active' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  // Mutation to Delete Draft
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.property.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setDeleteId(null);
    },
  });

  const columns: ColumnDef<Property>[] = [
    {
      accessorKey: 'name',
      header: 'Property Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-500" />
          <span
            className="font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
            onClick={() => navigate({ to: `/properties/edit`, search: { id: row.original.id } as any })}
          >
            {row.original.name || 'Untitled Property Draft'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <StatusBadge status={row.original.type || 'Apartment'} />,
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs truncate max-w-[200px] inline-block">
          {row.original.address || 'Incomplete Address'}
        </span>
      ),
    },
    {
      accessorKey: 'nycBin',
      header: 'NYC BIN #',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          {row.original.nycBin || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created On',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : 'Recent'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 font-semibold"
            onClick={() => publishMutation.mutate(row.original.id)}
            disabled={publishMutation.isPending}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Publish / Save
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
            onClick={() => navigate({ to: `/properties/edit`, search: { id: row.original.id } as any })}
            title="Edit Draft"
          >
            <Edit className="w-4 h-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
            onClick={() => setDeleteId(row.original.id)}
            title="Delete Draft"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Property Drafts"
        description="View, complete, publish or discard your saved property drafts."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Properties', href: '/properties' },
          { label: 'Drafts' },
        ]}
        action={{
          label: 'Add Property',
          onClick: () => navigate({ to: '/properties/new' }),
          icon: <Plus className="w-4.5 h-4.5" />,
        }}
      />

      <DataTable columns={columns} data={drafts} loading={isLoading} />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Draft Property"
        description="Are you sure you want to permanently delete this property draft? This action cannot be undone."
        confirmText="Delete Draft"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
};
export default DraftPropertiesPage;
