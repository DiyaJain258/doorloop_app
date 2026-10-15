import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { MaintenanceAsset } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { FormDialog } from '../../components/FormDialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { AssetConditionIndicator } from '../../components/MaintenanceComponents';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const AssetsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [serial, setSerial] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState('');

  // Queries
  const { data: assets = [], isLoading } = useQuery({ queryKey: ['assets-list'], queryFn: () => api.assets.getAll() });
  const { data: properties = [] } = useQuery({ queryKey: ['properties'], queryFn: () => api.property.getAll() });
  const [propertyId, setPropertyId] = useState('');

  const createMutation = useMutation({
    mutationFn: () => {
      const prop = properties.find((p) => p.id === propertyId);
      return api.assets.create({
        assetName: name,
        serialNumber: serial,
        propertyId,
        propertyName: prop ? prop.name : 'Property Portfolio',
        location,
        purchaseDate: new Date().toISOString().split('T')[0],
        warrantyExpiration: new Date().toISOString().split('T')[0],
        manufacturer,
        model,
        expectedLife: 10,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets-list'] });
      setIsOpen(false);
      setName('');
      setSerial('');
      setManufacturer('');
      setModel('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.assets.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets-list'] });
      setDeleteId(null);
    },
  });

  const filteredAssets = assets.filter((a) =>
    a.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.propertyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<MaintenanceAsset>[] = [
    { accessorKey: 'assetName', header: 'Asset Name', id: 'name', cell: ({ row }) => <span className="font-bold">{row.original.assetName}</span> },
    { accessorKey: 'serialNumber', header: 'Serial Number', id: 'serial', cell: ({ row }) => <span className="font-mono">{row.original.serialNumber}</span> },
    { accessorKey: 'propertyName', header: 'Location Property', id: 'property' },
    { accessorKey: 'location', header: 'Internal Room', id: 'location' },
    { accessorKey: 'manufacturer', header: 'Brand / Make', id: 'manufacturer' },
    {
      accessorKey: 'currentCondition',
      header: 'Condition Score',
      id: 'condition',
      cell: ({ row }) => <AssetConditionIndicator condition={row.original.currentCondition} />,
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
        title="Asset Registry"
        description="Verify active water heaters, elevator setups, rooftop HVAC generators, and on-site utility pumps."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Maintenance', href: '/maintenance' },
          { label: 'Assets' },
        ]}
        action={{
          label: 'Register Physical Asset',
          onClick: () => setIsOpen(true),
          icon: <Plus className="w-4.5 h-4.5" />,
        }}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search assets by name or property location..."
        onReset={() => setSearchQuery('')}
      />

      <DataTable columns={columns} data={filteredAssets.slice(0, 100)} loading={isLoading} />

      {/* CREATE DIALOG */}
      <FormDialog open={isOpen} onOpenChange={setIsOpen} title="Register Capital Asset">
        <div className="space-y-4 pt-2">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Asset Name</label>
            <Input placeholder="E.g., Northside Mechanical Elevator #2" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Property Location</label>
              <Select value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
                <option value="">Select Property...</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Internal Location</label>
              <Input placeholder="E.g., Boiler Room Zone A" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Serial Number</label>
              <Input placeholder="E.g., SN-88998822" value={serial} onChange={(e) => setSerial(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Manufacturer / Brand</label>
              <Input placeholder="E.g., Carrier Corp" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Model Code</label>
            <Input placeholder="E.g., MOD-HVAC-99" value={model} onChange={(e) => setModel(e.target.value)} />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!name || !propertyId || createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Asset
            </Button>
          </div>

        </div>
      </FormDialog>
    </div>
  );
};
export default AssetsPage;
