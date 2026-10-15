import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api';
import { PageHeader } from '../../../components/PageHeader';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { FormDialog } from '../../../components/FormDialog';
import { ShieldAlert, Trash2, Lock, Loader2, CheckCircle2, Building2, Home, Key } from 'lucide-react';

export const UnitDeletionPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Active Tab / Target Type
  const [activeTab, setActiveTab] = useState<'property' | 'building' | 'unit'>('property');

  // Selected Entities
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');

  // Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [targetType, setTargetType] = useState<'property' | 'building' | 'unit'>('property');
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Queries
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => api.property.getAll(),
  });

  const { data: buildings = [] } = useQuery({
    queryKey: ['buildings'],
    queryFn: () => api.building.getAll(),
  });

  const { data: units = [] } = useQuery({
    queryKey: ['units'],
    queryFn: () => api.unit.getAll(),
  });

  // Mutations
  const deletePropertyMutation = useMutation({
    mutationFn: (id: string) => api.property.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setIsPasswordModalOpen(false);
      setAdminPassword('');
      setSelectedPropertyId('');
      setNotification('Property and its associated buildings and units deleted successfully.');
      setTimeout(() => setNotification(null), 4000);
    },
  });

  const deleteBuildingMutation = useMutation({
    mutationFn: (id: string) => api.building.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setIsPasswordModalOpen(false);
      setAdminPassword('');
      setSelectedBuildingId('');
      setNotification('Building and its associated units deleted successfully.');
      setTimeout(() => setNotification(null), 4000);
    },
  });

  const deleteUnitMutation = useMutation({
    mutationFn: (id: string) => api.unit.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setIsPasswordModalOpen(false);
      setAdminPassword('');
      setSelectedUnitId('');
      setNotification('Unit deleted successfully from system.');
      setTimeout(() => setNotification(null), 4000);
    },
  });

  const handleOpenDeleteModal = (type: 'property' | 'building' | 'unit') => {
    setTargetType(type);
    setPasswordError(null);
    setAdminPassword('');
    setIsPasswordModalOpen(true);
  };

  const handleConfirmPasswordDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      setPasswordError('Please enter your account/admin password to proceed.');
      return;
    }

    if (targetType === 'property' && selectedPropertyId) {
      deletePropertyMutation.mutate(selectedPropertyId);
    } else if (targetType === 'building' && selectedBuildingId) {
      deleteBuildingMutation.mutate(selectedBuildingId);
    } else if (targetType === 'unit' && selectedUnitId) {
      deleteUnitMutation.mutate(selectedUnitId);
    }
  };

  const selectedPropObj = properties.find((p) => p.id === selectedPropertyId);
  const selectedBldObj = buildings.find((b) => b.id === selectedBuildingId);
  const selectedUnitObj = units.find((u) => u.id === selectedUnitId);

  const getTargetItemName = () => {
    if (targetType === 'property') return selectedPropObj ? `Property: ${selectedPropObj.name}` : 'the selected property';
    if (targetType === 'building') return selectedBldObj ? `Building: ${selectedBldObj.name}` : 'the selected building';
    if (targetType === 'unit') return selectedUnitObj ? `Unit ${selectedUnitObj.unitNumber} (${selectedUnitObj.propertyName})` : 'the selected unit';
    return 'the selected item';
  };

  const isDeleting = deletePropertyMutation.isPending || deleteBuildingMutation.isPending || deleteUnitMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset & Portfolio Security Deletion"
        description="Centralized authorization portal for password-restricted removal of Properties, Buildings, and Units across your portfolio."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Admin' }, { label: 'Asset Security Deletion' }]}
      />

      {notification && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 max-w-3xl">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="flex space-x-2 border-b border-border pb-2 max-w-3xl">
        <button
          onClick={() => setActiveTab('property')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded-xl transition ${
            activeTab === 'property'
              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <Building2 className="w-4 h-4" /> Properties Deletion
        </button>

        <button
          onClick={() => setActiveTab('unit')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded-xl transition ${
            activeTab === 'unit'
              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <Key className="w-4 h-4" /> Units Deletion
        </button>
      </div>

      {/* TAB 1: PROPERTIES DELETION */}
      {activeTab === 'property' && (
        <div className="bg-card border border-rose-500/30 p-6 rounded-2xl max-w-3xl space-y-4 shadow-sm animate-fade-in">
          <div className="border-b border-rose-500/20 pb-3">
            <h3 className="font-bold text-sm text-rose-500 flex items-center gap-1.5">
              <ShieldAlert className="w-4.5 h-4.5" /> Property Removal (Master Authorization Required)
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Deleting a property removes all underlying architectural structure references. Master password authentication is mandatory.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Select Property to Delete</label>
              <Select value={selectedPropertyId} onChange={(e) => setSelectedPropertyId(e.target.value)}>
                <option value="">Select a Property...</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.city} ({p.status})
                  </option>
                ))}
              </Select>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="button"
                variant="destructive"
                disabled={!selectedPropertyId}
                onClick={() => handleOpenDeleteModal('property')}
                className="flex items-center gap-2 font-bold"
              >
                <Trash2 className="w-4 h-4" /> Authorize & Delete Property
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: UNITS DELETION */}
      {activeTab === 'unit' && (
        <div className="bg-card border border-rose-500/30 p-6 rounded-2xl max-w-3xl space-y-4 shadow-sm animate-fade-in">
          <div className="border-b border-rose-500/20 pb-3">
            <h3 className="font-bold text-sm text-rose-500 flex items-center gap-1.5">
              <ShieldAlert className="w-4.5 h-4.5" /> Unit Removal (Master Authorization Required)
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Unit deletion has been moved to this centralized portal to prevent accidental action bar deletions. Password authentication is required.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Select Unit to Delete</label>
              <Select value={selectedUnitId} onChange={(e) => setSelectedUnitId(e.target.value)}>
                <option value="">Select a Unit...</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    Unit {u.unitNumber} - {u.propertyName} ({u.status})
                  </option>
                ))}
              </Select>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="button"
                variant="destructive"
                disabled={!selectedUnitId}
                onClick={() => handleOpenDeleteModal('unit')}
                className="flex items-center gap-2 font-bold"
              >
                <Trash2 className="w-4 h-4" /> Authorize & Delete Unit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* UNIFIED MASTER PASSWORD AUTHORIZATION MODAL */}
      <FormDialog
        open={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
        title="Master Password Authorization Required"
      >
        <form onSubmit={handleConfirmPasswordDelete} className="space-y-4 pt-2">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-semibold text-rose-500">
            You are about to permanently delete <span className="font-extrabold">{getTargetItemName()}</span>. This operation cannot be reversed.
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase">
              Enter Admin Password to Authorize Deletion
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Enter admin password..."
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  setPasswordError(null);
                }}
                className="pl-10 text-foreground"
                autoFocus
              />
            </div>
            {passwordError && (
              <p className="text-rose-500 text-xs font-semibold mt-1">{passwordError}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isDeleting}
              className="font-bold flex items-center gap-1.5"
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Authorize & Permanently Delete
            </Button>
          </div>
        </form>
      </FormDialog>
    </div>
  );
};
export default UnitDeletionPage;
