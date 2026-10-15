import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { VisitorCard } from '../../components/TenantComponents';
import { FormDialog } from '../../components/FormDialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Plus, Users, Loader2 } from 'lucide-react';

export const TenantVisitorsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [visitorName, setVisitorName] = useState('');
  const [phone, setPhone] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');

  // Queries
  const { data: visitors = [], isLoading } = useQuery({ queryKey: ['tenant-visitors-list'], queryFn: () => api.tenantVisitors.getAll() });

  const registerMutation = useMutation({
    mutationFn: () => {
      return api.tenantVisitors.create({
        visitorName,
        phone,
        visitDate,
        arrivalTime,
        departureTime: '10:00 PM',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-visitors-list'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-dashboard-metrics'] });
      setIsOpen(false);
      setVisitorName('');
      setPhone('');
      setVisitDate('');
      setArrivalTime('');
    },
  });

  if (isLoading) {
    return <LoadingSkeleton type="card" />;
  }

  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title="Visitor Registration & Passes"
        description="Verify security guest passes, schedule vehicle entries, and check historical visitor lists."
        breadcrumbs={[
          { label: 'Home', href: '/tenant' },
          { label: 'Visitors' },
        ]}
        action={{
          label: 'Register New Guest',
          onClick: () => setIsOpen(true),
          icon: <Plus className="w-4.5 h-4.5" />,
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visitors.map((vis) => (
          <VisitorCard
            key={vis.id}
            visitorName={vis.visitorName}
            visitDate={vis.visitDate}
            arrivalTime={vis.arrivalTime}
            status={vis.status}
          />
        ))}
      </div>

      {/* CREATE VISITOR DIALOG */}
      <FormDialog open={isOpen} onOpenChange={setIsOpen} title="Register New Guest Pass">
        <div className="space-y-4 pt-2 text-xs font-semibold text-foreground">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Guest Full Name</label>
            <Input placeholder="E.g., John Connor" value={visitorName} onChange={(e) => setVisitorName(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Phone Number</label>
            <Input placeholder="(512) 555-0199" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Visit Date</label>
              <Input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Estimated Arrival</label>
              <Input placeholder="E.g., 02:00 PM" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={() => registerMutation.mutate()} disabled={!visitorName || !phone || !visitDate || registerMutation.isPending}>
              {registerMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Generate Visitor Pass
            </Button>
          </div>

        </div>
      </FormDialog>
    </div>
  );
};
export default TenantVisitorsPage;
