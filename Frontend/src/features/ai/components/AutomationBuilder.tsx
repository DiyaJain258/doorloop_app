import React, { useState } from 'react';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ArrowDown, Sparkles, Play } from 'lucide-react';

interface AutomationBuilderProps {
  onSave: (rule: {
    name: string;
    trigger: string;
    condition: string;
    action: string;
  }) => void;
}

const TRIGGERS = [
  'Rent Due', 'Lease Expiring', 'Maintenance Created', 'Payment Failed', 'New Lead', 'Document Uploaded'
];

const CONDITIONS = [
  'Amount > $500', 'Amount > $1000', 'Tenant Status = Active', 'Lease expires in 60 days', 'Category = HVAC', 'Property = Sky Lofts'
];

const ACTIONS = [
  'Send Email', 'Send SMS', 'Create Task', 'Notify User', 'Create Work Order', 'Generate Report'
];

export const AutomationBuilder: React.FC<AutomationBuilderProps> = ({ onSave }) => {
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState(TRIGGERS[0]);
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [action, setAction] = useState(ACTIONS[0]);

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please name your automation.');
      return;
    }
    onSave({ name, trigger, condition, action });
    setName('');
  };

  return (
    <div className="bg-card border border-border p-6 rounded-2xl max-w-xl mx-auto space-y-6">
      <div className="border-b border-border pb-3 flex justify-between items-center">
        <h3 className="font-bold text-base text-foreground flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary" />
          Rule Recipe Builder
        </h3>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">Automation Rule Name</label>
        <Input
          type="text"
          placeholder="e.g. Late Rent Warning Alert"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* WHEN Block */}
      <div className="space-y-1.5 border border-border bg-secondary/10 p-4 rounded-xl relative">
        <span className="text-[10px] font-extrabold uppercase bg-indigo-500/10 text-indigo-600 px-1.5 py-0.5 rounded absolute -top-2.5 left-4">
          WHEN
        </span>
        <label className="text-xs font-semibold text-muted-foreground block pt-1">Event Trigger</label>
        <Select value={trigger} onChange={(e) => setTrigger(e.target.value)}>
          {TRIGGERS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex justify-center my-1">
        <ArrowDown className="w-5 h-5 text-muted-foreground" />
      </div>

      {/* CONDITION Block */}
      <div className="space-y-1.5 border border-border bg-secondary/10 p-4 rounded-xl relative">
        <span className="text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded absolute -top-2.5 left-4">
          CONDITION
        </span>
        <label className="text-xs font-semibold text-muted-foreground block pt-1">Rule Constraints</label>
        <Select value={condition} onChange={(e) => setCondition(e.target.value)}>
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex justify-center my-1">
        <ArrowDown className="w-5 h-5 text-muted-foreground" />
      </div>

      {/* ACTION Block */}
      <div className="space-y-1.5 border border-border bg-secondary/10 p-4 rounded-xl relative">
        <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded absolute -top-2.5 left-4">
          ACTION
        </span>
        <label className="text-xs font-semibold text-muted-foreground block pt-1">Workflow Response</label>
        <Select value={action} onChange={(e) => setAction(e.target.value)}>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
      </div>

      <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-1.5">
        <Play className="w-4 h-4" /> Deploy Automation
      </Button>
    </div>
  );
};
export default AutomationBuilder;
