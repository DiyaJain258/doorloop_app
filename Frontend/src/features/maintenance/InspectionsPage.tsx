import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import { InspectionRecord } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { FormDialog } from '../../components/FormDialog';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { InspectionChecklist } from '../../components/MaintenanceComponents';
import { Plus, Eye, Trash2, Printer } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const InspectionsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog state
  const [selectedIns, setSelectedIns] = useState<InspectionRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Queries
  const { data: inspections = [], isLoading } = useQuery({ queryKey: ['inspections-list'], queryFn: () => api.inspections.getAll() });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.inspections.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections-list'] });
      setDeleteId(null);
    },
  });

  const filteredInspections = inspections.filter((ins) =>
    ins.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ins.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<InspectionRecord>[] = [
    { accessorKey: 'propertyName', header: t('maintenanceRequests.propertyLocation'), id: 'property', cell: ({ row }) => <span className="font-bold">{row.original.propertyName}</span> },
    { accessorKey: 'unitNumber', header: t('maintenanceRequests.unit'), id: 'unit' },
    { accessorKey: 'type', header: t('maintenanceInspections.inspectionType'), id: 'type' },
    { accessorKey: 'date', header: t('maintenanceWorkOrders.scheduledDate'), id: 'date' },
    {
      accessorKey: 'checklist',
      header: t('maintenanceInspections.results'),
      id: 'fails',
      cell: ({ row }) => {
        const fails = row.original.checklist.filter((item) => item.status === 'Fail').length;
        return (
          <span className={fails > 0 ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>
            {fails > 0 ? `${fails} Fails` : 'All Pass'}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: t('maintenanceRequests.status'),
      id: 'status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: t('maintenanceRequests.actions'),
      cell: ({ row }) => (
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" onClick={() => setSelectedIns(row.original)} title="View Checklist">
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(row.original.id)}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Delete Record"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('maintenanceInspections.title')}
        description={t('maintenanceInspections.desc')}
        breadcrumbs={[
          { label: t('header.home'), href: '/' },
          { label: t('nav.maintenance'), href: '/maintenance' },
          { label: t('maintenanceInspections.title') },
        ]}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t('maintenanceRequests.searchPlaceholder')}
        onReset={() => setSearchQuery('')}
      />

      <DataTable columns={columns} data={filteredInspections.slice(0, 100)} loading={isLoading} />

      {/* INSPECTION CHECKLIST DIALOG */}
      <FormDialog open={!!selectedIns} onOpenChange={(open) => !open && setSelectedIns(null)} title="Property Inspection checklist">
        {selectedIns && (
          <div className="space-y-4 pt-2">
            <div className="flex justify-between border-b pb-2 text-xs font-semibold text-foreground">
              <div>
                <h4 className="font-extrabold text-sm uppercase">{selectedIns.type} Report</h4>
                <p className="text-muted-foreground mt-0.5">Property: {selectedIns.propertyName} • Unit: {selectedIns.unitNumber}</p>
              </div>
              <StatusBadge status={selectedIns.status} />
            </div>

            <InspectionChecklist checklist={selectedIns.checklist} readOnly={true} />

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedIns(null)}>Close</Button>
              <Button variant="outline" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold">
                <Printer className="w-4 h-4" /> Print PDF Report
              </Button>
            </div>
          </div>
        )}
      </FormDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Inspection Record"
        description="Are you sure you want to delete this inspection record? Click Yes to confirm or No to cancel."
        confirmText="Yes, Delete"
        cancelText="No, Cancel"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
};
export default InspectionsPage;
