import React from 'react';
import { PaginationInfo } from '../types/report.types';
import { ArrowUpDown } from 'lucide-react';

interface ColumnDef {
  key: string;
  header: string;
  render?: (row: any) => React.ReactNode;
}

interface ReportTableProps {
  columns: ColumnDef[];
  data: any[];
  isLoading: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onSort?: (key: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const ReportTable: React.FC<ReportTableProps> = ({
  columns,
  data,
  isLoading,
  pagination,
  onPageChange,
  onSort,
  sortBy,
  sortOrder,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Loading report data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
        <p className="text-sm font-bold text-slate-500">No report records found</p>
        <p className="text-xs text-slate-400 mt-1">Try modifying your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
        <table className="w-full text-left text-sm border-collapse bg-white dark:bg-slate-900">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-4 font-bold text-slate-600 dark:text-slate-300 select-none"
                >
                  <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => onSort?.(col.key)}>
                    {col.header}
                    {onSort && <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
            {data.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-slate-700 dark:text-slate-400">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && onPageChange && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
          <span className="text-xs text-slate-500">
            Showing Page <strong className="font-semibold text-slate-700 dark:text-slate-300">{pagination.page}</strong> of{' '}
            <strong className="font-semibold text-slate-700 dark:text-slate-300">{pagination.totalPages}</strong> ({pagination.totalRecords} records)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 h-8 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 h-8 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default ReportTable;
