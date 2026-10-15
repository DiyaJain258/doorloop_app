import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api';
import { PageHeader } from '../../../components/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Sparkles, Shield, UserX } from 'lucide-react';

const MOCK_SESSIONS = [
  { id: 'sess-1', device: 'Chrome on macOS (Mac Studio)', location: 'San Francisco, CA', lastActive: 'Active Now' },
  { id: 'sess-2', device: 'Safari on iPhone 15 Pro', location: 'Los Angeles, CA', lastActive: '3 hours ago' },
];

export const SecurityPage: React.FC = () => {
  const { data: policies } = useQuery({
    queryKey: ['security-policies-data'],
    queryFn: () => api.security.getPolicies(),
  });

  const handleSave = () => {
    alert('Security policy criteria updated!');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security Console"
        description="Verify active user sessions, configure multi-factor constraints (MFA), and define IP range whitelists."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Admin' }, { label: 'Security' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Auth settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-card border-border space-y-6 shadow-sm">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border pb-2">
              <Sparkles className="w-4 h-4 text-primary" /> Credentials & Session Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground font-semibold">Minimum Password Policy</label>
                <Select defaultValue="strong">
                  <option value="basic">Basic (8 chars)</option>
                  <option value="strong">Strong (10 chars, symbol)</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground font-semibold">Session Timeout (Minutes)</label>
                <Input type="number" defaultValue="30" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground font-semibold">Two Factor Authentication (MFA)</label>
                <Select defaultValue="required">
                  <option value="optional">Optional for standard accounts</option>
                  <option value="required">Enforced for all users</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground font-semibold">Allowed IP Ranges</label>
                <Input type="text" defaultValue="192.168.1.0/24" />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <Button onClick={handleSave} className="bg-primary text-primary-foreground font-semibold">
                Apply Policies
              </Button>
            </div>
          </Card>
        </div>

        {/* Sessions audit */}
        <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm h-fit">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border pb-2">
            <Shield className="w-4 h-4 text-primary" /> Active Login Sessions
          </h3>
          <div className="space-y-3">
            {MOCK_SESSIONS.map((sess) => (
              <div key={sess.id} className="p-3 border border-border rounded-xl space-y-1.5 text-xs font-semibold">
                <div className="flex justify-between items-center">
                  <span className="text-foreground">{sess.device}</span>
                  <button onClick={() => alert('Session terminated')} className="text-rose-500 hover:text-rose-600 transition" title="Revoke session">
                    <UserX className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Loc: {sess.location}</span>
                  <span>{sess.lastActive}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SecurityPage;
