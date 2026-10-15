import { apiClient } from '../../../api/client';
import { ReportResponse, RentRollItem, OccupancyItem, DelinquencyItem, ProfitLossData, MaintenanceItem, PaymentHistoryItem, ExportHistoryItem } from '../types/report.types';

const buildQuery = (params: any): string => {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.append(key, String(val));
    }
  });
  const str = searchParams.toString();
  return str ? `?${str}` : '';
};

export const reportApi = {
  getRentRoll: async (params: any): Promise<ReportResponse<RentRollItem>> => {
    const res: any = await apiClient.get(`/reports/rent-roll${buildQuery(params)}`);
    return res;
  },

  getOccupancy: async (params: any): Promise<ReportResponse<OccupancyItem>> => {
    const res: any = await apiClient.get(`/reports/occupancy${buildQuery(params)}`);
    return res;
  },

  getDelinquency: async (params: any): Promise<ReportResponse<DelinquencyItem>> => {
    const res: any = await apiClient.get(`/reports/delinquency${buildQuery(params)}`);
    return res;
  },

  getProfitLoss: async (params: any): Promise<{ data: ProfitLossData }> => {
    const res: any = await apiClient.get(`/reports/profit-loss${buildQuery(params)}`);
    return res;
  },

  getMaintenance: async (params: any): Promise<ReportResponse<MaintenanceItem>> => {
    const res: any = await apiClient.get(`/reports/maintenance${buildQuery(params)}`);
    return res;
  },

  getPaymentHistory: async (params: any): Promise<ReportResponse<PaymentHistoryItem>> => {
    const res: any = await apiClient.get(`/reports/payment-history${buildQuery(params)}`);
    return res;
  },

  getExports: async (params: any): Promise<ReportResponse<ExportHistoryItem>> => {
    const res: any = await apiClient.get(`/reports/exports${buildQuery(params)}`);
    return res;
  },

  triggerExport: async (data: { reportType: string; filters: any; fileName: string; fileType: string }): Promise<ExportHistoryItem> => {
    const res: any = await apiClient.post('/reports/exports', data);
    return res;
  },
};
