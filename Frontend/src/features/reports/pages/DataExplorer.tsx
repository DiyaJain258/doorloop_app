import React, { useState } from 'react';
import { PageHeader } from '../../../components/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Play, Database, FileSpreadsheet, Layers, BarChart } from 'lucide-react';

const DATA_SOURCES = [
  'Properties', 'Units', 'Tenants', 'Leases', 'Payments', 'Expenses', 'Maintenance', 'Vendors', 'Owners'
];

const FIELDS_MAP: Record<string, string[]> = {
  Properties: ['Name', 'Type', 'Units Count', 'Occupancy Rate', 'Monthly Revenue', 'Current Value'],
  Units: ['Unit Number', 'Bedrooms', 'Bathrooms', 'Rent Amount', 'Status'],
  Tenants: ['First Name', 'Last Name', 'Email', 'Phone', 'Status'],
  Leases: ['Tenant Name', 'Start Date', 'End Date', 'Rent Amount', 'Status'],
  Payments: ['Tenant Name', 'Amount', 'Date', 'Method', 'Status'],
  Expenses: ['Vendor Name', 'Category', 'Amount', 'Date', 'Status'],
  Maintenance: ['Title', 'Priority', 'Status', 'Cost', 'Created Date'],
  Vendors: ['Vendor Name', 'Category', 'Rating', 'Response Time'],
  Owners: ['Name', 'Email', 'Properties Owned', 'Payout Method'],
};

export const DataExplorer: React.FC = () => {
  const [source, setSource] = useState<string>('Properties');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [visType, setVisType] = useState<string>('Table');
  const [isGenerated, setIsGenerated] = useState(false);

  const fields = FIELDS_MAP[source] || [];

  const handleSourceChange = (val: string) => {
    setSource(val);
    setSelectedFields([]);
    setIsGenerated(false);
  };

  const handleFieldToggle = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Explorer"
        description="Write custom analytical queries against any module database, aggregate values, and build dynamic chart cards."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reports' }, { label: 'Data Explorer' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurations Side Panel */}
        <div className="bg-card border border-border p-5 rounded-2xl space-y-6 h-fit">
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <Database className="w-4 h-4 text-primary" />
              1. Choose Data Source
            </h3>
            <Select value={source} onChange={(e) => handleSourceChange(e.target.value)}>
              {DATA_SOURCES.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-primary" />
              2. Select Columns
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-border p-3 rounded-lg bg-secondary/20">
              {fields.map((field) => (
                <label key={field} className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field)}
                    onChange={() => handleFieldToggle(field)}
                    className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                  <span>{field}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <BarChart className="w-4 h-4 text-primary" />
              3. Visualization Type
            </h3>
            <Select value={visType} onChange={(e) => setVisType(e.target.value)}>
              <option value="Table">Data Table Grid</option>
              <option value="Line">Line Chart</option>
              <option value="Bar">Bar Chart</option>
              <option value="Pie">Pie Chart</option>
            </Select>
          </div>

          <Button
            onClick={() => setIsGenerated(true)}
            className="w-full bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-1.5"
          >
            <Play className="w-4 h-4" /> Run Query
          </Button>
        </div>

        {/* Results Viewer Grid */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl min-h-[400px] flex flex-col justify-between">
          <div className="border-b border-border pb-3 mb-4">
            <h3 className="font-bold text-base text-foreground">Query Execution Console</h3>
          </div>

          <div className="flex-1 flex items-center justify-center">
            {isGenerated ? (
              <div className="w-full text-center space-y-4">
                <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-lg text-sm font-semibold max-w-sm mx-auto flex items-center justify-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" /> Query executed successfully.
                </div>
                <div className="overflow-x-auto border border-border rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-secondary/40 text-muted-foreground uppercase font-bold">
                      <tr>
                        {selectedFields.length > 0 ? (
                          selectedFields.map((f) => <th key={f} className="p-3">{f}</th>)
                        ) : (
                          <th className="p-3">Record ID</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-foreground font-medium">
                      <tr>
                        {selectedFields.length > 0 ? (
                          selectedFields.map((f) => <td key={f} className="p-3">Mock {f} Data</td>)
                        ) : (
                          <td className="p-3">#00109A</td>
                        )}
                      </tr>
                      <tr>
                        {selectedFields.length > 0 ? (
                          selectedFields.map((f) => <td key={f} className="p-3">Mock {f} Data</td>)
                        ) : (
                          <td className="p-3">#00110B</td>
                        )}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground space-y-2">
                <Database className="w-12 h-12 mx-auto stroke-[1.5]" />
                <p className="text-sm font-semibold">Select your settings and click "Run Query" to fetch results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DataExplorer;
