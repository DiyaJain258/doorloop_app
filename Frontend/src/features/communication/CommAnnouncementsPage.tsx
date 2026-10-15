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
import { StatusBadge } from '../../components/StatusBadge';
import { Plus, Loader2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const CommAnnouncementsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Community');
  const [audience, setAudience] = useState<'All Tenants' | 'Owners' | 'Vendors' | 'Employees'>('All Tenants');

  // Queries
  const { data: announcements = [], isLoading } = useQuery({ queryKey: ['comm-announcements-list'], queryFn: () => api.announcements.getAll() });

  const createMutation = useMutation({
    mutationFn: () => {
      return api.announcements.create({
        title,
        category,
        audience,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comm-announcements-list'] });
      setIsOpen(false);
      setTitle('');
    },
  });

  const filteredAnn = announcements.filter((ann) =>
    ann.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'publishDate', header: 'Publish Date', id: 'date' },
    { accessorKey: 'title', header: 'Notice Title', id: 'title', cell: ({ row }) => <span className="font-bold">{row.original.title}</span> },
    { accessorKey: 'category', header: 'Category', id: 'category' },
    { accessorKey: 'audience', header: 'Target Audience', id: 'audience' },
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
        title="Notice Board & Announcements"
        description="Verify published community notices, fire alarm drills alerts, or schedule new announcements."
        breadcrumbs={[
          { label: 'Home', href: '/communication' },
          { label: 'Announcements' },
        ]}
        action={{
          label: 'Create Notice Announcement',
          onClick: () => setIsOpen(true),
          icon: <Plus className="w-4.5 h-4.5" />,
        }}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search notices by title..."
        onReset={() => setSearchQuery('')}
      />

      <DataTable columns={columns} data={filteredAnn} loading={isLoading} />

      {/* CREATE DIALOG */}
      <FormDialog open={isOpen} onOpenChange={setIsOpen} title="Create Notice Announcement">
        <div className="space-y-4 pt-2 text-xs font-semibold text-foreground">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Notice Title</label>
            <Input placeholder="E.g., HVAC seasonal maintenance check" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Category</label>
              <Select value={category} onChange={(e: any) => setCategory(e.target.value)}>
                <option value="Community">Community Events</option>
                <option value="Emergency">Emergency Safety</option>
                <option value="Maintenance">Maintenance Upgrades</option>
                <option value="Security">Security Warnings</option>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Target Audience Group</label>
              <Select value={audience} onChange={(e: any) => setAudience(e.target.value)}>
                <option value="All Tenants">All Tenants Residents</option>
                <option value="Owners">Portfolio Owners</option>
                <option value="Vendors">Registered Contractors</option>
                <option value="Employees">Management Staff</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!title || createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Publish Notice
            </Button>
          </div>

        </div>
      </FormDialog>
    </div>
  );
};
export default CommAnnouncementsPage;
