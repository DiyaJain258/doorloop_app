import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { PreventiveTask } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { FormDialog } from '../../components/FormDialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/StatusBadge';
import { Plus, Trash2, Calendar, Loader2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const PreventivePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form states
  const [task, setTask] = useState('');
  const [assetId, setAssetId] = useState('');
  const [frequency, setFrequency] = useState<'Weekly' | 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual'>('Monthly');
  const [nextDue, setNextDue] = useState(new Date().toISOString().split('T')[0]);
  const [assignedVendor, setAssignedVendor] = useState('');

  // Queries
  const { data: preventive = [], isLoading } = useQuery({ queryKey: ['preventive-list'], queryFn: () => api.preventiveMaintenance.getAll() });
  const { data: assets = [] } = useQuery({ queryKey: ['assets-list'], queryFn: () => api.assets.getAll() });
  const { data: properties = [] } = useQuery({ queryKey: ['properties'], queryFn: () => api.property.getAll() });
  const [propertyId, setPropertyId] = useState('');

  const createMutation = useMutation({
    mutationFn: () => {
      const asset = assets.find((a) => a.id === assetId);
      const prop = properties.find((p) => p.id === propertyId);
      return api.preventiveMaintenance.create({
        task,
        assetId,
        assetName: asset ? asset.assetName : 'General Asset',
        propertyId,
        propertyName: prop ? prop.name : 'Property Portfolio',
        frequency,
        nextDue,
        assignedVendorName: assignedVendor,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preventive-list'] });
      setIsOpen(false);
      setTask('');
      setAssignedVendor('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.preventiveMaintenance.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preventive-list'] });
      setDeleteId(null);
    },
  });

  const filteredTasks = preventive.filter((t) =>
    t.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.propertyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<PreventiveTask>[] = [
    { accessorKey: 'task', header: 'Preventive Task', id: 'task', cell: ({ row }) => <span className="font-bold">{row.original.task}</span> },
    { accessorKey: 'assetName', header: 'Target Asset', id: 'asset' },
    { accessorKey: 'propertyName', header: 'Location Property', id: 'property' },
    { accessorKey: 'frequency', header: 'Frequency', id: 'frequency' },
    {
      accessorKey: 'nextDue',
      header: 'Next Execution',
      id: 'nextDue',
      cell: ({ row }) => (
        <span className="font-mono flex items-center gap-1 font-bold">
          <Calendar className="w-3.5 h-3.5 text-primary" /> {row.original.nextDue}
        </span>
      ),
    },
    { accessorKey: 'assignedVendorName', header: 'Assigned Partner', id: 'vendor' },
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
        <Button variant="ghost" size="icon" onClick={() => setDeleteId(row.original.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Preventive Maintenance"
        description="Verify monthly HVAC filter checks, biannual fire systems audits, elevator testing, and swimming pools servicing schedules."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Maintenance', href: '/maintenance' },
          { label: 'Preventive' },
        ]}
        action={{
          label: 'Schedule Recurring Task',
          onClick: () => setIsOpen(true),
          icon: <Plus className="w-4.5 h-4.5" />,
        }}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search task templates or property location..."
        onReset={() => setSearchQuery('')}
      />

      <DataTable columns={columns} data={filteredTasks.slice(0, 100)} loading={isLoading} />

      {/* CREATE DIALOG */}
      <FormDialog open={isOpen} onOpenChange={setIsOpen} title="Setup Preventive Task Schedule">
        <div className="space-y-4 pt-2">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Task Description</label>
            <Input placeholder="E.g., Quarterly Elevator Testing" value={task} onChange={(e) => setTask(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Property Portfolio</label>
              <Select value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
                <option value="">Select Property...</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Target Asset</label>
              <Select value={assetId} onChange={(e) => setAssetId(e.target.value)}>
                <option value="">Select Asset...</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>{a.assetName}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Frequency</label>
              <Select value={frequency} onChange={(e: any) => setFrequency(e.target.value)}>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Semi-Annual">Semi-Annual</option>
                <option value="Annual">Annual</option>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Next Due Date</label>
              <Input type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Assigned Vendor / Partner</label>
            <Input placeholder="Contractor name..." value={assignedVendor} onChange={(e) => setAssignedVendor(e.target.value)} />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!task || !propertyId || createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Schedule Task
            </Button>
          </div>

        </div>
      </FormDialog>
    </div>
  );
};
export default PreventivePage;
