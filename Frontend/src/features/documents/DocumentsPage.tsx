import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { Document } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FileUploader } from '../../components/FileUploader';
import { FormDialog } from '../../components/FormDialog';
import { Button } from '../../components/ui/Button';
import { Plus, Download } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const DocumentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => api.document.getAll(),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      api.document.create({
        name: file.name,
        type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setIsUploadOpen(false);
    },
  });

  const columns: ColumnDef<Document>[] = [
    { accessorKey: 'name', header: 'Document Name', id: 'name', cell: ({ row }) => <span className="font-bold">{row.original.name}</span> },
    { accessorKey: 'type', header: 'Type', id: 'type' },
    { accessorKey: 'size', header: 'Size', id: 'size' },
    { accessorKey: 'uploadedAt', header: 'Uploaded', id: 'uploadedAt' },
    { accessorKey: 'uploadedBy', header: 'By', id: 'uploadedBy' },
    {
      id: 'actions',
      header: 'Download',
      cell: () => (
        <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
          <Download className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Access leases, inspections, invoices, and general documents."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Documents' },
        ]}
        action={{
          label: 'Upload File',
          onClick: () => setIsUploadOpen(true),
          icon: <Plus className="w-4 h-4" />,
        }}
      />

      <DataTable columns={columns} data={documents} loading={isLoading} />

      <FormDialog open={isUploadOpen} onOpenChange={setIsUploadOpen} title="Upload New Document">
        <div className="space-y-4 pt-2">
          <FileUploader onFileSelect={(file) => uploadMutation.mutate(file)} />
          <p className="text-xs text-muted-foreground text-center">
            Files will be stored securely and parsed automatically.
          </p>
        </div>
      </FormDialog>
    </div>
  );
};
export default DocumentsPage;
