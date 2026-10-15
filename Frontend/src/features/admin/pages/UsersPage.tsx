import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api';
import { PageHeader } from '../../../components/PageHeader';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Sparkles, UserPlus, Trash2, ShieldCheck, Mail, Eye, Edit3, Settings, Key, Building2, MapPin, Layers } from 'lucide-react';
import { useAuthStore } from '../../../store/useStore';

export const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null); // null means creating

  const { user } = useAuthStore();
  const defaultRole = user?.role === 'Super Admin' ? 'Property Manager' : 'Maintenance';

  // Form States
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formStatus, setFormStatus] = useState('Active');
  const [formRole, setFormRole] = useState(defaultRole);
  const [formServiceType, setFormServiceType] = useState('Plumber');
  const [assignedProperties, setAssignedProperties] = useState<string[]>([]);
  const [assignedUnit, setAssignedUnit] = useState('');
  const [assignedBuildings, setAssignedBuildings] = useState<string[]>([]);
  const [assignedDepartments, setAssignedDepartments] = useState<string[]>([]);


  // Notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'destructive'; message: string } | null>(null);

  const triggerNotification = (message: string, type: 'success' | 'info' | 'destructive' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Queries
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => api.users.getAll(),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['rbac-roles-list'],
    queryFn: () => api.roles.getAll(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties-list'],
    queryFn: () => api.property.getAll(),
  });

  const { data: units = [] } = useQuery({
    queryKey: ['units-list'],
    queryFn: () => api.unit.getAll(),
  });

  const { data: buildings = [] } = useQuery({
    queryKey: ['buildings-list'],
    queryFn: () => api.building.getAll(),
  });

  // Reactively select the correct default role based on database roles availability
  React.useEffect(() => {
    if (roles.length > 0 && !editingUser) {
      const hasStaff = roles.some((r: any) => r.name === 'Maintenance Staff');
      const hasMaint = roles.some((r: any) => r.name === 'Maintenance');
      if (user?.role === 'Super Admin') {
        setFormRole('Property Manager');
      } else if (hasStaff) {
        setFormRole('Maintenance Staff');
      } else if (hasMaint) {
        setFormRole('Maintenance');
      }
    }
  }, [roles, editingUser, user]);

  // Query user assignments when selecting a user
  const { data: userAssignments } = useQuery({
    queryKey: ['user-assignments', selectedUser?.id],
    queryFn: () => api.assignments.getForUser(selectedUser.id),
    enabled: !!selectedUser,
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: async (payload: any) => {
      const newUser = await api.users.invite({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
        role: payload.role,
        status: payload.status,
        team: payload.role,
        serviceType: payload.serviceType,
      });
      await api.assignments.update(newUser.id, {
        properties: payload.properties,
        units: payload.units,
        buildings: payload.buildings,
        departments: payload.departments,
      });
      return newUser;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      triggerNotification(`User ${data.name} successfully created with role ${data.role}!`);
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (payload: any) => {
      const updated = await api.users.update(payload.id, {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        role: payload.role,
        status: payload.status,
      });
      await api.assignments.update(payload.id, {
        properties: payload.properties,
        units: payload.units,
        buildings: payload.buildings,
        departments: payload.departments,
      });
      return updated;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      queryClient.invalidateQueries({ queryKey: ['user-assignments', data.id] });
      triggerNotification(`User profile updated successfully.`);
      setIsModalOpen(false);
      setSelectedUser(data);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.users.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      setSelectedUser(null);
      setDeleteId(null);
      triggerNotification('User access revoked successfully.', 'info');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (usr: any) => {
      const nextStatus = usr.status === 'Active' ? 'Suspended' : 'Active';
      return api.users.update(usr.id, { status: nextStatus });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      triggerNotification(`User status set to ${data.status}.`, 'info');
      if (selectedUser?.id === data.id) {
        setSelectedUser(data);
      }
    },
  });

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormPassword('');
    setFormStatus('Active');
    setFormServiceType('Plumber');
    const hasStaff = roles.some((r: any) => r.name === 'Maintenance Staff');
    const hasMaint = roles.some((r: any) => r.name === 'Maintenance');
    const resolvedDefaultRole = user?.role === 'Super Admin' 
      ? 'Property Manager' 
      : (hasStaff ? 'Maintenance Staff' : (hasMaint ? 'Maintenance' : 'Collection Manager'));
    setFormRole(resolvedDefaultRole);
    setAssignedProperties([]);
    setAssignedUnit('');
    setAssignedBuildings([]);
    setAssignedDepartments([]);
    setEditingUser(null);
  };

  const handleOpenEdit = async (u: any) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormPhone(u.phone || '');
    setFormPassword('');
    setFormStatus(u.status || 'Active');
    setFormRole(u.role || 'Property Manager');

    // Fetch assignments to populate edit modal
    const ass = await api.assignments.getForUser(u.id);
    const initialProperties = (ass.properties && ass.properties.length > 0)
      ? ass.properties
      : (ass.buildings || []);
    setAssignedProperties(initialProperties);
    setAssignedUnit(ass.units?.[0] || '');
    setAssignedBuildings(ass.buildings || []);
    setAssignedDepartments(ass.departments || []);

    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: editingUser?.id,
      name: formName,
      email: formEmail,
      phone: formPhone,
      password: formPassword,
      status: formStatus,
      role: formRole,
      serviceType: formServiceType,
      properties: assignedProperties,
      units: assignedUnit ? [assignedUnit] : [],
      buildings: assignedBuildings,
      departments: assignedDepartments,
    };

    if (editingUser) {
      updateUserMutation.mutate(payload);
    } else {
      createUserMutation.mutate(payload);
    }
  };

  // Filters
  const filtered = users.filter((u: any) => {
    if (u.role === 'Property Manager') {
      return false;
    }
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6 relative text-foreground">
      <PageHeader
        title="Organization User Hub"
        description="Provision agency personnel, configure role relationships, properties scopes, and manage user statuses."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Administration' }, { label: 'User Management' }]}
      />

      {notification && (
        <div className={`p-4 rounded-xl text-xs font-bold border transition-all duration-300 flex items-center gap-2 ${
          notification.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
            : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
        }`}>
          <ShieldCheck className="w-4 h-4" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border p-4 rounded-2xl">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Input
            placeholder="Search name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 text-xs font-semibold p-2.5 rounded-lg border bg-secondary"
          />
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full sm:w-48 text-xs font-semibold">
            <option value="All">All Roles</option>
            {roles
              .filter((r: any) => r.name !== 'Property Manager')
              .map((r: any) => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))
            }
          </Select>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-primary text-primary-foreground font-semibold flex items-center gap-1.5 w-full sm:w-auto">
          <UserPlus className="w-4 h-4" /> Provision New User
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* USERS DIRECTORY */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border bg-muted/10">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" /> Active System Accounts
            </h3>
          </div>

          {loadingUsers ? (
            <div className="p-6 text-center text-xs text-muted-foreground animate-pulse">Fetching users list...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead className="bg-secondary/40 text-muted-foreground uppercase border-b border-border">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {filtered.map((u: any) => (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={`hover:bg-secondary/10 cursor-pointer transition ${
                        selectedUser?.id === u.id ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div>
                          <p className="font-extrabold text-foreground">{u.name}</p>
                          <p className="text-[10px] text-muted-foreground font-semibold">{u.email}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-primary/10 text-primary">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                        }`}>
                          {u.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-3 text-right flex justify-end items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1 text-primary hover:bg-primary/10 rounded transition"
                          title="Edit Profile"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleStatusMutation.mutate(u)}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                            u.status === 'Active'
                              ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                          }`}
                        >
                          {u.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => setDeleteId(u.id)}
                          className="p-1 text-rose-500 hover:bg-rose-500/10 rounded transition"
                          title="Revoke User Access"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* DETAILED ATTRIBUTES SIDE PANEL */}
        <div>
          {selectedUser ? (
            <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm h-fit">
              <div className="flex justify-between items-start border-b border-border pb-3">
                <div>
                  <h4 className="font-extrabold text-sm text-foreground">{selectedUser.name}</h4>
                  <span className="text-[10px] text-muted-foreground font-semibold block">{selectedUser.email}</span>
                  {selectedUser.phone && <span className="text-[10px] text-muted-foreground block">{selectedUser.phone}</span>}
                </div>
                <button
                  onClick={() => setDeleteId(selectedUser.id)}
                  className="text-rose-500 hover:text-rose-650 transition p-1 hover:bg-rose-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-semibold">User Role:</span>
                  <span className="text-foreground font-extrabold uppercase text-[10px] bg-secondary px-2 py-0.5 rounded">{selectedUser.role}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-semibold">Account Status:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    selectedUser.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                  }`}>{selectedUser.status || 'Active'}</span>
                </div>

                {/* Scope & Property Assignments Display */}
                {userAssignments && (
                  <div className="pt-3 border-t border-border space-y-2">
                    <h5 className="font-bold text-[10px] uppercase text-muted-foreground tracking-widest flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" /> Scope Assignments
                    </h5>
                    
                    {userAssignments.properties && userAssignments.properties.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Assigned Properties:</span>
                        <div className="flex flex-wrap gap-1">
                          {userAssignments.properties.map((pid: string) => {
                            const pName = properties.find((p: any) => p.id === pid)?.name || pid;
                            return (
                              <span key={pid} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded flex items-center gap-0.5">
                                <Building2 className="w-2.5 h-2.5" /> {pName}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {userAssignments.units && userAssignments.units.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Assigned Rental Unit:</span>
                        <div className="flex flex-wrap gap-1">
                          {userAssignments.units.map((uid: string) => {
                            const uName = units.find((u: any) => u.id === uid)?.unitNumber || uid;
                            return (
                              <span key={uid} className="px-2 py-0.5 bg-teal-500/10 text-teal-600 text-[10px] font-bold rounded flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5" /> Unit: {uName}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {userAssignments.buildings && userAssignments.buildings.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Assigned Properties:</span>
                        <div className="flex flex-wrap gap-1">
                          {userAssignments.buildings.map((bid: string) => {
                            const bName = properties.find((p: any) => p.id === bid)?.name || buildings.find((b: any) => b.id === bid)?.name || bid;
                            return (
                              <span key={bid} className="px-2 py-0.5 bg-amber-500/10 text-amber-600 text-[10px] font-bold rounded flex items-center gap-0.5">
                                <Building2 className="w-2.5 h-2.5" /> Property: {bName}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {userAssignments.departments && userAssignments.departments.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Departments:</span>
                        <div className="flex flex-wrap gap-1">
                          {userAssignments.departments.map((d: string) => (
                            <span key={d} className="px-2 py-0.5 bg-slate-500/10 text-slate-600 text-[10px] font-bold rounded">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!userAssignments.properties?.length &&
                      !userAssignments.units?.length &&
                      !userAssignments.buildings?.length &&
                      !userAssignments.departments?.length) && (
                      <p className="text-[10px] text-muted-foreground italic">Full Organization Scope (No restrictions)</p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => triggerNotification('Reset instructions successfully dispatched.', 'info')} className="font-semibold text-xs h-8 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-primary" /> Dispatch Password Reset
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border p-5 rounded-2xl text-center py-10 text-muted-foreground shadow-sm">
              <ShieldCheck className="w-12 h-12 mx-auto text-primary stroke-[1.5]" />
              <p className="text-xs font-semibold mt-2">Select a member to audit profile, assignments, and reset logs.</p>
            </div>
          )}
        </div>
      </div>

      {/* USER PROVISION / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 text-left text-xs font-semibold text-foreground overflow-y-auto max-h-[90vh]">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="font-extrabold text-sm uppercase">{editingUser ? 'Modify User Profile' : 'Provision User Account'}</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Define metadata profiles and organization scope access</p>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground text-xl font-bold">&times;</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Full Name</label>
                  <Input
                    required
                    placeholder="E.g., David Miller"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Email Address</label>
                  <Input
                    required
                    type="email"
                    placeholder="david@company.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Phone Number</label>
                  <Input
                    placeholder="e.g. (555) 0122"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Status</label>
                  <Select value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">User Password</label>
                  <Input
                    type="password"
                    placeholder={editingUser ? "Leave blank to keep current" : "Choose secure password"}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    required={!editingUser}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Role</label>
                  <Select value={formRole} onChange={(e) => setFormRole(e.target.value)}>
                    {roles
                      .filter((r: any) => 
                        user?.role === 'Super Admin' 
                          ? r.name === 'Property Manager' 
                          : ['Maintenance Staff', 'Maintenance', 'Collection Manager'].includes(r.name)
                      )
                      .map((r: any) => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))
                    }
                  </Select>
                </div>
              </div>

              {(formRole === 'Maintenance' || formRole === 'Maintenance Staff') && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Specialty Trade</label>
                  <Select value={formServiceType} onChange={(e) => setFormServiceType(e.target.value)}>
                    <option value="Plumber">Plumber Specialty</option>
                    <option value="Electrician">Electrician Specialty</option>
                    <option value="HVAC">HVAC Maintenance</option>
                    <option value="General Contractor">General Contractor</option>
                    <option value="Cleaning">Cleaning & Turnovers</option>
                    <option value="Landscaping">Landscaping & Pools</option>
                    <option value="Pest Control">Pest Control</option>
                    <option value="Security">Security & Fire</option>
                    <option value="Roofing">Roofing & Guttering</option>
                  </Select>
                </div>
              )}

              {/* DYNAMIC RELATIONSHIPS ASSIGNMENT ZONE */}
              <div className="border-t border-border pt-4 space-y-3">
                <h4 className="font-bold text-[10px] uppercase text-primary tracking-wider">Access Scope Relationships</h4>
                
                {formRole === 'Owner' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Assign Owned Properties</label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-border p-2 rounded-lg bg-secondary/20">
                      {properties.map((p: any) => {
                        const checked = assignedProperties.includes(p.id);
                        return (
                          <label key={p.id} className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                if (checked) {
                                  setAssignedProperties(prev => prev.filter(x => x !== p.id));
                                } else {
                                  setAssignedProperties(prev => [...prev, p.id]);
                                }
                              }}
                              className="rounded border-border text-primary h-3.5 w-3.5"
                            />
                            <span>{p.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {formRole === 'Tenant' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Assign Rental Unit</label>
                    <Select value={assignedUnit} onChange={(e) => setAssignedUnit(e.target.value)}>
                      <option value="">Select Tenant Unit</option>
                      {units.map((u: any) => (
                        <option key={u.id} value={u.id}>Unit: {u.name} (Prop ID: {u.propertyId})</option>
                      ))}
                    </Select>
                  </div>
                )}

                {(formRole === 'Maintenance' || formRole === 'Maintenance Staff') && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Assign Property Scope</label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-border p-2 rounded-lg bg-secondary/20">
                      {properties.map((p: any) => {
                        const checked = assignedProperties.includes(p.id);
                        return (
                          <label key={p.id} className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                if (checked) {
                                  setAssignedProperties(prev => prev.filter(x => x !== p.id));
                                } else {
                                  setAssignedProperties(prev => [...prev, p.id]);
                                }
                              }}
                              className="rounded border-border text-primary h-3.5 w-3.5"
                            />
                            <span>{p.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(formRole === 'Accountant' || formRole === 'Leasing Agent' || formRole === 'Staff' || formRole === 'Custom') && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Assign Departments</label>
                    <div className="grid grid-cols-2 gap-2 border border-border p-2 rounded-lg bg-secondary/20">
                      {['Finance', 'Operations', 'Leasing', 'Executive', 'Maintenance'].map((dep) => {
                        const checked = assignedDepartments.includes(dep);
                        return (
                          <label key={dep} className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                if (checked) {
                                  setAssignedDepartments(prev => prev.filter(x => x !== dep));
                                } else {
                                  setAssignedDepartments(prev => [...prev, dep]);
                                }
                              }}
                              className="rounded border-border text-primary h-3.5 w-3.5"
                            />
                            <span>{dep}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary hover:bg-primary/95 text-white font-bold h-10 px-4 rounded-xl">
                  {editingUser ? 'Save Profile Changes' : 'Provision Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Revoke User Access"
        description="Are you sure you want to revoke access and delete this user? Click Yes to confirm or No to cancel."
        confirmText="Yes, Revoke Access"
        cancelText="No, Cancel"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
};

export default UsersPage;
