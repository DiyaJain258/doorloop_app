import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Calendar, Filter, Download, Printer } from 'lucide-react';

interface FilterBuilderProps {
  onFilterChange: (filters: {
    propertyId: string;
    dateRange: string;
    status: string;
    searchQuery: string;
  }) => void;
  showExport?: boolean;
  onExport?: (format: 'PDF' | 'CSV' | 'Print') => void;
  statuses?: string[];
}

export const FilterBuilder: React.FC<FilterBuilderProps> = ({
  onFilterChange,
  showExport = false,
  onExport,
  statuses = ['Active', 'Inactive', 'All'],
}) => {
  const [propertyId, setPropertyId] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [status, setStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: properties = [] } = useQuery({
    queryKey: ['properties-list-minimal'],
    queryFn: () => api.property.getAll(),
  });

  const handleApply = () => {
    onFilterChange({
      propertyId,
      dateRange,
      status,
      searchQuery,
    });
  };

  const handleClear = () => {
    setPropertyId('all');
    setDateRange('all');
    setStatus('all');
    setSearchQuery('');
    onFilterChange({
      propertyId: 'all',
      dateRange: 'all',
      status: 'all',
      searchQuery: '',
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-6 flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-end md:space-x-4">
      <div className="flex-1 space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">Property</label>
        <Select value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
          <option value="all">All Properties</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex-1 space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">Date Range</label>
        <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
          <option value="all">All Time</option>
          <option value="this-month">This Month</option>
          <option value="last-month">Last Month</option>
          <option value="this-quarter">This Quarter</option>
          <option value="ytd">Year to Date (YTD)</option>
          <option value="last-year">Last Year</option>
        </Select>
      </div>

      <div className="flex-1 space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">Status</label>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s.toLowerCase()}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex-1 space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">Search</label>
        <Input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="flex space-x-2">
        <Button onClick={handleApply} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-1.5">
          <Filter className="w-4 h-4" /> Apply
        </Button>
        <Button variant="outline" onClick={handleClear} className="font-semibold text-muted-foreground">
          Clear
        </Button>
      </div>

      {showExport && onExport && (
        <div className="flex space-x-2 border-t border-border pt-4 md:border-t-0 md:pt-0 md:border-l md:pl-4">
          <Button variant="outline" size="sm" onClick={() => onExport('CSV')} className="font-semibold flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport('PDF')} className="font-semibold flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport('Print')} className="font-semibold flex items-center gap-1">
            <Printer className="w-3.5 h-3.5" /> Print
          </Button>
        </div>
      )}
    </div>
  );
};
export default FilterBuilder;
