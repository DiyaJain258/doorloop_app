import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { ColumnDef } from '@tanstack/react-table';

export const CommContactsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Queries
  const { data: contacts = [], isLoading } = useQuery({ queryKey: ['comm-contacts-list'], queryFn: () => api.contacts.getAll() });

  const filteredCont = contacts.filter((c) => {
    const nameMatch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const roleMatch = roleFilter === '' || c.role === roleFilter;
    return nameMatch && roleMatch;
  });

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'name', header: 'Contact Name', id: 'name', cell: ({ row }) => <span className="font-bold">{row.original.name}</span> },
    { accessorKey: 'role', header: 'Role Type', id: 'role', cell: ({ row }) => <span className="font-extrabold uppercase text-[9px] bg-secondary border px-2 py-0.5 rounded">{row.original.role}</span> },
    { accessorKey: 'property', header: 'Associated Property', id: 'property' },
    { accessorKey: 'email', header: 'Email Address', id: 'email' },
    { accessorKey: 'phone', header: 'Phone Number', id: 'phone' },
    { accessorKey: 'status', header: 'Status', id: 'status' },
  ];

  return (
    <div>
      <PageHeader
        title="Communication Contacts Directory"
        description="Verify tenants directories, portfolio owners, contractors vendors, or staff employees."
        breadcrumbs={[
          { label: 'Home', href: '/communication' },
          { label: 'Contacts' },
        ]}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search contact names..."
        filters={[
          {
            key: 'role',
            value: roleFilter,
            placeholder: 'Role Group',
            options: [
              { label: 'Tenant', value: 'Tenant' },
              { label: 'Owner', value: 'Owner' },
              { label: 'Vendor', value: 'Vendor' },
              { label: 'Employee', value: 'Employee' },
            ],
          },
        ]}
        onFilterChange={(key, val) => {
          if (key === 'role') setRoleFilter(val);
        }}
        onReset={() => {
          setSearchQuery('');
          setRoleFilter('');
        }}
      />

      <DataTable columns={columns} data={filteredCont.slice(0, 100)} loading={isLoading} />
    </div>
  );
};
export default CommContactsPage;
