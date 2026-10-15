import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { AnnouncementCard } from '../../components/TenantComponents';
import { FilterBar } from '../../components/FilterBar';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';

export const TenantAnnouncementsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Queries
  const { data: announcements = [], isLoading } = useQuery({ queryKey: ['tenant-announcements-list'], queryFn: () => api.tenantAnnouncements.getAll() });

  const filteredAnn = announcements.filter((ann) => {
    const searchMatch = ann.title.toLowerCase().includes(searchQuery.toLowerCase());
    const catMatch = categoryFilter === '' || ann.category === categoryFilter;
    return searchMatch && catMatch;
  });

  if (isLoading) {
    return <LoadingSkeleton type="card" />;
  }

  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title="Community Announcements"
        description="Verify seasonal elevator upgrades, safety announcements, fire drills schedules, or community parties."
        breadcrumbs={[
          { label: 'Home', href: '/tenant' },
          { label: 'Announcements' },
        ]}
      />

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search announcements..."
        filters={[
          {
            key: 'category',
            value: categoryFilter,
            placeholder: 'Announcement Category',
            options: [
              { label: 'Community', value: 'Community' },
              { label: 'Maintenance', value: 'Maintenance' },
              { label: 'Events', value: 'Events' },
              { label: 'Safety', value: 'Safety' },
              { label: 'Emergency', value: 'Emergency' },
            ],
          },
        ]}
        onFilterChange={(key, val) => {
          if (key === 'category') setCategoryFilter(val);
        }}
        onReset={() => {
          setSearchQuery('');
          setCategoryFilter('');
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAnn.map((ann) => (
          <AnnouncementCard
            key={ann.id}
            title={ann.title}
            category={ann.category}
            publishDate={ann.publishDate}
            body={ann.body}
            priority={ann.priority}
          />
        ))}
      </div>
    </div>
  );
};
export default TenantAnnouncementsPage;
