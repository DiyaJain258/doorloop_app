import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { PackageCard } from '../../components/TenantComponents';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';

export const TenantPackagesPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Queries
  const { data: packages = [], isLoading } = useQuery({ queryKey: ['tenant-packages-list'], queryFn: () => api.tenantPackages.getAll() });

  const pickupMutation = useMutation({
    mutationFn: (id: string) => api.tenantPackages.pickup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-packages-list'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-dashboard-metrics'] });
    },
  });

  if (isLoading) {
    return <LoadingSkeleton type="card" />;
  }

  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title="My Parcels & Packages"
        description="Verify carrier delivery arrivals, parcel lockers slots status, and pickup logs history."
        breadcrumbs={[
          { label: 'Home', href: '/tenant' },
          { label: 'Packages' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            carrier={pkg.carrier}
            trackingNumber={pkg.trackingNumber}
            deliveredDate={pkg.deliveredDate}
            pickupStatus={pkg.pickupStatus}
            onPickup={() => pickupMutation.mutate(pkg.id)}
          />
        ))}
      </div>
    </div>
  );
};
export default TenantPackagesPage;
