import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { ActivityTimeline } from '../../components/CommunicationComponents';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';

export const CommActivityPage: React.FC = () => {
  // Queries
  const { data: activities = [], isLoading } = useQuery({ queryKey: ['comm-activity-timeline'], queryFn: () => api.communication.getActivityLog() });

  if (isLoading) {
    return <LoadingSkeleton type="card" />;
  }

  return (
    <div className="space-y-6 text-foreground max-w-3xl">
      <PageHeader
        title="Communication Activity Logs"
        description="Verify system dispatch audits, campaign started markers, template usages, and delivery timelines."
        breadcrumbs={[
          { label: 'Home', href: '/communication' },
          { label: 'Activity Logs' },
        ]}
      />

      <Card className="p-6 border bg-card">
        <h3 className="font-extrabold text-sm uppercase border-b pb-2 tracking-wider mb-4">Outbound dispatch audits</h3>
        <ActivityTimeline activities={activities} />
      </Card>
    </div>
  );
};
export default CommActivityPage;
