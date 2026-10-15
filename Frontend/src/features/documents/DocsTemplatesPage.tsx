import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { FormDialog } from '../../components/FormDialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Plus, Eye, Loader2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const DocsTemplatesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('Lease Agreement');
  const [body, setBody] = useState('');

  const { data: templates = [], isLoading } = useQuery({ queryKey: ['docs-templates'], queryFn: () => api.documentTemplates.getAll() });

  const createMutation = useMutation({
    mutationFn: () => api.documentTemplates.create({ name, type, body }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['docs-templates'] }); setIsOpen(false); setName(''); setBody(''); },
  });

  const filtered = templates.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'name', header: 'Template Name', id: 'name', cell: ({ row }) => <span className="font-bold">{row.original.name}</span> },
    { accessorKey: 'type', header: 'Document Type', id: 'type', cell: ({ row }) => <span className="text-[9px] font-black uppercase bg-secondary border px-2 py-0.5 rounded">{row.original.type}</span> },
    { accessorKey: 'createdAt', header: 'Created Date', id: 'date' },
    { id: 'actions', header: 'Preview', cell: ({ row }) => (
      <Button variant="ghost" size="icon" onClick={() => setPreview(row.original)}><Eye className="w-4 h-4" /></Button>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Document Templates Library"
        description="Create and manage lease agreements, rental applications, inspection reports, and notice templates."
        breadcrumbs={[{ label: 'Documents', href: '/documents' }, { label: 'Templates' }]}
        action={{ label: 'Create Template', onClick: () => setIsOpen(true), icon: <Plus className="w-4 h-4" /> }}
      />
      <FilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search templates..." onReset={() => setSearchQuery('')} />
      <DataTable columns={columns} data={filtered} loading={isLoading} />

      <FormDialog open={isOpen} onOpenChange={setIsOpen} title="Create Document Template">
        <div className="space-y-4 pt-2 text-xs font-semibold text-foreground">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[10px] font-bold text-muted-foreground uppercase">Template Name</label><Input value={name} onChange={e => setName(e.target.value)} placeholder="E.g., Standard Lease 2026" /></div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-muted-foreground uppercase">Document Type</label>
              <Select value={type} onChange={(e: any) => setType(e.target.value)}>
                {['Lease Agreement','Rental Application','Owner Agreement','Vendor Contract','Inspection Report','Notice','Invoice','Receipt','Statement','Other'].map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
          </div>
          <div className="space-y-1"><label className="text-[10px] font-bold text-muted-foreground uppercase">Template Body</label><textarea className="w-full min-h-[140px] p-3 rounded-xl border bg-card text-foreground font-mono text-xs" placeholder="Enter template body. Use {{variableName}} for merge fields." value={body} onChange={e => setBody(e.target.value)} /></div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!name || !body || createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Save Template
            </Button>
          </div>
        </div>
      </FormDialog>

      <FormDialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)} title="Template Preview">
        {preview && (
          <div className="space-y-4 pt-2 text-xs font-semibold text-foreground">
            <div><h4 className="font-extrabold text-sm uppercase">{preview.name}</h4><p className="text-[10px] text-muted-foreground uppercase mt-0.5">{preview.type}</p></div>
            <div className="bg-secondary/15 p-4 rounded-xl border font-mono whitespace-pre-wrap leading-relaxed text-[11px]">{preview.body}</div>
            <div className="flex justify-end border-t pt-4"><Button variant="outline" onClick={() => setPreview(null)}>Close</Button></div>
          </div>
        )}
      </FormDialog>
    </div>
  );
};
export default DocsTemplatesPage;
