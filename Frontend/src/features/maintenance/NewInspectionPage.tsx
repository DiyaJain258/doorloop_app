import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import api from '../../api';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { ApplicationStepper } from '../../components/ApplicationStepper';
import { InspectionChecklist } from '../../components/MaintenanceComponents';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

export const NewInspectionPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const steps = ['Select Property', 'Select Unit', 'Select Type', 'Checklist', 'Photos Upload', 'Review & Post'];

  // Form states
  const [propertyId, setPropertyId] = useState('');
  const [unitNumber, setUnitNumber] = useState('101');
  const [type, setType] = useState<'Move In' | 'Move Out' | 'Routine' | 'Annual' | 'Safety' | 'Fire' | 'Insurance' | 'Vendor Completion'>('Routine');
  const [checklist, setChecklist] = useState<any[]>([
    { section: 'Exterior Entrance Door Lock', status: 'Pass' },
    { section: 'Interior Wall Outlets & GFCIs', status: 'Pass' },
    { section: 'Kitchen Appliances Seals', status: 'Pass' },
    { section: 'Bathroom Plumbing Faucets', status: 'Pass' },
    { section: 'HVAC Air Filter Status', status: 'Pass' },
    { section: 'Smoke Detectors Batteries', status: 'Pass' },
  ]);

  // Queries
  const { data: properties = [] } = useQuery({ queryKey: ['properties'], queryFn: () => api.property.getAll() });

  const createMutation = useMutation({
    mutationFn: () => {
      const prop = properties.find((p) => p.id === propertyId);
      return api.inspections.create({
        propertyId,
        propertyName: prop ? prop.name : 'Property Portfolio',
        unitNumber,
        type,
        checklist,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections-list'] });
      navigate({ to: '/inspections' });
    },
  });

  const handleNext = () => {
    if (step === 0 && !propertyId) return;
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleChecklistChange = (idx: number, status: 'Pass' | 'Fail' | 'N/A') => {
    const nextCheck = [...checklist];
    nextCheck[idx].status = status;
    setChecklist(nextCheck);
  };

  return (
    <div className="max-w-2xl text-foreground space-y-6">
      <PageHeader
        title="Record Property Inspection"
        description="Inspect unit parameters, verify fire alarms, and sign checklist sheets."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Maintenance', href: '/maintenance' },
          { label: 'Inspections', href: '/inspections' },
          { label: 'New Inspection' },
        ]}
      />

      <Card className="p-6 border bg-card space-y-6">
        <ApplicationStepper steps={steps} currentStep={step} />

        {/* STEP 1: Property */}
        {step === 0 && (
          <div className="space-y-3.5 text-xs font-semibold">
            <h3 className="font-extrabold text-sm uppercase">Select Property Location</h3>
            <Select value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
              <option value="">Select Property...</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </div>
        )}

        {/* STEP 2: Unit */}
        {step === 1 && (
          <div className="space-y-3.5 text-xs font-semibold">
            <h3 className="font-extrabold text-sm uppercase">Select Unit Number</h3>
            <Select value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)}>
              <option value="101">Unit 101</option>
              <option value="102">Unit 102</option>
              <option value="201">Unit 201</option>
              <option value="202">Unit 202</option>
            </Select>
          </div>
        )}

        {/* STEP 3: Type */}
        {step === 2 && (
          <div className="space-y-3.5 text-xs font-semibold">
            <h3 className="font-extrabold text-sm uppercase">Select Inspection Category</h3>
            <Select value={type} onChange={(e: any) => setType(e.target.value)}>
              <option value="Routine">Routine Inspection</option>
              <option value="Move In">Move In Inspection</option>
              <option value="Move Out">Move Out Inspection</option>
              <option value="Annual">Annual Audit</option>
              <option value="Safety">Safety Standards Verification</option>
              <option value="Fire">Fire Safety Audits</option>
              <option value="Insurance">Insurance Policy Inspections</option>
              <option value="Vendor Completion">Vendor Completion Inspections</option>
            </Select>
          </div>
        )}

        {/* STEP 4: Checklist */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm uppercase">Checklist Audit Grid</h3>
            <InspectionChecklist checklist={checklist} onChange={handleChecklistChange} />
          </div>
        )}

        {/* STEP 5: Photos */}
        {step === 4 && (
          <div className="space-y-3.5 text-xs font-semibold">
            <h3 className="font-extrabold text-sm uppercase">Upload Diagnostic Photos</h3>
            <div className="border border-dashed border-border p-6 rounded-2xl text-center space-y-2 hover:border-primary/40 transition">
              <p className="text-muted-foreground">Drag and drop photos or click to browse files.</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Max upload size: 10MB per image</p>
            </div>
          </div>
        )}

        {/* STEP 6: Review */}
        {step === 5 && (
          <div className="space-y-4 text-xs font-semibold">
            <h3 className="font-extrabold text-sm uppercase">Review & Post Inspection</h3>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Inspection data gathered. Ready to write audit records.</span>
            </div>
          </div>
        )}

        {/* WIZARD FOOTER */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button variant="ghost" onClick={handlePrev} disabled={step === 0} className="flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={handleNext} disabled={step === 0 && !propertyId} className="flex items-center gap-1">
              Next Step <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Inspection
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
export default NewInspectionPage;
