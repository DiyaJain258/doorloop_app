import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api';
import { PageHeader } from '../../../components/PageHeader';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { PermissionMatrix } from '../components/PermissionMatrix';
import { ShieldCheck, Trash2, Settings, UserPlus } from 'lucide-react';
import { ConfirmDialog } from '../../../components/ConfirmDialog';

export const RolesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [deleteManagerId, setDeleteManagerId] = useState<string | null>(null);
  const [deleteManagerName, setDeleteManagerName] = useState<string>('');

  // Manager Form State
  const [managerForm, setManagerForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  const triggerNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const addManagerMutation = useMutation({
    mutationFn: (data: any) => api.users.invite({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: 'Property Manager',
      status: 'Active',
    }),
    onSuccess: () => {
      triggerNotification(editingUserId ? 'Property Manager updated successfully!' : 'Property Manager added successfully!');
      setManagerForm({ name: '', email: '', password: '', phone: '' });
      setFormError(null);
      setEditingUserId(null);
      queryClient.invalidateQueries({ queryKey: ['company-users-list'] });
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to save Property Manager.');
    }
  });

  // Fetch Roles
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['rbac-roles-list'],
    queryFn: () => api.roles.getAll(),
  });

  // Fetch Company Users
  const { data: companyUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['company-users-list'],
    queryFn: () => api.users.getAll(),
  });

  // Filter Company Users - Only keep Property Managers
  const managers = React.useMemo(() => {
    return companyUsers.filter((u: any) => u.role === 'Property Manager');
  }, [companyUsers]);

  // Selected Manager State
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  const activeManager = managers.find((m: any) => m.id === (selectedManagerId || managers[0]?.id));

  // Active Selected Role - Always configure the Property Manager role permissions matrix
  const activeRole = roles.find((r: any) => r.name === 'Property Manager');

  // Mutation to delete a manager
  const deleteManagerMutation = useMutation({
    mutationFn: (id: string) => api.users.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-users-list'] });
      triggerNotification('Manager deleted successfully.', 'info');
      setSelectedManagerId(null);
    },
    onError: (err: any) => {
      triggerNotification(err.message || 'Failed to delete manager.', 'info');
    }
  });

  const confirmDeleteManager = () => {
    if (deleteManagerId) {
      deleteManagerMutation.mutate(deleteManagerId);
      setDeleteManagerId(null);
    }
  };

  // Mutations
  const createRoleMutation = useMutation({
    mutationFn: async (payload: any) => {
      // Initialize with default empty/minimal permissions structure
      const modules = [
        'dashboard', 'properties', 'leases', 'tenants', 'owners', 
        'payments', 'accounting', 'maintenance', 'documents', 
        'reports', 'communication', 'settings'
      ];
      const permissions = modules.map(m => ({
        module: m,
        view: false,
        create: false,
        edit: false,
        delete: false,
        approve: false,
        export: false
      }));
      return api.roles.create({
        name: payload.name,
        description: payload.description,
        permissions,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rbac-roles-list'] });
      setSelectedRoleId(data.id);
      triggerNotification(`Custom role "${data.name}" created successfully!`);
    },
  });

  const cloneRoleMutation = useMutation({
    mutationFn: (payload: { id: string; name: string }) => 
      api.roles.clone(payload.id, payload.name),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rbac-roles-list'] });
      setSelectedRoleId(data.id);
      triggerNotification(`Role cloned successfully as "${data.name}"!`);
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => api.roles.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac-roles-list'] });
      setSelectedRoleId(null);
      triggerNotification('Custom role deleted successfully.', 'info');
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: (payload: { id: string; permissions: any[] }) => 
      api.roles.update(payload.id, { permissions: payload.permissions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rbac-roles-list'] });
      triggerNotification('Role permissions synchronized successfully!');
    },
  });

  const handlePermissionToggle = (
    module: string,
    action: 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export',
    checked: boolean
  ) => {
    if (!activeRole) return;

    const updatedPermissions = activeRole.permissions.map((p: any) => {
      if (p.module === module) {
        return { ...p, [action]: checked };
      }
      return p;
    });

    updatePermissionsMutation.mutate({
      id: activeRole.id,
      permissions: updatedPermissions,
    });
  };

  return (
    <div className="space-y-6 text-foreground relative">
      <PageHeader
        title="Access Roles & Permissions"
        description="Establish organizational authorization levels, custom roles, and configure dynamic module matrices."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Administration' }, { label: 'Roles & Permissions' }]}
      />

      {/* ADD PROPERTY MANAGER FORM */}
      <Card className="p-5 border bg-card space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-foreground">
              {editingUserId ? 'Edit Property Manager' : 'Add Property Manager'}
            </h3>
          </div>
          {editingUserId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditingUserId(null);
                setManagerForm({ name: '', email: '', password: '', phone: '' });
                setFormError(null);
              }}
              className="text-xs text-rose-500 hover:bg-rose-500/10 font-bold"
            >
              Cancel Edit
            </Button>
          )}
        </div>

        {formError && (
          <div className="text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg">
            {formError}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!managerForm.name || !managerForm.email || (!editingUserId && !managerForm.password)) {
              setFormError('Name, email and password are required fields.');
              return;
            }
            addManagerMutation.mutate(managerForm);
          }}
          className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
        >
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Full Name</label>
            <Input
              required
              placeholder="E.g., Jane Doe"
              value={managerForm.name}
              onChange={(e) => setManagerForm({ ...managerForm, name: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Email Address</label>
            <Input
              required
              type="email"
              placeholder="jane@example.com"
              disabled={!!editingUserId}
              value={managerForm.email}
              onChange={(e) => setManagerForm({ ...managerForm, email: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">
              {editingUserId ? 'New Password (Optional)' : 'Password'}
            </label>
            <Input
              required={!editingUserId}
              type="password"
              placeholder="••••••••"
              value={managerForm.password}
              onChange={(e) => setManagerForm({ ...managerForm, password: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Mobile Phone</label>
            <Input
              placeholder="E.g., +1 234 567"
              value={managerForm.phone}
              onChange={(e) => setManagerForm({ ...managerForm, phone: e.target.value })}
            />
          </div>
          <div>
            <Button
              type="submit"
              disabled={addManagerMutation.isPending}
              className="w-full flex items-center justify-center gap-1.5 h-10 font-bold"
            >
              {addManagerMutation.isPending ? 'Saving...' : editingUserId ? 'Update Manager' : 'Add Manager'}
            </Button>
          </div>
        </form>
      </Card>

      {notification && (
        <div className="p-4 rounded-xl text-xs font-bold border bg-emerald-500/10 border-emerald-500/20 text-emerald-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>{notification.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MANAGERS SELECTOR LIST */}
        <div className="space-y-4">
          <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2 border-border">
              <h4 className="font-extrabold text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                <Settings className="w-4 h-4" /> Company Managers
              </h4>
            </div>

            {isLoadingUsers ? (
              <div className="py-6 text-center text-xs text-muted-foreground">Loading company managers...</div>
            ) : managers.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">No managers added yet.</div>
            ) : (
              <div className="space-y-2">
                {managers.map((r: any) => {
                  const isSelected = activeManager?.id === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedManagerId(r.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:bg-secondary/20 text-foreground'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-extrabold text-xs">{r.name}</span>
                        <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-extrabold uppercase">
                          Active
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 font-medium truncate">
                        {r.email}
                      </p>
                      {r.phone && (
                        <p className="text-[10px] text-muted-foreground font-medium">
                          {r.phone}
                        </p>
                      )}

                      {/* MANAGER QUICK ACTIONS */}
                      <div className="flex gap-3 mt-3 pt-2 border-t border-border/50 justify-end" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setEditingUserId(r.id);
                            setManagerForm({
                              name: r.name,
                              email: r.email,
                              password: '', // leave empty to avoid resetting password unless wanted
                              phone: r.phone || '',
                            });
                            setFormError(null);
                          }}
                          className="p-1 hover:bg-primary/10 rounded text-primary text-[10px] font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDeleteManagerId(r.id);
                            setDeleteManagerName(r.name);
                          }}
                          className="p-1 hover:bg-rose-500/10 rounded text-rose-500 hover:text-rose-600 text-[10px] font-bold flex items-center gap-0.5"
                          title="Delete Manager"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ROLE PERMISSION MATRIX */}
        <div className="lg:col-span-2">
          {activeRole ? (
            <PermissionMatrix role={activeRole} onToggle={handlePermissionToggle} />
          ) : (
            <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted-foreground shadow-sm py-12">
              <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-xs font-semibold mt-2">Select a role profile from the list to view its module accessibility.</p>
            </div>
          )}
        </div>

      </div>


      <ConfirmDialog
        open={deleteManagerId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteManagerId(null);
        }}
        title="Delete Property Manager"
        description={`Are you sure you want to delete manager "${deleteManagerName}"? This action cannot be undone.`}
        onConfirm={confirmDeleteManager}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default RolesPage;
