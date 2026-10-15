import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from '@tanstack/react-router';
import api from '../../api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { 
  User, ShieldCheck, CheckCircle, 
  ArrowRight, ArrowLeft, Loader2, Sparkles, Lock,
  UploadCloud, FileText
} from 'lucide-react';

export const ApplicantScreeningWizard: React.FC = () => {
  const { screeningId } = useParams({ from: '/tenant/screening/$screeningId' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);

  // Form states
  const [dob, setDob] = useState('');
  const [ssn, setSsn] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Queries
  const { data: screening, isLoading } = useQuery({
    queryKey: ['applicant-screening-detail', screeningId],
    queryFn: () => api.screening.getById(screeningId),
  });

  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => api.userProfile.get(),
  });

  const companyName = 
    (screening?.companyName && !screening.companyName.includes('Apex'))
      ? screening.companyName
      : (profile?.company && !profile.company.includes('Apex'))
        ? profile.company
        : (profile?.company || screening?.companyName || 'Property Management');

  React.useEffect(() => {
    if (screening) {
      if (screening.status === 'Pending Approval' || screening.status === 'Approved' || screening.status === 'Declined') {
        setStep(5);
      } else if (screening.status === 'Processing') {
        setStep(4);
      }
    }
  }, [screening]);

  const consentMutation = useMutation({
    mutationFn: () => api.screening.update(screeningId, {
      dob,
      ssn,
      authorized: true,
      status: 'Processing'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicant-screening-detail', screeningId] });
      queryClient.invalidateQueries({ queryKey: ['screening-checks-list'] });
      setStep(4);
    },
    onError: (err: any) => {
      alert('Failed to save consent: ' + err.message);
    }
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.screening.uploadDocument(screeningId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicant-screening-detail', screeningId] });
      queryClient.invalidateQueries({ queryKey: ['screening-checks-list'] });
      setStep(5);
    },
    onError: (err: any) => {
      alert('Upload failed: ' + err.message);
    }
  });

  if (isLoading || !screening) {
    return <LoadingSkeleton type="details" />;
  }

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (dob) {
        setStep(3);
      } else {
        alert('Please complete all identification fields.');
      }
    } else if (step === 3) {
      if (authorized) {
        consentMutation.mutate();
      } else {
        alert('You must authorize the screening check to proceed.');
      }
    } else if (step === 4) {
      if (selectedFile) {
        uploadMutation.mutate(selectedFile);
      } else {
        alert('Please select a document to upload.');
      }
    }
  };

  const handlePrevStep = () => {
    if (step > 1 && step < 5) {
      setStep(step - 1);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pt-6 pb-12 text-foreground font-semibold text-xs">
      
      {/* HEADER PROGRESS STEP BAR */}
      <div className="flex justify-between items-center bg-card border rounded-2xl p-4 shadow-sm shrink-0">
        <div className="space-y-1">
          <h1 className="text-xl font-black text-foreground uppercase tracking-wider">Tenant Screening check</h1>
          <p className="text-[10px] text-muted-foreground font-mono">STEP {step} OF 5 • PROVIDER: TransUnion</p>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              className={`w-3.5 h-3.5 rounded-full border transition flex items-center justify-center text-[9px] font-black ${
                step === s ? 'bg-primary border-primary text-primary-foreground scale-110' :
                step > s ? 'bg-emerald-500 border-emerald-500 text-white' :
                'bg-secondary/15 border-border/40 text-muted-foreground'
              }`}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <Card className="p-6 border bg-card space-y-5">

        {/* STEP 1: INVITATION STATEMENT */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm uppercase border-b pb-2 flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-primary animate-pulse" /> Screening Check Invitation
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed font-medium">
              You have been invited by {companyName} to complete a rental application screening check. This request will be processed securely.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-secondary/10 rounded-xl border border-border/40">
                <span className="text-[9px] text-muted-foreground uppercase">Applicant Details</span>
                <p className="font-bold text-sm mt-1">{screening.applicantName}</p>
                <p className="text-muted-foreground text-[10px] mt-0.5">{screening.applicantEmail || 'N/A'}</p>
              </div>
              <div className="p-4 bg-secondary/10 rounded-xl border border-border/40">
                <span className="text-[9px] text-muted-foreground uppercase">Target Location</span>
                <p className="font-bold text-sm mt-1">{screening.propertyName}</p>
                <p className="text-muted-foreground text-[10px] mt-0.5">Unit Number: {screening.unitNumber}</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: IDENTITY DETAILS */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm uppercase border-b pb-2 flex items-center gap-1.5">
              <User className="w-4.5 h-4.5 text-primary" /> Identity Verification
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed font-medium">
              Please enter your Date of Birth. This information is encrypted and transmitted directly to the screening provider for verification.
            </p>
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-muted-foreground font-black">Date of Birth *</label>
                <Input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: AUTHORIZATION CONSENT */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm uppercase border-b pb-2 flex items-center gap-1.5">
              <Lock className="w-4.5 h-4.5 text-primary" /> Authorization & Consent
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed font-medium">
              Please review and authorize the background screening reports checklist.
            </p>
            <label className="flex items-start space-x-3 p-4 bg-secondary/15 rounded-xl border border-border/40 cursor-pointer hover:bg-secondary/25 transition">
              <input
                type="checkbox"
                checked={authorized}
                onChange={e => setAuthorized(e.target.checked)}
                className="w-4.5 h-4.5 rounded text-primary focus:ring-primary border-border bg-background mt-0.5 shrink-0"
              />
              <p className="text-xs leading-relaxed font-semibold text-foreground">
                I authorize {companyName} and the screening provider (TransUnion) to obtain my consumer report, criminal background report, and eviction history for rental screening purposes.
              </p>
            </label>
          </div>
        )}

        {/* STEP 4: DOCUMENT UPLOAD */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm uppercase border-b pb-2 flex items-center gap-1.5">
              <FileText className="w-4.5 h-4.5 text-primary" /> Document Verification
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed font-medium">
              Please upload a copy of your Government-issued Photo ID (e.g. Passport, Drivers License, State ID) or W2 Income statements. Max file size: 5MB.
            </p>
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/60 hover:border-primary/45 rounded-2xl bg-secondary/5 transition relative">
              <input
                type="file"
                id="doc-upload"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-9 h-9 text-muted-foreground mb-2" />
              {selectedFile ? (
                <div className="text-center">
                  <p className="font-bold text-foreground">{selectedFile.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-bold text-muted-foreground">Drag and drop or click to browse</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">Images, PDF, Word, Excel, or Text files (Max 5MB)</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: FINAL CONFIRMATION */}
        {step === 5 && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2 animate-bounce">
              <CheckCircle className="w-9 h-9 text-emerald-500 animate-bounce" />
            </div>
            <h3 className="text-lg font-black uppercase text-foreground">Screening Request Submitted</h3>
            <p className="text-muted-foreground text-xs max-w-sm mx-auto font-medium leading-relaxed">
              Your screening request credentials have been processed successfully. The reports are currently in Processing status. Property Manager has been notified.
            </p>
            <div className="p-4 bg-secondary/15 rounded-xl border border-border/40 max-w-sm mx-auto text-xs font-semibold">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Screening Status:</span>
                <span className={`font-extrabold uppercase ${
                  screening.status === 'Approved' ? 'text-emerald-500 font-black' :
                  screening.status === 'Declined' ? 'text-rose-500 font-black' :
                  'text-amber-500 animate-pulse'
                }`}>
                  {screening.status}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-muted-foreground">Document Status:</span>
                <span className="text-emerald-500 font-extrabold">Received</span>
              </div>
            </div>
          </div>
        )}

        {/* CONTROLS */}
        <div className="flex justify-between pt-4 border-t border-border/60">
          {step > 1 && step < 5 ? (
            <Button variant="outline" type="button" onClick={handlePrevStep} className="flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <Button
              onClick={handleNextStep}
              className="bg-primary hover:bg-primary/95 text-white font-bold flex items-center gap-1"
              disabled={
                (step === 2 && !dob) ||
                (step === 3 && !authorized) ||
                (step === 4 && !selectedFile) ||
                consentMutation.isPending ||
                uploadMutation.isPending
              }
            >
              {consentMutation.isPending || uploadMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>Continue <ArrowRight className="w-3.5 h-3.5" /></>
              )}
            </Button>
          ) : (
            <Button onClick={() => navigate({ to: '/tenant' })} className="bg-primary text-white font-bold mx-auto">
              Finish & Exit Portal
            </Button>
          )}
        </div>

      </Card>
    </div>
  );
};
export default ApplicantScreeningWizard;
