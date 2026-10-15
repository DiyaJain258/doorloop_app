import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useStore';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { 
  User, Mail, Shield, CheckCircle2, Clock, 
  Star, MapPin, Phone, Calendar, Briefcase, Power, Loader2, Save, Lock, Edit3, KeyRound
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const StaffProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'view' | 'edit' | 'password'>('view');
  
  // Profile Info State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialist, setSpecialist] = useState('');

  // Password Reset State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ text: '', isError: false });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['staff-profile-data'],
    queryFn: () => api.staffProfile.get(),
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || user?.name || 'Marcus Vance');
      setEmail(profile.email || user?.email || 'marcus.v@apexpm.com');
      setPhone(profile.phone || '(512) 555-0199');
      setSpecialist(profile.specialist || 'HVAC & Plumbing Lead');
    }
  }, [profile, user]);

  const toggleDutyMutation = useMutation({
    mutationFn: (newStatus: boolean) => api.staffProfile.update({ isAvailable: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-profile-data'] });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (updatedData: any) => api.staffProfile.update(updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-profile-data'] });
      setActiveTab('view');
      setSuccessMessage('Staff profile updated successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
    },
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      name,
      email,
      phone,
      specialist,
    });
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'New password must be at least 6 characters.', isError: true });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', isError: true });
      return;
    }

    setPasswordLoading(true);
    try {
      await api.auth.changePassword({ currentPassword, newPassword });
      setPasswordMsg({ text: 'Password reset successfully!', isError: false });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPasswordMsg({ text: '', isError: false });
        setActiveTab('view');
      }, 3000);
    } catch (err: any) {
      setPasswordMsg({ text: err.message || 'Failed to update password', isError: true });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (isLoading || !profile) {
    return <LoadingSkeleton type="card" />;
  }

  const isAvailable = profile.isAvailable ?? true;

  return (
    <div className="space-y-6 text-foreground max-w-5xl">
      <PageHeader
        title={t('staffProfilePage.title')}
        description={t('staffProfilePage.desc')}
        breadcrumbs={[
          { label: t('staffProfilePage.portalBreadcrumb'), href: '/staff/dashboard' },
          { label: t('staffProfilePage.profileBreadcrumb') },
        ]}
      />

      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl flex items-center gap-2 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4" />
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card - User Avatar & Duty Status */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 border bg-card flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <img
                src={user?.avatarUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"}
                alt={name}
                className="w-28 h-28 rounded-full object-cover border-4 border-primary/20 shadow-lg"
              />
              <span className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-card flex items-center justify-center ${
                isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
              }`} />
            </div>

            <div>
              <h3 className="font-extrabold text-lg">{name}</h3>
              <p className="text-xs text-muted-foreground font-semibold flex items-center justify-center gap-1 mt-1">
                <Briefcase className="w-3.5 h-3.5" /> {specialist}
              </p>
            </div>

            {/* Availability Toggle */}
            <div className="w-full pt-4 border-t border-border/40 flex flex-col items-center space-y-2">
              <div className="flex items-center justify-between w-full px-2 text-xs font-bold">
                <span className="text-muted-foreground">{t('staffProfilePage.dutyStatus')}</span>
                <span className={isAvailable ? 'text-emerald-500' : 'text-rose-500'}>
                  {isAvailable ? t('staffProfilePage.onDuty') : t('staffProfilePage.offDuty')}
                </span>
              </div>
              <Button
                size="sm"
                disabled={toggleDutyMutation.isPending}
                onClick={() => toggleDutyMutation.mutate(!isAvailable)}
                className={`w-full flex items-center justify-center gap-2 rounded-xl h-10 font-bold transition-all ${
                  isAvailable 
                    ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20' 
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20'
                }`}
              >
                {toggleDutyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                {isAvailable ? t('staffProfilePage.clockOut') : t('staffProfilePage.clockIn')}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Cards - Work Stats & Professional Credentials */}
        <div className="lg:col-span-2 space-y-6">
          {/* Work Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 border bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">{t('staffProfilePage.completedJobs')}</p>
                <p className="text-xl font-black mt-0.5">{profile.completedJobs || 142}</p>
              </div>
            </Card>

            <Card className="p-5 border bg-gradient-to-br from-blue-500/5 to-blue-500/10 flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">{t('staffProfilePage.avgResponseTime')}</p>
                <p className="text-xl font-black mt-0.5">{profile.avgResponseTime || '38 Min'}</p>
              </div>
            </Card>

            <Card className="p-5 border bg-gradient-to-br from-amber-500/5 to-amber-500/10 flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                <Star className="w-5 h-5 fill-amber-500" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">{t('staffProfilePage.customerRating')}</p>
                <p className="text-xl font-black mt-0.5">{profile.customerRating || '4.92 / 5.0'}</p>
              </div>
            </Card>
          </div>

          {/* Account & Details Card with Integrated Edit & Password Reset Options */}
          <Card className="p-6 border bg-card space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm uppercase tracking-wider">
                {activeTab === 'password' ? '🔒 Reset Security Password' : activeTab === 'edit' ? '✏️ Edit Profile Details' : t('staffProfilePage.credentials')}
              </h3>

              <div className="flex items-center gap-2">
                {activeTab === 'view' ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('edit')}
                      className="flex items-center gap-1.5 text-xs font-bold"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('password')}
                      className="flex items-center gap-1.5 text-xs font-bold text-amber-500 border-amber-500/30 hover:bg-amber-500/10"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      Reset Password
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('view')}
                    className="flex items-center gap-1.5 text-xs font-bold"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
            
            {activeTab === 'edit' ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">{t('staffProfilePage.fullName')}</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">{t('staffProfilePage.contactPhone')}</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* EMAIL IS LOCKED / READ-ONLY */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                      {t('staffProfilePage.emailAddress')} <span className="text-[10px] text-amber-500 font-normal lowercase">(cannot be changed)</span>
                    </label>
                    <div className="relative">
                      <Input value={email} disabled={true} readOnly={true} className="bg-muted/50 cursor-not-allowed opacity-70 border-muted pr-8" />
                      <Lock className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-3" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">{t('staffProfilePage.specialist')}</label>
                    <Input value={specialist} onChange={(e) => setSpecialist(e.target.value)} required />
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={updateProfileMutation.isPending} className="flex items-center gap-2">
                    {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            ) : activeTab === 'password' ? (
              <form onSubmit={handlePasswordReset} className="space-y-4 text-xs font-semibold max-w-md">
                {passwordMsg.text ? (
                  <div className={`p-3 rounded-lg border text-xs font-bold ${passwordMsg.isError ? 'bg-rose-500/10 text-rose-500 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'}`}>
                    {passwordMsg.text}
                  </div>
                ) : null}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Current Password</label>
                  <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required placeholder="••••••••" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">New Password</label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="••••••••" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Confirm New Password</label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••" />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <Button type="submit" disabled={passwordLoading} className="flex items-center gap-2">
                    {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                    Update Password
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <User className="w-4.5 h-4.5 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground/60">{t('staffProfilePage.fullName')}</p>
                      <p className="text-foreground mt-0.5">{name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <Mail className="w-4.5 h-4.5 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground/60">{t('staffProfilePage.emailAddress')}</p>
                      <p className="text-foreground mt-0.5 flex items-center gap-1.5">
                        {email}
                        <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-mono">locked</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <Phone className="w-4.5 h-4.5 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground/60">{t('staffProfilePage.contactPhone')}</p>
                      <p className="text-foreground mt-0.5">{phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <Shield className="w-4.5 h-4.5 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground/60">{t('staffProfilePage.securityRole')}</p>
                      <p className="text-foreground mt-0.5">{profile.role || user?.role || 'Maintenance Staff'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <MapPin className="w-4.5 h-4.5 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground/60">{t('staffProfilePage.assignedProperties')}</p>
                      <p className="text-foreground mt-0.5">{profile.assignedProperties || 'Sunset Villas, Apex Heights, Lakeside'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <Calendar className="w-4.5 h-4.5 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground/60">{t('staffProfilePage.joinedDate')}</p>
                      <p className="text-foreground mt-0.5">{profile.joinedDate || 'January 15th, 2025'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffProfilePage;
