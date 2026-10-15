import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api';
import { PageHeader } from '../../../components/PageHeader';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { DashboardGrid } from '../components/DashboardGrid';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Plus, Save, Copy, Trash2, Share2, Edit3, X } from 'lucide-react';

export const DashboardBuilder: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedDashId, setSelectedDashId] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Widget settings form state
  const [wTitle, setWTitle] = useState('');
  const [wType, setWType] = useState<'MetricCard' | 'LineChart' | 'BarChart' | 'PieChart' | 'Table' | 'Funnel' | 'Calendar'>('MetricCard');
  const [wDataSource, setWDataSource] = useState('Revenue');

  const { data: dashboards = [], isLoading } = useQuery({
    queryKey: ['dashboards-list'],
    queryFn: async () => {
      const res = await api.dashboards.getAll();
      if (res.length > 0 && !selectedDashId) {
        setSelectedDashId(res[0].id);
      }
      return res;
    },
  });

  const activeDashboard = dashboards.find((d) => d.id === selectedDashId);

  const createDashMutation = useMutation({
    mutationFn: (name: string) => api.dashboards.create({ name }),
    onSuccess: (newDash) => {
      queryClient.invalidateQueries({ queryKey: ['dashboards-list'] });
      setSelectedDashId(newDash.id);
    },
  });

  const updateDashMutation = useMutation({
    mutationFn: (data: any) => api.dashboards.update(selectedDashId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards-list'] });
    },
  });

  const duplicateDashMutation = useMutation({
    mutationFn: () => api.dashboards.duplicate(selectedDashId),
    onSuccess: (newDash) => {
      queryClient.invalidateQueries({ queryKey: ['dashboards-list'] });
      setSelectedDashId(newDash.id);
    },
  });

  const deleteDashMutation = useMutation({
    mutationFn: () => api.dashboards.delete(selectedDashId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards-list'] });
      setSelectedDashId('');
      setIsConfirmDeleteOpen(false);
    },
  });

  const shareDashMutation = useMutation({
    mutationFn: (isShared: boolean) => api.dashboards.share(selectedDashId, isShared),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards-list'] });
    },
  });

  const handleAddWidget = () => {
    if (!activeDashboard) return;
    const newWidget = {
      id: `w-${Date.now()}`,
      type: wType,
      title: wTitle || 'Untitled Widget',
      dataSource: wDataSource,
      col: 0,
      row: 0,
      w: 4,
      h: 2,
    };
    const updatedWidgets = [...activeDashboard.widgets, newWidget];
    updateDashMutation.mutate({ widgets: updatedWidgets });
    setShowAddWidget(false);
    setWTitle('');
  };

  const handleRemoveWidget = (widgetId: string) => {
    if (!activeDashboard) return;
    const updatedWidgets = activeDashboard.widgets.filter((w) => w.id !== widgetId);
    updateDashMutation.mutate({ widgets: updatedWidgets });
  };

  const handleCreateNew = () => {
    const name = prompt('Enter dashboard name:');
    if (name) createDashMutation.mutate(name);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Builder"
        description="Design and layout custom metrics, analytics charts, and grids to suit your operations."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reports' }, { label: 'Dashboard Builder' }]}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card border border-border p-4 rounded-xl gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Select value={selectedDashId} onChange={(e) => setSelectedDashId(e.target.value)}>
            {dashboards.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>

          <Button variant="outline" size="sm" onClick={handleCreateNew} className="font-semibold flex items-center gap-1">
            <Plus className="w-4 h-4" /> New
          </Button>
        </div>

        {activeDashboard && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={isEditing ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="font-semibold flex items-center gap-1"
            >
              <Edit3 className="w-4 h-4" /> {isEditing ? 'Done Editing' : 'Customize Layout'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => duplicateDashMutation.mutate()} className="font-semibold flex items-center gap-1">
              <Copy className="w-4 h-4" /> Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareDashMutation.mutate(!activeDashboard.isShared)}
              className="font-semibold flex items-center gap-1"
            >
              <Share2 className="w-4 h-4" /> {activeDashboard.isShared ? 'Shared' : 'Share'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsConfirmDeleteOpen(true)} className="font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1">
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="bg-card border border-border p-4 rounded-xl flex flex-wrap gap-4 items-center">
          <span className="text-sm font-semibold text-muted-foreground">Layout Settings:</span>
          <Button onClick={() => setShowAddWidget(true)} className="bg-primary text-primary-foreground font-semibold flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Widget
          </Button>
        </div>
      )}

      {showAddWidget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border p-6 rounded-2xl w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-lg text-foreground">Add Custom Widget</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAddWidget(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Widget Title</label>
              <Input
                type="text"
                placeholder="e.g. Total Revenue"
                value={wTitle}
                onChange={(e) => setWTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Display Type</label>
              <Select value={wType} onChange={(e) => setWType(e.target.value as any)}>
                <option value="MetricCard">Metric Card</option>
                <option value="LineChart">Line Chart</option>
                <option value="BarChart">Bar Chart</option>
                <option value="PieChart">Pie Chart</option>
                <option value="Table">Table</option>
                <option value="Funnel">Funnel</option>
                <option value="Calendar">Calendar</option>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Data Source</label>
              <Select value={wDataSource} onChange={(e) => setWDataSource(e.target.value)}>
                <option value="Revenue">Revenue</option>
                <option value="Occupancy">Occupancy</option>
                <option value="Expenses">Expenses</option>
                <option value="Leads">Leads & Conversion</option>
                <option value="Maintenance">Maintenance Tasks</option>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowAddWidget(false)} className="font-semibold">
                Cancel
              </Button>
              <Button onClick={handleAddWidget} className="font-semibold bg-primary text-primary-foreground">
                Add Widget
              </Button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="h-60 flex items-center justify-center text-muted-foreground">Loading dashboard...</div>
      ) : activeDashboard ? (
        <DashboardGrid
          widgets={activeDashboard.widgets}
          isEditing={isEditing}
          onRemoveWidget={handleRemoveWidget}
        />
      ) : (
        <div className="h-60 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border rounded-2xl bg-card">
          <p className="font-semibold">No Dashboard Selected or Created.</p>
          <Button onClick={handleCreateNew} className="mt-4 bg-primary text-primary-foreground font-semibold">
            Create Your First Dashboard
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        title="Delete Dashboard"
        description="Are you sure you want to delete this custom dashboard? Click Yes to confirm or No to cancel."
        confirmText="Yes, Delete"
        cancelText="No, Cancel"
        variant="destructive"
        loading={deleteDashMutation.isPending}
        onConfirm={() => deleteDashMutation.mutate()}
      />
    </div>
  );
};
export default DashboardBuilder;
