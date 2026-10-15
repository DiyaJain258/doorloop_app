import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api';
import { PageHeader } from '../../../components/PageHeader';
import { ForecastChart } from '../components/ForecastChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/Tabs';

export const ForecastingPage: React.FC = () => {
  const [type, setType] = useState<'revenue' | 'occupancy' | 'expense' | 'maintenance'>('revenue');

  const { data: forecast = [], isLoading } = useQuery({
    queryKey: ['forecast-data', type],
    queryFn: () => api.forecasts.getForecast(type),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Predictive Analytics & Forecasting"
        description="Machine learning forecasting models outlining 12-month projections of occupancy, revenue, and utility costs."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reports' }, { label: 'Forecasting' }]}
      />

      <div className="bg-card border border-border rounded-2xl p-6">
        <Tabs defaultValue="revenue" onValueChange={(val: any) => setType(val)}>
          <TabsList className="mb-6">
            <TabsTrigger value="revenue">Revenue Forecast</TabsTrigger>
            <TabsTrigger value="occupancy">Occupancy Forecast</TabsTrigger>
            <TabsTrigger value="expense">Expense Forecast</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance Costs</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue">
            <h3 className="text-sm font-bold text-foreground mb-4 uppercase">12-Month Revenue Projections ($)</h3>
            {isLoading ? (
              <div className="h-60 flex items-center justify-center">Loading Prediction...</div>
            ) : (
              <ForecastChart data={forecast} dataKey="forecast" name="Projected Revenue" />
            )}
          </TabsContent>

          <TabsContent value="occupancy">
            <h3 className="text-sm font-bold text-foreground mb-4 uppercase">Projected Portfolio Occupancy %</h3>
            {isLoading ? (
              <div className="h-60 flex items-center justify-center">Loading Prediction...</div>
            ) : (
              <ForecastChart data={forecast} dataKey="forecast" name="Occupancy %" valueFormatter={(val) => `${val}%`} />
            )}
          </TabsContent>

          <TabsContent value="expense">
            <h3 className="text-sm font-bold text-foreground mb-4 uppercase">Expense Outflow Prediction ($)</h3>
            {isLoading ? (
              <div className="h-60 flex items-center justify-center">Loading Prediction...</div>
            ) : (
              <ForecastChart data={forecast} dataKey="forecast" name="Projected Outflows" />
            )}
          </TabsContent>

          <TabsContent value="maintenance">
            <h3 className="text-sm font-bold text-foreground mb-4 uppercase">Estimated Maintenance & Repairs cost</h3>
            {isLoading ? (
              <div className="h-60 flex items-center justify-center">Loading Prediction...</div>
            ) : (
              <ForecastChart data={forecast} dataKey="forecast" name="Projected Maintenance" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
export default ForecastingPage;
