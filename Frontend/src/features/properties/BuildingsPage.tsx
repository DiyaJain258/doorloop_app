import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import api from '../../api';
import { Building } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { FormDialog } from '../../components/FormDialog';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { StatusBadge } from '../../components/StatusBadge';
import { Plus, Trash2, Pencil, Loader2, Lock } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

const buildingSchema = zod.object({
  propertyId: zod.string().min(1, 'Property is required'),
  name: zod.string().min(1, 'Building Name is required'),
  floors: zod.number().min(1, 'Must have at least 1 floor'),
  unitsCount: zod.number().min(0),
  address: zod.string().optional(),
  status: zod.enum(['Active', 'Inactive']),
});

type BuildingFormValues = zod.infer<typeof buildingSchema>;

export const BuildingsPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);

  // Queries
  const { data: buildings = [], isLoading } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => api.building.getAll(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => api.property.getAll(),
  });

  // Form Setup
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BuildingFormValues>({
    resolver: zodResolver(buildingSchema),
    defaultValues: { floors: 3, unitsCount: 0, status: 'Active' },
  });

  const selectedPropertyId = watch('propertyId');

  React.useEffect(() => {
    if (selectedPropertyId && properties.length > 0) {
      const prop = properties.find((p) => p.id === selectedPropertyId);
      if (prop) {
        setValue('address', prop.address || prop.streetAddress || '');
      }
    }
  }, [selectedPropertyId, properties, setValue]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newBld: BuildingFormValues) => {
      const prop = properties.find((p) => p.id === newBld.propertyId);
      return api.building.create({
        ...newBld,
        propertyName: prop ? prop.name : 'Unknown Property',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      setIsFormOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updatedBld: BuildingFormValues) => {
      if (!editingBuilding) throw new Error('No building selected for update');
      const prop = properties.find((p) => p.id === updatedBld.propertyId);
      return api.building.update(editingBuilding.id, {
        ...updatedBld,
        propertyName: prop ? prop.name : 'Unknown Property',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      setIsFormOpen(false);
      setEditingBuilding(null);
      reset();
    },
  });

  const handleOpenAddModal = () => {
    setEditingBuilding(null);
    const firstProp = properties[0];
    const defaultAddr = firstProp ? (firstProp.address || firstProp.streetAddress || '') : '';
    reset({
      propertyId: firstProp?.id || '',
      name: '',
      floors: 3,
      unitsCount: 0,
      address: defaultAddr,
      status: 'Active',
    });
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (building: Building) => {
    setEditingBuilding(building);
    const prop = properties.find((p) => p.id === building.propertyId);
    const buildingAddr = prop ? (prop.address || prop.streetAddress || '') : (building.address || '');
    reset({
      propertyId: building.propertyId || '',
      name: building.name || '',
      floors: building.floors || 1,
      unitsCount: building.unitsCount || 0,
      address: buildingAddr,
      status: (building.status === 'Inactive' ? 'Inactive' : 'Active') as 'Active' | 'Inactive',
    });
    setIsFormOpen(true);
  };

  const onSubmit = (values: BuildingFormValues) => {
    if (editingBuilding) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const filteredBuildings = buildings.filter((bld) =>
    bld.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bld.propertyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<Building>[] = [
    { accessorKey: 'name', header: t('pmProperties.buildingName'), id: 'name', cell: ({ row }) => <span className="font-bold">{row.original.name}</span> },
    { accessorKey: 'propertyName', header: t('pmLeasing.property'), id: 'property' },
    { accessorKey: 'floors', header: t('pmProperties.floors'), id: 'floors' },
    { accessorKey: 'unitsCount', header: t('pmProperties.totalUnits'), id: 'units' },
    {
      accessorKey: 'occupancyRate',
      header: t('pmProperties.occupancy'),
      id: 'occupancy',
      cell: ({ row }) => <span>{row.original.occupancyRate || 0}%</span>,
    },
    {
      accessorKey: 'status',
      header: t('pmIncome.status'),
      id: 'status',
      cell: ({ row }) => <StatusBadge status={row.original.status || 'Active'} />,
    },
    {
      id: 'actions',
      header: t('pmCoa.actions'),
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenEditModal(row.original)}
            className="text-muted-foreground hover:text-primary hover:bg-primary/10"
            title="Edit Building"
          >
            <Pencil className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('pmProperties.buildingsTitle')}
        description={t('pmProperties.buildingsDesc')}
        breadcrumbs={[
          { label: t('header.home'), href: '/' },
          { label: t('nav.properties'), href: '/properties' },
          { label: t('pmProperties.buildingsTitle') },
        ]}
        action={{
          label: t('pmProperties.addBuilding'),
          onClick: handleOpenAddModal,
          icon: <Plus className="w-4.5 h-4.5" />,
        }}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t('pmProperties.searchBuildings')}
        onReset={() => setSearchQuery('')}
      />

      <DataTable columns={columns} data={filteredBuildings} loading={isLoading} />

      {/* ADD / EDIT BUILDING DIALOG */}
      <FormDialog 
        open={isFormOpen} 
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingBuilding(null);
        }} 
        title={editingBuilding ? "Edit Building" : "Add New Building"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Associated Property</label>
            <Select 
              {...register('propertyId', {
                onChange: (e) => {
                  const selectedId = e.target.value;
                  const prop = properties.find((p) => p.id === selectedId);
                  setValue('address', prop ? (prop.address || prop.streetAddress || '') : '');
                },
              })}
            >
              <option value="">Select Property...</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
            {errors.propertyId && <p className="text-rose-500 text-xs">{errors.propertyId.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Building Name</label>
            <Input placeholder="Building B / Block C" {...register('name')} />
            {errors.name && <p className="text-rose-500 text-xs">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Number of Floors</label>
            <Input type="number" {...register('floors', { valueAsNumber: true })} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Street Address</label>
            <Input 
              placeholder="Select property to view address" 
              disabled 
              readOnly 
              className="bg-slate-100 dark:bg-slate-800 text-muted-foreground opacity-75 cursor-not-allowed"
              {...register('address')} 
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Status</label>
            <Select {...register('status')}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => {
              setIsFormOpen(false);
              setEditingBuilding(null);
            }}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingBuilding ? "Update Building" : "Save Building"}
            </Button>
          </div>
        </form>
      </FormDialog>
    </div>
  );
};
export default BuildingsPage;
