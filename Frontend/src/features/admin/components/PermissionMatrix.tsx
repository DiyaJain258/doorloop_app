import React from 'react';
import { Card } from '../../../components/ui/Card';

interface PermissionMatrixProps {
  role: {
    id: string;
    name: string;
    description: string;
    permissions: Array<{
      module: string;
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
      approve: boolean;
      export: boolean;
    }>;
  };
  onToggle: (module: string, action: 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export', checked: boolean) => void;
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ role, onToggle }) => {
  const actions: Array<'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export'> = [
    'view',
    'create',
    'edit',
    'delete',
    'approve',
    'export',
  ];

  const getModulesForRole = (roleName: string) => {
    const name = roleName.toLowerCase();
    if (name.includes('owner')) {
      return ['Dashboard', 'Properties', 'Financials', 'Statements', 'Distributions', 'Maintenance', 'Documents', 'Reports', 'Messages', 'Profile'];
    }
    if (name.includes('tenant')) {
      return ['Dashboard', 'Lease', 'Payments', 'Maintenance', 'Documents', 'Messages', 'Notifications', 'Profile'];
    }
    if (name.includes('maintenance') || name.includes('staff') || name.includes('maint')) {
      return ['Dashboard', 'Maintenance'];
    }
    if (name.includes('collection')) {
      return ['Dashboard', 'Rent & Payments', 'Owners', 'Accounting'];
    }
    return [
      'Dashboard', 'Properties', 'Leasing', 'Tenants', 'Documents', 
      'Owners', 'Rent & Payments', 'Accounting', 'Maintenance', 
      'Reports', 'Communication', 'Company Settings', 'AI Assistant'
    ];
  };

  const allowedModules = getModulesForRole(role.name);
  const filteredPermissions = role.permissions.filter(p => allowedModules.includes(p.module));

  const getFriendlyModuleName = (moduleName: string) => {
    switch (moduleName) {
      case 'Owners': return 'Owners (Owner Payouts)';
      case 'Rent & Payments': return 'Rent & Payments (Tenant Payments)';
      case 'Accounting': return 'Accounting (Vendor Bills & Ledgers)';
      case 'Maintenance': return 'Maintenance (My Tasks & Tickets)';
      default: return moduleName;
    }
  };

  return (
    <Card className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-border bg-muted/15">
        <h4 className="font-extrabold text-xs text-primary uppercase tracking-widest">
          Permission Scope Matrix: {role.name}
        </h4>
        <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">
          Configure module accessibility privileges and functional operation authorizations.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-semibold">
          <thead className="bg-secondary/40 text-muted-foreground uppercase border-b border-border">
            <tr>
              <th className="p-3">Module Name</th>
              {actions.map((act) => (
                <th key={act} className="p-3 text-center uppercase tracking-wider text-[10px] font-extrabold">
                  {act}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-foreground">
            {filteredPermissions.map((p) => (
              <tr key={p.module} className="hover:bg-secondary/5 transition">
                <td className="p-3 font-bold">{getFriendlyModuleName(p.module)}</td>
                {actions.map((act) => {
                  const val = p[act];
                  return (
                    <td key={act} className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={(e) => onToggle(p.module, act, e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default PermissionMatrix;
