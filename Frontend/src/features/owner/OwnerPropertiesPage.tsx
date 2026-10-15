import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { FormDialog } from '../../components/FormDialog';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Building, MapPin, Trash2, Home, DollarSign, Users, Layers, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const OwnerPropertiesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);

  // Create Property States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [propertyName, setPropertyName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyType, setPropertyType] = useState('Commercial');
  const [propertyRent, setPropertyRent] = useState(2400);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Queries
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['owner-properties-list'],
    queryFn: () => api.ownerProperties.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (newProp: any) => api.ownerProperties.create(newProp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-properties-list'] });
      setIsCreateOpen(false);
      setPropertyName('');
      setPropertyAddress('');
      setPropertyType('Commercial');
      setPropertyRent(2400);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.ownerProperties.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-properties-list'] });
      setDeleteId(null);
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (propertyName) {
      createMutation.mutate({
        name: propertyName,
        address: propertyAddress,
        type: propertyType,
        monthlyRent: Number(propertyRent)
      });
    }
  };

  if (isLoading) {
    return <LoadingSkeleton type="card" />;
  }

  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title={t('owner.ownerProperties.title')}
        description={t('owner.ownerProperties.desc')}
        breadcrumbs={[
          { label: t('header.home'), href: '/owner' },
          { label: t('owner.ownerProperties.title') },
        ]}
      />

      <div className="flex flex-col gap-4 w-full">
        {properties.map((p: any) => (
          <Card key={p.id} className="p-6 border bg-card w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-primary/40 transition-all shadow-sm">
            {/* Left Info Section */}
            <div className="space-y-3 flex-1 min-w-[280px]">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-black text-lg uppercase tracking-tight">{p.name}</h4>
                    <StatusBadge status={p.status || 'Active'} />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground inline-block mt-1">
                    {p.type}
                  </span>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center text-xs text-muted-foreground font-medium">
                <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0 text-primary" />
                <span className="truncate">{p.address}</span>
              </div>

              {/* Specs Pills */}
              <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-muted-foreground">
                {p.squareFootage > 0 && (
                  <span className="bg-secondary/40 px-2.5 py-1 rounded-md border border-border">
                    {p.squareFootage.toLocaleString()} sq ft
                  </span>
                )}
                {p.yearBuilt && (
                  <span className="bg-secondary/40 px-2.5 py-1 rounded-md border border-border">
                    Built {p.yearBuilt}
                  </span>
                )}
                <span className="bg-secondary/40 px-2.5 py-1 rounded-md border border-border">
                  {p.ownershipPercentage || 100}% Share
                </span>
              </div>
            </div>

            {/* Center Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-secondary/15 rounded-2xl p-4 text-xs font-semibold border border-border/50 w-full md:w-auto min-w-[320px]">
              <div className="space-y-0.5">
                <p className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Total Units</p>
                <p className="font-black text-base text-foreground">{p.unitsCount || 0} Units</p>
                <p className="text-[10px] text-muted-foreground font-medium">
                  {p.occupiedUnits || 0} Occ / {p.vacantUnits || 0} Vac
                </p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Est. Monthly Rent</p>
                <p className="font-black text-base text-emerald-400">
                  ${(p.monthlyRent || p.totalRent || 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium">
                  Occ. Rate: {p.occupancyRate || 0}%
                </p>
              </div>

              {p.currentValue > 0 && (
                <div className="space-y-0.5 col-span-2 sm:col-span-1">
                  <p className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Asset Valuation</p>
                  <p className="font-black text-base text-primary">
                    ${p.currentValue.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">Market Value</p>
                </div>
              )}
            </div>

            {/* Right Action Buttons */}
            <div className="flex md:flex-col gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0">
              <Button size="sm" variant="outline" onClick={() => setSelectedProperty(p)} className="flex-1 md:flex-none text-xs font-bold uppercase h-10 px-5">
                {t('owner.ownerProperties.viewDetails')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDeleteId(p.id)} className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-10 px-3 rounded-xl flex items-center justify-center" title={t('owner.ownerProperties.deleteProperty')}>
                <Trash2 className="w-4 h-4 mr-1 md:mr-0" />
                <span className="md:hidden text-xs font-bold">Delete</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* COMPREHENSIVE DETAIL DIALOG */}
      <FormDialog open={!!selectedProperty} onOpenChange={(open) => !open && setSelectedProperty(null)} title="Managed Asset Profile & Units Breakdown">
        {selectedProperty && (
          <div className="space-y-6 pt-2 text-xs font-semibold text-foreground max-h-[75vh] overflow-y-auto pr-1">
            {/* Header info */}
            <div className="flex justify-between items-start border-b pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <Building className="w-6 h-6 shrink-0" />
                </div>
                <div>
                  <h3 className="font-black text-lg uppercase tracking-tight">{selectedProperty.name}</h3>
                  <p className="text-muted-foreground text-xs font-medium flex items-center mt-0.5">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-primary shrink-0" />
                    {selectedProperty.address}
                  </p>
                </div>
              </div>
              <StatusBadge status={selectedProperty.status || 'Active'} />
            </div>

            {/* Property Overview Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-secondary/20 p-3.5 rounded-2xl border">
              <div>
                <p className="text-[10px] uppercase text-muted-foreground font-black">Property Type</p>
                <p className="font-extrabold text-sm">{selectedProperty.type}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground font-black">Total Valuation</p>
                <p className="font-extrabold text-sm text-primary">
                  ${(selectedProperty.currentValue || selectedProperty.purchasePrice || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground font-black">Monthly Rent Revenue</p>
                <p className="font-extrabold text-sm text-emerald-400">
                  ${(selectedProperty.monthlyRent || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground font-black">Ownership Share</p>
                <p className="font-extrabold text-sm">{selectedProperty.ownershipPercentage || 100}%</p>
              </div>
            </div>

            {/* Property Technical Specifications */}
            <div className="grid grid-cols-3 gap-3 border-t pt-4">
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Total Sq Footage</p>
                <p className="font-bold">{selectedProperty.squareFootage ? `${selectedProperty.squareFootage.toLocaleString()} sq ft` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Year Built</p>
                <p className="font-bold">{selectedProperty.yearBuilt || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Management Co.</p>
                <p className="font-bold">{selectedProperty.managementCompany || 'Apex Property Management'}</p>
              </div>
            </div>

            {/* Owner Info if available */}
            {selectedProperty.owner && (
              <div className="border-t pt-4 space-y-2">
                <p className="text-[10px] uppercase text-muted-foreground font-black tracking-wider">Owner Profile Details</p>
                <div className="grid grid-cols-2 gap-3 bg-secondary/10 p-3 rounded-xl border">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase">Email</p>
                      <p className="font-bold">{selectedProperty.owner.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-[9px] text-muted-foreground uppercase">Phone</p>
                      <p className="font-bold">{selectedProperty.owner.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Units & Rent Breakdown */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-black text-xs uppercase tracking-wider text-foreground flex items-center">
                  <Layers className="w-4 h-4 mr-1.5 text-primary" />
                  Units Breakdown & Rent Costs ({selectedProperty.units?.length || 0} Units)
                </h4>
                <span className="text-[10px] text-muted-foreground font-bold">
                  {selectedProperty.occupiedUnits || 0} Occupied / {selectedProperty.vacantUnits || 0} Vacant
                </span>
              </div>

              {selectedProperty.units && selectedProperty.units.length > 0 ? (
                <div className="border rounded-xl overflow-hidden divide-y bg-secondary/10">
                  <div className="grid grid-cols-12 p-2.5 font-extrabold text-[10px] uppercase text-muted-foreground bg-secondary/30">
                    <div className="col-span-3">Unit Number</div>
                    <div className="col-span-2">Type / Beds</div>
                    <div className="col-span-3">Monthly Rent</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Resident</div>
                  </div>
                  {selectedProperty.units.map((unit: any) => (
                    <div key={unit.id} className="grid grid-cols-12 p-2.5 items-center text-xs font-semibold hover:bg-secondary/20 transition-colors">
                      <div className="col-span-3 font-extrabold text-foreground">
                        Unit {unit.unitNumber || unit.id?.slice(0, 4)}
                        {unit.squareFootage ? <span className="block text-[9.5px] font-normal text-muted-foreground">{unit.squareFootage} sq ft</span> : null}
                      </div>
                      <div className="col-span-2 text-muted-foreground text-xs">
                        {unit.bedrooms || 1}B / {unit.bathrooms || 1}Ba
                      </div>
                      <div className="col-span-3 font-extrabold text-emerald-400">
                        ${(unit.rentAmount || 0).toLocaleString()}/mo
                        {unit.securityDeposit ? <span className="block text-[9.5px] font-normal text-muted-foreground">Dep: ${unit.securityDeposit}</span> : null}
                      </div>
                      <div className="col-span-2">
                        <StatusBadge status={unit.status || 'Vacant'} />
                      </div>
                      <div className="col-span-2 truncate text-muted-foreground text-xs font-bold">
                        {unit.tenantName || 'Vacant'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border rounded-xl text-center text-muted-foreground text-xs font-medium">
                  No units recorded for this property asset.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedProperty(null)} className="font-bold">{t('ownerProperties.close')}</Button>
            </div>
          </div>
        )}
      </FormDialog>

      {/* CREATE DIALOG */}
      <FormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} title={t('ownerProperties.addNewProperty')}>
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-3 text-xs font-semibold text-foreground">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-muted-foreground">{t('ownerProperties.propertyName')}</label>
            <Input required placeholder="E.g., Sunset Gardens" value={propertyName} onChange={e => setPropertyName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-muted-foreground">{t('ownerProperties.address')}</label>
            <Input required placeholder="E.g., 789 Palms Blvd, Austin, TX" value={propertyAddress} onChange={e => setPropertyAddress(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">{t('ownerProperties.propertyType')}</label>
              <Select value={propertyType} onChange={e => setPropertyType(e.target.value)}>
                <option value="Apartment">Apartment</option>
                <option value="Commercial">Commercial</option>
                <option value="Single Family">Single Family</option>
                <option value="Multi Family">Multi Family</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">{t('ownerProperties.targetMonthlyRent')}</label>
              <Input type="number" required min="0" value={propertyRent} onChange={e => setPropertyRent(Number(e.target.value))} />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>{t('ownerProperties.cancel')}</Button>
            <Button type="submit" className="bg-primary text-primary-foreground font-bold">{t('ownerProperties.addProperty')}</Button>
          </div>
        </form>
      </FormDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t('ownerProperties.deleteProperty')}
        description={t('ownerProperties.confirmDeleteDesc')}
        confirmText={t('ownerProperties.deleteProperty')}
        variant="destructive"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
};
export default OwnerPropertiesPage;
