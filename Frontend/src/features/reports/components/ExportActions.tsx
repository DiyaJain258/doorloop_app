import React from 'react';
import { Download, FileText, Table, FileSpreadsheet } from 'lucide-react';

interface ExportActionsProps {
  onExport: (fileType: 'CSV' | 'PDF' | 'XLSX') => void;
  isExporting: boolean;
}

export const ExportActions: React.FC<ExportActionsProps> = ({ onExport, isExporting }) => {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
      <span className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
        <Download className="w-4 h-4" /> Export Options:
      </span>

      <button
        onClick={() => onExport('CSV')}
        disabled={isExporting}
        className="flex items-center gap-1.5 h-8 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
      >
        <FileText className="w-3.5 h-3.5 text-blue-500" />
        CSV
      </button>

      <button
        onClick={() => onExport('XLSX')}
        disabled={isExporting}
        className="flex items-center gap-1.5 h-8 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
      >
        <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
        Excel
      </button>

      <button
        onClick={() => onExport('PDF')}
        disabled={isExporting}
        className="flex items-center gap-1.5 h-8 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
      >
        <Table className="w-3.5 h-3.5 text-red-500" />
        PDF
      </button>

      {isExporting && (
        <span className="text-xs text-slate-400 animate-pulse">Processing export request...</span>
      )}
    </div>
  );
};
export default ExportActions;
