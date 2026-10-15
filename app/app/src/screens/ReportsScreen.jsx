import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Animated,
  Easing,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import apiClient from '../api/client';
import { useAuthStore } from '../store/useStore';
import { useThemeColors } from '../theme';
import { Ionicons } from '@expo/vector-icons';

// Animated Touchable Component
const AnimatedTouchable = ({ children, onPress, style, disabled }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export const ReportsScreen = () => {
  const logout = useAuthStore((state) => state.logout);
  const refreshAccessToken = useAuthStore((state) => state.refreshAccessToken);
  const { colors, isDarkMode } = useThemeColors();
  const styles = getStyles(colors, isDarkMode);

  // Navigation states
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDesc, setReportDesc] = useState('');

  // Data lists states
  const [reportData, setReportData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Selected item for Detailed Modal view
  const [viewingItem, setViewingItem] = useState(null);

  // Dropdown options lists
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [tenants, setTenants] = useState([]);

  // Active filters states
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter Modal state
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [expandedFilterSection, setExpandedFilterSection] = useState(null); // 'property' | 'unit' | 'tenant' | 'status' | 'method' | 'priority' | null

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const runEntryAnimation = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(15);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const spinReloadButton = () => {
    rotateAnim.setValue(0);
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  const spinInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // 6 Core Operational & Financial Reports matching Web Frontend 1-to-1
  const reportsList = [
    {
      id: 'rent-roll',
      title: 'Rent Roll Report',
      desc: 'Detailed breakdown of active rents, security deposits, and unit vacancy status across properties.',
      icon: 'business-outline',
      color: '#38bdf8',
      endpoint: '/reports/rent-roll',
    },
    {
      id: 'occupancy',
      title: 'Occupancy Report',
      desc: 'Understand units performance, vacancies, and visual occupancy ratios across all buildings.',
      icon: 'pie-chart-outline',
      color: '#10b981',
      endpoint: '/reports/occupancy',
    },
    {
      id: 'delinquency',
      title: 'Delinquency Report',
      desc: 'Identifies overdue balances, late days, outstanding values, and tenant contacts info.',
      icon: 'alert-circle-outline',
      color: '#ef4444',
      endpoint: '/reports/delinquency',
    },
    {
      id: 'profit-loss',
      title: 'Profit & Loss Statement',
      desc: 'Attributed general ledger financial statement detailing rental income, expenses, and net profit.',
      icon: 'trending-up-outline',
      color: '#a855f7',
      endpoint: '/reports/profit-loss',
    },
    {
      id: 'maintenance',
      title: 'Maintenance Log Report',
      desc: 'Track maintenance requests, assigned vendors, technicians, completion rates, and actual costs.',
      icon: 'hammer-outline',
      color: '#f59e0b',
      endpoint: '/reports/maintenance',
    },
    {
      id: 'payment-history',
      title: 'Payment History Report',
      desc: 'Audit completed transactions, reference check numbers, payment methods, and statuses.',
      icon: 'card-outline',
      color: '#06b6d4',
      endpoint: '/reports/payment-history',
    },
  ];

  // Fetch dropdown collections once on mount
  useEffect(() => {
    let active = true;
    const fetchFilterOptions = async () => {
      try {
        const [propsRes, unitsRes, tenantsRes] = await Promise.all([
          apiClient.get('/properties', logout, refreshAccessToken).catch(() => null),
          apiClient.get('/units', logout, refreshAccessToken).catch(() => null),
          apiClient.get('/tenants', logout, refreshAccessToken).catch(() => null),
        ]);
        if (active) {
          if (propsRes?.data || propsRes) setProperties(propsRes?.data || propsRes || []);
          if (unitsRes?.data || unitsRes) setUnits(unitsRes?.data || unitsRes || []);
          if (tenantsRes?.data || tenantsRes) setTenants(tenantsRes?.data || tenantsRes || []);
        }
      } catch (e) {
        console.log('Failed fetching filter choices:', e?.message || e);
      }
    };
    fetchFilterOptions();
    return () => {
      active = false;
    };
  }, []);

  // Main reports compiler calling EXACT same APIs as web frontend
  const fetchReportData = async (showLoadingIndicator = true, queryOverride = null) => {
    if (!selectedReportId) return;

    try {
      if (showLoadingIndicator && reportData.length === 0) setLoading(true);
      spinReloadButton();

      // Build query string matching web reportApi.ts buildQuery()
      const params = new URLSearchParams();
      if (selectedPropertyId) params.append('propertyId', selectedPropertyId);
      if (selectedUnitId) params.append('unitId', selectedUnitId);
      if (selectedTenantId) params.append('tenantId', selectedTenantId);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedPaymentMethod) params.append('paymentMethod', selectedPaymentMethod);
      if (selectedPriority) params.append('priority', selectedPriority);

      const q = queryOverride !== null ? queryOverride : searchQuery;
      if (q) params.append('search', q);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const endpoint = `/reports/${selectedReportId}?${params.toString()}`;
      const res = await apiClient.get(endpoint, logout, refreshAccessToken);

      if (!isMountedRef.current) return;

      if (selectedReportId === 'profit-loss') {
        const payload = res?.data || res || {};
        const plSummary =
          payload.summary || payload.data?.summary || { totalIncome: 0, totalExpenses: 0, netProfit: 0 };
        setSummaryData(plSummary);

        const incomes = (payload.income || payload.data?.income || []).map((i) => ({ ...i, type: 'Income' }));
        const expenses = (payload.expenses || payload.data?.expenses || []).map((e) => ({
          ...e,
          type: 'Expense',
        }));
        setReportData([...incomes, ...expenses]);
      } else {
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        const summary = res?.summary || null;
        setSummaryData(summary);
        setReportData(list);
      }
    } catch (error) {
      console.log(`Failed loading report ${selectedReportId}:`, error?.message || error);
      if (isMountedRef.current) {
        Alert.alert('Report Notice', `Could not fetch ${reportTitle}. Please verify connection.`);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  // Re-fetch report when core parameters change
  useEffect(() => {
    if (selectedReportId) {
      fetchReportData(true);
    }
  }, [
    selectedReportId,
    selectedPropertyId,
    selectedUnitId,
    selectedTenantId,
    selectedStatus,
    selectedPaymentMethod,
    selectedPriority,
    startDate,
    endDate,
  ]);

  const handleSelectReport = (rep) => {
    setReportTitle(rep.title);
    setReportDesc(rep.desc);
    setSelectedPropertyId('');
    setSelectedUnitId('');
    setSelectedTenantId('');
    setSelectedStatus('');
    setSelectedPaymentMethod('');
    setSelectedPriority('');
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setReportData([]);
    setSummaryData(null);
    setViewingItem(null);
    setSelectedReportId(rep.id);
    runEntryAnimation();
  };

  const handleBack = () => {
    setSelectedReportId(null);
    setReportTitle('');
    setReportData([]);
    setSummaryData(null);
    setViewingItem(null);
    setExpandedFilterSection(null);
    runEntryAnimation();
  };

  const resetFilters = () => {
    setSelectedPropertyId('');
    setSelectedUnitId('');
    setSelectedTenantId('');
    setSelectedStatus('');
    setSelectedPaymentMethod('');
    setSelectedPriority('');
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setExpandedFilterSection(null);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReportData(false);
  };

  // Get active filter count
  const activeFilterCount = [
    selectedPropertyId,
    selectedUnitId,
    selectedTenantId,
    selectedStatus,
    selectedPaymentMethod,
    selectedPriority,
    startDate,
    endDate,
  ].filter(Boolean).length;

  // Real-time client-side search filtering across ALL record fields
  const filteredData = reportData.filter((item) => {
    if (!item) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    return Object.values(item).some((val) => {
      if (val === null || val === undefined) return false;
      if (typeof val === 'object') {
        return Object.values(val).some((nestedVal) =>
          String(nestedVal).toLowerCase().includes(q)
        );
      }
      return String(val).toLowerCase().includes(q);
    });
  });

  // Status and filter choice generators
  const getStatusChoices = () => {
    if (selectedReportId === 'rent-roll') {
      return [
        { label: 'All Statuses', value: '' },
        { label: 'Active', value: 'Active' },
        { label: 'Draft', value: 'Draft' },
        { label: 'Pending Move In', value: 'Pending_Move_In' },
        { label: 'Terminated', value: 'Terminated' },
      ];
    }
    if (selectedReportId === 'delinquency') {
      return [
        { label: 'All Statuses', value: '' },
        { label: 'Overdue', value: 'Overdue' },
        { label: 'Paid', value: 'Paid' },
        { label: 'Partially Paid', value: 'Partial' },
      ];
    }
    if (selectedReportId === 'maintenance') {
      return [
        { label: 'All Statuses', value: '' },
        { label: 'Open', value: 'Open' },
        { label: 'In Progress', value: 'InProgress' },
        { label: 'Completed', value: 'Completed' },
        { label: 'Closed', value: 'Closed' },
      ];
    }
    return [
      { label: 'All Statuses', value: '' },
      { label: 'Paid', value: 'Paid' },
      { label: 'Unpaid', value: 'Unpaid' },
      { label: 'Pending', value: 'Pending' },
    ];
  };

  return (
    <View style={styles.mainWrapper}>
      {/* 1. REPORT MAIN DIRECTORY VIEW */}
      {selectedReportId === null ? (
        <>
          {/* Fixed Header */}
          <View style={[styles.fixedHeader, { paddingTop: Platform.OS === 'ios' ? 48 : 16 }]}>
            <Text style={styles.title} allowFontScaling={false}>Operational & Financial Reports</Text>
            <Text style={styles.subtitle} allowFontScaling={false}>
              Audit portfolio metrics, vacancies, delinquencies, profit losses statements, and cash flows.
            </Text>
          </View>

          {/* Scrollable list of Report Cards */}
          <ScrollView
            style={styles.container}
            contentContainerStyle={[styles.scrollContent, { paddingTop: 10 }]}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              {reportsList.map((rep) => (
                <AnimatedTouchable
                  key={rep.id}
                  style={styles.repCard}
                  onPress={() => handleSelectReport(rep)}
                >
                  <View style={[styles.cardIconBox, { backgroundColor: `${rep.color}15` }]}>
                    <Ionicons name={rep.icon} size={24} color={rep.color} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} allowFontScaling={false}>{rep.title}</Text>
                    <Text style={styles.cardDesc} allowFontScaling={false}>{rep.desc}</Text>
                  </View>
                  <Ionicons name="chevron-forward-outline" size={18} color="#64748b" />
                </AnimatedTouchable>
              ))}
            </Animated.View>
          </ScrollView>
        </>
      ) : (
        // 2. DETAILED REPORT VIEWER VIEW
        <>
          {/* Header with back action, title, search and filters toggle */}
          <View style={[styles.fixedHeader, { paddingTop: Platform.OS === 'ios' ? 48 : 16 }]}>
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
              <Ionicons name="arrow-back-outline" size={16} color="#38bdf8" style={{ marginRight: 6 }} />
              <Text style={styles.backBtnText} allowFontScaling={false}>Back to Reports</Text>
            </TouchableOpacity>

            <View style={styles.headerTitleRow}>
              <Text style={styles.title} numberOfLines={1} allowFontScaling={false}>
                {reportTitle}
              </Text>
            </View>

            {/* Quick Actions Row: Search, Reload, Filters */}
            <View style={[styles.searchBarRow, { marginTop: 10 }]}>
              {/* Realtime Search Bar */}
              <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={16} color="#64748b" style={{ marginRight: 6 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search records by name, unit, amount..."
                  placeholderTextColor="#64748b"
                  value={searchQuery}
                  onChangeText={(text) => setSearchQuery(text)}
                  returnKeyType="search"
                  onSubmitEditing={() => fetchReportData(true)}
                  clearButtonMode="while-editing"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={16} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Dedicated Reload Button */}
              <TouchableOpacity
                style={styles.reloadBtn}
                onPress={() => fetchReportData(true)}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Animated.View style={{ transform: [{ rotate: spinInterpolation }] }}>
                  <Ionicons name="refresh-outline" size={17} color={loading ? '#38bdf8' : '#cbd5e1'} />
                </Animated.View>
              </TouchableOpacity>

              {/* Filters Toggle Button with Active Count Badge */}
              <TouchableOpacity
                style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
                onPress={() => setFilterModalOpen(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="funnel-outline"
                  size={14}
                  color={activeFilterCount > 0 ? '#ffffff' : '#0f172a'}
                />
                <Text
                  style={[styles.filterBtnText, activeFilterCount > 0 && { color: '#ffffff' }]}
                  allowFontScaling={false}
                >
                  {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
                </Text>
              </TouchableOpacity>

              {/* Reset Filters Icon if any filter active */}
              {activeFilterCount > 0 && (
                <TouchableOpacity
                  style={styles.clearFilterBtn}
                  onPress={resetFilters}
                  activeOpacity={0.7}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons name="close" size={15} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Report Content Container */}
          <ScrollView
            style={styles.container}
            contentContainerStyle={[styles.scrollContent, { paddingTop: 12 }]}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#38bdf8" />}
          >
            {loading && reportData.length === 0 ? (
              <View style={styles.centerLoading}>
                <ActivityIndicator size="large" color="#38bdf8" />
                <Text style={styles.loadingText} allowFontScaling={false}>Loading report data...</Text>
              </View>
            ) : (
              <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                {/* --- 1. RENT ROLL REPORT SUMMARY CARDS --- */}
                {selectedReportId === 'rent-roll' && summaryData && (
                  <View style={styles.kpiGrid}>
                    <View style={[styles.kpiCard, { borderLeftColor: '#38bdf8' }]}>
                      <Text style={styles.kpiLabel} allowFontScaling={false}>TOTAL MONTHLY RENT</Text>
                      <Text style={[styles.kpiValue, { color: '#38bdf8' }]} allowFontScaling={false}>
                        ${Number(summaryData.totalMonthlyRent || 0).toLocaleString()}
                      </Text>
                    </View>
                    <View style={[styles.kpiCard, { borderLeftColor: '#10b981' }]}>
                      <Text style={styles.kpiLabel} allowFontScaling={false}>SECURITY DEPOSITS</Text>
                      <Text style={[styles.kpiValue, { color: '#10b981' }]} allowFontScaling={false}>
                        ${Number(summaryData.totalSecurityDeposits || 0).toLocaleString()}
                      </Text>
                    </View>
                    <View style={[styles.kpiCard, { borderLeftColor: '#a855f7' }]}>
                      <Text style={styles.kpiLabel} allowFontScaling={false}>OCCUPIED UNITS</Text>
                      <Text style={[styles.kpiValue, { color: '#a855f7' }]} allowFontScaling={false}>
                        {summaryData.occupiedCount} / {summaryData.totalUnits}
                      </Text>
                    </View>
                    <View style={[styles.kpiCard, { borderLeftColor: '#f59e0b' }]}>
                      <Text style={styles.kpiLabel} allowFontScaling={false}>VACANT UNITS</Text>
                      <Text style={[styles.kpiValue, { color: '#f59e0b' }]} allowFontScaling={false}>
                        {summaryData.vacantCount}
                      </Text>
                    </View>
                  </View>
                )}

                {/* --- 2. OCCUPANCY REPORT SUMMARY CARDS --- */}
                {selectedReportId === 'occupancy' && summaryData && (
                  <View style={styles.kpiGrid}>
                    <View style={[styles.kpiCard, { borderLeftColor: '#10b981' }]}>
                      <Text style={styles.kpiLabel} allowFontScaling={false}>OVERALL OCCUPANCY</Text>
                      <Text style={[styles.kpiValue, { color: '#10b981' }]} allowFontScaling={false}>
                        {summaryData.overallOccupancyPercentage}%
                      </Text>
                    </View>
                    <View style={[styles.kpiCard, { borderLeftColor: '#38bdf8' }]}>
                      <Text style={styles.kpiLabel} allowFontScaling={false}>TOTAL UNITS</Text>
                      <Text style={[styles.kpiValue, { color: '#38bdf8' }]} allowFontScaling={false}>
                        {summaryData.portfolioTotalUnits}
                      </Text>
                    </View>
                    <View style={[styles.kpiCard, { borderLeftColor: '#10b981' }]}>
                      <Text style={styles.kpiLabel} allowFontScaling={false}>OCCUPIED UNITS</Text>
                      <Text style={[styles.kpiValue, { color: '#10b981' }]} allowFontScaling={false}>
                        {summaryData.portfolioOccupiedUnits}
                      </Text>
                    </View>
                    <View style={[styles.kpiCard, { borderLeftColor: '#f59e0b' }]}>
                      <Text style={styles.kpiLabel} allowFontScaling={false}>VACANT UNITS</Text>
                      <Text style={[styles.kpiValue, { color: '#f59e0b' }]} allowFontScaling={false}>
                        {summaryData.portfolioVacantUnits}
                      </Text>
                    </View>
                  </View>
                )}

                {/* --- 3. DELINQUENCY REPORT SUMMARY CARDS --- */}
                {selectedReportId === 'delinquency' && summaryData && (
                  <View style={styles.kpiGrid}>
                    <View style={[styles.kpiCard, { borderLeftColor: '#ef4444' }]}>
                      <Text style={styles.kpiLabel} allowFontScaling={false}>DELINQUENT BALANCE</Text>
                      <Text style={[styles.kpiValue, { color: '#ef4444' }]} allowFontScaling={false}>
                        ${Number(summaryData.totalDelinquentBalance || 0).toLocaleString()}
                      </Text>
                    </View>
                    <View style={[styles.kpiCard, { borderLeftColor: '#f59e0b' }]}>
                      <Text style={styles.kpiLabel} allowFontScaling={false}>DELINQUENT TENANTS</Text>
                      <Text style={[styles.kpiValue, { color: '#f59e0b' }]} allowFontScaling={false}>
                        {summaryData.totalDelinquentTenants}
                      </Text>
                    </View>
                    <View style={[styles.kpiCard, { borderLeftColor: '#38bdf8' }]}>
                      <Text style={styles.kpiLabel} allowFontScaling={false}>OVERDUE INVOICES</Text>
                      <Text style={[styles.kpiValue, { color: '#38bdf8' }]} allowFontScaling={false}>
                        {summaryData.totalDelinquentInvoices}
                      </Text>
                    </View>
                    <View style={[styles.kpiCard, { borderLeftColor: '#a855f7' }]}>
                      <Text style={styles.kpiLabel} allowFontScaling={false}>AVERAGE DAYS LATE</Text>
                      <Text style={[styles.kpiValue, { color: '#a855f7' }]} allowFontScaling={false}>
                        {summaryData.averageDaysLate} Days
                      </Text>
                    </View>
                  </View>
                )}

                {/* --- 4. PROFIT & LOSS STATEMENT SUMMARY CARDS --- */}
                {selectedReportId === 'profit-loss' && summaryData && (
                  <View style={styles.pnLSummaryRow}>
                    <View style={[styles.pnLSummaryBox, { borderLeftColor: '#10b981' }]}>
                      <Text style={styles.pnLSummaryLabel} allowFontScaling={false}>GROSS INCOME</Text>
                      <Text style={[styles.pnLSummaryVal, { color: '#10b981' }]} allowFontScaling={false}>
                        ${Number(summaryData.totalIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                    <View style={[styles.pnLSummaryBox, { borderLeftColor: '#ef4444' }]}>
                      <Text style={styles.pnLSummaryLabel} allowFontScaling={false}>TOTAL EXPENSES</Text>
                      <Text style={[styles.pnLSummaryVal, { color: '#ef4444' }]} allowFontScaling={false}>
                        -${Number(summaryData.totalExpenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                    <View style={[styles.pnLSummaryBox, { borderLeftColor: '#38bdf8' }]}>
                      <Text style={styles.pnLSummaryLabel} allowFontScaling={false}>NET PROFIT</Text>
                      <Text style={[styles.pnLSummaryVal, { color: '#38bdf8' }]} allowFontScaling={false}>
                        ${Number(summaryData.netProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </View>
                )}

                {/* --- 5. MAINTENANCE REPORT SUMMARY CARDS --- */}
                {selectedReportId === 'maintenance' && summaryData && (
                  <View style={styles.kpiGrid}>
                    <View style={[styles.kpiCard, { borderLeftColor: '#38bdf8' }]}>
                      <Text style={styles.kpiLabel} allowFontScaling={false}>TOTAL WORK ORDERS</Text>
                      <Text style={[styles.kpiValue, { color: '#38bdf8' }]} allowFontScaling={false}>
                        {summaryData.totalWorkOrders}
                      </Text>
                    </View>
                    <View style={[styles.kpiCard, { borderLeftColor: '#f59e0b' }]}>
                      <Text style={styles.kpiLabel} allowFontScaling={false}>ESTIMATED COST</Text>
                      <Text style={[styles.kpiValue, { color: '#f59e0b' }]} allowFontScaling={false}>
                        ${Number(summaryData.totalEstimatedCost || 0).toLocaleString()}
                      </Text>
                    </View>
                    <View style={[styles.kpiCard, { borderLeftColor: '#10b981' }]}>
                      <Text style={styles.kpiLabel} allowFontScaling={false}>ACTUAL COST</Text>
                      <Text style={[styles.kpiValue, { color: '#10b981' }]} allowFontScaling={false}>
                        ${Number(summaryData.totalActualCost || 0).toLocaleString()}
                      </Text>
                    </View>
                    <View style={[styles.kpiCard, { borderLeftColor: '#a855f7' }]}>
                      <Text style={styles.kpiLabel} allowFontScaling={false}>COMPLETION RATE</Text>
                      <Text style={[styles.kpiValue, { color: '#a855f7' }]} allowFontScaling={false}>
                        {summaryData.completionRate}%
                      </Text>
                    </View>
                  </View>
                )}

                {/* --- 6. PAYMENT HISTORY REPORT SUMMARY CARDS --- */}
                {selectedReportId === 'payment-history' && summaryData && (
                  <View style={styles.kpiGrid}>
                    <View style={[styles.kpiCard, { borderLeftColor: '#10b981' }]}>
                      <Text style={styles.kpiLabel} allowFontScaling={false}>TOTAL COLLECTED</Text>
                      <Text style={[styles.kpiValue, { color: '#10b981' }]} allowFontScaling={false}>
                        ${Number(summaryData.totalCollectedAmount || 0).toLocaleString()}
                      </Text>
                    </View>
                    <View style={[styles.kpiCard, { borderLeftColor: '#38bdf8' }]}>
                      <Text style={styles.kpiLabel} allowFontScaling={false}>TRANSACTIONS</Text>
                      <Text style={[styles.kpiValue, { color: '#38bdf8' }]} allowFontScaling={false}>
                        {summaryData.totalTransactions}
                      </Text>
                    </View>
                    <View style={[styles.kpiCard, { borderLeftColor: '#a855f7' }]}>
                      <Text style={styles.kpiLabel} allowFontScaling={false}>AVERAGE PAYMENT</Text>
                      <Text style={[styles.kpiValue, { color: '#a855f7' }]} allowFontScaling={false}>
                        ${Number(summaryData.averageTransaction || 0).toLocaleString()}
                      </Text>
                    </View>
                    <View style={[styles.kpiCard, { borderLeftColor: '#f59e0b' }]}>
                      <Text style={styles.kpiLabel} allowFontScaling={false}>TOP METHOD</Text>
                      <Text style={[styles.kpiValue, { color: '#f59e0b' }]} allowFontScaling={false}>
                        {summaryData.topMethod || 'ACH'}
                      </Text>
                    </View>
                  </View>
                )}

                {/* SECTION TITLE & RECORD COUNT */}
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.reportSectionHeader} allowFontScaling={false}>
                    RECORDS ({filteredData.length}{filteredData.length !== reportData.length ? ` of ${reportData.length}` : ''})
                  </Text>
                </View>

                {/* EMPTY VIEW */}
                {filteredData.length === 0 ? (
                  <View style={styles.emptyView}>
                    <Ionicons name="document-text-outline" size={40} color="#64748b" style={{ marginBottom: 10 }} />
                    <Text style={styles.emptyText} allowFontScaling={false}>No records matching filter criteria.</Text>
                    <Text style={styles.emptySubText} allowFontScaling={false}>Try adjusting or resetting active filters.</Text>
                    {(activeFilterCount > 0 || searchQuery.length > 0) && (
                      <TouchableOpacity style={styles.emptyResetBtn} onPress={() => resetFilters(true)}>
                        <Text style={styles.emptyResetBtnText} allowFontScaling={false}>Reset All Filters</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  // RECORD CARDS WITH VIEW DETAILS ICON (MATCHING WEB REPORTTABLE)
                  filteredData.map((item, idx) => (
                    <View key={item.id || idx} style={styles.reportCard}>
                      {/* Top Header of Card */}
                      <View style={styles.rowBetween}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Text style={styles.recordLabel} numberOfLines={1} allowFontScaling={false}>
                            {item.propertyName || item.tenantName || item.name || `Record #${idx + 1}`}
                          </Text>
                          {item.unitNumber && (
                            <Text style={styles.recordSubText} allowFontScaling={false}>Unit {item.unitNumber}</Text>
                          )}
                        </View>

                        {/* View Details Eye Icon Button */}
                        <TouchableOpacity
                          style={styles.eyeBtn}
                          onPress={() => setViewingItem(item)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="eye-outline" size={17} color="#38bdf8" />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.cardDivider} />

                      {/* Specific fields depending on report type */}
                      {selectedReportId === 'rent-roll' && (
                        <View style={styles.fieldsGrid}>
                          <View style={styles.fieldItem}>
                            <Text style={styles.fieldLabel} allowFontScaling={false}>TENANT</Text>
                            <Text style={styles.fieldVal} allowFontScaling={false}>{item.tenantName || 'Vacant'}</Text>
                          </View>
                          <View style={styles.fieldItem}>
                            <Text style={styles.fieldLabel} allowFontScaling={false}>MONTHLY RENT</Text>
                            <Text style={[styles.fieldVal, { color: '#38bdf8', fontWeight: '800' }]} allowFontScaling={false}>
                              ${Number(item.monthlyRent || 0).toLocaleString()}
                            </Text>
                          </View>
                          <View style={styles.fieldItem}>
                            <Text style={styles.fieldLabel} allowFontScaling={false}>STATUS</Text>
                            <Text
                              style={[
                                styles.fieldVal,
                                { color: item.leaseStatus === 'Active' ? '#10b981' : '#f59e0b', fontWeight: '800' },
                              ]}
                              allowFontScaling={false}
                            >
                              {item.leaseStatus || item.unitStatus}
                            </Text>
                          </View>
                        </View>
                      )}

                      {selectedReportId === 'occupancy' && (
                        <View>
                          <View style={styles.rowBetween}>
                            <Text style={styles.recordSubText} allowFontScaling={false}>Occupancy Rate</Text>
                            <Text style={[styles.fieldVal, { color: '#10b981', fontWeight: '800' }]} allowFontScaling={false}>
                              {item.occupancyPercentage}%
                            </Text>
                          </View>
                          <View style={styles.progressBarBg}>
                            <View
                              style={[
                                styles.progressBarFill,
                                {
                                  width: `${Math.min(100, item.occupancyPercentage || 0)}%`,
                                  backgroundColor:
                                    item.occupancyPercentage >= 80
                                      ? '#10b981'
                                      : item.occupancyPercentage >= 50
                                      ? '#f59e0b'
                                      : '#ef4444',
                                },
                              ]}
                            />
                          </View>
                          <View style={styles.fieldsGrid}>
                            <View style={styles.fieldItem}>
                              <Text style={styles.fieldLabel} allowFontScaling={false}>TOTAL</Text>
                              <Text style={styles.fieldVal} allowFontScaling={false}>{item.totalUnits} Units</Text>
                            </View>
                            <View style={styles.fieldItem}>
                              <Text style={styles.fieldLabel} allowFontScaling={false}>OCCUPIED</Text>
                              <Text style={[styles.fieldVal, { color: '#10b981' }]} allowFontScaling={false}>
                                {item.occupiedUnits} Units
                              </Text>
                            </View>
                            <View style={styles.fieldItem}>
                              <Text style={styles.fieldLabel} allowFontScaling={false}>VACANT</Text>
                              <Text style={[styles.fieldVal, { color: '#f59e0b' }]} allowFontScaling={false}>
                                {item.vacantUnits} Units
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}

                      {selectedReportId === 'delinquency' && (
                        <View style={styles.fieldsGrid}>
                          <View style={styles.fieldItem}>
                            <Text style={styles.fieldLabel} allowFontScaling={false}>DUE DATE</Text>
                            <Text style={styles.fieldVal} allowFontScaling={false}>{item.dueDate || 'N/A'}</Text>
                          </View>
                          <View style={styles.fieldItem}>
                            <Text style={styles.fieldLabel} allowFontScaling={false}>OVERDUE DAYS</Text>
                            <Text style={[styles.fieldVal, { color: '#ef4444', fontWeight: '800' }]} allowFontScaling={false}>
                              {item.daysLate} Days
                            </Text>
                          </View>
                          <View style={styles.fieldItem}>
                            <Text style={styles.fieldLabel} allowFontScaling={false}>BALANCE</Text>
                            <Text style={[styles.fieldVal, { color: '#ef4444', fontWeight: '800' }]} allowFontScaling={false}>
                              ${Number(item.outstandingBalance || 0).toLocaleString()}
                            </Text>
                          </View>
                        </View>
                      )}

                      {selectedReportId === 'profit-loss' && (
                        <View style={styles.rowBetween}>
                          <Text style={styles.recordSubText} allowFontScaling={false}>Category: {item.type}</Text>
                          <Text
                            style={[
                              styles.fieldVal,
                              { color: item.type === 'Income' ? '#10b981' : '#ef4444', fontWeight: '800' },
                            ]}
                            allowFontScaling={false}
                          >
                            {item.type === 'Income' ? '+' : '-'}${Number(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </Text>
                        </View>
                      )}

                      {selectedReportId === 'maintenance' && (
                        <View style={styles.fieldsGrid}>
                          <View style={styles.fieldItem}>
                            <Text style={styles.fieldLabel} allowFontScaling={false}>ISSUE</Text>
                            <Text style={styles.fieldVal} numberOfLines={1} allowFontScaling={false}>{item.issue || 'Service'}</Text>
                          </View>
                          <View style={styles.fieldItem}>
                            <Text style={styles.fieldLabel} allowFontScaling={false}>PRIORITY</Text>
                            <Text style={[styles.fieldVal, { color: item.priority === 'High' ? '#ef4444' : '#38bdf8' }]} allowFontScaling={false}>
                              {item.priority || 'Normal'}
                            </Text>
                          </View>
                          <View style={styles.fieldItem}>
                            <Text style={styles.fieldLabel} allowFontScaling={false}>ACTUAL COST</Text>
                            <Text style={[styles.fieldVal, { color: '#10b981', fontWeight: '800' }]} allowFontScaling={false}>
                              ${Number(item.actualCost || 0).toLocaleString()}
                            </Text>
                          </View>
                        </View>
                      )}

                      {selectedReportId === 'payment-history' && (
                        <View style={styles.fieldsGrid}>
                          <View style={styles.fieldItem}>
                            <Text style={styles.fieldLabel} allowFontScaling={false}>DATE</Text>
                            <Text style={styles.fieldVal} allowFontScaling={false}>{item.paymentDate || 'N/A'}</Text>
                          </View>
                          <View style={styles.fieldItem}>
                            <Text style={styles.fieldLabel} allowFontScaling={false}>METHOD</Text>
                            <Text style={styles.fieldVal} allowFontScaling={false}>{item.paymentMethod || 'ACH'}</Text>
                          </View>
                          <View style={styles.fieldItem}>
                            <Text style={styles.fieldLabel} allowFontScaling={false}>AMOUNT</Text>
                            <Text style={[styles.fieldVal, { color: '#10b981', fontWeight: '800' }]} allowFontScaling={false}>
                              +${Number(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  ))
                )}
              </Animated.View>
            )}
          </ScrollView>
        </>
      )}

      {/* DETAIL VIEW MODAL (MATCHING WEB ReportDetailsModal.tsx) */}
      <Modal visible={viewingItem !== null} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="document-text-outline" size={20} color="#38bdf8" />
                <Text style={styles.modalTitle} allowFontScaling={false}>Record Details</Text>
              </View>
              <TouchableOpacity onPress={() => setViewingItem(null)}>
                <Ionicons name="close" size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {viewingItem && (
              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                {Object.entries(viewingItem)
                  .filter(([key, val]) => !key.toLowerCase().endsWith('id') && val !== null && val !== undefined)
                  .map(([key, val]) => {
                    const formattedLabel = key.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
                    let displayVal = val;
                    if (typeof val === 'number') {
                      displayVal = key.toLowerCase().includes('amount') || key.toLowerCase().includes('rent') || key.toLowerCase().includes('cost') || key.toLowerCase().includes('balance') || key.toLowerCase().includes('deposit')
                        ? `$${val.toLocaleString()}`
                        : val.toString();
                    } else if (typeof val === 'object') {
                      displayVal = JSON.stringify(val);
                    } else {
                      displayVal = String(val);
                    }

                    return (
                      <View key={key} style={styles.detailItemRow}>
                        <Text style={styles.detailItemLabel} allowFontScaling={false}>{formattedLabel}</Text>
                        <Text style={styles.detailItemValue} allowFontScaling={false}>{displayVal}</Text>
                      </View>
                    );
                  })}
              </ScrollView>
            )}

            <View style={styles.detailModalFooter}>
              <TouchableOpacity style={styles.closeDetailBtn} onPress={() => setViewingItem(null)}>
                <Text style={styles.closeDetailBtnText} allowFontScaling={false}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FILTER MODAL (ACCORDION / INLINE STYLE TO PREVENT MODAL CONFLICTS) */}
      <Modal visible={filterModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="funnel-outline" size={18} color="#38bdf8" />
                  <Text style={styles.modalTitle} allowFontScaling={false}>Filter Report</Text>
                </View>
                <TouchableOpacity onPress={() => setFilterModalOpen(false)}>
                  <Ionicons name="close" size={24} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                {/* 1. Property Filter Accordion */}
                <Text style={styles.filterLabel} allowFontScaling={false}>PROPERTY</Text>
                <TouchableOpacity
                  style={[
                    styles.accordionHeader,
                    expandedFilterSection === 'property' && styles.accordionHeaderActive,
                  ]}
                  onPress={() =>
                    setExpandedFilterSection(expandedFilterSection === 'property' ? null : 'property')
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.accordionHeaderText} allowFontScaling={false}>
                    {properties.find((p) => p.id === selectedPropertyId)?.name || 'All Properties'}
                  </Text>
                  <Ionicons
                    name={expandedFilterSection === 'property' ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
                {expandedFilterSection === 'property' && (
                  <View style={styles.accordionList}>
                    <TouchableOpacity
                      style={styles.accordionOption}
                      onPress={() => {
                        setSelectedPropertyId('');
                        setExpandedFilterSection(null);
                      }}
                    >
                      <Ionicons
                        name={selectedPropertyId === '' ? 'radio-button-on' : 'radio-button-off'}
                        size={16}
                        color={selectedPropertyId === '' ? '#38bdf8' : '#64748b'}
                      />
                      <Text style={[styles.accordionOptionText, selectedPropertyId === '' && styles.optionSelectedText]}>
                        All Properties
                      </Text>
                    </TouchableOpacity>
                    {properties.map((p) => (
                      <TouchableOpacity
                        key={p.id}
                        style={styles.accordionOption}
                        onPress={() => {
                          setSelectedPropertyId(p.id);
                          setExpandedFilterSection(null);
                        }}
                      >
                        <Ionicons
                          name={selectedPropertyId === p.id ? 'radio-button-on' : 'radio-button-off'}
                          size={16}
                          color={selectedPropertyId === p.id ? '#38bdf8' : '#64748b'}
                        />
                        <Text style={[styles.accordionOptionText, selectedPropertyId === p.id && styles.optionSelectedText]}>
                          {p.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* 2. Unit Filter Accordion */}
                <Text style={styles.filterLabel} allowFontScaling={false}>UNIT</Text>
                <TouchableOpacity
                  style={[
                    styles.accordionHeader,
                    expandedFilterSection === 'unit' && styles.accordionHeaderActive,
                  ]}
                  onPress={() =>
                    setExpandedFilterSection(expandedFilterSection === 'unit' ? null : 'unit')
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.accordionHeaderText} allowFontScaling={false}>
                    {units.find((u) => u.id === selectedUnitId)?.unitNumber
                      ? `Unit ${units.find((u) => u.id === selectedUnitId)?.unitNumber}`
                      : 'All Units'}
                  </Text>
                  <Ionicons
                    name={expandedFilterSection === 'unit' ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
                {expandedFilterSection === 'unit' && (
                  <View style={styles.accordionList}>
                    <TouchableOpacity
                      style={styles.accordionOption}
                      onPress={() => {
                        setSelectedUnitId('');
                        setExpandedFilterSection(null);
                      }}
                    >
                      <Ionicons
                        name={selectedUnitId === '' ? 'radio-button-on' : 'radio-button-off'}
                        size={16}
                        color={selectedUnitId === '' ? '#38bdf8' : '#64748b'}
                      />
                      <Text style={[styles.accordionOptionText, selectedUnitId === '' && styles.optionSelectedText]}>
                        All Units
                      </Text>
                    </TouchableOpacity>
                    {units.map((u) => (
                      <TouchableOpacity
                        key={u.id}
                        style={styles.accordionOption}
                        onPress={() => {
                          setSelectedUnitId(u.id);
                          setExpandedFilterSection(null);
                        }}
                      >
                        <Ionicons
                          name={selectedUnitId === u.id ? 'radio-button-on' : 'radio-button-off'}
                          size={16}
                          color={selectedUnitId === u.id ? '#38bdf8' : '#64748b'}
                        />
                        <Text style={[styles.accordionOptionText, selectedUnitId === u.id && styles.optionSelectedText]}>
                          Unit {u.unitNumber} ({u.property?.name || 'Property'})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* 3. Tenant Filter Accordion */}
                <Text style={styles.filterLabel} allowFontScaling={false}>TENANT</Text>
                <TouchableOpacity
                  style={[
                    styles.accordionHeader,
                    expandedFilterSection === 'tenant' && styles.accordionHeaderActive,
                  ]}
                  onPress={() =>
                    setExpandedFilterSection(expandedFilterSection === 'tenant' ? null : 'tenant')
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.accordionHeaderText} allowFontScaling={false}>
                    {tenants.find((t) => t.id === selectedTenantId)?.name || 'All Tenants'}
                  </Text>
                  <Ionicons
                    name={expandedFilterSection === 'tenant' ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
                {expandedFilterSection === 'tenant' && (
                  <View style={styles.accordionList}>
                    <TouchableOpacity
                      style={styles.accordionOption}
                      onPress={() => {
                        setSelectedTenantId('');
                        setExpandedFilterSection(null);
                      }}
                    >
                      <Ionicons
                        name={selectedTenantId === '' ? 'radio-button-on' : 'radio-button-off'}
                        size={16}
                        color={selectedTenantId === '' ? '#38bdf8' : '#64748b'}
                      />
                      <Text style={[styles.accordionOptionText, selectedTenantId === '' && styles.optionSelectedText]}>
                        All Tenants
                      </Text>
                    </TouchableOpacity>
                    {tenants.map((t) => (
                      <TouchableOpacity
                        key={t.id}
                        style={styles.accordionOption}
                        onPress={() => {
                          setSelectedTenantId(t.id);
                          setExpandedFilterSection(null);
                        }}
                      >
                        <Ionicons
                          name={selectedTenantId === t.id ? 'radio-button-on' : 'radio-button-off'}
                          size={16}
                          color={selectedTenantId === t.id ? '#38bdf8' : '#64748b'}
                        />
                        <Text style={[styles.accordionOptionText, selectedTenantId === t.id && styles.optionSelectedText]}>
                          {t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* 4. Status Filter Accordion */}
                <Text style={styles.filterLabel} allowFontScaling={false}>STATUS</Text>
                <TouchableOpacity
                  style={[
                    styles.accordionHeader,
                    expandedFilterSection === 'status' && styles.accordionHeaderActive,
                  ]}
                  onPress={() =>
                    setExpandedFilterSection(expandedFilterSection === 'status' ? null : 'status')
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.accordionHeaderText} allowFontScaling={false}>
                    {getStatusChoices().find((s) => s.value === selectedStatus)?.label || 'All Statuses'}
                  </Text>
                  <Ionicons
                    name={expandedFilterSection === 'status' ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
                {expandedFilterSection === 'status' && (
                  <View style={styles.accordionList}>
                    {getStatusChoices().map((s) => (
                      <TouchableOpacity
                        key={s.value || 'all'}
                        style={styles.accordionOption}
                        onPress={() => {
                          setSelectedStatus(s.value);
                          setExpandedFilterSection(null);
                        }}
                      >
                        <Ionicons
                          name={selectedStatus === s.value ? 'radio-button-on' : 'radio-button-off'}
                          size={16}
                          color={selectedStatus === s.value ? '#38bdf8' : '#64748b'}
                        />
                        <Text style={[styles.accordionOptionText, selectedStatus === s.value && styles.optionSelectedText]}>
                          {s.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* 5. Payment Method (for payment-history) */}
                {selectedReportId === 'payment-history' && (
                  <>
                    <Text style={styles.filterLabel} allowFontScaling={false}>PAYMENT METHOD</Text>
                    <TouchableOpacity
                      style={[
                        styles.accordionHeader,
                        expandedFilterSection === 'method' && styles.accordionHeaderActive,
                      ]}
                      onPress={() =>
                        setExpandedFilterSection(expandedFilterSection === 'method' ? null : 'method')
                      }
                      activeOpacity={0.7}
                    >
                      <Text style={styles.accordionHeaderText} allowFontScaling={false}>
                        {selectedPaymentMethod || 'All Methods'}
                      </Text>
                      <Ionicons
                        name={expandedFilterSection === 'method' ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color="#94a3b8"
                      />
                    </TouchableOpacity>
                    {expandedFilterSection === 'method' && (
                      <View style={styles.accordionList}>
                        {['', 'ACH', 'Cash', 'Check', 'CreditCard', 'Zelle'].map((m) => (
                          <TouchableOpacity
                            key={m || 'all'}
                            style={styles.accordionOption}
                            onPress={() => {
                              setSelectedPaymentMethod(m);
                              setExpandedFilterSection(null);
                            }}
                          >
                            <Ionicons
                              name={selectedPaymentMethod === m ? 'radio-button-on' : 'radio-button-off'}
                              size={16}
                              color={selectedPaymentMethod === m ? '#38bdf8' : '#64748b'}
                            />
                            <Text style={[styles.accordionOptionText, selectedPaymentMethod === m && styles.optionSelectedText]}>
                              {m || 'All Methods'}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </>
                )}

                {/* 6. Priority (for maintenance) */}
                {selectedReportId === 'maintenance' && (
                  <>
                    <Text style={styles.filterLabel} allowFontScaling={false}>PRIORITY</Text>
                    <TouchableOpacity
                      style={[
                        styles.accordionHeader,
                        expandedFilterSection === 'priority' && styles.accordionHeaderActive,
                      ]}
                      onPress={() =>
                        setExpandedFilterSection(expandedFilterSection === 'priority' ? null : 'priority')
                      }
                      activeOpacity={0.7}
                    >
                      <Text style={styles.accordionHeaderText} allowFontScaling={false}>
                        {selectedPriority || 'All Priorities'}
                      </Text>
                      <Ionicons
                        name={expandedFilterSection === 'priority' ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color="#94a3b8"
                      />
                    </TouchableOpacity>
                    {expandedFilterSection === 'priority' && (
                      <View style={styles.accordionList}>
                        {['', 'Low', 'Medium', 'High', 'Emergency'].map((pr) => (
                          <TouchableOpacity
                            key={pr || 'all'}
                            style={styles.accordionOption}
                            onPress={() => {
                              setSelectedPriority(pr);
                              setExpandedFilterSection(null);
                            }}
                          >
                            <Ionicons
                              name={selectedPriority === pr ? 'radio-button-on' : 'radio-button-off'}
                              size={16}
                              color={selectedPriority === pr ? '#38bdf8' : '#64748b'}
                            />
                            <Text style={[styles.accordionOptionText, selectedPriority === pr && styles.optionSelectedText]}>
                              {pr || 'All Priorities'}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </>
                )}
              </ScrollView>

              {/* Action Buttons inside Filter Modal */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.resetModalBtn}
                  onPress={resetFilters}
                >
                  <Text style={styles.resetModalBtnText} allowFontScaling={false}>Clear All</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={() => setFilterModalOpen(false)}
                >
                  <Text style={styles.applyBtnText} allowFontScaling={false}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default ReportsScreen;

const getStyles = (colors, isDarkMode) =>
  StyleSheet.create({
    mainWrapper: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 60 },
    fixedHeader: {
      paddingHorizontal: 16,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
    },
    title: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
    subtitle: { fontSize: 11.5, color: colors.textSecondary, marginTop: 3, lineHeight: 16 },

    // Main Reports Directory
    repCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    cardIconBox: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    cardInfo: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
    cardDesc: { fontSize: 11.5, color: colors.textSecondary, marginTop: 3, lineHeight: 16 },

    // Viewer Header
    backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    backBtnText: { color: '#38bdf8', fontSize: 12.5, fontWeight: '700' },
    headerTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

    // Search, Reload and Filters bar
    searchBarRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderRadius: 10,
      paddingHorizontal: 10,
      height: 38,
    },
    searchInput: { flex: 1, color: colors.textPrimary, fontSize: 12, padding: 0 },
    reloadBtn: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderRadius: 10,
      width: 38,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterBtn: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 10,
      paddingHorizontal: 10,
      height: 38,
      gap: 4,
    },
    filterBtnActive: {
      backgroundColor: '#0284c7',
      borderColor: '#0284c7',
    },
    filterBtnText: { color: colors.textPrimary, fontSize: 12, fontWeight: '800' },
    clearFilterBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    centerLoading: { paddingVertical: 40, alignItems: 'center' },
    loadingText: { color: colors.textSecondary, fontSize: 13, marginTop: 10, fontWeight: '600' },

    // KPI Cards Grid
    kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
    kpiCard: {
      flex: 1,
      minWidth: '47%',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderLeftWidth: 4,
    },
    kpiLabel: { fontSize: 9, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5 },
    kpiValue: { fontSize: 16, fontWeight: '900', marginTop: 4 },

    // P&L Summary Cards
    pnLSummaryRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
    pnLSummaryBox: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderLeftWidth: 4,
    },
    pnLSummaryLabel: { fontSize: 8.5, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5 },
    pnLSummaryVal: { fontSize: 12.5, fontWeight: '900', marginTop: 4 },

    sectionHeaderRow: { marginBottom: 10 },
    reportSectionHeader: { fontSize: 11, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.8 },

    emptyView: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 30,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.cardBorder,
      marginTop: 10,
    },
    emptyText: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
    emptySubText: { color: colors.textMuted, fontSize: 11.5, marginTop: 4, textAlign: 'center' },
    emptyResetBtn: {
      marginTop: 14,
      backgroundColor: '#38bdf8',
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    emptyResetBtnText: { color: '#0f172a', fontWeight: '800', fontSize: 12 },

    // Report Card
    reportCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    recordLabel: { fontSize: 14.5, fontWeight: '800', color: colors.textPrimary },
    recordSubText: { fontSize: 11.5, color: colors.textSecondary, marginTop: 2 },
    eyeBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: 'rgba(56, 189, 248, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardDivider: { height: 1, backgroundColor: colors.divider, marginVertical: 10 },
    fieldsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
    fieldItem: { flex: 1 },
    fieldLabel: { fontSize: 9, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5 },
    fieldVal: { fontSize: 12.5, color: colors.textPrimary, fontWeight: '700', marginTop: 2 },

    // Occupancy Progress
    progressBarBg: { height: 6, backgroundColor: colors.inputBackground, borderRadius: 3, marginVertical: 8, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 3 },

    // Detail Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    detailModalCard: {
      width: '100%',
      maxWidth: 440,
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    detailItemRow: {
      marginBottom: 10,
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      padding: 10,
    },
    detailItemLabel: { fontSize: 9.5, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5 },
    detailItemValue: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginTop: 2 },
    detailModalFooter: { borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: 14, alignItems: 'flex-end' },
    closeDetailBtn: { backgroundColor: '#38bdf8', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16 },
    closeDetailBtnText: { color: '#0f172a', fontWeight: '800', fontSize: 13 },

    // Filters Modal
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      width: '100%',
      maxWidth: 440,
      maxHeight: '85%',
      padding: 20,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      paddingBottom: 12,
      marginBottom: 10,
    },
    modalTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
    modalForm: { flex: 1 },
    filterLabel: { fontSize: 9.5, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.6, marginTop: 12, marginBottom: 5 },
    accordionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    accordionHeaderActive: {
      borderColor: '#38bdf8',
    },
    accordionHeaderText: { color: colors.textPrimary, fontSize: 13, fontWeight: '700' },
    accordionList: {
      marginTop: 4,
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      maxHeight: 180,
      paddingVertical: 4,
    },
    accordionOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 9,
      paddingHorizontal: 12,
      gap: 10,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.divider,
    },
    accordionOptionText: { color: colors.textSecondary, fontSize: 12.5, fontWeight: '600', flex: 1 },
    optionSelectedText: { color: '#38bdf8', fontWeight: '800' },

    modalActions: {
      flexDirection: 'row',
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      paddingTop: 14,
      marginTop: 12,
    },
    resetModalBtn: {
      flex: 1,
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    resetModalBtnText: { color: colors.textSecondary, fontSize: 13, fontWeight: '800' },
    applyBtn: { flex: 1, backgroundColor: '#38bdf8', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    applyBtnText: { color: '#0f172a', fontSize: 13, fontWeight: '800' },
  });
