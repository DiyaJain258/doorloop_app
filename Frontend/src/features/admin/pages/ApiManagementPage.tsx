import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api';
import { PageHeader } from '../../../components/PageHeader';
import { ApiKeyCard } from '../components/ApiKeyCard';
import { Button } from '../../../components/ui/Button';
import { Plus } from 'lucide-react';

export const ApiManagementPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: keys = [], isLoading } = useQuery({
    queryKey: ['api-developer-keys'],
    queryFn: () => api.apiKeys.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => api.apiKeys.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-developer-keys'] });
      alert('Developer API token created successfully!');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => api.apiKeys.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-developer-keys'] });
      alert('API key revoked.');
    },
  });

  const handleCreate = () => {
    const name = prompt('Enter API key name:');
    if (name) {
      createMutation.mutate(name);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Management"
        description="Review active developer access secrets, construct new tokens, or revoke key privileges."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Admin' }, { label: 'API Management' }]}
      />

      <div className="flex justify-between items-center bg-card border border-border p-4 rounded-xl">
        <span className="text-xs font-semibold text-muted-foreground">Developer Authorization Center</span>
        <Button onClick={handleCreate} className="bg-primary text-primary-foreground font-semibold flex items-center gap-1">
          <Plus className="w-4 h-4" /> Create Key
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <span className="text-xs text-muted-foreground">Mapping security keys...</span>
        ) : (
          keys.map((k) => (
            <ApiKeyCard key={k.id} keyItem={k} onRevoke={revokeMutation.mutate} />
          ))
        )}
      </div>
    </div>
  );
};
export default ApiManagementPage;
