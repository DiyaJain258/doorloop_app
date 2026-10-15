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
import { TemplateEditor } from '../../components/CommunicationComponents';
import { Plus, Eye, Loader2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const CommTemplatesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Rent Reminder' | 'Lease Renewal' | 'Welcome' | 'Maintenance Update' | 'Payment Receipt' | 'Late Fee Notice' | 'Inspection Reminder' | 'General'>('General');
  const [body, setBody] = useState('');

  // Queries
  const { data: templates = [], isLoading } = useQuery({ queryKey: ['comm-templates-list'], queryFn: () => api.templates.getAll() });

  const createMutation = useMutation({
    mutationFn: () => {
      return api.templates.create({
        title,
        category,
        body,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comm-templates-list'] });
      setIsOpen(false);
      setTitle('');
      setBody('');
    },
  });

  const filteredTemp = templates.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'title', header: 'Template Title', id: 'title', cell: ({ row }) => <span className="font-bold">{row.original.title}</span> },
    { accessorKey: 'category', header: 'Category Type', id: 'category' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" onClick={() => setSelectedTemplate(row.original)} title="Preview content">
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Saved Communication Templates"
        description="Verify pre-saved rent reminder notices, lease welcome kits, late fee alerts, or draft a new template."
        breadcrumbs={[
          { label: 'Home', href: '/communication' },
          { label: 'Templates' },
        ]}
        action={{
          label: 'Create Template',
          onClick: () => setIsOpen(true),
          icon: <Plus className="w-4.5 h-4.5" />,
        }}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search template titles..."
        onReset={() => setSearchQuery('')}
      />

      <DataTable columns={columns} data={filteredTemp} loading={isLoading} />

      {/* CREATE DIALOG */}
      <FormDialog open={isOpen} onOpenChange={setIsOpen} title="Create Message Template">
        <div className="space-y-4 pt-2 text-xs font-semibold text-foreground">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Template Title</label>
            <Input placeholder="E.g., Late Rent Reminder notice" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Category</label>
            <Select value={category} onChange={(e: any) => setCategory(e.target.value)}>
              <option value="Rent Reminder">Rent Reminder</option>
              <option value="Lease Renewal">Lease Renewal</option>
              <option value="Welcome">Welcome Kit</option>
              <option value="Maintenance Update">Maintenance Updates</option>
              <option value="Payment Receipt">Payment Receipt</option>
              <option value="Late Fee Notice">Late Fee Notice</option>
              <option value="Inspection Reminder">Inspection Reminder</option>
              <option value="General">General Template</option>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Template content</label>
            <TemplateEditor title={title} body={body} onChange={setBody} />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!title || !body || createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Template
            </Button>
          </div>

        </div>
      </FormDialog>

      {/* PREVIEW DIALOG */}
      <FormDialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)} title="Template Preview">
        {selectedTemplate && (
          <div className="space-y-4 pt-2 text-xs font-semibold text-foreground">
            <div>
              <h4 className="font-extrabold text-sm uppercase">{selectedTemplate.title}</h4>
              <p className="text-[10px] text-muted-foreground uppercase mt-0.5">{selectedTemplate.category}</p>
            </div>
            <div className="bg-secondary/15 p-4 rounded-xl border font-mono whitespace-pre-wrap leading-relaxed">
              {selectedTemplate.body}
            </div>
            <div className="flex justify-end border-t pt-4">
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>Close</Button>
            </div>
          </div>
        )}
      </FormDialog>
    </div>
  );
};
export default CommTemplatesPage;
