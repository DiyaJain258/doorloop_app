import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import { OwnerDistribution } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { StatusBadge } from '../../components/StatusBadge';
import { ColumnDef } from '@tanstack/react-table';

export const OwnerDistributionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // Queries
  const { data: distributions = [], isLoading } = useQuery({ queryKey: ['owner-distributions-list'], queryFn: () => api.ownerDistributions.getAll() });

  const filteredDist = distributions.filter((d) =>
    d.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.distributionNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<OwnerDistribution>[] = [
    { accessorKey: 'distributionNumber', header: t('owner.distributions.number'), id: 'number', cell: ({ row }) => <span className="font-bold">{row.original.distributionNumber}</span> },
    { accessorKey: 'propertyName', header: t('owner.distributions.property'), id: 'property' },
    { accessorKey: 'date', header: t('owner.distributions.date'), id: 'date' },
    {
      accessorKey: 'amount',
      header: t('owner.distributions.amount'),
      id: 'amount',
      cell: ({ row }) => <span className="font-extrabold text-emerald-500">${(Number(row.original.amount) || 0).toLocaleString()}</span>,
    },
    { accessorKey: 'method', header: t('owner.distributions.method'), id: 'method' },
    {
      accessorKey: 'status',
      header: t('owner.distributions.status'),
      id: 'status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('owner.distributions.title')}
        description={t('owner.distributions.desc')}
        breadcrumbs={[
          { label: t('header.home'), href: '/owner' },
          { label: t('owner.nav.distributions') },
        ]}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t('owner.distributions.searchPlaceholder')}
        onReset={() => setSearchQuery('')}
      />

      <DataTable columns={columns} data={filteredDist.slice(0, 100)} loading={isLoading} />
    </div>
  );
};
export default OwnerDistributionsPage;
