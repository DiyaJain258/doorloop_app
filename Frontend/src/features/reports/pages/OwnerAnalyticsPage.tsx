import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api';
import { PageHeader } from '../../../components/PageHeader';
import { FilterBuilder } from '../components/FilterBuilder';
import { DataTable } from '../../../components/DataTable';
import { AnalyticsCard } from '../components/AnalyticsCard';
import { ColumnDef } from '@tanstack/react-table';

export const OwnerAnalyticsPage: React.FC = () => {
  const [filters, setFilters] = useState({
    propertyId: 'all',
    dateRange: 'all',
    status: 'all',
    searchQuery: '',
  });

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['owner-portfolios', filters],
    queryFn: () => api.analytics.getPropertyPerformance(),
  });

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'property', header: 'Property Name', id: 'property' },
    { accessorKey: 'units', header: 'Total Units', id: 'units' },
    { accessorKey: 'occupancyRate', header: 'Occupancy Rate', id: 'occupancyRate', cell: ({ getValue }) => `${getValue()}%` },
    { accessorKey: 'revenue', header: 'Owner Income', id: 'revenue', cell: ({ getValue }) => `$${(getValue() as number).toLocaleString()}` },
    { accessorKey: 'expenses', header: 'Owner Expenses', id: 'expenses', cell: ({ getValue }) => `$${(getValue() as number).toLocaleString()}` },
    { accessorKey: 'noi', header: 'Net Payout (NOI)', id: 'noi', cell: ({ getValue }) => `$${(getValue() as number).toLocaleString()}` },
    { accessorKey: 'roi', header: 'Yield % (ROI)', id: 'roi', cell: ({ getValue }) => `${getValue()}%` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Owner Analytics"
        description="Monitor investor portfolio yields, total managed assets, distribution histories, and building ROI rankings."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reports' }, { label: 'Owners' }]}
      />

      <FilterBuilder onFilterChange={setFilters} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <AnalyticsCard title="Total Owners" value="105" description="Registered portfolio beneficiaries" />
        <AnalyticsCard title="Managed Value" value="$150M" description="Total properties current valuation" />
        <AnalyticsCard title="Average Return" value="6.4%" description="Median portfolio capitalization rate" />
      </div>

      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-sm text-foreground mb-4 uppercase">Owner Portfolio Performance</h3>
        <DataTable columns={columns} data={properties} loading={isLoading} />
      </div>
    </div>
  );
};
export default OwnerAnalyticsPage;
