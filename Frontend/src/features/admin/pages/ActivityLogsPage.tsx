import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api';
import { PageHeader } from '../../../components/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Select } from '../../../components/ui/Select';
import { Sparkles, Calendar, Layers } from 'lucide-react';

export const ActivityLogsPage: React.FC = () => {
  const [activeModule, setActiveModule] = useState('All');

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['admin-activity-logs'],
    queryFn: () => api.activity.getAll(),
  });

  const filtered = activeModule === 'All'
    ? activities
    : activities.filter((a) => a.module === activeModule);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Logs"
        description="Live timeline of operational modifications made by staff members across property modules."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Admin' }, { label: 'Activity Logs' }]}
      />

      <div className="flex items-center space-x-2 bg-card border border-border p-4 rounded-xl">
        <span className="text-xs font-semibold text-muted-foreground font-semibold">Filter Module:</span>
        <Select value={activeModule} onChange={(e) => setActiveModule(e.target.value)}>
          <option value="All">All Modules</option>
          <option value="Properties">Properties</option>
          <option value="Payments">Payments</option>
          <option value="Documents">Documents</option>
        </Select>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <span className="text-xs text-muted-foreground">Indexing timeline...</span>
        ) : (
          filtered.map((item) => (
            <Card key={item.id} className="p-4 border border-border bg-card hover:border-primary/45 transition shadow-sm">
              <div className="flex justify-between items-start text-xs font-semibold text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-foreground">{item.user}</span>
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    {item.module}
                  </span>
                </div>
                <span className="text-[10px] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  {item.timestamp}
                </span>
              </div>
              <p className="text-xs text-foreground/90 font-bold mt-2 leading-relaxed flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> {item.description}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
export default ActivityLogsPage;
