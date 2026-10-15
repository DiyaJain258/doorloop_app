import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api';
import { PageHeader } from '../../../components/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Sparkles, Users, Plus, ShieldCheck } from 'lucide-react';

export const TeamsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [manager, setManager] = useState('');

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['admin-teams-list'],
    queryFn: () => api.teams.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (newTeam: any) => api.teams.create(newTeam),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-teams-list'] });
      setName('');
      setDescription('');
      setManager('');
      alert('Organizational team created successfully!');
    },
  });

  const handleCreate = () => {
    if (!name.trim()) {
      alert('Please enter a team name.');
      return;
    }
    createMutation.mutate({ name, description, manager });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teams Management"
        description="Configure organizational groups (e.g. Leasing, Accounting, Maintenance) and assign managers."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Admin' }, { label: 'Teams' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teams List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <span className="text-xs text-muted-foreground">Fetching divisions...</span>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teams.map((t) => (
                <Card key={t.id} className="p-5 border border-border bg-card space-y-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xl p-1 bg-primary/10 text-primary rounded-lg">
                        <Users className="w-5 h-5" />
                      </span>
                      <div>
                        <h4 className="font-extrabold text-sm text-foreground">{t.name}</h4>
                        <span className="text-[10px] text-muted-foreground font-semibold">Manager: {t.manager || 'Unassigned'}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                    {t.description || 'No description provided.'}
                  </p>
                  <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-border">
                    <span className="text-indigo-600">{t.members} Members</span>
                    <Button size="sm" variant="outline" onClick={() => alert('Editing members list')} className="text-[10px] py-1 px-2.5 h-7">
                      Assign Users
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Create Team Form */}
        <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm h-fit">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border pb-2">
            <Sparkles className="w-4 h-4 text-primary" /> Create New Team
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Team Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. North Maintenance Squad" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Manager Name</label>
            <Input value={manager} onChange={(e) => setManager(e.target.value)} placeholder="e.g. John Doe" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief focus..." />
          </div>

          <Button onClick={handleCreate} className="w-full bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-1">
            <Plus className="w-4 h-4" /> Deploy Team
          </Button>
        </div>
      </div>
    </div>
  );
};
export default TeamsPage;
