import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import apiClient from '../api/client';
import { useAuthStore, useThemeStore } from '../store/useStore';
import { useThemeColors } from '../theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const ManagerDashboard = ({ onNavigate }) => {
  const { user, logout, refreshAccessToken } = useAuthStore();
  const { language } = useThemeStore();
  const { colors, isDarkMode } = useThemeColors();
  const styles = getStyles(colors, isDarkMode);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Live Metrics strictly from GET /dashboard/metrics
  const [metrics, setMetrics] = useState({
    totalProperties: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    occupancyRate: 0,
    monthlyRevenue: 0,
    pendingRent: 0,
    expenses: 0,
    openMaintenance: 0,
    leasesExpiringSoon: 0,
  });

  // 2. Financial Chart Data strictly from GET /dashboard/charts
  const [chartData, setChartData] = useState([]);

  // 3. Operational Real Lists
  const [outstandingInvoices, setOutstandingInvoices] = useState([]);
  const [recentWorkOrders, setRecentWorkOrders] = useState([]);
  const [upcomingLeases, setUpcomingLeases] = useState([]);
  const [propertiesList, setPropertiesList] = useState([]);
  const [unitsList, setUnitsList] = useState([]);
  const [expensesList, setExpensesList] = useState([]);

  // 4. Interactive Metric Detail Modal State
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [modalSearch, setModalSearch] = useState('');

  // Fetch live dashboard data matching Web Frontend APIs strictly without mock fallbacks
  const fetchDashboardData = async () => {
    try {
      const [
        metricsRes,
        chartsRes,
        invoicesRes,
        woRes,
        leasesRes,
        propsRes,
        unitsRes,
        expensesRes,
      ] = await Promise.all([
        apiClient.get('/dashboard/metrics', logout, refreshAccessToken).catch(() => null),
        apiClient.get('/dashboard/charts', logout, refreshAccessToken).catch(() => null),
        apiClient.get('/invoices', logout, refreshAccessToken).catch(() => null),
        apiClient.get('/work-orders', logout, refreshAccessToken).catch(() => null),
        apiClient.get('/leases', logout, refreshAccessToken).catch(() => null),
        apiClient.get('/properties', logout, refreshAccessToken).catch(() => null),
        apiClient.get('/units', logout, refreshAccessToken).catch(() => null),
        apiClient.get('/portal/expenses', logout, refreshAccessToken).catch(() => null),
      ]);

      // 1. Process Live Properties & Units
      const rawProps = Array.isArray(propsRes) ? propsRes : (propsRes?.data || []);
      const propArray = Array.isArray(rawProps) ? rawProps : [];
      setPropertiesList(propArray);

      const rawUnits = Array.isArray(unitsRes) ? unitsRes : (unitsRes?.data || []);
      const unitArray = Array.isArray(rawUnits) ? rawUnits : [];
      setUnitsList(unitArray);

      // 2. Process Live Metrics
      if (metricsRes) {
        const m = metricsRes.data || metricsRes;
        const totalU = Number(m.totalUnits !== undefined ? m.totalUnits : unitArray.length);
        const occU = Number(
          m.occupiedUnits !== undefined
            ? m.occupiedUnits
            : unitArray.filter((u) => String(u.status || '').toLowerCase() === 'occupied').length
        );
        const vacU = Number(
          m.vacantUnits !== undefined
            ? m.vacantUnits
            : (totalU > occU ? totalU - occU : unitArray.filter((u) => String(u.status || '').toLowerCase() === 'vacant').length)
        );
        const occRate = Number(
          m.occupancyRate !== undefined
            ? m.occupancyRate
            : (totalU > 0 ? Math.round((occU / totalU) * 100) : 0)
        );

        setMetrics({
          totalProperties: Number(m.totalProperties !== undefined ? m.totalProperties : propArray.length),
          totalUnits: totalU,
          occupiedUnits: occU,
          vacantUnits: vacU,
          occupancyRate: occRate,
          monthlyRevenue: Number(m.monthlyRevenue ?? 0),
          pendingRent: Number(m.pendingRent ?? 0),
          expenses: Number(m.expenses ?? 0),
          openMaintenance: Number(m.openMaintenance ?? 0),
          leasesExpiringSoon: Number(m.leasesExpiringSoon ?? 0),
        });
      }

      // 3. Process Financial Trends from /dashboard/charts
      if (chartsRes) {
        const c = chartsRes.data || chartsRes;
        const incExp = c.incomeVsExpenses || [];
        if (Array.isArray(incExp) && incExp.length > 0) {
          setChartData(incExp);
        } else {
          setChartData([]);
        }
      }

      // 4. Process Real Outstanding Invoices (strictly balance > 0 and unpaid)
      const rawInvoices = invoicesRes?.data || invoicesRes || [];
      const invList = Array.isArray(rawInvoices) ? rawInvoices : [];
      const unpaid = invList.filter((inv) => {
        const bal = Number(inv.balance !== undefined ? inv.balance : inv.amount || 0);
        const st = String(inv.status || '').toLowerCase();
        return bal > 0 && st !== 'paid';
      });
      setOutstandingInvoices(unpaid.slice(0, 10));

      // 5. Process Real Work Orders
      const rawWorkOrders = woRes?.data || woRes || [];
      const woList = Array.isArray(rawWorkOrders) ? rawWorkOrders : [];
      setRecentWorkOrders(woList.slice(0, 10));

      // 6. Process Real Leases Expiring / Upcoming
      const rawLeases = leasesRes?.data || leasesRes || [];
      const leaseList = Array.isArray(rawLeases) ? rawLeases : [];
      const now = new Date();
      const in60Days = new Date();
      in60Days.setDate(now.getDate() + 60);

      const activeUpcoming = leaseList.filter((l) => {
        if (!l.endDate && !l.startDate) return false;
        const end = l.endDate ? new Date(l.endDate) : null;
        return end && end >= now && end <= in60Days;
      });
      setUpcomingLeases(activeUpcoming.slice(0, 10));

      // 7. Process Expenses List
      const rawExpenses = expensesRes?.data || expensesRes || [];
      setExpensesList(Array.isArray(rawExpenses) ? rawExpenses : []);

    } catch (e) {
      console.log('Error fetching manager dashboard data:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]} allowFontScaling={false}>
          {language === 'es' ? 'Cargando tablero en vivo...' : 'Loading live dashboard...'}
        </Text>
      </View>
    );
  }

  // Real occupancy numbers (100% database based, zero fake data)
  const totalUnits = metrics.totalUnits;
  const occupiedUnits = metrics.occupiedUnits;
  const vacantUnits = metrics.vacantUnits;
  const occupancyPct = metrics.occupancyRate;
  const vacancyPct = totalUnits > 0 ? Math.max(0, 100 - occupancyPct) : 0;

  // Max value for chart scaling
  const maxChartVal = Math.max(
    1000,
    ...chartData.map((d) => Math.max(d.income || 0, d.expenses || 0))
  );

  // Filter items for Metric Details Modal based on search term
  const getModalItems = () => {
    const q = modalSearch.toLowerCase().trim();
    switch (selectedMetric) {
      case 'properties':
        return propertiesList
          .filter((p) => !q || (p.name && p.name.toLowerCase().includes(q)) || (p.address && String(p.address).toLowerCase().includes(q)))
          .map((p) => ({
            id: p.id,
            title: p.name || 'Property',
            subtitle: typeof p.address === 'string' ? p.address : (p.address?.street || p.city || 'Address not set'),
            badge: `${p.units?.length || p.unitsCount || 0} Units`,
            badgeColor: '#2563eb',
            targetScreen: 'properties',
          }));

      case 'totalUnits':
      case 'occupancyRate':
        return unitsList
          .filter((u) => !q || (u.unitNumber && String(u.unitNumber).toLowerCase().includes(q)) || (u.property?.name && u.property.name.toLowerCase().includes(q)))
          .map((u) => ({
            id: u.id,
            title: `Unit ${u.unitNumber || 'N/A'}`,
            subtitle: u.property?.name || u.propertyName || 'Property',
            badge: u.status || 'Vacant',
            badgeColor: String(u.status || '').toLowerCase() === 'occupied' ? '#10b981' : '#f59e0b',
            targetScreen: 'properties',
          }));

      case 'occupiedUnits':
        return unitsList
          .filter((u) => String(u.status || '').toLowerCase() === 'occupied')
          .filter((u) => !q || (u.unitNumber && String(u.unitNumber).toLowerCase().includes(q)) || (u.property?.name && u.property.name.toLowerCase().includes(q)))
          .map((u) => ({
            id: u.id,
            title: `Unit ${u.unitNumber || 'N/A'}`,
            subtitle: u.property?.name || u.propertyName || 'Property',
            badge: `$${Number(u.rentAmount || 0).toLocaleString()}/mo`,
            badgeColor: '#10b981',
            targetScreen: 'properties',
          }));

      case 'vacantUnits':
        return unitsList
          .filter((u) => String(u.status || '').toLowerCase() !== 'occupied')
          .filter((u) => !q || (u.unitNumber && String(u.unitNumber).toLowerCase().includes(q)) || (u.property?.name && u.property.name.toLowerCase().includes(q)))
          .map((u) => ({
            id: u.id,
            title: `Unit ${u.unitNumber || 'N/A'} (Vacant)`,
            subtitle: u.property?.name || u.propertyName || 'Property',
            badge: 'Ready to Lease',
            badgeColor: '#f43f5e',
            targetScreen: 'properties',
          }));

      case 'monthlyRevenue':
        return upcomingLeases
          .concat(
            unitsList
              .filter((u) => String(u.status || '').toLowerCase() === 'occupied')
              .map((u) => ({
                id: u.id,
                tenantName: u.tenantName || 'Active Resident',
                propertyName: u.property?.name || 'Property',
                unitNumber: u.unitNumber,
                rentAmount: u.rentAmount,
              }))
          )
          .filter((item) => !q || (item.tenantName && item.tenantName.toLowerCase().includes(q)) || (item.propertyName && item.propertyName.toLowerCase().includes(q)))
          .map((l, i) => ({
            id: l.id || `rev-${i}`,
            title: l.tenantName || (l.tenant ? `${l.tenant.firstName || ''} ${l.tenant.lastName || ''}`.trim() : null) || 'Contracted Tenant',
            subtitle: `${l.propertyName || l.property?.name || 'Property'} · Unit ${l.unitNumber || l.unit?.unitNumber || '1'}`,
            badge: `$${Number(l.rentAmount || 0).toLocaleString()}`,
            badgeColor: '#0ea5e9',
            targetScreen: 'rent',
          }));

      case 'pendingRent':
        return outstandingInvoices
          .filter((inv) => !q || (inv.tenantName && inv.tenantName.toLowerCase().includes(q)) || (inv.propertyName && inv.propertyName.toLowerCase().includes(q)))
          .map((inv) => ({
            id: inv.id,
            title: inv.tenantName || (inv.tenant ? `${inv.tenant.firstName || ''} ${inv.tenant.lastName || ''}`.trim() : null) || 'Resident',
            subtitle: inv.propertyName || (inv.unit ? `Unit ${inv.unit.unitNumber}` : 'Rental Unit'),
            badge: `$${Number(inv.balance !== undefined ? inv.balance : inv.amount || 0).toLocaleString()} Due`,
            badgeColor: '#ef4444',
            targetScreen: 'rent',
          }));

      case 'expenses':
        return expensesList
          .filter((exp) => !q || (exp.description && exp.description.toLowerCase().includes(q)) || (exp.category && exp.category.toLowerCase().includes(q)))
          .map((exp, i) => ({
            id: exp.id || `exp-${i}`,
            title: exp.description || exp.category || 'Operating Expense',
            subtitle: exp.date ? exp.date.split('T')[0] : 'Recorded Expense',
            badge: `$${Number(exp.amount || 0).toLocaleString()}`,
            badgeColor: '#ef4444',
            targetScreen: 'accounting',
          }));

      case 'openMaintenance':
        return recentWorkOrders
          .filter((wo) => !q || (wo.title && wo.title.toLowerCase().includes(q)) || (wo.propertyName && wo.propertyName.toLowerCase().includes(q)))
          .map((wo) => ({
            id: wo.id,
            title: wo.title || wo.description || 'Maintenance Task',
            subtitle: `${wo.propertyName || wo.property?.name || 'Property'} · ${wo.unitNumber || 'Unit'}`,
            badge: wo.status || 'Open',
            badgeColor: String(wo.status || '').toLowerCase().includes('comp') ? '#10b981' : '#f59e0b',
            targetScreen: 'maintenance',
          }));

      case 'leasesExpiringSoon':
        return upcomingLeases
          .filter((l) => !q || (l.tenantName && l.tenantName.toLowerCase().includes(q)) || (l.propertyName && l.propertyName.toLowerCase().includes(q)))
          .map((l) => ({
            id: l.id,
            title: l.tenantName || (l.tenant ? `${l.tenant.firstName || ''} ${l.tenant.lastName || ''}`.trim() : null) || 'Tenant',
            subtitle: `${l.propertyName || l.property?.name || 'Property'} · Unit ${l.unitNumber || '1'}`,
            badge: l.endDate ? `Ends ${l.endDate.split('T')[0]}` : 'Expiring Soon',
            badgeColor: '#f97316',
            targetScreen: 'leasing',
          }));

      default:
        return [];
    }
  };

  const getMetricModalTitle = () => {
    switch (selectedMetric) {
      case 'properties':
        return { name: 'Portfolio Properties', count: `${metrics.totalProperties} Active`, dest: 'properties', destLabel: 'View All Properties' };
      case 'totalUnits':
        return { name: 'Total Portfolio Units', count: `${metrics.totalUnits} Units`, dest: 'properties', destLabel: 'View All Units' };
      case 'occupiedUnits':
        return { name: 'Occupied Units', count: `${metrics.occupiedUnits} Leased`, dest: 'properties', destLabel: 'View Occupied Units' };
      case 'vacantUnits':
        return { name: 'Vacant Units', count: `${metrics.vacantUnits} Available`, dest: 'properties', destLabel: 'View Vacant Listings' };
      case 'occupancyRate':
        return { name: 'Portfolio Occupancy', count: `${metrics.occupancyRate}% Leased`, dest: 'properties', destLabel: 'Manage Units & Leases' };
      case 'monthlyRevenue':
        return { name: 'Monthly Contracted Revenue', count: `$${metrics.monthlyRevenue.toLocaleString()}`, dest: 'rent', destLabel: 'Open Rent & Collections' };
      case 'pendingRent':
        return { name: 'Outstanding Rent Receivables', count: `$${metrics.pendingRent.toLocaleString()}`, dest: 'rent', destLabel: 'Collect Overdue Rent' };
      case 'expenses':
        return { name: 'Operating Expenses', count: `$${metrics.expenses.toLocaleString()}`, dest: 'accounting', destLabel: 'View Accounting Expenses' };
      case 'openMaintenance':
        return { name: 'Active Maintenance Orders', count: `${metrics.openMaintenance} Open Tasks`, dest: 'maintenance', destLabel: 'Manage Work Orders' };
      case 'leasesExpiringSoon':
        return { name: 'Leases Expiring Soon', count: `${metrics.leasesExpiringSoon} Contracts`, dest: 'leasing', destLabel: 'Manage Lease Renewals' };
      default:
        return { name: 'Metric Details', count: '', dest: 'dashboard', destLabel: 'View Screen' };
    }
  };

  const modalMeta = getMetricModalTitle();
  const modalItems = getModalItems();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#2563eb" />
      }
    >
      {/* =========================================================================
          1. HEADER WITH WELCOME & LIVE REFRESH
          ========================================================================= */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerGreeting, { color: colors.textSecondary }]} allowFontScaling={false}>
            {user?.firstName ? `Welcome back, ${user.firstName}` : 'Portfolio Operations'} 👋
          </Text>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]} allowFontScaling={false}>
            Property Manager Dashboard
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.syncBtn, { borderColor: colors.cardBorder, backgroundColor: colors.surface }]}
          onPress={handleRefresh}
          activeOpacity={0.7}
        >
          <Ionicons
            name="refresh-outline"
            size={16}
            color="#2563eb"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.syncBtnText} allowFontScaling={false}>
            Sync
          </Text>
        </TouchableOpacity>
      </View>

      {/* =========================================================================
          2. WORKING PROJECT WORKFLOW ACTION SHORTCUTS
          ========================================================================= */}
      <View style={styles.shortcutsRow}>
        <TouchableOpacity
          style={[styles.shortcutPill, { backgroundColor: '#2563eb' }]}
          onPress={() => onNavigate && onNavigate('properties')}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={15} color="#ffffff" style={{ marginRight: 5 }} />
          <Text style={styles.shortcutPillText} allowFontScaling={false}>+ Property</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.shortcutPill, { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', borderColor: colors.cardBorder, borderWidth: 1 }]}
          onPress={() => onNavigate && onNavigate('leasing')}
          activeOpacity={0.8}
        >
          <Ionicons name="document-text-outline" size={14} color={colors.textPrimary} style={{ marginRight: 5 }} />
          <Text style={[styles.shortcutPillText, { color: colors.textPrimary }]} allowFontScaling={false}>+ Lease</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.shortcutPill, { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', borderColor: colors.cardBorder, borderWidth: 1 }]}
          onPress={() => onNavigate && onNavigate('tenants')}
          activeOpacity={0.8}
        >
          <Ionicons name="people-outline" size={14} color={colors.textPrimary} style={{ marginRight: 5 }} />
          <Text style={[styles.shortcutPillText, { color: colors.textPrimary }]} allowFontScaling={false}>+ Tenant</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.shortcutPill, { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', borderColor: colors.cardBorder, borderWidth: 1 }]}
          onPress={() => onNavigate && onNavigate('maintenance')}
          activeOpacity={0.8}
        >
          <Ionicons name="build-outline" size={14} color={colors.textPrimary} style={{ marginRight: 5 }} />
          <Text style={[styles.shortcutPillText, { color: colors.textPrimary }]} allowFontScaling={false}>+ Work Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.shortcutPill, { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', borderColor: colors.cardBorder, borderWidth: 1 }]}
          onPress={() => onNavigate && onNavigate('rent')}
          activeOpacity={0.8}
        >
          <Ionicons name="card-outline" size={14} color={colors.textPrimary} style={{ marginRight: 5 }} />
          <Text style={[styles.shortcutPillText, { color: colors.textPrimary }]} allowFontScaling={false}>Collect Rent</Text>
        </TouchableOpacity>
      </View>

      {/* =========================================================================
          3. ALL 10 CORE PORTFOLIO & FINANCIAL METRICS (Matching Web Dashboard)
          ========================================================================= */}
      <Text style={[styles.sectionHeading, { color: colors.textSecondary }]} allowFontScaling={false}>
        PORTFOLIO OVERVIEW & REVENUE (LIVE)
      </Text>

      <View style={styles.kpiGrid}>
        {/* KPI 1: Total Properties */}
        <TouchableOpacity
          style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
          onPress={() => setSelectedMetric('properties')}
          activeOpacity={0.7}
        >
          <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(37, 99, 235, 0.12)' }]}>
            <Ionicons name="business" size={20} color="#2563eb" />
          </View>
          <Text style={[styles.kpiValue, { color: colors.textPrimary }]} allowFontScaling={false}>
            {metrics.totalProperties}
          </Text>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]} allowFontScaling={false}>
            Total Properties
          </Text>
          <Text style={[styles.kpiSub, { color: '#2563eb' }]} allowFontScaling={false}>
            Active Assets →
          </Text>
        </TouchableOpacity>

        {/* KPI 2: Total Units */}
        <TouchableOpacity
          style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
          onPress={() => setSelectedMetric('totalUnits')}
          activeOpacity={0.7}
        >
          <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.12)' }]}>
            <Ionicons name="home" size={20} color="#6366f1" />
          </View>
          <Text style={[styles.kpiValue, { color: colors.textPrimary }]} allowFontScaling={false}>
            {metrics.totalUnits}
          </Text>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]} allowFontScaling={false}>
            Total Units
          </Text>
          <Text style={[styles.kpiSub, { color: colors.textMuted }]} allowFontScaling={false}>
            Across all assets →
          </Text>
        </TouchableOpacity>

        {/* KPI 3: Occupied Units */}
        <TouchableOpacity
          style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
          onPress={() => setSelectedMetric('occupiedUnits')}
          activeOpacity={0.7}
        >
          <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
            <Ionicons name="person-circle" size={20} color="#10b981" />
          </View>
          <Text style={[styles.kpiValue, { color: '#10b981' }]} allowFontScaling={false}>
            {metrics.occupiedUnits}
          </Text>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]} allowFontScaling={false}>
            Occupied Units
          </Text>
          <Text style={[styles.kpiSub, { color: '#10b981' }]} allowFontScaling={false}>
            Active Leases →
          </Text>
        </TouchableOpacity>

        {/* KPI 4: Vacant Units */}
        <TouchableOpacity
          style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
          onPress={() => setSelectedMetric('vacantUnits')}
          activeOpacity={0.7}
        >
          <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(244, 63, 94, 0.12)' }]}>
            <Ionicons name="alert-circle-outline" size={20} color="#f43f5e" />
          </View>
          <Text style={[styles.kpiValue, { color: '#f43f5e' }]} allowFontScaling={false}>
            {metrics.vacantUnits}
          </Text>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]} allowFontScaling={false}>
            Vacant Units
          </Text>
          <Text style={[styles.kpiSub, { color: '#f43f5e' }]} allowFontScaling={false}>
            Ready for Listing →
          </Text>
        </TouchableOpacity>

        {/* KPI 5: Occupancy Rate */}
        <TouchableOpacity
          style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
          onPress={() => setSelectedMetric('occupancyRate')}
          activeOpacity={0.7}
        >
          <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(139, 92, 246, 0.12)' }]}>
            <Ionicons name="trending-up" size={20} color="#8b5cf6" />
          </View>
          <Text style={[styles.kpiValue, { color: '#8b5cf6' }]} allowFontScaling={false}>
            {metrics.occupancyRate}%
          </Text>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]} allowFontScaling={false}>
            Occupancy Rate
          </Text>
          <Text style={[styles.kpiSub, { color: colors.textMuted }]} allowFontScaling={false}>
            {metrics.occupiedUnits} of {metrics.totalUnits} Leased
          </Text>
        </TouchableOpacity>

        {/* KPI 6: Monthly Revenue */}
        <TouchableOpacity
          style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
          onPress={() => setSelectedMetric('monthlyRevenue')}
          activeOpacity={0.7}
        >
          <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(14, 165, 233, 0.12)' }]}>
            <Ionicons name="cash" size={20} color="#0ea5e9" />
          </View>
          <Text style={[styles.kpiValue, { color: colors.textPrimary }]} allowFontScaling={false}>
            ${metrics.monthlyRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </Text>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]} allowFontScaling={false}>
            Monthly Revenue
          </Text>
          <Text style={[styles.kpiSub, { color: '#0ea5e9' }]} allowFontScaling={false}>
            Contracted Rent →
          </Text>
        </TouchableOpacity>

        {/* KPI 7: Pending Rent / Receivables */}
        <TouchableOpacity
          style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
          onPress={() => setSelectedMetric('pendingRent')}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.kpiIconBox,
              {
                backgroundColor:
                  metrics.pendingRent > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              },
            ]}
          >
            <Ionicons
              name="alert-circle"
              size={20}
              color={metrics.pendingRent > 0 ? '#ef4444' : '#10b981'}
            />
          </View>
          <Text
            style={[
              styles.kpiValue,
              { color: metrics.pendingRent > 0 ? '#ef4444' : colors.textPrimary },
            ]}
            allowFontScaling={false}
          >
            ${metrics.pendingRent.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </Text>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]} allowFontScaling={false}>
            Pending Rent
          </Text>
          <Text style={[styles.kpiSub, { color: metrics.pendingRent > 0 ? '#ef4444' : '#10b981' }]} allowFontScaling={false}>
            {metrics.pendingRent > 0 ? 'Uncollected Balance' : 'All Clear ✓'}
          </Text>
        </TouchableOpacity>

        {/* KPI 8: Expenses */}
        <TouchableOpacity
          style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
          onPress={() => setSelectedMetric('expenses')}
          activeOpacity={0.7}
        >
          <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(244, 63, 94, 0.12)' }]}>
            <Ionicons name="card" size={20} color="#f43f5e" />
          </View>
          <Text style={[styles.kpiValue, { color: colors.textPrimary }]} allowFontScaling={false}>
            ${metrics.expenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </Text>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]} allowFontScaling={false}>
            Expenses
          </Text>
          <Text style={[styles.kpiSub, { color: '#f43f5e' }]} allowFontScaling={false}>
            Invoices Paid →
          </Text>
        </TouchableOpacity>

        {/* KPI 9: Open Maintenance */}
        <TouchableOpacity
          style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
          onPress={() => setSelectedMetric('openMaintenance')}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.kpiIconBox,
              {
                backgroundColor:
                  metrics.openMaintenance > 0 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              },
            ]}
          >
            <Ionicons
              name="construct"
              size={20}
              color={metrics.openMaintenance > 0 ? '#f59e0b' : '#10b981'}
            />
          </View>
          <Text style={[styles.kpiValue, { color: colors.textPrimary }]} allowFontScaling={false}>
            {metrics.openMaintenance}
          </Text>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]} allowFontScaling={false}>
            Work Orders
          </Text>
          <Text style={[styles.kpiSub, { color: metrics.openMaintenance > 0 ? '#f59e0b' : '#10b981' }]} allowFontScaling={false}>
            {metrics.openMaintenance > 0 ? 'Active Repairs →' : 'No Open Tasks ✓'}
          </Text>
        </TouchableOpacity>

        {/* KPI 10: Leases Expiring Soon */}
        <TouchableOpacity
          style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
          onPress={() => setSelectedMetric('leasesExpiringSoon')}
          activeOpacity={0.7}
        >
          <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(249, 115, 22, 0.12)' }]}>
            <Ionicons name="calendar" size={20} color="#f97316" />
          </View>
          <Text style={[styles.kpiValue, { color: colors.textPrimary }]} allowFontScaling={false}>
            {metrics.leasesExpiringSoon}
          </Text>
          <Text style={[styles.kpiLabel, { color: colors.textSecondary }]} allowFontScaling={false}>
            Expiring Leases
          </Text>
          <Text style={[styles.kpiSub, { color: '#f97316' }]} allowFontScaling={false}>
            Next 30-60 Days →
          </Text>
        </TouchableOpacity>
      </View>

      {/* =========================================================================
          4. FINANCIAL PERFORMANCE CHART (Income vs Operating Expenses)
          ========================================================================= */}
      {chartData.length > 0 && (
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]} allowFontScaling={false}>
                Income vs Expenses
              </Text>
              <Text style={[styles.cardSub, { color: colors.textSecondary }]} allowFontScaling={false}>
                Monthly cashflow comparison
              </Text>
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]} allowFontScaling={false}>Income</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                <Text style={[styles.legendText, { color: colors.textSecondary }]} allowFontScaling={false}>Expenses</Text>
              </View>
            </View>
          </View>

          <View style={styles.chartBody}>
            <View style={styles.barsContainer}>
              {chartData.map((d, index) => {
                const maxBarH = 100;
                const incH = Math.min(maxBarH, Math.max(6, ((d.income || 0) / maxChartVal) * maxBarH));
                const expH = Math.min(maxBarH, Math.max(6, ((d.expenses || 0) / maxChartVal) * maxBarH));

                return (
                  <View key={`chart-col-${index}`} style={styles.chartColumn}>
                    <View style={styles.barsPair}>
                      <View style={[styles.chartBar, { height: incH, backgroundColor: '#10b981' }]} />
                      <View style={[styles.chartBar, { height: expH, backgroundColor: '#ef4444' }]} />
                    </View>
                    <Text style={[styles.monthLabel, { color: colors.textSecondary }]} allowFontScaling={false}>
                      {d.month}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}

      {/* =========================================================================
          5. REAL OCCUPANCY & LEASING STATUS CARD
          ========================================================================= */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]} allowFontScaling={false}>
              Unit Occupancy Status
            </Text>
            <Text style={[styles.cardSub, { color: colors.textSecondary }]} allowFontScaling={false}>
              Portfolio leasing breakdown
            </Text>
          </View>
          <View style={[styles.badgePill, { backgroundColor: 'rgba(37, 99, 235, 0.12)' }]}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#2563eb' }} allowFontScaling={false}>
              {metrics.totalUnits} Total Units
            </Text>
          </View>
        </View>

        {totalUnits === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="home-outline" size={40} color={colors.textMuted} style={{ marginBottom: 8 }} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]} allowFontScaling={false}>
              No Units Recorded
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]} allowFontScaling={false}>
              Get started by adding your first property and rental units.
            </Text>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onNavigate && onNavigate('properties')}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText} allowFontScaling={false}>+ Add Property</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.occupancyContent}>
            {/* Real Visual Progress Bar */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFillOccupied,
                  { width: `${Math.min(100, Math.max(0, occupancyPct))}%` },
                ]}
              />
              <View
                style={[
                  styles.progressFillVacant,
                  { width: `${Math.min(100, Math.max(0, vacancyPct))}%` },
                ]}
              />
            </View>

            {/* Real Breakdown Tiles */}
            <View style={styles.occupancyStatsRow}>
              <TouchableOpacity
                style={styles.occupancyStatItem}
                onPress={() => setSelectedMetric('occupiedUnits')}
                activeOpacity={0.7}
              >
                <View style={[styles.statDot, { backgroundColor: '#10b981' }]} />
                <View>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]} allowFontScaling={false}>
                    Occupied Units
                  </Text>
                  <Text style={[styles.statVal, { color: colors.textPrimary }]} allowFontScaling={false}>
                    {occupiedUnits} <Text style={styles.statPct}>({occupancyPct}%)</Text>
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.occupancyStatItem}
                onPress={() => setSelectedMetric('vacantUnits')}
                activeOpacity={0.7}
              >
                <View style={[styles.statDot, { backgroundColor: '#f43f5e' }]} />
                <View>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]} allowFontScaling={false}>
                    Vacant Units
                  </Text>
                  <Text style={[styles.statVal, { color: colors.textPrimary }]} allowFontScaling={false}>
                    {vacantUnits} <Text style={styles.statPct}>({vacancyPct}%)</Text>
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.cardFooterLink, { borderTopColor: colors.cardBorder }]}
              onPress={() => onNavigate && onNavigate('properties')}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLinkText} allowFontScaling={false}>
                View All Property Units & Vacancies →
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* =========================================================================
          6. LEASES WITH OUTSTANDING BALANCES (Real Invoices)
          ========================================================================= */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]} allowFontScaling={false}>
              Outstanding Rent Balances
            </Text>
            <Text style={[styles.cardSub, { color: colors.textSecondary }]} allowFontScaling={false}>
              Unpaid invoices requiring collection
            </Text>
          </View>
          <View
            style={[
              styles.badgePill,
              {
                backgroundColor:
                  outstandingInvoices.length > 0
                    ? 'rgba(239, 68, 68, 0.12)'
                    : 'rgba(16, 185, 129, 0.12)',
              },
            ]}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '800',
                color: outstandingInvoices.length > 0 ? '#ef4444' : '#10b981',
              }}
              allowFontScaling={false}
            >
              {outstandingInvoices.length} Unpaid
            </Text>
          </View>
        </View>

        {outstandingInvoices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={40} color="#10b981" style={{ marginBottom: 8 }} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]} allowFontScaling={false}>
              All Accounts Current
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]} allowFontScaling={false}>
              There are no overdue or unpaid rent balances in your portfolio!
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {outstandingInvoices.map((inv, idx) => {
              const bal = Number(inv.balance !== undefined ? inv.balance : inv.amount || 0);
              const tenantName =
                inv.tenantName ||
                (inv.tenant ? `${inv.tenant.firstName || ''} ${inv.tenant.lastName || ''}`.trim() : null) ||
                'Tenant';
              const propertyInfo =
                inv.propertyName ||
                inv.property?.name ||
                (inv.unit ? `Unit ${inv.unit.unitNumber}` : 'Rental Unit');

              return (
                <TouchableOpacity
                  key={`inv-${inv.id || idx}`}
                  style={[
                    styles.listItemRow,
                    {
                      borderBottomColor: colors.cardBorder,
                      borderBottomWidth: idx < outstandingInvoices.length - 1 ? StyleSheet.hairlineWidth : 0,
                    },
                  ]}
                  onPress={() => onNavigate && onNavigate('rent')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.listIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                    <Ionicons name="alert-circle" size={18} color="#ef4444" />
                  </View>

                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={[styles.listPrimaryText, { color: colors.textPrimary }]} numberOfLines={1} allowFontScaling={false}>
                      {tenantName}
                    </Text>
                    <Text style={[styles.listSecondaryText, { color: colors.textSecondary }]} numberOfLines={1} allowFontScaling={false}>
                      {propertyInfo}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.dueAmountText} allowFontScaling={false}>
                      ${bal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                    <Text style={styles.dueBadgeText} allowFontScaling={false}>Overdue</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[styles.cardFooterLink, { borderTopColor: colors.cardBorder }]}
              onPress={() => onNavigate && onNavigate('rent')}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLinkText} allowFontScaling={false}>
                Open Rent Ledger & Send Reminders →
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* =========================================================================
          7. ACTIVE MAINTENANCE & REPAIRS (Real Work Orders)
          ========================================================================= */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]} allowFontScaling={false}>
              Maintenance & Work Orders
            </Text>
            <Text style={[styles.cardSub, { color: colors.textSecondary }]} allowFontScaling={false}>
              Current service requests from residents
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.badgePill, { backgroundColor: 'rgba(37, 99, 235, 0.12)' }]}
            onPress={() => onNavigate && onNavigate('maintenance')}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#2563eb' }} allowFontScaling={false}>
              {recentWorkOrders.length} Orders
            </Text>
          </TouchableOpacity>
        </View>

        {recentWorkOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="construct-outline" size={40} color={colors.textMuted} style={{ marginBottom: 8 }} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]} allowFontScaling={false}>
              No Active Service Requests
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]} allowFontScaling={false}>
              All maintenance orders have been addressed and resolved.
            </Text>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onNavigate && onNavigate('maintenance')}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText} allowFontScaling={false}>+ Create Work Order</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {recentWorkOrders.map((wo, idx) => {
              const statusStr = String(wo.status || 'Open');
              const isResolved = statusStr.toLowerCase().includes('comp') || statusStr.toLowerCase().includes('resolv');

              return (
                <TouchableOpacity
                  key={`wo-${wo.id || idx}`}
                  style={[
                    styles.listItemRow,
                    {
                      borderBottomColor: colors.cardBorder,
                      borderBottomWidth: idx < recentWorkOrders.length - 1 ? StyleSheet.hairlineWidth : 0,
                    },
                  ]}
                  onPress={() => onNavigate && onNavigate('maintenance')}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.listIconBox,
                      {
                        backgroundColor: isResolved
                          ? 'rgba(16, 185, 129, 0.12)'
                          : 'rgba(245, 158, 11, 0.12)',
                      },
                    ]}
                  >
                    <Ionicons
                      name="hammer"
                      size={18}
                      color={isResolved ? '#10b981' : '#f59e0b'}
                    />
                  </View>

                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={[styles.listPrimaryText, { color: colors.textPrimary }]} numberOfLines={1} allowFontScaling={false}>
                      {wo.title || wo.description || 'Maintenance Request'}
                    </Text>
                    <Text style={[styles.listSecondaryText, { color: colors.textSecondary }]} numberOfLines={1} allowFontScaling={false}>
                      {wo.propertyName || wo.property?.name || 'Property'} · {wo.unitNumber || (wo.unit ? `Unit ${wo.unit.unitNumber}` : 'General')}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isResolved
                          ? 'rgba(16, 185, 129, 0.15)'
                          : 'rgba(245, 158, 11, 0.15)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: isResolved ? '#10b981' : '#f59e0b' },
                      ]}
                      allowFontScaling={false}
                    >
                      {statusStr}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[styles.cardFooterLink, { borderTopColor: colors.cardBorder }]}
              onPress={() => onNavigate && onNavigate('maintenance')}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLinkText} allowFontScaling={false}>
                View All Work Orders & Vendors →
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* =========================================================================
          8. LEASES EXPIRING SOON (Real Lease Expirations)
          ========================================================================= */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]} allowFontScaling={false}>
              Leases Expiring Soon (30-60 Days)
            </Text>
            <Text style={[styles.cardSub, { color: colors.textSecondary }]} allowFontScaling={false}>
              Active contracts nearing expiration
            </Text>
          </View>
          <View style={[styles.badgePill, { backgroundColor: 'rgba(249, 115, 22, 0.12)' }]}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#f97316' }} allowFontScaling={false}>
              {metrics.leasesExpiringSoon} Leases
            </Text>
          </View>
        </View>

        {upcomingLeases.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={40} color={colors.textMuted} style={{ marginBottom: 8 }} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]} allowFontScaling={false}>
              No Leases Expiring Soon
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]} allowFontScaling={false}>
              All tenant contracts are active and safe for the next 60 days.
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {upcomingLeases.map((l, idx) => (
              <TouchableOpacity
                key={`lease-${l.id || idx}`}
                style={[
                  styles.listItemRow,
                  {
                    borderBottomColor: colors.cardBorder,
                    borderBottomWidth: idx < upcomingLeases.length - 1 ? StyleSheet.hairlineWidth : 0,
                  },
                ]}
                onPress={() => onNavigate && onNavigate('leasing')}
                activeOpacity={0.7}
              >
                <View style={[styles.listIconBox, { backgroundColor: 'rgba(249, 115, 22, 0.12)' }]}>
                  <Ionicons name="calendar" size={18} color="#f97316" />
                </View>

                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.listPrimaryText, { color: colors.textPrimary }]} numberOfLines={1} allowFontScaling={false}>
                    {l.tenant?.firstName || l.tenantName || 'Tenant'} {l.tenant?.lastName || ''}
                  </Text>
                  <Text style={[styles.listSecondaryText, { color: colors.textSecondary }]} numberOfLines={1} allowFontScaling={false}>
                    {l.property?.name || l.propertyName || 'Property'} · Unit {l.unit?.unitNumber || l.unitNumber || '1'}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.dueAmountText, { color: '#f97316' }]} allowFontScaling={false}>
                    {l.endDate ? l.endDate.split('T')[0] : 'Expiring'}
                  </Text>
                  <Text style={styles.dueBadgeText} allowFontScaling={false}>Review Renewal</Text>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.cardFooterLink, { borderTopColor: colors.cardBorder }]}
              onPress={() => onNavigate && onNavigate('leasing')}
              activeOpacity={0.7}
            >
              <Text style={styles.footerLinkText} allowFontScaling={false}>
                Manage Lease Renewals & Documents →
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* =========================================================================
          9. METRIC DETAILS MODAL (Interactive drill-down with live data & search)
          ========================================================================= */}
      <Modal
        visible={selectedMetric !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setSelectedMetric(null);
          setModalSearch('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]} allowFontScaling={false}>
                  {modalMeta.name}
                </Text>
                <Text style={[styles.modalSubtitle, { color: '#2563eb' }]} allowFontScaling={false}>
                  {modalMeta.count}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => {
                  setSelectedMetric(null);
                  setModalSearch('');
                }}
              >
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Modal Search Bar */}
            <View style={[styles.searchBox, { backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', borderColor: colors.cardBorder }]}>
              <Ionicons name="search" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search items..."
                placeholderTextColor={colors.textMuted}
                value={modalSearch}
                onChangeText={setModalSearch}
                autoCapitalize="none"
              />
              {modalSearch.length > 0 && (
                <TouchableOpacity onPress={() => setModalSearch('')}>
                  <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Modal Items List */}
            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={true}>
              {modalItems.length === 0 ? (
                <View style={{ padding: 32, alignItems: 'center' }}>
                  <Ionicons name="folder-open-outline" size={36} color={colors.textMuted} style={{ marginBottom: 8 }} />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 }} allowFontScaling={false}>
                    No Records Found
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center' }} allowFontScaling={false}>
                    {modalSearch ? 'No items match your search filter.' : 'There are currently no items recorded for this metric.'}
                  </Text>
                </View>
              ) : (
                modalItems.map((item, idx) => (
                  <TouchableOpacity
                    key={`modal-item-${item.id || idx}`}
                    style={[
                      styles.modalItemRow,
                      {
                        borderBottomColor: colors.cardBorder,
                        borderBottomWidth: idx < modalItems.length - 1 ? StyleSheet.hairlineWidth : 0,
                      },
                    ]}
                    onPress={() => {
                      setSelectedMetric(null);
                      setModalSearch('');
                      if (onNavigate && item.targetScreen) {
                        onNavigate(item.targetScreen);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={[styles.modalItemTitle, { color: colors.textPrimary }]} numberOfLines={1} allowFontScaling={false}>
                        {item.title}
                      </Text>
                      <Text style={[styles.modalItemSub, { color: colors.textSecondary }]} numberOfLines={1} allowFontScaling={false}>
                        {item.subtitle}
                      </Text>
                    </View>
                    <View style={[styles.modalBadge, { backgroundColor: `${item.badgeColor}18` }]}>
                      <Text style={[styles.modalBadgeText, { color: item.badgeColor }]} allowFontScaling={false}>
                        {item.badge}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            {/* Modal Bottom CTA */}
            <TouchableOpacity
              style={styles.modalCtaBtn}
              onPress={() => {
                const target = modalMeta.dest;
                setSelectedMetric(null);
                setModalSearch('');
                if (onNavigate) {
                  onNavigate(target);
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCtaText} allowFontScaling={false}>
                {modalMeta.destLabel} →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const getStyles = (colors, isDarkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 48,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      fontWeight: '600',
    },

    // Header Row
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    headerGreeting: {
      fontSize: 12.5,
      fontWeight: '600',
      marginBottom: 2,
    },
    headerTitle: {
      fontSize: 19,
      fontWeight: '800',
      letterSpacing: -0.4,
    },
    syncBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 10,
      borderWidth: 1,
    },
    syncBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#2563eb',
    },

    // Shortcuts Row
    shortcutsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 20,
    },
    shortcutPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
    },
    shortcutPillText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#ffffff',
    },

    // Section Heading
    sectionHeading: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: 10,
      marginLeft: 2,
    },

    // KPI Grid (2 Columns)
    kpiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 20,
    },
    kpiCard: {
      width: (width - 44) / 2,
      borderRadius: 16,
      borderWidth: 1,
      padding: 14,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDarkMode ? 0.3 : 0.04,
      shadowRadius: 4,
    },
    kpiIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    kpiValue: {
      fontSize: 20,
      fontWeight: '800',
      letterSpacing: -0.4,
      marginBottom: 2,
    },
    kpiLabel: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 4,
    },
    kpiSub: {
      fontSize: 11,
      fontWeight: '700',
    },

    // Section Cards
    sectionCard: {
      borderRadius: 16,
      borderWidth: 1,
      marginBottom: 16,
      overflow: 'hidden',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.05,
      shadowRadius: 6,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(148, 163, 184, 0.1)',
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: -0.2,
    },
    cardSub: {
      fontSize: 11.5,
      fontWeight: '500',
      marginTop: 2,
    },
    badgePill: {
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 12,
    },

    // Chart Components
    chartLegend: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendText: {
      fontSize: 11,
      fontWeight: '700',
    },
    chartBody: {
      padding: 16,
    },
    barsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: 120,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(148, 163, 184, 0.15)',
    },
    chartColumn: {
      alignItems: 'center',
      flex: 1,
    },
    barsPair: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 4,
      height: 100,
    },
    chartBar: {
      width: 10,
      borderRadius: 3,
    },
    monthLabel: {
      fontSize: 10,
      fontWeight: '700',
      marginTop: 6,
    },

    // Occupancy Progress & Breakdown
    occupancyContent: {
      padding: 16,
    },
    progressTrack: {
      height: 12,
      borderRadius: 6,
      backgroundColor: isDarkMode ? '#334155' : '#e2e8f0',
      flexDirection: 'row',
      overflow: 'hidden',
      marginBottom: 14,
    },
    progressFillOccupied: {
      height: '100%',
      backgroundColor: '#10b981',
    },
    progressFillVacant: {
      height: '100%',
      backgroundColor: '#f43f5e',
    },
    occupancyStatsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 14,
    },
    occupancyStatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 4,
    },
    statDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    statLabel: {
      fontSize: 11.5,
      fontWeight: '600',
    },
    statVal: {
      fontSize: 14,
      fontWeight: '800',
    },
    statPct: {
      fontSize: 11.5,
      fontWeight: '600',
      color: '#64748b',
    },

    // Lists
    listContainer: {
      paddingHorizontal: 16,
      paddingBottom: 6,
    },
    listItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
    },
    listIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    listPrimaryText: {
      fontSize: 13.5,
      fontWeight: '700',
      marginBottom: 2,
    },
    listSecondaryText: {
      fontSize: 11.5,
      fontWeight: '500',
    },
    dueAmountText: {
      fontSize: 14,
      fontWeight: '800',
      color: '#ef4444',
      marginBottom: 2,
    },
    dueBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#ef4444',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    statusBadgeText: {
      fontSize: 11,
      fontWeight: '800',
    },

    // Card Footer Links
    cardFooterLink: {
      borderTopWidth: 1,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 4,
    },
    footerLinkText: {
      fontSize: 12.5,
      fontWeight: '700',
      color: '#2563eb',
    },

    // Empty States
    emptyContainer: {
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 4,
      textAlign: 'center',
    },
    emptySub: {
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
      maxWidth: 280,
      marginBottom: 14,
    },
    actionBtn: {
      backgroundColor: '#2563eb',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    actionBtnText: {
      fontSize: 12.5,
      fontWeight: '700',
      color: '#ffffff',
    },

    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 18,
      paddingHorizontal: 18,
      paddingBottom: 32,
      maxHeight: '85%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: '800',
    },
    modalSubtitle: {
      fontSize: 12,
      fontWeight: '700',
      marginTop: 2,
    },
    modalCloseBtn: {
      padding: 6,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 13,
      padding: 0,
    },
    modalItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    modalItemTitle: {
      fontSize: 13.5,
      fontWeight: '700',
      marginBottom: 2,
    },
    modalItemSub: {
      fontSize: 11.5,
    },
    modalBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    modalBadgeText: {
      fontSize: 11,
      fontWeight: '800',
    },
    modalCtaBtn: {
      backgroundColor: '#2563eb',
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 16,
    },
    modalCtaText: {
      fontSize: 13.5,
      fontWeight: '800',
      color: '#ffffff',
    },
  });

export default ManagerDashboard;
