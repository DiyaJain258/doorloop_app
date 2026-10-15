import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { CheckCircle, XCircle } from 'lucide-react';

const BoolIcon: React.FC<{ value: boolean }> = ({ value }) =>
  value ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-400 opacity-40" />;

const PERM_COLS = ['canView', 'canUpload', 'canDownload', 'canEdit', 'canDelete', 'canShare', 'canSign', 'canManageVersions'];
const PERM_LABELS = ['View', 'Upload', 'Download', 'Edit', 'Delete', 'Share', 'Sign', 'Manage Versions'];

export const DocsPermissionsPage: React.FC = () => {
  const { data: permissions = [], isLoading } = useQuery({ queryKey: ['docs-permissions'], queryFn: () => api.permissions.getAll() });

  if (isLoading) return <LoadingSkeleton type="card" />;

  return (
    <div className="space-y-6 text-foreground">
      <PageHeader
        title="Document Permission Matrix"
        description="Review role-based access control settings for all document operations across user groups."
        breadcrumbs={[{ label: 'Documents', href: '/documents' }, { label: 'Permissions' }]}
      />
      <Card className="p-0 border bg-card overflow-x-auto">
        <table className="w-full text-xs font-semibold">
          <thead>
            <tr className="border-b bg-secondary/20">
              <th className="text-left px-4 py-3 font-black uppercase text-[10px] text-muted-foreground">Role</th>
              {PERM_LABELS.map(l => <th key={l} className="px-3 py-3 font-black uppercase text-[10px] text-muted-foreground text-center">{l}</th>)}
            </tr>
          </thead>
          <tbody>
            {permissions.map((perm: any) => (
              <tr key={perm.id} className="border-b hover:bg-secondary/10 transition">
                <td className="px-4 py-3 font-bold">{perm.role}</td>
                {PERM_COLS.map(col => (
                  <td key={col} className="px-3 py-3 text-center">
                    <BoolIcon value={(perm as any)[col]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
export default DocsPermissionsPage;
