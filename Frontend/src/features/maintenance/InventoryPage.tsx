import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { InventoryItem } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { FormDialog } from '../../components/FormDialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { InventoryStatusBadge } from '../../components/MaintenanceComponents';
import { Plus, Minus, Loader2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

export const InventoryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog state
  const [adjustId, setAdjustId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState(1);
  const [adjustType, setAdjustType] = useState<'add' | 'remove'>('add');

  // Queries
  const { data: inventory = [], isLoading } = useQuery({ queryKey: ['inventory-list'], queryFn: () => api.inventory.getAll() });

  const adjustMutation = useMutation({
    mutationFn: () => {
      if (!adjustId) return Promise.resolve(null);
      if (adjustType === 'add') {
        return api.inventory.addStock(adjustId, adjustAmount);
      } else {
        return api.inventory.removeStock(adjustId, adjustAmount);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-list'] });
      setAdjustId(null);
      setAdjustAmount(1);
    },
  });

  const filteredInventory = inventory.filter((item) =>
    item.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<InventoryItem>[] = [
    { accessorKey: 'item', header: 'Supply Item', id: 'item', cell: ({ row }) => <span className="font-bold">{row.original.item}</span> },
    { accessorKey: 'sku', header: 'SKU Code', id: 'sku', cell: ({ row }) => <span className="font-mono">{row.original.sku}</span> },
    { accessorKey: 'category', header: 'Category', id: 'category' },
    { accessorKey: 'quantity', header: 'On Hand Qty', id: 'quantity', cell: ({ row }) => <span className="font-bold">{row.original.quantity}</span> },
    { accessorKey: 'reorderLevel', header: 'Reorder Point', id: 'reorder' },
    {
      accessorKey: 'unitCost',
      header: 'Unit Cost',
      id: 'cost',
      cell: ({ row }) => <span>${row.original.unitCost.toLocaleString()}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Stock Status',
      id: 'status',
      cell: ({ row }) => <InventoryStatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Adjust Stock',
      cell: ({ row }) => (
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setAdjustId(row.original.id);
              setAdjustType('add');
            }}
            className="text-emerald-500 hover:bg-emerald-500/10 h-8 w-8"
            title="Increment Stock"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setAdjustId(row.original.id);
              setAdjustType('remove');
            }}
            className="text-rose-500 hover:bg-rose-500/10 h-8 w-8"
            title="Decrement Stock"
          >
            <Minus className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Maintenance Supply & Inventory"
        description="Verify active filter stock counts, pipe fittings, electrical components, diagnostic testing tools, and keys."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Maintenance', href: '/maintenance' },
          { label: 'Inventory' },
        ]}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search items by SKU or description..."
        onReset={() => setSearchQuery('')}
      />

      <DataTable columns={columns} data={filteredInventory.slice(0, 100)} loading={isLoading} />

      {/* ADJUST DIALOG */}
      <FormDialog open={!!adjustId} onOpenChange={(open) => !open && setAdjustId(null)} title="Adjust Stock Quantity">
        <div className="space-y-4 pt-2">
          <p className="text-xs text-muted-foreground font-semibold">
            Specify the quantity to {adjustType === 'add' ? 'receive into' : 'issue out of'} this supply record.
          </p>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Quantity</label>
            <Input type="number" min="1" value={adjustAmount} onChange={(e) => setAdjustAmount(Math.max(1, Number(e.target.value)))} />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setAdjustId(null)}>Cancel</Button>
            <Button onClick={() => adjustMutation.mutate()} disabled={adjustMutation.isPending}>
              {adjustMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirm Adjust
            </Button>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};
export default InventoryPage;
