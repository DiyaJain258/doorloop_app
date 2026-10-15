import React from 'react';
import { DashboardWidget } from '../../../types';
import { WidgetRenderer } from './WidgetRenderer';

interface DashboardGridProps {
  widgets: DashboardWidget[];
  isEditing?: boolean;
  onRemoveWidget?: (id: string) => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  widgets,
  isEditing = false,
  onRemoveWidget,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {widgets.map((widget) => (
        <div key={widget.id} className="relative group">
          {isEditing && onRemoveWidget && (
            <button
              onClick={() => onRemoveWidget(widget.id)}
              className="absolute top-2 right-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              title="Remove Widget"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <WidgetRenderer widget={widget} />
        </div>
      ))}
    </div>
  );
};
export default DashboardGrid;
