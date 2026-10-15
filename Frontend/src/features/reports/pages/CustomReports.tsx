import React, { useState } from 'react';
import { PageHeader } from '../../../components/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { ChevronRight, ChevronLeft, Save } from 'lucide-react';

export const CustomReports: React.FC = () => {
  const [step, setStep] = useState(1);
  const [reportName, setReportName] = useState('');
  const [dataSource, setDataSource] = useState('revenue');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [vis, setVis] = useState('table');

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSave = () => {
    alert(`Report "${reportName || 'Untitled Custom Report'}" saved successfully!`);
    setStep(1);
    setReportName('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Custom Report Builder"
        description="Build and configuration customized reports in 5 simple stages."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reports' }, { label: 'Custom' }]}
      />

      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        {/* Step Indicator Header */}
        <div className="flex justify-between items-center border-b border-border pb-4">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Step {step} of 5
          </span>
          <h3 className="font-extrabold text-base text-foreground">
            {step === 1 && 'Select Report Database'}
            {step === 2 && 'Select Columns & Fields'}
            {step === 3 && 'Define Filtering Criteria'}
            {step === 4 && 'Choose Visual Format'}
            {step === 5 && 'Verify & Save configuration'}
          </h3>
        </div>

        {/* Form Body for steps */}
        <div className="min-h-[200px] flex items-center justify-center">
          {step === 1 && (
            <div className="w-full max-w-sm space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Select Base Data Model</label>
              <Select value={dataSource} onChange={(e) => setDataSource(e.target.value)}>
                <option value="revenue">Financial Ledger Transactions</option>
                <option value="occupancy">Occupancy & Unit Logs</option>
                <option value="maintenance">Service requests / Work Orders</option>
              </Select>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-wrap gap-3 max-w-md justify-center">
              {['Amount', 'Category', 'Date', 'Property Name', 'Unit Number', 'Tenant name', 'Vendor details'].map((f) => (
                <label
                  key={f}
                  className={`px-4 py-2 rounded-full border text-xs font-semibold cursor-pointer transition ${
                    selectedFields.includes(f)
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-card border-border hover:bg-secondary/40'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(f)}
                    onChange={() =>
                      setSelectedFields((prev) =>
                        prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f]
                      )
                    }
                    className="hidden"
                  />
                  {f}
                </label>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="text-center text-muted-foreground space-y-2">
              <p className="text-sm font-semibold text-foreground">Filtering Rules</p>
              <p className="text-xs">Filter transactions where amount is greater than $0, in date range (YTD).</p>
            </div>
          )}

          {step === 4 && (
            <div className="w-full max-w-sm space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Select chart style</label>
              <Select value={vis} onChange={(e) => setVis(e.target.value)}>
                <option value="table">Standard Spreadsheet Table</option>
                <option value="bar">Bar Chart</option>
                <option value="line">Trend Line Chart</option>
                <option value="pie">Donut Pie Chart</option>
              </Select>
            </div>
          )}

          {step === 5 && (
            <div className="w-full max-w-sm space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Name Your Report</label>
                <Input
                  type="text"
                  placeholder="e.g. Monthly Performance audit"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Buttons Controls footer */}
        <div className="flex justify-between border-t border-border pt-4">
          <Button variant="outline" onClick={prevStep} disabled={step === 1} className="font-semibold flex items-center">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>

          {step < 5 ? (
            <Button onClick={nextStep} className="bg-primary text-primary-foreground font-semibold flex items-center">
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSave} className="bg-primary text-primary-foreground font-semibold flex items-center gap-1">
              <Save className="w-4 h-4" /> Save Report
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
export default CustomReports;
