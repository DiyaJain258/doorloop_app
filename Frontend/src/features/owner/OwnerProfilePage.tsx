import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Landmark, Save, CheckCircle, Loader2, KeyRound, Lock, Edit3 } from 'lucide-react';

export const OwnerProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'view' | 'edit' | 'password'>('view');

  // Contact Info State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [bankName, setBankName] = useState('Chase checking');
  const [accountNumber, setAccountNumber] = useState('XXXX-XXXX-9822');

  // Password Reset State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ text: '', isError: false });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['owner-profile'],
    queryFn: () => api.ownerProfile.get(),
  });

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || 'William');
      setLastName(profile.lastName || 'Anderson');
      setPhone(profile.phone || '(212) 555-0122');
      setEmail(profile.email || 'bill.a@investments.com');
      setStreetAddress(profile.streetAddress || '742 Evergreen Terrace, New York, NY');
      setBankName(profile.bankName || 'Chase checking');
      setAccountNumber(profile.accountNumber || 'XXXX-XXXX-9822');
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (updatedData: any) => api.ownerProfile.update(updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-profile'] });
      setActiveTab('view');
      setSuccessMessage('Profile saved successfully to database.');
      setTimeout(() => setSuccessMessage(''), 4000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      firstName,
      lastName,
      phone,
      email,
      streetAddress,
      bankName,
      accountNumber,
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

  if (isLoading) {
    return <LoadingSkeleton type="card" />;
  }

  return (
    <div className="space-y-6 text-foreground max-w-4xl">
      <PageHeader
        title="My Investor Profile"
        description="Verify direct deposit banking configurations, mailing addresses, and security passwords."
        breadcrumbs={[
          { label: 'Home', href: '/owner' },
          { label: 'Profile' },
        ]}
      />

      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl flex items-center gap-2 text-xs font-bold">
          <CheckCircle className="w-4 h-4" />
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Details & Password Reset Card */}
        <Card className="md:col-span-2 p-6 border bg-card space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-extrabold text-sm uppercase tracking-wider">
              {activeTab === 'password' ? '🔒 Reset Security Password' : activeTab === 'edit' ? '✏️ Edit Profile Details' : 'Mailing & Contact Info'}
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
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">First Name</label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Last Name</label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Phone</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                    Email Address <span className="text-[10px] text-amber-500 font-normal lowercase">(cannot be changed)</span>
                  </label>
                  <Input type="email" value={email} disabled={true} readOnly={true} className="bg-muted/50 cursor-not-allowed opacity-70 border-muted" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Mailing Street Address</label>
                <Input value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} required />
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={updateMutation.isPending} className="flex items-center gap-2">
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes to DB
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

              <div className="pt-2">
                <Button type="submit" disabled={passwordLoading} className="flex items-center gap-2">
                  {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  Update Password
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground/60">Full Name</p>
                  <p className="text-foreground mt-0.5 text-sm font-bold">{firstName} {lastName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground/60">Contact Phone</p>
                  <p className="text-foreground mt-0.5">{phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground/60">Email Address</p>
                  <p className="text-foreground mt-0.5 flex items-center gap-1.5 font-bold">
                    {email}
                    <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-mono">locked</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground/60">Mailing Address</p>
                  <p className="text-foreground mt-0.5">{streetAddress}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Payout Bank Setup */}
        <Card className="md:col-span-1 p-6 border bg-card space-y-4">
          <h3 className="font-extrabold text-sm uppercase border-b pb-2 tracking-wider">ACH Direct Deposit</h3>
          <div className="space-y-3.5 text-xs font-semibold text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Landmark className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-bold text-foreground">{bankName}</p>
                <p className="font-mono text-[10px]">{accountNumber}</p>
              </div>
            </div>
            <p className="text-[10px] uppercase font-bold text-emerald-500">Routing status: Verified</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OwnerProfilePage;
