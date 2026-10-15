import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FolderTree } from '../../components/DocumentComponents';
import { FormDialog } from '../../components/FormDialog';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { FolderPlus, Folder, Loader2 } from 'lucide-react';

export const DocsFoldersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  const [folderName, setFolderName] = useState('');

  const { data: folders = [], isLoading } = useQuery({ queryKey: ['docs-folders'], queryFn: () => api.folders.getAll() });

  const createMutation = useMutation({
    mutationFn: () => api.folders.create({ name: folderName, path: `/root/${folderName}` }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['docs-folders'] }); setIsOpen(false); setFolderName(''); },
  });

  if (isLoading) return <LoadingSkeleton type="card" />;

  const selectedFolder = folders.find(f => f.id === selectedId);

  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title="Folder Management"
        description="Navigate, create, and organise nested document folder structures across all properties."
        breadcrumbs={[{ label: 'Documents', href: '/documents' }, { label: 'Folders' }]}
        action={{ label: 'New Folder', onClick: () => setIsOpen(true), icon: <FolderPlus className="w-4 h-4" /> }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Folder Tree */}
        <Card className="lg:col-span-1 p-4 border bg-card overflow-y-auto max-h-[600px]">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-muted-foreground border-b pb-2 mb-3">Folder Tree</h3>
          <FolderTree
            folders={folders.slice(0, 30).map(f => ({ id: f.id, name: f.name, documentCount: f.documentCount }))}
            onSelect={setSelectedId}
            selectedId={selectedId}
          />
        </Card>

        {/* Folder Detail Panel */}
        <Card className="lg:col-span-3 p-6 border bg-card">
          {selectedFolder ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b pb-4">
                <Folder className="w-8 h-8 text-amber-500" />
                <div>
                  <h3 className="font-extrabold text-lg">{selectedFolder.name}</h3>
                  <p className="text-xs text-muted-foreground font-semibold">{selectedFolder.path}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase">Documents Inside</span>
                  <p className="font-black text-xl">{selectedFolder.documentCount}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase">Created Date</span>
                  <p className="font-bold">{selectedFolder.createdAt}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Folder className="w-12 h-12 mb-3 opacity-30" />
              <p className="font-semibold text-sm">Select a folder to view details</p>
            </div>
          )}
        </Card>
      </div>

      <FormDialog open={isOpen} onOpenChange={setIsOpen} title="Create New Folder">
        <div className="space-y-4 pt-2 text-xs font-semibold text-foreground">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Folder Name</label>
            <Input placeholder="E.g., 2026 Lease Agreements" value={folderName} onChange={(e) => setFolderName(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!folderName || createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Create Folder
            </Button>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};
export default DocsFoldersPage;
