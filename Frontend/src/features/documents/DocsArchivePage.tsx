import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Button } from '../../components/ui/Button';
import { FileTypeIcon } from '../../components/DocumentComponents';
import { ColumnDef } from '@tanstack/react-table';

export const DocsArchivePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDoc, setDeleteDoc] = useState<any | null>(null);

  const { data: docs = [], isLoading } = useQuery({ queryKey: ['docs-all'], queryFn: () => api.documents.getAll() });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.documents.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docs-all'] });
      setDeleteDoc(null);
    },
  });

  const archived = docs.filter(d => d.status === 'Archived').filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'name', header: 'Document Name', id: 'name', cell: ({ row }) => (
      <div className="flex items-center gap-2"><FileTypeIcon name={row.original.name} /><span className="font-bold">{row.original.name}</span></div>
    )},
    { accessorKey: 'category', header: 'Category', id: 'category', cell: ({ row }) => <span className="text-[9px] font-black uppercase bg-secondary border px-2 py-0.5 rounded">{row.original.category}</span> },
    { accessorKey: 'owner', header: 'Archived By', id: 'owner' },
    { accessorKey: 'updatedAt', header: 'Archived Date', id: 'date' },
    { id: 'actions', header: 'Actions', cell: ({ row }) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" className="text-[9px] text-emerald-500" onClick={() => alert(`Restoring ${row.original.name}`)}>Restore</Button>
        <Button variant="ghost" size="sm" className="text-[9px] text-rose-500" onClick={() => setDeleteDoc(row.original)}>Delete Permanently</Button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Archived Documents"
        description="Browse archived documents, restore needed files, or permanently remove records."
        breadcrumbs={[{ label: 'Documents', href: '/documents' }, { label: 'Archive' }]}
      />
      <FilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search archived documents..." onReset={() => setSearchQuery('')} />
      <DataTable columns={columns} data={archived} loading={isLoading} />

      <ConfirmDialog
        open={!!deleteDoc}
        onOpenChange={(open) => !open && setDeleteDoc(null)}
        title="Permanently Delete Document"
        description={`Are you sure you want to permanently delete "${deleteDoc?.name}"? Click Yes to confirm or No to cancel.`}
        confirmText="Yes, Delete Permanently"
        cancelText="No, Cancel"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteDoc && deleteMutation.mutate(deleteDoc.id)}
      />
    </div>
  );
};
export default DocsArchivePage;
