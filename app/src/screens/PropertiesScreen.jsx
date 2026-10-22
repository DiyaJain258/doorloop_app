import React, { useState, useEffect, useMemo } from 'react';
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
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../api/client';
import { useAuthStore, useThemeStore, safeStorage } from '../store/useStore';
import { useThemeColors } from '../theme';
import { propertySchema, unitSchema } from '../validations/mobile.validation';
import { CustomDatePicker } from '../components/CustomDatePicker';

const PROPERTY_TYPES = [
  'Apartment',
  'Single Family',
  'Multi Family',
  'Commercial',
  'Industrial',
  'Condo',
  'Townhouse',
  'Mixed-Use Property (MUP)',
  'HOA',
  'Other',
];
const PROPERTY_STATUSES = ['Active', 'Inactive', 'Under Review', 'Draft'];
const PAYMENT_PROVIDERS = [
  'Use Company Default (Fallback Option)',
  'Stripe Connect Account',
  'Authorize.Net Gateway',
  'Direct Merchant Account',
];
const UNIT_STATUSES = ['Occupied', 'Vacant', 'Reserved', 'Under Maintenance'];
const GENDERS = ['Male', 'Female', 'Other'];

export const normalizeGender = (g) => {
  if (!g) return 'Male';
  const s = String(g).trim().toLowerCase();
  if (s === 'female') return 'Female';
  if (s === 'other' || s.startsWith('oth')) return 'Other';
  return 'Male';
};

const parseDateSafe = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY/MM/DD
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) return new Date(y, m, d);
      } else {
        // MM/DD/YYYY
        const m = parseInt(parts[0], 10) - 1;
        const d = parseInt(parts[1], 10);
        const y = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) return new Date(y, m, d);
      }
    }
  }
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) return new Date(y, m, d);
      } else {
        // MM-DD-YYYY
        const m = parseInt(parts[0], 10) - 1;
        const d = parseInt(parts[1], 10);
        const y = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) return new Date(y, m, d);
      }
    }
  }
  const dt = new Date(trimmed);
  return isNaN(dt.getTime()) ? null : dt;
};

// Helper to generate past months list (Matching Web NewUnitPage.tsx)
const generateMonthListFromMoveIn = (dateStr) => {
  if (!dateStr) return [];
  const start = parseDateSafe(dateStr);
  if (!start) return [];
  const now = new Date();
  // Ensure reference end date covers at least 2026-10-21 (matching Web 10 months past demo dataset)
  let refYear = Math.max(now.getFullYear(), 2026);
  let refMonth = 9; // October (index 9)
  if (now.getFullYear() > 2026) {
    refMonth = now.getMonth();
  } else if (now.getFullYear() === 2026) {
    refMonth = Math.max(now.getMonth(), 9);
  }

  let currentYear = start.getFullYear();
  let currentMonth = start.getMonth();

  if (currentYear > refYear || (currentYear === refYear && currentMonth > refMonth)) {
    return [];
  }

  const months = [];
  while (currentYear < refYear || (currentYear === refYear && currentMonth <= refMonth)) {
    const d = new Date(currentYear, currentMonth, 1);
    const id = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    months.push({ id, label });
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    if (months.length >= 36) break;
  }
  return months;
};

export const PropertiesScreen = ({ initialTab = 'properties' }) => {
  const { user, logout, refreshAccessToken } = useAuthStore();
  const { language } = useThemeStore();
  const { colors, isDarkMode } = useThemeColors();
  const styles = useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

  // Tab State: 'properties' | 'units' | 'drafts'
  const [activeTab, setActiveTab] = useState(
    initialTab === 'units' ? 'units' : initialTab === 'drafts' ? 'drafts' : 'properties'
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data Collections (Live from Backend)
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [owners, setOwners] = useState([]);
  const [tenants, setTenants] = useState([]);

  // Selected for Details
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // Quick Action Modals
  const [assignTenantUnit, setAssignTenantUnit] = useState(null);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [statusChangeUnit, setStatusChangeUnit] = useState(null);
  const [newStatusValue, setNewStatusValue] = useState('Vacant');

  // Form Modals (Add / Edit)
  const [isPropModalOpen, setIsPropModalOpen] = useState(false);
  const [editingPropId, setEditingPropId] = useState(null);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState(null);
  const [editingTenantId, setEditingTenantId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Property Form Inputs (Matching Web 1:1)
  const [pName, setPName] = useState('');
  const [pType, setPType] = useState('Apartment');
  const [pStatus, setPStatus] = useState('Active');
  const [pStreet, setPStreet] = useState('');
  const [pCity, setPCity] = useState('Austin');
  const [pState, setPState] = useState('TX');
  const [pCountry, setPCountry] = useState('USA');
  const [pZip, setPZip] = useState('78701');
  const [pNycBin, setPNycBin] = useState('');
  const [pFloors, setPFloors] = useState('1');
  const [pUnitsCount, setPUnitsCount] = useState('1');
  const [pOwnerId, setPOwnerId] = useState('');
  const [pShare, setPShare] = useState('100');
  const [pManagementCompany, setPManagementCompany] = useState('');
  const [pPaymentProvider, setPPaymentProvider] = useState('Use Company Default (Fallback Option)');
  const [showPropAdditional, setShowPropAdditional] = useState(false);
  const [pYearBuilt, setPYearBuilt] = useState('2020');
  const [pSqft, setPSqft] = useState('8500');
  const [pPurchasePrice, setPPurchasePrice] = useState('1800000');
  const [pCurrentValue, setPCurrentValue] = useState('2200000');
  const [pExpenses, setPExpenses] = useState('4500');
  const [pPhotoUrl, setPPhotoUrl] = useState('');
  const [pNotes, setPNotes] = useState('');

  // Dropdown Picker Modal state for Property Form
  const [activePropDropdown, setActivePropDropdown] = useState(null); // 'type' | 'status' | 'owner' | 'paymentProvider' | null

  // Quick Add Owner Modal inside Property Form
  const [isQuickAddOwnerOpen, setIsQuickAddOwnerOpen] = useState(false);
  const [newOwnerFullName, setNewOwnerFullName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');
  const [creatingOwner, setCreatingOwner] = useState(false);

  // Unit Form Inputs
  const [uPropId, setUPropId] = useState('');
  const [uNumber, setUNumber] = useState('');
  const [uFloor, setUFloor] = useState('1');
  const [uBeds, setUBeds] = useState('2');
  const [uBaths, setUBaths] = useState('2');
  const [uSqft, setUSqft] = useState('850');
  const [uRent, setURent] = useState('1500');
  const [uDeposit, setUDeposit] = useState('1500');
  const [uStatus, setUStatus] = useState('Occupied'); // Default Occupied

  // Late Fee & Grace Period
  const [uLateFeeEnabled, setULateFeeEnabled] = useState(false);
  const [uLateFeeType, setULateFeeType] = useState('FLAT');
  const [uLateFeeAmount, setULateFeeAmount] = useState('50');
  const [uLateFeeGraceDays, setULateFeeGraceDays] = useState('5');

  // Vacant Advertising
  const [uWantToAdvertise, setUWantToAdvertise] = useState('yes');
  const [uAdvertiseTime, setUAdvertiseTime] = useState('now');

  // Occupied Tenant Onboarding (Matching Web Screenshot)
  const [uProvideTenantInfo, setUProvideTenantInfo] = useState('now');
  const [tFirstName, setTFirstName] = useState('John');
  const [tLastName, setTLastName] = useState('Doe');
  const [tPreferredName, setTPreferredName] = useState('');
  const [tDob, setTDob] = useState('1990-05-15');
  const [tGender, setTGender] = useState('Male');
  const [tEmail, setTEmail] = useState('john.doe@example.com');
  const [tPhone, setTPhone] = useState('(512) 555-0199');
  const [tAltPhone, setTAltPhone] = useState('(512) 555-4321');
  const [tPassword, setTPassword] = useState('123456');
  const [tShowPassword, setTShowPassword] = useState(false);
  const [tMoveInDate, setTMoveInDate] = useState('2026-01-23');
  const [tInvoiceStartDate, setTInvoiceStartDate] = useState('2026-01-21');
  const [tOutstandingBalance, setTOutstandingBalance] = useState('0');

  // Calendar Date Picker Modal States
  const [showMoveInPicker, setShowMoveInPicker] = useState(false);
  const [showInvoiceStartPicker, setShowInvoiceStartPicker] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);

  // Monthly Billing Status States (Matching Web Screenshot 3)
  const [includeMonthlyLateFee, setIncludeMonthlyLateFee] = useState(false);
  const [monthPaymentDetails, setMonthPaymentDetails] = useState({});
  const [activeMonthPopover, setActiveMonthPopover] = useState(null); // { id, label }
  const [partialAmountInput, setPartialAmountInput] = useState('');

  // Tenant Additional Optional Accordion
  const [showTenantExtra, setShowTenantExtra] = useState(false);
  const [tSsn, setTSsn] = useState('');
  const [tIdType, setTIdType] = useState('Driver License');
  const [tIdNumber, setTIdNumber] = useState('');
  const [tEmergencyName, setTEmergencyName] = useState('');
  const [tEmergencyPhone, setTEmergencyPhone] = useState('');
  const [tEmployer, setTEmployer] = useState('');
  const [tEmployerPhone, setTEmployerPhone] = useState('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab === 'units' ? 'units' : initialTab === 'drafts' ? 'drafts' : 'properties');
    }
  }, [initialTab]);

  // Live Data Fetch (Exact Web APIs)
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [propsRes, unitsRes, ownersRes, tenantsRes] = await Promise.all([
        apiClient.get('/properties', logout, refreshAccessToken).catch(() => null),
        apiClient.get('/units', logout, refreshAccessToken).catch(() => null),
        apiClient.get('/owners', logout, refreshAccessToken).catch(() => null),
        apiClient.get('/tenants', logout, refreshAccessToken).catch(() => null),
      ]);

      setProperties(Array.isArray(propsRes) ? propsRes : (propsRes?.data || []));
      setUnits(Array.isArray(unitsRes) ? unitsRes : (unitsRes?.data || []));
      setOwners(Array.isArray(ownersRes) ? ownersRes : (ownersRes?.data || []));
      setTenants(Array.isArray(tenantsRes) ? tenantsRes : (tenantsRes?.data || []));
    } catch (e) {
      console.log('Error fetching properties data:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  // Helper address
  const formatAddress = (addr) => {
    if (!addr) return 'Austin, TX';
    return String(addr).split(',').slice(0, 2).join(', ').trim();
  };

  // --------------------------------------------------------------------------
  // MONTHLY BILLING STATUS LOGIC (Matching Web Screenshot 3)
  // --------------------------------------------------------------------------
  const pastMonths = useMemo(() => {
    return generateMonthListFromMoveIn(tInvoiceStartDate || tMoveInDate);
  }, [tInvoiceStartDate, tMoveInDate]);

  // Recalculate Outstanding Balance
  useEffect(() => {
    const rentVal = Number(uRent) || 1500;
    const lateFeeVal = includeMonthlyLateFee ? 50 : 0;
    let totalUnpaid = 0;

    pastMonths.forEach((m) => {
      const d = monthPaymentDetails[m.id] || { status: 'Unpaid', paidAmount: 0 };
      if (d.status === 'Paid') {
        // paid
      } else if (d.status === 'Partial') {
        const p = Math.min(rentVal, Number(d.paidAmount || 0));
        totalUnpaid += Math.max(0, rentVal + lateFeeVal - p);
      } else {
        totalUnpaid += (rentVal + lateFeeVal);
      }
    });

    setTOutstandingBalance(String(totalUnpaid));
  }, [pastMonths, monthPaymentDetails, includeMonthlyLateFee, uRent]);

  // Counts for Badges
  const { paidCount, paidTotal, unpaidCount, unpaidTotal, partialCount } = useMemo(() => {
    const rentVal = Number(uRent) || 1500;
    const lateFeeVal = includeMonthlyLateFee ? 50 : 0;
    let pCount = 0;
    let pTotal = 0;
    let uCount = 0;
    let uTotal = 0;
    let partCount = 0;

    pastMonths.forEach((m) => {
      const d = monthPaymentDetails[m.id] || { status: 'Unpaid', paidAmount: 0 };
      if (d.status === 'Paid') {
        pCount++;
        pTotal += rentVal;
      } else if (d.status === 'Partial') {
        partCount++;
        const p = Math.min(rentVal, Number(d.paidAmount || 0));
        pTotal += p;
        uCount++;
        uTotal += Math.max(0, rentVal + lateFeeVal - p);
      } else {
        uCount++;
        uTotal += (rentVal + lateFeeVal);
      }
    });

    return { paidCount: pCount, paidTotal: pTotal, unpaidCount: uCount, unpaidTotal: uTotal, partialCount: partCount };
  }, [pastMonths, monthPaymentDetails, includeMonthlyLateFee, uRent]);

  const handleSetMonthStatus = (monthId, newStatus, paidAmount = 0) => {
    const rentVal = Number(uRent) || 1500;
    const finalPaid = newStatus === 'Paid' ? rentVal : newStatus === 'Partial' ? Math.min(rentVal, Number(paidAmount)) : 0;
    setMonthPaymentDetails((prev) => ({
      ...prev,
      [monthId]: {
        status: newStatus,
        paidAmount: finalPaid,
      },
    }));
    setActiveMonthPopover(null);
  };

  // Filtered lists
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (p.status === 'Draft' || p.status === 'Inactive') return false;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        (p.name || '').toLowerCase().includes(q) ||
        (p.city || '').toLowerCase().includes(q) ||
        (p.address || '').toLowerCase().includes(q) ||
        (p.type || '').toLowerCase().includes(q)
      );
    });
  }, [properties, searchQuery]);

  const filteredDrafts = useMemo(() => {
    return properties.filter((p) => {
      if (p.status !== 'Draft') return false;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (p.name || '').toLowerCase().includes(q);
    });
  }, [properties, searchQuery]);

  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const uNum = String(u.unitNumber || '');
      const pName = u.propertyName || (u.property ? u.property.name : '');
      if (!q) return true;
      return uNum.toLowerCase().includes(q) || pName.toLowerCase().includes(q);
    });
  }, [units, searchQuery]);

  // --------------------------------------------------------------------------
  // PROPERTY ACTIONS (Matching Web 1:1)
  // --------------------------------------------------------------------------
  const handleOpenAddProperty = () => {
    setEditingPropId(null);
    setPName('');
    setPType('Apartment');
    setPStatus('Active');
    setPStreet('');
    setPCity('Austin');
    setPState('TX');
    setPCountry('USA');
    setPZip('78701');
    setPNycBin('');
    setPOwnerId(owners[0]?.id || '');
    setPShare('100');
    setPManagementCompany(user?.companyName || 'Divine Properties');
    setPFloors('1');
    setPUnitsCount('1');
    setPPaymentProvider('Use Company Default (Fallback Option)');
    setShowPropAdditional(false);
    setPYearBuilt('2020');
    setPSqft('8500');
    setPPurchasePrice('1800000');
    setPCurrentValue('2200000');
    setPExpenses('4500');
    setPPhotoUrl('');
    setPNotes('');
    setFormErrors({});
    setIsPropModalOpen(true);
  };

  const handleOpenEditProperty = (prop) => {
    setEditingPropId(prop.id);
    setPName(prop.name || '');
    setPType(prop.type || 'Apartment');
    setPStatus(prop.status || 'Active');
    setPStreet(prop.streetAddress || prop.address || '');
    setPCity(prop.city || 'Austin');
    setPState(prop.state || 'TX');
    setPCountry(prop.country || 'USA');
    setPZip(prop.zip || '78701');
    setPNycBin(prop.nycBin || prop.bin || '');
    setPOwnerId(prop.ownerId || (typeof prop.owner === 'object' ? prop.owner?.id : prop.owner) || owners[0]?.id || '');
    setPShare(String(prop.ownershipPercentage ?? 100));
    setPManagementCompany(prop.managementCompany || user?.companyName || 'Divine Properties');
    setPFloors(String(prop.totalFloors || prop.floors || 1));
    setPUnitsCount(String(prop.totalUnits || prop.unitsCount || 1));
    setPPaymentProvider(prop.paymentProvider || 'Use Company Default (Fallback Option)');
    setShowPropAdditional(false);
    setPYearBuilt(String(prop.yearBuilt || 2020));
    setPSqft(String(prop.squareFootage || 8500));
    setPPurchasePrice(prop.purchasePrice ? String(prop.purchasePrice) : '1800000');
    setPCurrentValue(String(prop.currentValue || 2200000));
    setPExpenses(String(prop.monthlyExpenses || 4500));
    setPPhotoUrl(prop.photoUrl || prop.photo || '');
    setPNotes(prop.notes || prop.description || '');
    setFormErrors({});
    setIsPropModalOpen(true);
  };

  // Quick Add Owner Action
  const handleQuickAddOwner = async () => {
    if (!newOwnerFullName.trim()) {
      Alert.alert('Validation Error', 'Full Name is required.');
      return;
    }
    if (!newOwnerEmail.trim()) {
      Alert.alert('Validation Error', 'Email is required.');
      return;
    }
    try {
      setCreatingOwner(true);
      const [first = '', ...rest] = newOwnerFullName.trim().split(' ');
      const payload = {
        name: newOwnerFullName.trim(),
        firstName: first,
        lastName: rest.join(' ') || 'Owner',
        email: newOwnerEmail.trim(),
        phone: newOwnerPhone.trim() || undefined,
        payoutMethod: 'ACH/Direct Deposit',
        role: 'Owner',
      };
      const res = await apiClient.post('/owners', payload, logout, refreshAccessToken);
      const newOwner = res?.data || res;
      // Refresh owners list
      const ownersRes = await apiClient.get('/owners', logout, refreshAccessToken).catch(() => null);
      const updatedOwners = Array.isArray(ownersRes) ? ownersRes : (ownersRes?.data || []);
      setOwners(updatedOwners);
      if (newOwner?.id) {
        setPOwnerId(newOwner.id);
      } else if (updatedOwners.length > 0) {
        setPOwnerId(updatedOwners[updatedOwners.length - 1].id);
      }
      setIsQuickAddOwnerOpen(false);
      setNewOwnerFullName('');
      setNewOwnerEmail('');
      setNewOwnerPhone('');
      Alert.alert('Success', 'Owner added and selected successfully!');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to add owner.');
    } finally {
      setCreatingOwner(false);
    }
  };

  const handleSaveProperty = async (saveAsDraft = false) => {
    setFormErrors({});
    const targetStatus = saveAsDraft ? 'Draft' : pStatus;
    const payload = {
      name: pName.trim(),
      type: pType,
      status: targetStatus,
      streetAddress: pStreet.trim() || undefined,
      city: pCity.trim() || undefined,
      state: pState.trim() || undefined,
      country: pCountry.trim() || 'USA',
      zip: pZip.trim() || undefined,
      nycBin: pNycBin.trim() || undefined,
      address: pStreet.trim() ? `${pStreet.trim()}, ${pCity.trim()}, ${pState.trim()}` : `${pCity}, ${pState}`,
      ownerId: pOwnerId || (owners[0]?.id || undefined),
      ownershipPercentage: Number(pShare) || 100,
      managementCompany: pManagementCompany.trim() || user?.companyName || 'Divine Properties',
      yearBuilt: Number(pYearBuilt) || 2020,
      totalFloors: Number(pFloors) || 1,
      totalBuildings: 1,
      totalUnits: Number(pUnitsCount) || 1,
      squareFootage: Number(pSqft) || 8500,
      purchasePrice: pPurchasePrice ? Number(pPurchasePrice) : undefined,
      currentValue: Number(pCurrentValue) || 2200000,
      monthlyExpenses: Number(pExpenses) || 4500,
      paymentProvider: pPaymentProvider,
      photoUrl: pPhotoUrl.trim() || undefined,
      notes: pNotes.trim() || undefined,
    };

    const valResult = propertySchema.safeParse(payload);
    if (!valResult.success) {
      const errMap = {};
      valResult.error.issues.forEach((issue) => {
        errMap[issue.path[0]] = issue.message;
      });
      setFormErrors(errMap);
      return;
    }

    try {
      setSubmitting(true);
      if (editingPropId) {
        await apiClient.put(`/properties/${editingPropId}`, valResult.data, logout, refreshAccessToken);
        Alert.alert('Success', 'Property updated successfully.');
      } else {
        await apiClient.post('/properties', valResult.data, logout, refreshAccessToken);
        Alert.alert('Success', saveAsDraft ? 'Draft saved.' : 'Property added successfully.');
      }
      setIsPropModalOpen(false);
      fetchAllData();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save property');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProperty = (id, name) => {
    Alert.alert('Delete Property', `Delete "${name}"? This action cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await apiClient.delete(`/properties/${id}`, logout, refreshAccessToken);
            fetchAllData();
          } catch (err) {
            Alert.alert('Error', err.message || 'Failed to delete');
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handlePublishDraft = async (id, name) => {
    try {
      setLoading(true);
      await apiClient.put(`/properties/${id}`, { status: 'Active' }, logout, refreshAccessToken);
      Alert.alert('Success', `"${name}" is now Active.`);
      fetchAllData();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to publish');
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // UNIT ACTIONS (Matching Web 1:1)
  // --------------------------------------------------------------------------
  const handleOpenAddUnit = (preselectedPropId = null) => {
    setEditingUnitId(null);
    setEditingTenantId(null);
    setUPropId(preselectedPropId || properties[0]?.id || '');
    setUNumber('');
    setUFloor('1');
    setUBeds('2');
    setUBaths('2');
    setUSqft('850');
    setURent('1500');
    setUDeposit('1500');
    setUStatus('Occupied'); // Default Occupied matching Web

    setULateFeeEnabled(false);
    setULateFeeType('FLAT');
    setULateFeeAmount('50');
    setULateFeeGraceDays('5');

    setUProvideTenantInfo('now');
    setTFirstName('John');
    setTLastName('Doe');
    setTPreferredName('');
    setTDob('');
    setTGender('Male');
    setTEmail('john.doe@example.com');
    setTPhone('(512) 555-0199');
    setTAltPhone('(512) 555-4321');
    setTPassword('123456');
    setTShowPassword(false);
    setTMoveInDate('01/23/2026');
    setTInvoiceStartDate('01/21/2026');
    setTOutstandingBalance('0');

    setIncludeMonthlyLateFee(false);
    setMonthPaymentDetails({});
    setActiveMonthPopover(null);
    setShowTenantExtra(false);
    setTSsn('');
    setTIdType('Driver License');
    setTIdNumber('');
    setTEmergencyName('');
    setTEmergencyPhone('');
    setTEmployer('');
    setTEmployerPhone('');

    setFormErrors({});
    setIsUnitModalOpen(true);
  };

  const handleOpenEditUnit = async (unit) => {
    setEditingUnitId(unit.id);
    setUPropId(unit.propertyId || properties[0]?.id || '');
    setUNumber(String(unit.unitNumber || ''));
    setUFloor(String(unit.floor || 1));
    setUBeds(String(unit.bedrooms || 2));
    setUBaths(String(unit.bathrooms || 2));
    setUSqft(String(unit.squareFootage || 850));
    setURent(String(unit.rentAmount || 1500));
    setUDeposit(String(unit.securityDeposit || 1500));
    setUStatus(unit.status || 'Vacant');

    setULateFeeEnabled(Boolean(unit.isLateFeeEnabled));
    setULateFeeType(unit.lateFeeType || 'FLAT');
    setULateFeeAmount(String(unit.lateFeeAmount || 50));
    setULateFeeGraceDays(String(unit.lateFeeGraceDays || 5));

    setUProvideTenantInfo('now');

    // Fetch live unit data from backend to ensure changes from Web are immediately visible in App
    let liveUnit = unit;
    try {
      const freshRes = await apiClient.get(`/units/${unit.id}`, logout, refreshAccessToken);
      if (freshRes?.data || freshRes) {
        liveUnit = freshRes.data || freshRes;
      }
    } catch (e) {
      console.debug('[PropertiesScreen] Using cached unit data:', e.message);
    }

    const existingT = (liveUnit.tenants && liveUnit.tenants[0]) || liveUnit.tenant || tenants.find((item) => item.unitId === liveUnit.id || item.id === liveUnit.tenantId);
    const tId = existingT?.id || liveUnit.tenantId || (liveUnit.tenants && liveUnit.tenants[0]?.id) || null;
    setEditingTenantId(tId);

    if (existingT) {
      setTFirstName(existingT.firstName || 'John');
      setTLastName(existingT.lastName || 'Doe');
      setTPreferredName(existingT.preferredName || '');
      setTDob(existingT.dob ? String(existingT.dob).split('T')[0] : '');

      const cachedG = tId ? await safeStorage.getItem('tenant_gender_' + tId) : null;
      const unitCachedG = await safeStorage.getItem('unit_tenant_gender_' + unit.id);
      const resolvedGender = normalizeGender(cachedG || unitCachedG || existingT.gender || (['Male', 'Female', 'Other'].includes(existingT.nationality) ? existingT.nationality : null) || 'Male');
      setTGender(resolvedGender);

      setTEmail(existingT.email || 'john.doe@example.com');
      setTPhone(existingT.phone || '(512) 555-0199');
      setTAltPhone(existingT.altPhone || '(512) 555-4321');
      setTPassword('123456');
      setTMoveInDate(existingT.moveInDate ? String(existingT.moveInDate).split('T')[0] : '01/23/2026');
      setTInvoiceStartDate(existingT.invoiceStartDate ? String(existingT.invoiceStartDate).split('T')[0] : (existingT.moveInDate ? String(existingT.moveInDate).split('T')[0] : '01/21/2026'));
      setTOutstandingBalance(String(existingT.openingBalance ?? existingT.previousBalance ?? '0'));
      setTSsn(existingT.ssn || '');
      setTIdType(existingT.idType || 'Driver License');
      setTIdNumber(existingT.idNumber || '');
      setTEmergencyName(existingT.emergencyName || '');
      setTEmergencyPhone(existingT.emergencyPhone || '');
      setTEmployer(existingT.employer || '');
      setTEmployerPhone(existingT.employerPhone || '');
    } else {
      setTFirstName('John');
      setTLastName('Doe');
      setTPreferredName('');
      setTDob('');
      setTGender('Male');
      setTEmail('john.doe@example.com');
      setTPhone('(512) 555-0199');
      setTAltPhone('(512) 555-4321');
      setTPassword('123456');
      setTMoveInDate('01/23/2026');
      setTInvoiceStartDate('01/21/2026');
      setTOutstandingBalance('0');
      setTSsn('');
      setTIdType('Driver License');
      setTIdNumber('');
      setTEmergencyName('');
      setTEmergencyPhone('');
      setTEmployer('');
      setTEmployerPhone('');
    }

    setIncludeMonthlyLateFee(false);
    setMonthPaymentDetails({});
    setActiveMonthPopover(null);
    setShowTenantExtra(false);
    setFormErrors({});
    setIsUnitModalOpen(true);
  };

  const handleSaveUnit = async () => {
    setFormErrors({});
    const errMap = {};

    if (!uPropId) {
      errMap.propertyId = 'Please select a property.';
    }
    if (!uNumber.trim()) {
      errMap.unitNumber = 'Unit Number is required.';
    }

    if (uStatus === 'Occupied') {
      if (!tFirstName.trim()) errMap.tFirstName = 'First Name is required.';
      if (!tLastName.trim()) errMap.tLastName = 'Last Name is required.';
      if (!tEmail.trim() && !tPhone.trim()) {
        errMap.tContact = 'Email or Mobile Phone is required for the resident.';
      }
    }

    if (Object.keys(errMap).length > 0) {
      setFormErrors(errMap);
      return;
    }

    const selectedProp = properties.find((p) => p.id === uPropId);

    const unitPayload = {
      propertyId: uPropId,
      unitNumber: uNumber.trim(),
      floor: Number(uFloor) || 1,
      bedrooms: Number(uBeds) || 2,
      bathrooms: Number(uBaths) || 2,
      squareFootage: Number(uSqft) || 850,
      rentAmount: Number(uRent) || 1500,
      securityDeposit: Number(uDeposit) || 1500,
      status: uStatus,
      propertyName: selectedProp ? selectedProp.name : 'Property',
      isLateFeeEnabled: uLateFeeEnabled,
      lateFeeType: uLateFeeType,
      lateFeeAmount: uLateFeeEnabled ? Number(uLateFeeAmount) : null,
      lateFeeGraceDays: uLateFeeEnabled ? Number(uLateFeeGraceDays) : null,
      advertiseListing: uStatus === 'Vacant' && uWantToAdvertise === 'yes' && uAdvertiseTime === 'now',
    };

    try {
      setSubmitting(true);

      if (editingUnitId) {
        await apiClient.put(`/units/${editingUnitId}`, unitPayload, logout, refreshAccessToken);

        if (uStatus === 'Occupied' && tFirstName && tLastName) {
          try {
            const finalGender = normalizeGender(tGender);
            const tenantPayload = {
              firstName: tFirstName.trim(),
              lastName: tLastName.trim(),
              preferredName: tPreferredName.trim() || undefined,
              email: tEmail.trim() || 'john.doe@example.com',
              phone: tPhone.trim() || '(512) 555-0199',
              altPhone: tAltPhone.trim() || undefined,
              dob: tDob || undefined,
              gender: finalGender,
              nationality: finalGender,
              status: 'Active',
              unitId: editingUnitId,
              propertyId: uPropId,
              propertyName: selectedProp?.name || 'Property',
              unitNumber: uNumber.trim(),
              moveInDate: tMoveInDate,
              invoiceStartDate: tInvoiceStartDate || tMoveInDate,
              previousBalance: Number(tOutstandingBalance) || 0,
              openingBalance: Number(tOutstandingBalance) || 0,
              ssn: tSsn || undefined,
              idType: tIdType || 'Driver License',
              idNumber: tIdNumber || undefined,
              emergencyName: tEmergencyName || undefined,
              emergencyPhone: tEmergencyPhone || undefined,
              employer: tEmployer || undefined,
              employerPhone: tEmployerPhone || undefined,
            };

            let targetTenantId = editingTenantId;
            if (!targetTenantId) {
              const existingTenant = tenants.find((item) => item.unitId === editingUnitId || (item.email && item.email.toLowerCase() === tEmail.trim().toLowerCase()));
              targetTenantId = existingTenant?.id;
            }

            if (targetTenantId) {
              await apiClient.put(`/tenants/${targetTenantId}`, tenantPayload, logout, refreshAccessToken);
              await safeStorage.setItem('tenant_gender_' + targetTenantId, finalGender);
              await safeStorage.setItem('unit_tenant_gender_' + editingUnitId, finalGender);
            } else {
              const createdTenantRes = await apiClient.post('/tenants', tenantPayload, logout, refreshAccessToken).catch(() => null);
              const createdTenant = createdTenantRes?.data || createdTenantRes;
              if (createdTenant?.id) {
                await safeStorage.setItem('tenant_gender_' + createdTenant.id, finalGender);
                await safeStorage.setItem('unit_tenant_gender_' + editingUnitId, finalGender);
                await apiClient.post(
                  `/units/${editingUnitId}/assign-tenant`,
                  { tenantId: createdTenant.id },
                  logout,
                  refreshAccessToken
                ).catch(() => null);
              }
            }
          } catch (tErr) {
            console.warn('Tenant update/create error:', tErr.message);
          }
        }

        Alert.alert('Success', 'Unit updated successfully.');
      } else {
        const createdUnitRes = await apiClient.post('/units', unitPayload, logout, refreshAccessToken);
        const createdUnit = createdUnitRes?.data || createdUnitRes;

        if (uStatus === 'Occupied' && tFirstName && tLastName) {
          try {
            const finalGender = normalizeGender(tGender);
            const tenantPayload = {
              firstName: tFirstName.trim(),
              lastName: tLastName.trim(),
              preferredName: tPreferredName.trim() || undefined,
              email: tEmail.trim() || `${tFirstName.toLowerCase()}@example.com`,
              phone: tPhone.trim() || '(512) 555-0199',
              altPhone: tAltPhone.trim() || undefined,
              password: tPassword || '123456',
              dob: tDob || undefined,
              gender: finalGender,
              nationality: finalGender,
              status: 'Active',
              unitId: createdUnit?.id,
              propertyId: uPropId,
              propertyName: selectedProp?.name || 'Property',
              unitNumber: uNumber.trim(),
              moveInDate: tMoveInDate,
              invoiceStartDate: tInvoiceStartDate || tMoveInDate,
              previousBalance: Number(tOutstandingBalance) || 0,
              openingBalance: Number(tOutstandingBalance) || 0,
              ssn: tSsn || undefined,
              idType: tIdType || 'Driver License',
              idNumber: tIdNumber || undefined,
              emergencyName: tEmergencyName || undefined,
              emergencyPhone: tEmergencyPhone || undefined,
              employer: tEmployer || undefined,
              employerPhone: tEmployerPhone || undefined,
            };

            const createdTenantRes = await apiClient.post('/tenants', tenantPayload, logout, refreshAccessToken);
            const createdTenant = createdTenantRes?.data || createdTenantRes;

            if (createdTenant?.id) {
              await safeStorage.setItem('tenant_gender_' + createdTenant.id, finalGender);
              if (createdUnit?.id) {
                await safeStorage.setItem('unit_tenant_gender_' + createdUnit.id, finalGender);
              }
            }

            if (createdUnit?.id && createdTenant?.id) {
              await apiClient.post(
                `/units/${createdUnit.id}/assign-tenant`,
                { tenantId: createdTenant.id },
                logout,
                refreshAccessToken
              ).catch(() => null);

              const moveInParsed = parseDateSafe(tMoveInDate) || new Date();
              const endDate = new Date(moveInParsed);
              endDate.setFullYear(endDate.getFullYear() + 1);
              await apiClient.post(
                '/leases',
                {
                  tenantId: createdTenant.id,
                  tenantName: `${tFirstName} ${tLastName}`.trim(),
                  propertyId: uPropId,
                  propertyName: selectedProp?.name || 'Property',
                  unitId: createdUnit.id,
                  unitNumber: uNumber.trim(),
                  rentAmount: Number(uRent) || 1500,
                  securityDeposit: Number(uDeposit) || 1500,
                  startDate: tMoveInDate,
                  endDate: endDate.toISOString().split('T')[0],
                  status: 'Active',
                },
                logout,
                refreshAccessToken
              ).catch(() => null);
            }
          } catch (tErr) {
            console.warn('Tenant creation error:', tErr.message);
          }
        }

        Alert.alert('Success', 'Unit created successfully with resident & lease!');
      }

      setIsUnitModalOpen(false);
      fetchAllData();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save unit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignTenant = async () => {
    if (!assignTenantUnit || !selectedTenantId) return;
    try {
      setSubmitting(true);
      await apiClient.post(`/units/${assignTenantUnit.id}/assign-tenant`, { tenantId: selectedTenantId }, logout, refreshAccessToken);
      Alert.alert('Success', 'Tenant assigned.');
      setAssignTenantUnit(null);
      setSelectedTenantId('');
      fetchAllData();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to assign tenant');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUnitStatus = async () => {
    if (!statusChangeUnit) return;
    try {
      setSubmitting(true);
      await apiClient.put(`/units/${statusChangeUnit.id}`, { status: newStatusValue }, logout, refreshAccessToken);
      Alert.alert('Success', 'Status updated.');
      setStatusChangeUnit(null);
      fetchAllData();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUnit = (id, number) => {
    Alert.alert('Delete Unit', `Delete Unit "${number}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await apiClient.delete(`/units/${id}`, logout, refreshAccessToken);
            fetchAllData();
          } catch (err) {
            Alert.alert('Error', err.message || 'Failed to delete unit');
            setLoading(false);
          }
        },
      },
    ]);
  };

  // --------------------------------------------------------------------------
  // RENDER LOADING
  // --------------------------------------------------------------------------
  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.mutedText} allowFontScaling={false}>Loading data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        {/* TOP BAR: TITLE + ACTION */}
        <View style={styles.topHeader}>
          <Text style={styles.screenTitle} allowFontScaling={false}>
            {activeTab === 'properties' ? 'Properties' : activeTab === 'units' ? 'Units' : 'Drafts'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {activeTab === 'properties' && (
              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: isDarkMode ? '#334155' : '#e2e8f0' }]}
                onPress={() => handleOpenAddUnit()}
                activeOpacity={0.8}
              >
                <Ionicons name="home-outline" size={14} color={colors.textPrimary} />
                <Text style={[styles.addBtnText, { color: colors.textPrimary }]} allowFontScaling={false}>
                  + Unit
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.addBtn}
              onPress={activeTab === 'units' ? () => handleOpenAddUnit() : handleOpenAddProperty}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color="#0f172a" />
              <Text style={styles.addBtnText} allowFontScaling={false}>
                {activeTab === 'units' ? 'Add Unit' : 'Add Property'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SIMPLE TABS (Properties | Units | Drafts) */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'properties' && styles.tabActive]}
            onPress={() => {
              setActiveTab('properties');
              setSearchQuery('');
            }}
          >
            <Text style={[styles.tabText, activeTab === 'properties' && styles.tabTextActive]} allowFontScaling={false}>
              Properties ({properties.filter((p) => p.status !== 'Draft' && p.status !== 'Inactive').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'units' && styles.tabActive]}
            onPress={() => {
              setActiveTab('units');
              setSearchQuery('');
            }}
          >
            <Text style={[styles.tabText, activeTab === 'units' && styles.tabTextActive]} allowFontScaling={false}>
              Units ({units.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'drafts' && styles.tabActive]}
            onPress={() => {
              setActiveTab('drafts');
              setSearchQuery('');
            }}
          >
            <Text style={[styles.tabText, activeTab === 'drafts' && styles.tabTextActive]} allowFontScaling={false}>
              Drafts ({properties.filter((p) => p.status === 'Draft').length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH INPUT */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={16} color={colors.textMuted} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={activeTab === 'units' ? 'Search by unit number or property...' : 'Search by name, address, city...'}
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            allowFontScaling={false}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* LIST VIEW */}
        <ScrollView
          style={styles.scrollList}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        >
          {/* TAB 1: PROPERTIES */}
          {activeTab === 'properties' && (
            <>
              {filteredProperties.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText} allowFontScaling={false}>No properties found</Text>
                </View>
              ) : (
                filteredProperties.map((p) => {
                  const totalUnits = p.units?.length || p.unitsCount || 0;
                  const occUnits = p.units?.filter((u) => u.status === 'Occupied').length || p.occupiedUnits || 0;
                  const revenue = p.units?.reduce((sum, u) => sum + (Number(u.rentAmount) || 0), 0) || p.monthlyRevenue || 0;
                  const ownerName = p.owner ? (typeof p.owner === 'object' ? p.owner.name : p.owner) : (owners.find((o) => o.id === p.ownerId)?.name || 'Owner');

                  return (
                    <View key={p.id} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.cardTitle} allowFontScaling={false} numberOfLines={1}>
                            {p.name}
                          </Text>
                          <Text style={styles.cardAddress} allowFontScaling={false} numberOfLines={1}>
                            {formatAddress(p.address)} · {p.type || 'Apartment'}
                          </Text>
                        </View>
                        <View style={[styles.badge, p.status === 'Active' ? styles.badgeActive : styles.badgeMuted]}>
                          <Text style={[styles.badgeText, p.status === 'Active' ? styles.badgeTextActive : styles.badgeTextMuted]} allowFontScaling={false}>
                            {p.status || 'Active'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                          <Text style={styles.infoLabel} allowFontScaling={false}>UNITS</Text>
                          <Text style={styles.infoValue} allowFontScaling={false}>{totalUnits} ({occUnits} Occ)</Text>
                        </View>
                        <View style={styles.infoItem}>
                          <Text style={styles.infoLabel} allowFontScaling={false}>REVENUE</Text>
                          <Text style={[styles.infoValue, { color: colors.success }]} allowFontScaling={false}>
                            ${Number(revenue).toLocaleString()}
                          </Text>
                        </View>
                        <View style={styles.infoItem}>
                          <Text style={styles.infoLabel} allowFontScaling={false}>OWNER</Text>
                          <Text style={styles.infoValue} allowFontScaling={false} numberOfLines={1}>{ownerName}</Text>
                        </View>
                      </View>

                      <View style={styles.cardActions}>
                        <TouchableOpacity style={styles.btnSmall} onPress={() => setSelectedProperty(p)}>
                          <Ionicons name="eye-outline" size={14} color={colors.primary} />
                          <Text style={[styles.btnSmallText, { color: colors.primary }]} allowFontScaling={false}>View</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.btnSmall} onPress={() => handleOpenAddUnit(p.id)}>
                          <Ionicons name="add-circle-outline" size={14} color={colors.primary} />
                          <Text style={[styles.btnSmallText, { color: colors.primary }]} allowFontScaling={false}>+ Unit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.btnSmall} onPress={() => handleOpenEditProperty(p)}>
                          <Ionicons name="create-outline" size={14} color={colors.textSecondary} />
                          <Text style={styles.btnSmallText} allowFontScaling={false}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.btnSmall} onPress={() => handleDeleteProperty(p.id, p.name)}>
                          <Ionicons name="trash-outline" size={14} color={colors.danger} />
                          <Text style={[styles.btnSmallText, { color: colors.danger }]} allowFontScaling={false}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </>
          )}

          {/* TAB 2: UNITS */}
          {activeTab === 'units' && (
            <>
              {filteredUnits.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText} allowFontScaling={false}>No units found</Text>
                </View>
              ) : (
                filteredUnits.map((u) => {
                  const isOcc = u.status === 'Occupied';
                  const tenantName = u.tenantName || (u.tenants?.length ? `${u.tenants[0].firstName} ${u.tenants[0].lastName}` : null);
                  const propName = u.propertyName || (u.property ? u.property.name : 'Property');

                  return (
                    <View key={u.id} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.cardTitle} allowFontScaling={false}>
                            Unit {u.unitNumber}
                          </Text>
                          <Text style={styles.cardAddress} allowFontScaling={false} numberOfLines={1}>
                            {propName} · Floor {u.floor || 1}
                          </Text>
                        </View>
                        <View style={[styles.badge, isOcc ? styles.badgeActive : styles.badgeMuted]}>
                          <Text style={[styles.badgeText, isOcc ? styles.badgeTextActive : styles.badgeTextMuted]} allowFontScaling={false}>
                            {u.status || 'Vacant'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                          <Text style={styles.infoLabel} allowFontScaling={false}>SPECS</Text>
                          <Text style={styles.infoValue} allowFontScaling={false}>{u.bedrooms || 0}B / {u.bathrooms || 0}B ({u.squareFootage || 0} sqft)</Text>
                        </View>
                        <View style={styles.infoItem}>
                          <Text style={styles.infoLabel} allowFontScaling={false}>RENT</Text>
                          <Text style={[styles.infoValue, { color: colors.success }]} allowFontScaling={false}>
                            ${(Number(u.rentAmount) || 0).toLocaleString()}
                          </Text>
                        </View>
                        <View style={styles.infoItem}>
                          <Text style={styles.infoLabel} allowFontScaling={false}>RESIDENT</Text>
                          <Text style={styles.infoValue} allowFontScaling={false} numberOfLines={1}>
                            {tenantName || 'Vacant'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.cardActions}>
                        <TouchableOpacity style={styles.btnSmall} onPress={() => setSelectedUnit(u)}>
                          <Ionicons name="eye-outline" size={14} color={colors.primary} />
                          <Text style={[styles.btnSmallText, { color: colors.primary }]} allowFontScaling={false}>View</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.btnSmall} onPress={() => handleOpenEditUnit(u)}>
                          <Ionicons name="create-outline" size={14} color={colors.textSecondary} />
                          <Text style={styles.btnSmallText} allowFontScaling={false}>Edit</Text>
                        </TouchableOpacity>

                        {!isOcc && (
                          <TouchableOpacity
                            style={styles.btnSmall}
                            onPress={() => {
                              setAssignTenantUnit(u);
                              setSelectedTenantId('');
                            }}
                          >
                            <Ionicons name="person-add-outline" size={14} color={colors.success} />
                            <Text style={[styles.btnSmallText, { color: colors.success }]} allowFontScaling={false}>Assign</Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity
                          style={styles.btnSmall}
                          onPress={() => {
                            setStatusChangeUnit(u);
                            setNewStatusValue(u.status || 'Vacant');
                          }}
                        >
                          <Ionicons name="swap-horizontal-outline" size={14} color={colors.textSecondary} />
                          <Text style={styles.btnSmallText} allowFontScaling={false}>Status</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.btnSmall} onPress={() => handleDeleteUnit(u.id, u.unitNumber)}>
                          <Ionicons name="trash-outline" size={14} color={colors.danger} />
                          <Text style={[styles.btnSmallText, { color: colors.danger }]} allowFontScaling={false}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </>
          )}

          {/* TAB 3: DRAFTS */}
          {activeTab === 'drafts' && (
            <>
              {filteredDrafts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText} allowFontScaling={false}>No draft properties</Text>
                </View>
              ) : (
                filteredDrafts.map((d) => (
                  <View key={d.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle} allowFontScaling={false}>{d.name}</Text>
                        <Text style={styles.cardAddress} allowFontScaling={false}>{formatAddress(d.address)}</Text>
                      </View>
                      <View style={[styles.badge, styles.badgeMuted]}>
                        <Text style={[styles.badgeText, styles.badgeTextMuted]} allowFontScaling={false}>Draft</Text>
                      </View>
                    </View>

                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={[styles.btnSmall, { backgroundColor: colors.primary, paddingHorizontal: 12, borderRadius: 6 }]}
                        onPress={() => handlePublishDraft(d.id, d.name)}
                      >
                        <Ionicons name="checkmark-circle-outline" size={14} color="#0f172a" />
                        <Text style={[styles.btnSmallText, { color: '#0f172a', fontWeight: '700' }]} allowFontScaling={false}>Publish</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.btnSmall} onPress={() => handleOpenEditProperty(d)}>
                        <Ionicons name="create-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.btnSmallText} allowFontScaling={false}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.btnSmall} onPress={() => handleDeleteProperty(d.id, d.name)}>
                        <Ionicons name="trash-outline" size={14} color={colors.danger} />
                        <Text style={[styles.btnSmallText, { color: colors.danger }]} allowFontScaling={false}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </>
          )}
        </ScrollView>

        {/* -------------------------------------------------------------------------- */}
        {/* VIEW PROPERTY DETAILS MODAL */}
        {/* -------------------------------------------------------------------------- */}
        <Modal visible={!!selectedProperty} animationType="slide" transparent>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle} allowFontScaling={false}>{selectedProperty?.name}</Text>
                  <Text style={styles.cardAddress} allowFontScaling={false}>{selectedProperty?.address}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedProperty(null)}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 380, marginVertical: 10 }}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey} allowFontScaling={false}>Type</Text>
                  <Text style={styles.detailVal} allowFontScaling={false}>{selectedProperty?.type || 'Apartment'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey} allowFontScaling={false}>Status</Text>
                  <Text style={styles.detailVal} allowFontScaling={false}>{selectedProperty?.status || 'Active'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey} allowFontScaling={false}>Total Units</Text>
                  <Text style={styles.detailVal} allowFontScaling={false}>{selectedProperty?.totalUnits || selectedProperty?.unitsCount || 0}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey} allowFontScaling={false}>Occupancy</Text>
                  <Text style={styles.detailVal} allowFontScaling={false}>{selectedProperty?.occupancyRate || 0}%</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey} allowFontScaling={false}>Monthly Revenue</Text>
                  <Text style={[styles.detailVal, { color: colors.success }]} allowFontScaling={false}>
                    ${Number(selectedProperty?.monthlyRevenue || 0).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey} allowFontScaling={false}>NYC BIN #</Text>
                  <Text style={styles.detailVal} allowFontScaling={false}>{selectedProperty?.nycBin || selectedProperty?.bin || 'N/A'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey} allowFontScaling={false}>Owner</Text>
                  <Text style={styles.detailVal} allowFontScaling={false}>
                    {selectedProperty?.owner ? (typeof selectedProperty.owner === 'object' ? selectedProperty.owner.name : selectedProperty.owner) : 'Owner'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey} allowFontScaling={false}>Year Built</Text>
                  <Text style={styles.detailVal} allowFontScaling={false}>{selectedProperty?.yearBuilt || 2020}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey} allowFontScaling={false}>Square Footage</Text>
                  <Text style={styles.detailVal} allowFontScaling={false}>{Number(selectedProperty?.squareFootage || 8500).toLocaleString()} sqft</Text>
                </View>
              </ScrollView>

              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedProperty(null)}>
                <Text style={styles.closeBtnText} allowFontScaling={false}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* -------------------------------------------------------------------------- */}
        {/* VIEW UNIT DETAILS MODAL */}
        {/* -------------------------------------------------------------------------- */}
        <Modal visible={!!selectedUnit} animationType="slide" transparent>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle} allowFontScaling={false}>Unit {selectedUnit?.unitNumber}</Text>
                  <Text style={styles.cardAddress} allowFontScaling={false}>{selectedUnit?.propertyName || 'Property'}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedUnit(null)}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 380, marginVertical: 10 }}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey} allowFontScaling={false}>Status</Text>
                  <Text style={styles.detailVal} allowFontScaling={false}>{selectedUnit?.status || 'Vacant'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey} allowFontScaling={false}>Monthly Rent</Text>
                  <Text style={[styles.detailVal, { color: colors.success }]} allowFontScaling={false}>
                    ${(Number(selectedUnit?.rentAmount) || 0).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey} allowFontScaling={false}>Security Deposit</Text>
                  <Text style={styles.detailVal} allowFontScaling={false}>
                    ${(Number(selectedUnit?.securityDeposit) || 0).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey} allowFontScaling={false}>Bedrooms / Bathrooms</Text>
                  <Text style={styles.detailVal} allowFontScaling={false}>{selectedUnit?.bedrooms || 0} Beds / {selectedUnit?.bathrooms || 0} Baths</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey} allowFontScaling={false}>Square Footage</Text>
                  <Text style={styles.detailVal} allowFontScaling={false}>{selectedUnit?.squareFootage || 0} sqft</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey} allowFontScaling={false}>Floor</Text>
                  <Text style={styles.detailVal} allowFontScaling={false}>Floor {selectedUnit?.floor || 1}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailKey} allowFontScaling={false}>Resident</Text>
                  <Text style={styles.detailVal} allowFontScaling={false}>
                    {selectedUnit?.tenantName || (selectedUnit?.tenants?.length ? `${selectedUnit.tenants[0].firstName} ${selectedUnit.tenants[0].lastName}` : 'Vacant')}
                  </Text>
                </View>
              </ScrollView>

              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedUnit(null)}>
                <Text style={styles.closeBtnText} allowFontScaling={false}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* -------------------------------------------------------------------------- */}
        {/* ASSIGN TENANT MODAL */}
        {/* -------------------------------------------------------------------------- */}
        <Modal visible={!!assignTenantUnit} animationType="fade" transparent>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle} allowFontScaling={false}>Assign Tenant to Unit {assignTenantUnit?.unitNumber}</Text>
              <Text style={[styles.cardAddress, { marginTop: 4 }]} allowFontScaling={false}>Select tenant:</Text>

              <ScrollView style={{ maxHeight: 200, marginVertical: 10 }}>
                {tenants.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.pickerRow, selectedTenantId === t.id && styles.pickerRowSelected]}
                    onPress={() => setSelectedTenantId(t.id)}
                  >
                    <Text style={styles.detailVal} allowFontScaling={false}>{t.firstName} {t.lastName}</Text>
                    {selectedTenantId === t.id && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setAssignTenantUnit(null)}>
                  <Text style={styles.cancelBtnText} allowFontScaling={false}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleAssignTenant} disabled={submitting}>
                  <Text style={styles.submitBtnText} allowFontScaling={false}>Assign</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* -------------------------------------------------------------------------- */}
        {/* STATUS CHANGE MODAL */}
        {/* -------------------------------------------------------------------------- */}
        <Modal visible={!!statusChangeUnit} animationType="fade" transparent>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle} allowFontScaling={false}>Change Status — Unit {statusChangeUnit?.unitNumber}</Text>
              <View style={{ marginVertical: 10 }}>
                {UNIT_STATUSES.map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.pickerRow, newStatusValue === st && styles.pickerRowSelected]}
                    onPress={() => setNewStatusValue(st)}
                  >
                    <Text style={styles.detailVal} allowFontScaling={false}>{st}</Text>
                    {newStatusValue === st && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setStatusChangeUnit(null)}>
                  <Text style={styles.cancelBtnText} allowFontScaling={false}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleUpdateUnitStatus} disabled={submitting}>
                  <Text style={styles.submitBtnText} allowFontScaling={false}>Update</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>



        {/* -------------------------------------------------------------------------- */}
        {/* ADD / EDIT PROPERTY MODAL (Web 1:1 Matching) */}
        {/* -------------------------------------------------------------------------- */}
        <Modal visible={isPropModalOpen} animationType="slide" transparent>
          <KeyboardAvoidingView
            style={styles.modalBackdrop}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={[styles.modalCard, styles.propFullModalCard]}>
              {/* Header Matching Web */}
              <View style={styles.propHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.propMainTitle} allowFontScaling={false}>
                    {editingPropId ? 'Edit Property' : 'Add Property'}
                  </Text>
                  <Text style={styles.propSubtitle} allowFontScaling={false}>
                    Register a new property asset in your management ledger.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsPropModalOpen(false)}
                  style={styles.propCloseBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={22} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Form Content */}
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 24, paddingTop: 4 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* PROPERTY NAME */}
                <View style={styles.formGroup}>
                  <Text style={styles.fieldLabel} allowFontScaling={false}>
                    PROPERTY NAME <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.propInput, formErrors.name && styles.propInputError]}
                    placeholder="Oakridge Heights"
                    placeholderTextColor={colors.placeholder}
                    value={pName}
                    onChangeText={setPName}
                    allowFontScaling={false}
                  />
                  {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
                </View>

                {/* PROPERTY TYPE & STATUS (2 Columns) */}
                <View style={styles.twoColRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel} allowFontScaling={false}>
                      PROPERTY TYPE <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.propSelectTrigger}
                      onPress={() => setActivePropDropdown('type')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.propSelectValue} numberOfLines={1} allowFontScaling={false}>
                        {pType || 'Apartment'}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel} allowFontScaling={false}>
                      STATUS <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.propSelectTrigger}
                      onPress={() => setActivePropDropdown('status')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.propSelectValue} numberOfLines={1} allowFontScaling={false}>
                        {pStatus || 'Active'}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* STREET ADDRESS */}
                <View style={styles.formGroup}>
                  <Text style={styles.fieldLabel} allowFontScaling={false}>
                    STREET ADDRESS <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.propInput}
                    placeholder="124 Oakridge Blvd"
                    placeholderTextColor={colors.placeholder}
                    value={pStreet}
                    onChangeText={setPStreet}
                    allowFontScaling={false}
                  />
                </View>

                {/* CITY & STATE (2 Columns) */}
                <View style={styles.twoColRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel} allowFontScaling={false}>
                      CITY <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.propInput}
                      placeholder="Austin"
                      placeholderTextColor={colors.placeholder}
                      value={pCity}
                      onChangeText={setPCity}
                      allowFontScaling={false}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel} allowFontScaling={false}>
                      STATE <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.propInput}
                      placeholder="TX"
                      placeholderTextColor={colors.placeholder}
                      value={pState}
                      onChangeText={setPState}
                      allowFontScaling={false}
                    />
                  </View>
                </View>

                {/* COUNTRY & ZIP CODE (2 Columns) */}
                <View style={styles.twoColRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel} allowFontScaling={false}>
                      COUNTRY <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.propInput}
                      placeholder="USA"
                      placeholderTextColor={colors.placeholder}
                      value={pCountry}
                      onChangeText={setPCountry}
                      allowFontScaling={false}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel} allowFontScaling={false}>
                      ZIP CODE <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.propInput}
                      placeholder="78701"
                      placeholderTextColor={colors.placeholder}
                      value={pZip}
                      onChangeText={setPZip}
                      allowFontScaling={false}
                    />
                  </View>
                </View>

                {/* NYC BIN (BUILDING ID) (OPTIONAL) */}
                <View style={styles.formGroup}>
                  <Text style={styles.fieldLabel} allowFontScaling={false}>
                    NYC BIN (BUILDING ID) <Text style={styles.optionalTag}>(OPTIONAL)</Text>
                  </Text>
                  <TextInput
                    style={styles.propInput}
                    placeholder="e.g. 1000000"
                    placeholderTextColor={colors.placeholder}
                    value={pNycBin}
                    onChangeText={setPNycBin}
                    allowFontScaling={false}
                  />
                </View>

                {/* TOTAL FLOORS & TOTAL UNITS (2 Columns) */}
                <View style={styles.twoColRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel} allowFontScaling={false}>TOTAL FLOORS</Text>
                    <TextInput
                      style={styles.propInput}
                      keyboardType="numeric"
                      placeholder="1"
                      placeholderTextColor={colors.placeholder}
                      value={pFloors}
                      onChangeText={setPFloors}
                      allowFontScaling={false}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel} allowFontScaling={false}>TOTAL UNITS</Text>
                    <TextInput
                      style={styles.propInput}
                      keyboardType="numeric"
                      placeholder="1"
                      placeholderTextColor={colors.placeholder}
                      value={pUnitsCount}
                      onChangeText={setPUnitsCount}
                      allowFontScaling={false}
                    />
                  </View>
                </View>

                {/* OWNER WITH + ADD OWNER */}
                <View style={styles.formGroup}>
                  <View style={styles.fieldLabelRow}>
                    <Text style={styles.fieldLabel} allowFontScaling={false}>
                      OWNER <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <TouchableOpacity
                      onPress={() => setIsQuickAddOwnerOpen(true)}
                      style={styles.addOwnerLink}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={13} color="#2563eb" />
                      <Text style={styles.addOwnerLinkText} allowFontScaling={false}>Add Owner</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.propSelectTrigger}
                    onPress={() => setActivePropDropdown('owner')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.propSelectValue} numberOfLines={1} allowFontScaling={false}>
                      {owners.find((o) => o.id === pOwnerId)?.name || 'Select Owner...'}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {/* OWNERSHIP PERCENTAGE (%) & MANAGEMENT COMPANY (2 Columns) */}
                <View style={styles.twoColRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel} allowFontScaling={false}>
                      OWNERSHIP PERCENTAGE (%) <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.propInput}
                      keyboardType="numeric"
                      placeholder="100"
                      placeholderTextColor={colors.placeholder}
                      value={pShare}
                      onChangeText={setPShare}
                      allowFontScaling={false}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel} allowFontScaling={false}>MANAGEMENT COMPANY</Text>
                    <TextInput
                      style={styles.propInput}
                      placeholder="Enter management company name"
                      placeholderTextColor={colors.placeholder}
                      value={pManagementCompany}
                      onChangeText={setPManagementCompany}
                      allowFontScaling={false}
                    />
                  </View>
                </View>

                {/* PAYMENT INTEGRATION & MERCHANT ACCOUNT CARD */}
                <View style={styles.propPaymentBox}>
                  <View style={styles.propPaymentHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                      <Ionicons name="card" size={16} color="#2563eb" />
                      <Text style={styles.propPaymentTitle} allowFontScaling={false}>
                        PAYMENT INTEGRATION & MERCHANT ACCOUNT
                      </Text>
                    </View>
                    <View style={styles.companyDefaultBadge}>
                      <Ionicons name="checkmark-circle-outline" size={12} color="#059669" />
                      <Text style={styles.companyDefaultBadgeText} allowFontScaling={false}>
                        Company Default (Option 2 Fallback)
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.propPaymentSubtitle} allowFontScaling={false}>
                    Configure property-specific payment gateway to receive tenant rent in this account, or use Company Default as fallback.
                  </Text>

                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.propPaymentLabel} allowFontScaling={false}>
                      PAYMENT PROVIDER / ACCOUNT DESTINATION
                    </Text>
                    <TouchableOpacity
                      style={styles.propPaymentDropdown}
                      onPress={() => setActivePropDropdown('paymentProvider')}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                        <Ionicons name="business-outline" size={15} color={colors.textSecondary} />
                        <Text style={styles.propPaymentDropdownVal} numberOfLines={1} allowFontScaling={false}>
                          {pPaymentProvider}
                        </Text>
                      </View>
                      <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                    <Text style={styles.propPaymentHint} allowFontScaling={false}>
                      Tenant rent for this property will flow through the global gateway configured under Company Settings.
                    </Text>
                  </View>
                </View>

                {/* ADDITIONAL DETAILS (OPTIONAL) ACCORDION */}
                <View style={styles.propAccordionBox}>
                  <TouchableOpacity
                    style={styles.propAccordionHeader}
                    onPress={() => setShowPropAdditional(!showPropAdditional)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.propAccordionTitle} allowFontScaling={false}>
                        ADDITIONAL DETAILS <Text style={styles.optionalTag}>(OPTIONAL)</Text>
                      </Text>
                      <Text style={styles.propAccordionSub} allowFontScaling={false}>
                        Financial Valuation, Property Photo & Documents
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={styles.propAccordionToggleText} allowFontScaling={false}>
                        {showPropAdditional ? 'Hide Details' : 'Show Details'}
                      </Text>
                      <Ionicons
                        name={showPropAdditional ? 'chevron-up' : 'chevron-down'}
                        size={15}
                        color="#2563eb"
                      />
                    </View>
                  </TouchableOpacity>

                  {showPropAdditional && (
                    <View style={styles.propAccordionBody}>
                      {/* YEAR BUILT & SQUARE FOOTAGE */}
                      <View style={styles.twoColRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.fieldLabel} allowFontScaling={false}>YEAR BUILT</Text>
                          <TextInput
                            style={styles.propInput}
                            keyboardType="numeric"
                            placeholder="2020"
                            placeholderTextColor={colors.placeholder}
                            value={pYearBuilt}
                            onChangeText={setPYearBuilt}
                            allowFontScaling={false}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.fieldLabel} allowFontScaling={false}>SQUARE FOOTAGE (SQFT)</Text>
                          <TextInput
                            style={styles.propInput}
                            keyboardType="numeric"
                            placeholder="8500"
                            placeholderTextColor={colors.placeholder}
                            value={pSqft}
                            onChangeText={setPSqft}
                            allowFontScaling={false}
                          />
                        </View>
                      </View>

                      {/* PURCHASE PRICE & CURRENT VALUATION */}
                      <View style={styles.twoColRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.fieldLabel} allowFontScaling={false}>PURCHASE PRICE ($)</Text>
                          <TextInput
                            style={styles.propInput}
                            keyboardType="numeric"
                            placeholder="1800000"
                            placeholderTextColor={colors.placeholder}
                            value={pPurchasePrice}
                            onChangeText={setPPurchasePrice}
                            allowFontScaling={false}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.fieldLabel} allowFontScaling={false}>CURRENT VALUATION ($)</Text>
                          <TextInput
                            style={styles.propInput}
                            keyboardType="numeric"
                            placeholder="2200000"
                            placeholderTextColor={colors.placeholder}
                            value={pCurrentValue}
                            onChangeText={setPCurrentValue}
                            allowFontScaling={false}
                          />
                        </View>
                      </View>

                      {/* MONTHLY EXPENSES */}
                      <View style={styles.formGroup}>
                        <Text style={styles.fieldLabel} allowFontScaling={false}>MONTHLY EXPENSES ($)</Text>
                        <TextInput
                          style={styles.propInput}
                          keyboardType="numeric"
                          placeholder="4500"
                          placeholderTextColor={colors.placeholder}
                          value={pExpenses}
                          onChangeText={setPExpenses}
                          allowFontScaling={false}
                        />
                      </View>

                      {/* PROPERTY PHOTO URL */}
                      <View style={styles.formGroup}>
                        <Text style={styles.fieldLabel} allowFontScaling={false}>PROPERTY PHOTO URL</Text>
                        <TextInput
                          style={styles.propInput}
                          placeholder="https://images.unsplash.com/photo-..."
                          placeholderTextColor={colors.placeholder}
                          value={pPhotoUrl}
                          onChangeText={setPPhotoUrl}
                          allowFontScaling={false}
                        />
                      </View>

                      {/* NOTES / DESCRIPTION */}
                      <View style={styles.formGroup}>
                        <Text style={styles.fieldLabel} allowFontScaling={false}>NOTES / DESCRIPTION</Text>
                        <TextInput
                          style={[styles.propInput, { minHeight: 60, textAlignVertical: 'top' }]}
                          multiline
                          numberOfLines={3}
                          placeholder="Property amenities, ledger notes, or details..."
                          placeholderTextColor={colors.placeholder}
                          value={pNotes}
                          onChangeText={setPNotes}
                          allowFontScaling={false}
                        />
                      </View>
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* FOOTER ACTIONS MATCHING WEB */}
              <View style={styles.propFooterBar}>
                <TouchableOpacity
                  style={styles.propCancelBtn}
                  onPress={() => setIsPropModalOpen(false)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back-outline" size={15} color={colors.textSecondary} />
                  <Text style={styles.propCancelBtnText} allowFontScaling={false}>Cancel</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <TouchableOpacity
                    style={styles.propDraftBtn}
                    onPress={() => handleSaveProperty(true)}
                    disabled={submitting}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.propDraftBtnText} allowFontScaling={false}>Save Draft</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.propSubmitBtn}
                    onPress={() => handleSaveProperty(false)}
                    disabled={submitting}
                    activeOpacity={0.8}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.propSubmitBtnText} allowFontScaling={false}>
                        {editingPropId ? 'Update Property' : 'Create Property'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* DROPDOWN SELECTOR MODAL FOR PROPERTY FORM */}
        <Modal visible={!!activePropDropdown} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setActivePropDropdown(null)}
          >
            <View style={[styles.modalCard, { maxHeight: 380, width: '90%', alignSelf: 'center' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle} allowFontScaling={false}>
                  {activePropDropdown === 'type'
                    ? 'Select Property Type'
                    : activePropDropdown === 'status'
                    ? 'Select Status'
                    : activePropDropdown === 'owner'
                    ? 'Select Owner'
                    : 'Select Payment Provider'}
                </Text>
                <TouchableOpacity onPress={() => setActivePropDropdown(null)}>
                  <Ionicons name="close" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ marginVertical: 8 }} showsVerticalScrollIndicator={false}>
                {activePropDropdown === 'type' &&
                  PROPERTY_TYPES.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.pickerRow, pType === t && styles.pickerRowSelected]}
                      onPress={() => {
                        setPType(t);
                        setActivePropDropdown(null);
                      }}
                    >
                      <Text style={[styles.detailVal, pType === t && { color: colors.primary }]} allowFontScaling={false}>
                        {t}
                      </Text>
                      {pType === t && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                    </TouchableOpacity>
                  ))}

                {activePropDropdown === 'status' &&
                  PROPERTY_STATUSES.map((st) => (
                    <TouchableOpacity
                      key={st}
                      style={[styles.pickerRow, pStatus === st && styles.pickerRowSelected]}
                      onPress={() => {
                        setPStatus(st);
                        setActivePropDropdown(null);
                      }}
                    >
                      <Text style={[styles.detailVal, pStatus === st && { color: colors.primary }]} allowFontScaling={false}>
                        {st}
                      </Text>
                      {pStatus === st && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                    </TouchableOpacity>
                  ))}

                {activePropDropdown === 'owner' && (
                  <>
                    {owners.length === 0 ? (
                      <View style={{ padding: 16, alignItems: 'center' }}>
                        <Text style={{ color: colors.textMuted, fontSize: 13 }} allowFontScaling={false}>
                          No owners found. Please add an owner.
                        </Text>
                      </View>
                    ) : (
                      owners.map((o) => (
                        <TouchableOpacity
                          key={o.id}
                          style={[styles.pickerRow, pOwnerId === o.id && styles.pickerRowSelected]}
                          onPress={() => {
                            setPOwnerId(o.id);
                            setActivePropDropdown(null);
                          }}
                        >
                          <View>
                            <Text style={[styles.detailVal, pOwnerId === o.id && { color: colors.primary }]} allowFontScaling={false}>
                              {o.name || `${o.firstName || ''} ${o.lastName || ''}`.trim() || 'Owner'}
                            </Text>
                            {o.email && (
                              <Text style={{ fontSize: 11, color: colors.textMuted }} allowFontScaling={false}>
                                {o.email}
                              </Text>
                            )}
                          </View>
                          {pOwnerId === o.id && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                        </TouchableOpacity>
                      ))
                    )}
                    <TouchableOpacity
                      style={[styles.closeBtn, { backgroundColor: '#2563eb', marginTop: 10 }]}
                      onPress={() => {
                        setActivePropDropdown(null);
                        setIsQuickAddOwnerOpen(true);
                      }}
                    >
                      <Text style={[styles.closeBtnText, { color: '#ffffff', fontWeight: '700' }]} allowFontScaling={false}>
                        + Add New Owner
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {activePropDropdown === 'paymentProvider' &&
                  PAYMENT_PROVIDERS.map((pr) => (
                    <TouchableOpacity
                      key={pr}
                      style={[styles.pickerRow, pPaymentProvider === pr && styles.pickerRowSelected]}
                      onPress={() => {
                        setPPaymentProvider(pr);
                        setActivePropDropdown(null);
                      }}
                    >
                      <Text style={[styles.detailVal, pPaymentProvider === pr && { color: colors.primary }]} allowFontScaling={false}>
                        {pr}
                      </Text>
                      {pPaymentProvider === pr && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* QUICK ADD OWNER MODAL */}
        <Modal visible={isQuickAddOwnerOpen} transparent animationType="fade">
          <KeyboardAvoidingView
            style={styles.modalBackdrop}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={[styles.modalCard, { width: '92%', alignSelf: 'center' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle} allowFontScaling={false}>Quick Add Owner</Text>
                <TouchableOpacity onPress={() => setIsQuickAddOwnerOpen(false)}>
                  <Ionicons name="close" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={{ marginVertical: 12 }}>
                <Text style={styles.fieldLabel} allowFontScaling={false}>
                  FULL NAME <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.propInput}
                  placeholder="e.g. John Smith"
                  placeholderTextColor={colors.placeholder}
                  value={newOwnerFullName}
                  onChangeText={setNewOwnerFullName}
                  allowFontScaling={false}
                />

                <Text style={[styles.fieldLabel, { marginTop: 10 }]} allowFontScaling={false}>
                  EMAIL <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.propInput}
                  placeholder="e.g. john@example.com"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={newOwnerEmail}
                  onChangeText={setNewOwnerEmail}
                  allowFontScaling={false}
                />

                <Text style={[styles.fieldLabel, { marginTop: 10 }]} allowFontScaling={false}>
                  PHONE NUMBER
                </Text>
                <TextInput
                  style={styles.propInput}
                  placeholder="e.g. (512) 555-0199"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="phone-pad"
                  value={newOwnerPhone}
                  onChangeText={setNewOwnerPhone}
                  allowFontScaling={false}
                />
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setIsQuickAddOwnerOpen(false)}
                >
                  <Text style={styles.cancelBtnText} allowFontScaling={false}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: '#2563eb' }]}
                  onPress={handleQuickAddOwner}
                  disabled={creatingOwner}
                >
                  {creatingOwner ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={[styles.submitBtnText, { color: '#ffffff' }]} allowFontScaling={false}>
                      Add Owner
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* -------------------------------------------------------------------------- */}
        {/* ADD / EDIT UNIT MODAL WITH FULL OCCUPIED ONBOARDING & MONTHLY BILLING STATUS */}
        {/* -------------------------------------------------------------------------- */}
        <Modal visible={isUnitModalOpen} animationType="slide" transparent>
          <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.modalCard, { maxHeight: '92%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle} allowFontScaling={false}>
                  {editingUnitId ? 'Edit Unit' : 'Add Unit'}
                </Text>
                <TouchableOpacity onPress={() => setIsUnitModalOpen(false)}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ marginVertical: 10 }} showsVerticalScrollIndicator={false}>
                {/* Property Selection */}
                <Text style={styles.inputLabel} allowFontScaling={false}>Property *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
                  {properties.map((p) => (
                    <TouchableOpacity key={p.id} style={[styles.chip, uPropId === p.id && styles.chipActive]} onPress={() => setUPropId(p.id)}>
                      <Text style={[styles.chipText, uPropId === p.id && styles.chipTextActive]} allowFontScaling={false}>{p.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {formErrors.propertyId && <Text style={styles.errorText}>{formErrors.propertyId}</Text>}

                {/* Unit Number & Floor */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel} allowFontScaling={false}>Unit Number *</Text>
                    <TextInput style={styles.input} placeholder="101" placeholderTextColor={colors.placeholder} value={uNumber} onChangeText={setUNumber} allowFontScaling={false} />
                    {formErrors.unitNumber && <Text style={styles.errorText}>{formErrors.unitNumber}</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel} allowFontScaling={false}>Floor</Text>
                    <TextInput style={styles.input} keyboardType="numeric" placeholder="1" placeholderTextColor={colors.placeholder} value={uFloor} onChangeText={setUFloor} allowFontScaling={false} />
                  </View>
                </View>

                {/* Beds & Baths */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel} allowFontScaling={false}>Bedrooms</Text>
                    <TextInput style={styles.input} keyboardType="numeric" placeholder="2" placeholderTextColor={colors.placeholder} value={uBeds} onChangeText={setUBeds} allowFontScaling={false} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel} allowFontScaling={false}>Bathrooms</Text>
                    <TextInput style={styles.input} keyboardType="numeric" placeholder="2" placeholderTextColor={colors.placeholder} value={uBaths} onChangeText={setUBaths} allowFontScaling={false} />
                  </View>
                </View>

                {/* Rent & Deposit */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel} allowFontScaling={false}>Monthly Rent ($) *</Text>
                    <TextInput style={styles.input} keyboardType="numeric" placeholder="1500" placeholderTextColor={colors.placeholder} value={uRent} onChangeText={setURent} allowFontScaling={false} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel} allowFontScaling={false}>Security Deposit ($)</Text>
                    <TextInput style={styles.input} keyboardType="numeric" placeholder="1500" placeholderTextColor={colors.placeholder} value={uDeposit} onChangeText={setUDeposit} allowFontScaling={false} />
                  </View>
                </View>

                {/* Status Selection */}
                <Text style={[styles.inputLabel, { marginTop: 12 }]} allowFontScaling={false}>Status *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                  {UNIT_STATUSES.map((st) => (
                    <TouchableOpacity
                      key={st}
                      style={[styles.chip, uStatus === st && styles.chipActive]}
                      onPress={() => setUStatus(st)}
                    >
                      <Text style={[styles.chipText, uStatus === st && styles.chipTextActive]} allowFontScaling={false}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* LATE FEE & GRACE PERIOD (Matching Web Screenshot) */}
                <View style={styles.sectionBox}>
                  <TouchableOpacity
                    style={styles.toggleRow}
                    onPress={() => setULateFeeEnabled(!uLateFeeEnabled)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sectionBoxTitle} allowFontScaling={false}>LATE FEE & GRACE PERIOD (OPTIONAL)</Text>
                      <Text style={styles.cardAddress} allowFontScaling={false}>Set automated overdue penalty rules specifically for this unit</Text>
                    </View>
                    <View style={[styles.toggleBadge, uLateFeeEnabled && styles.toggleBadgeActive]}>
                      <Text style={[styles.toggleBadgeText, uLateFeeEnabled && styles.toggleBadgeTextActive]} allowFontScaling={false}>
                        {uLateFeeEnabled ? 'Enabled' : 'Disabled'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {uLateFeeEnabled && (
                    <View style={{ marginTop: 8 }}>
                      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                        <TouchableOpacity
                          style={[styles.chip, uLateFeeType === 'FLAT' && styles.chipActive]}
                          onPress={() => setULateFeeType('FLAT')}
                        >
                          <Text style={[styles.chipText, uLateFeeType === 'FLAT' && styles.chipTextActive]} allowFontScaling={false}>Flat ($)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.chip, uLateFeeType === 'PERCENTAGE' && styles.chipActive]}
                          onPress={() => setULateFeeType('PERCENTAGE')}
                        >
                          <Text style={[styles.chipText, uLateFeeType === 'PERCENTAGE' && styles.chipTextActive]} allowFontScaling={false}>Percentage (%)</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.inputLabel} allowFontScaling={false}>Fee Amount</Text>
                          <TextInput style={styles.input} keyboardType="numeric" placeholder="50" placeholderTextColor={colors.placeholder} value={uLateFeeAmount} onChangeText={setULateFeeAmount} allowFontScaling={false} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.inputLabel} allowFontScaling={false}>Grace Days</Text>
                          <TextInput style={styles.input} keyboardType="numeric" placeholder="5" placeholderTextColor={colors.placeholder} value={uLateFeeGraceDays} onChangeText={setULateFeeGraceDays} allowFontScaling={false} />
                        </View>
                      </View>
                    </View>
                  )}
                </View>

                {/* ------------------------------------------------------------------ */}
                {/* OCCUPIED TENANT ONBOARDING SECTION (Matching Web Screenshots 1:1) */}
                {/* ------------------------------------------------------------------ */}
                {uStatus === 'Occupied' && (
                  <View style={[styles.sectionBox, { borderColor: colors.primary, marginTop: 12 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={[styles.sectionBoxTitle, { color: colors.primary }]} allowFontScaling={false}>
                        OCCUPIED TENANT INFORMATION
                      </Text>
                      <View style={[styles.badge, styles.badgeActive]}>
                        <Text style={[styles.badgeText, styles.badgeTextActive]} allowFontScaling={false}>ACTIVE RESIDENT</Text>
                      </View>
                    </View>
                    <Text style={styles.cardAddress} allowFontScaling={false}>
                      Register existing resident details to auto-generate lease & completed move-in
                    </Text>

                    {/* PERSONAL INFORMATION */}
                    <Text style={[styles.subSectionHeader, { marginTop: 14 }]} allowFontScaling={false}>
                      PERSONAL INFORMATION
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel} allowFontScaling={false}>FIRST NAME *</Text>
                        <TextInput style={styles.input} placeholder="John" placeholderTextColor={colors.placeholder} value={tFirstName} onChangeText={setTFirstName} allowFontScaling={false} />
                        {formErrors.tFirstName && <Text style={styles.errorText}>{formErrors.tFirstName}</Text>}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel} allowFontScaling={false}>LAST NAME *</Text>
                        <TextInput style={styles.input} placeholder="Doe" placeholderTextColor={colors.placeholder} value={tLastName} onChangeText={setTLastName} allowFontScaling={false} />
                        {formErrors.tLastName && <Text style={styles.errorText}>{formErrors.tLastName}</Text>}
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel} allowFontScaling={false}>PREFERRED NAME</Text>
                        <TextInput style={styles.input} placeholder="Johnny" placeholderTextColor={colors.placeholder} value={tPreferredName} onChangeText={setTPreferredName} allowFontScaling={false} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel} allowFontScaling={false}>GENDER</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {GENDERS.map((g) => (
                            <TouchableOpacity key={g} style={[styles.chip, normalizeGender(tGender) === g && styles.chipActive]} onPress={() => setTGender(g)}>
                              <Text style={[styles.chipText, normalizeGender(tGender) === g && styles.chipTextActive]} allowFontScaling={false}>{g}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </View>

                    <View style={{ marginTop: 8 }}>
                      <Text style={styles.inputLabel} allowFontScaling={false}>DATE OF BIRTH (YYYY-MM-DD)</Text>
                      <TouchableOpacity
                        style={styles.datePickerBtn}
                        onPress={() => setShowDobPicker(true)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.datePickerBtnText, !tDob && { color: colors.placeholder }]} allowFontScaling={false}>
                          {tDob || '1990-05-15'}
                        </Text>
                        <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                      </TouchableOpacity>
                      <CustomDatePicker
                        visible={showDobPicker}
                        value={tDob || '1990-05-15'}
                        onSelect={(date) => setTDob(date)}
                        onClose={() => setShowDobPicker(false)}
                      />
                    </View>

                    {/* CONTACT & TENANT PORTAL CREDENTIALS (Matches Web Screenshot 1:1) */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                      <Text style={styles.subSectionHeader} allowFontScaling={false}>
                        CONTACT & TENANT PORTAL CREDENTIALS
                      </Text>
                      <TouchableOpacity onPress={() => Alert.alert('Tenant Portal', 'Resident will receive credentials to login to the Tenant Portal.')}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: colors.primary, letterSpacing: 0.3 }} allowFontScaling={false}>
                          DASHBOARD ACCESS SETUP
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={{ marginTop: 6 }}>
                      <Text style={styles.inputLabel} allowFontScaling={false}>EMAIL ADDRESS *</Text>
                      <TextInput style={styles.input} keyboardType="email-address" placeholder="john.doe@example.com" placeholderTextColor={colors.placeholder} value={tEmail} onChangeText={setTEmail} autoCapitalize="none" allowFontScaling={false} />
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel} allowFontScaling={false}>MOBILE PHONE *</Text>
                        <TextInput style={styles.input} keyboardType="phone-pad" placeholder="(512) 555-0199" placeholderTextColor={colors.placeholder} value={tPhone} onChangeText={setTPhone} allowFontScaling={false} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inputLabel} allowFontScaling={false}>ALTERNATE PHONE</Text>
                        <TextInput style={styles.input} keyboardType="phone-pad" placeholder="(512) 555-4321" placeholderTextColor={colors.placeholder} value={tAltPhone} onChangeText={setTAltPhone} allowFontScaling={false} />
                      </View>
                    </View>
                    {formErrors.tContact && <Text style={styles.errorText}>{formErrors.tContact}</Text>}

                    <View style={{ marginTop: 8 }}>
                      <Text style={styles.inputLabel} allowFontScaling={false}>TENANT PASSWORD *</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput
                          style={[styles.input, { flex: 1 }]}
                          secureTextEntry={!tShowPassword}
                          placeholder="••••••"
                          placeholderTextColor={colors.placeholder}
                          value={tPassword}
                          onChangeText={setTPassword}
                          allowFontScaling={false}
                        />
                        <TouchableOpacity style={{ padding: 8 }} onPress={() => setTShowPassword(!tShowPassword)}>
                          <Ionicons name={tShowPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* TENANCY DATES & OUTSTANDING BALANCE (Matches Web Screenshot 1:1) */}
                    <Text style={[styles.subSectionHeader, { marginTop: 14 }]} allowFontScaling={false}>
                      TENANCY DATES & OUTSTANDING BALANCE
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <Ionicons name="calendar-outline" size={13} color={colors.primary} style={{ marginRight: 4 }} />
                          <Text style={[styles.inputLabel, { marginBottom: 0 }]} allowFontScaling={false}>MOVE-IN DATE *</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.datePickerBtn}
                          onPress={() => setShowMoveInPicker(true)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.datePickerBtnText, !tMoveInDate && { color: colors.placeholder }]} allowFontScaling={false}>
                            {tMoveInDate || '2026-01-23'}
                          </Text>
                          <Ionicons name="calendar" size={16} color={colors.primary} />
                        </TouchableOpacity>
                        <Text style={styles.helperText} allowFontScaling={false}>Date tenant resides from</Text>
                        <CustomDatePicker
                          visible={showMoveInPicker}
                          value={tMoveInDate || '2026-01-23'}
                          onSelect={(date) => {
                            setTMoveInDate(date);
                            if (!tInvoiceStartDate || tInvoiceStartDate === tMoveInDate) {
                              setTInvoiceStartDate(date);
                            }
                          }}
                          onClose={() => setShowMoveInPicker(false)}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <Ionicons name="calendar-outline" size={13} color={colors.primary} style={{ marginRight: 4 }} />
                          <Text style={[styles.inputLabel, { marginBottom: 0 }]} allowFontScaling={false}>INVOICES FROM DATE *</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.datePickerBtn}
                          onPress={() => setShowInvoiceStartPicker(true)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.datePickerBtnText, !tInvoiceStartDate && { color: colors.placeholder }]} allowFontScaling={false}>
                            {tInvoiceStartDate || tMoveInDate || '2026-01-21'}
                          </Text>
                          <Ionicons name="calendar" size={16} color={colors.primary} />
                        </TouchableOpacity>
                        <Text style={styles.helperText} allowFontScaling={false}>Date to start generating invoices from</Text>
                        <CustomDatePicker
                          visible={showInvoiceStartPicker}
                          value={tInvoiceStartDate || tMoveInDate || '2026-01-21'}
                          onSelect={(date) => setTInvoiceStartDate(date)}
                          onClose={() => setShowInvoiceStartPicker(false)}
                        />
                      </View>
                    </View>

                    <View style={{ marginTop: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ fontSize: 13, color: '#f59e0b', fontWeight: 'bold', marginRight: 4 }}>$</Text>
                        <Text style={[styles.inputLabel, { marginBottom: 0 }]} allowFontScaling={false}>OUTSTANDING BALANCE ($)</Text>
                      </View>
                      <TextInput style={styles.input} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.placeholder} value={tOutstandingBalance} onChangeText={setTOutstandingBalance} allowFontScaling={false} />
                      <Text style={styles.helperText} allowFontScaling={false}>Initial balance logged in ledger</Text>
                    </View>

                    {/* MONTHLY BILLING STATUS (Exact Match Web Screenshot 1:1) */}
                    {pastMonths.length > 0 && (
                      <View style={styles.billingStatusBox}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                          <Ionicons name="calendar" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                          <Text style={styles.billingBoxTitle} allowFontScaling={false}>
                            MONTHLY BILLING STATUS ({pastMonths.length} MONTHS PAST)
                          </Text>
                        </View>
                        <Text style={styles.helperText} allowFontScaling={false}>
                          Click a month chip to set status: <Text style={{ color: colors.success, fontWeight: '700' }}>Paid</Text>, <Text style={{ color: colors.warning, fontWeight: '700' }}>Partial</Text>, or <Text style={{ color: colors.danger, fontWeight: '700' }}>Unpaid</Text>. Unpaid months auto-calculate balance.
                        </Text>

                        {/* Late Fee Checkbox & Badges Row */}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginVertical: 8 }}>
                          <TouchableOpacity
                            style={[
                              styles.lateFeeToggleRow,
                              includeMonthlyLateFee && { backgroundColor: 'rgba(245, 158, 11, 0.18)', borderColor: '#f59e0b' }
                            ]}
                            onPress={() => setIncludeMonthlyLateFee(!includeMonthlyLateFee)}
                          >
                            <Ionicons
                              name={includeMonthlyLateFee ? "checkbox" : "square-outline"}
                              size={15}
                              color={includeMonthlyLateFee ? "#d97706" : colors.textMuted}
                            />
                            <Text style={[styles.lateFeeToggleText, includeMonthlyLateFee && { color: "#d97706" }]} allowFontScaling={false}>
                              Include $50 Late Fee for Unpaid Months
                            </Text>
                          </TouchableOpacity>

                          <View style={styles.paidBadge}>
                            <Text style={styles.paidBadgeText} allowFontScaling={false}>
                              Paid: {paidCount} (${paidTotal.toLocaleString()})
                            </Text>
                          </View>
                          {partialCount > 0 && (
                            <View style={styles.partialBadge}>
                              <Text style={styles.partialBadgeText} allowFontScaling={false}>
                                Partial: {partialCount}
                              </Text>
                            </View>
                          )}
                          <View style={styles.unpaidBadge}>
                            <Text style={styles.unpaidBadgeText} allowFontScaling={false}>
                              Unpaid: {unpaidCount} (${unpaidTotal.toLocaleString()})
                            </Text>
                          </View>
                        </View>

                        {/* Month Chips Grid */}
                        <View style={styles.monthChipsGrid}>
                          {pastMonths.map((m) => {
                            const d = monthPaymentDetails[m.id] || { status: 'Unpaid', paidAmount: 0 };
                            const isPaid = d.status === 'Paid';
                            const isPartial = d.status === 'Partial';
                            const rentVal = Number(uRent) || 1500;
                            const lateVal = includeMonthlyLateFee ? 50 : 0;
                            const due = isPaid ? 0 : isPartial ? Math.max(0, rentVal + lateVal - d.paidAmount) : (rentVal + lateVal);

                            return (
                              <TouchableOpacity
                                key={m.id}
                                style={[
                                  styles.monthChip,
                                  isPaid ? styles.monthChipPaid : isPartial ? styles.monthChipPartial : styles.monthChipUnpaid,
                                  activeMonthPopover?.id === m.id && { borderWidth: 2, borderColor: colors.primary }
                                ]}
                                onPress={() => {
                                  if (activeMonthPopover?.id === m.id) {
                                    setActiveMonthPopover(null);
                                  } else {
                                    setActiveMonthPopover(m);
                                    setPartialAmountInput(isPartial ? String(d.paidAmount) : String(Math.round(rentVal / 2)));
                                  }
                                }}
                              >
                                <Ionicons
                                  name={isPaid ? "checkmark-circle" : isPartial ? "time" : "close-circle"}
                                  size={13}
                                  color={isPaid ? colors.success : isPartial ? colors.warning : colors.danger}
                                  style={{ marginRight: 4 }}
                                />
                                <Text
                                  style={[
                                    styles.monthChipText,
                                    isPaid ? { color: colors.success } : isPartial ? { color: colors.warning } : { color: colors.danger },
                                  ]}
                                  allowFontScaling={false}
                                >
                                  {isPaid ? `${m.label} (Paid)` : isPartial ? `${m.label} ($${d.paidAmount} Paid / $${due} Due)` : `${m.label} (Unpaid - $${due})`}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>

                        {/* Inline Popover Panel for active month */}
                        {activeMonthPopover && (
                          <View style={styles.monthPopoverCard}>
                            <View style={styles.monthPopoverHeader}>
                              <Text style={styles.monthPopoverTitle} allowFontScaling={false}>
                                {activeMonthPopover.label} PAYMENT STATUS
                              </Text>
                              <TouchableOpacity onPress={() => setActiveMonthPopover(null)}>
                                <Ionicons name="close" size={18} color={colors.textMuted} />
                              </TouchableOpacity>
                            </View>
                            <Text style={styles.monthPopoverSub} allowFontScaling={false}>
                              Monthly Rent: ${(Number(uRent) || 1500).toLocaleString()} {includeMonthlyLateFee ? '+ $50 Late Fee' : ''}
                            </Text>

                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                              <TouchableOpacity
                                style={[styles.popoverActionBtn, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: colors.success }]}
                                onPress={() => handleSetMonthStatus(activeMonthPopover.id, 'Paid')}
                              >
                                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                                <Text style={[styles.popoverActionText, { color: colors.success }]} allowFontScaling={false}>
                                  Paid ($0 Due)
                                </Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[styles.popoverActionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: colors.danger }]}
                                onPress={() => handleSetMonthStatus(activeMonthPopover.id, 'Unpaid')}
                              >
                                <Ionicons name="close-circle" size={14} color={colors.danger} />
                                <Text style={[styles.popoverActionText, { color: colors.danger }]} allowFontScaling={false}>
                                  Unpaid
                                </Text>
                              </TouchableOpacity>
                            </View>

                            <View style={{ marginTop: 8 }}>
                              <Text style={styles.inputLabel} allowFontScaling={false}>Partial Payment Amount ($):</Text>
                              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                                <TextInput
                                  style={[styles.input, { flex: 1, height: 36 }]}
                                  keyboardType="numeric"
                                  placeholder="e.g. 500"
                                  placeholderTextColor={colors.placeholder}
                                  value={partialAmountInput}
                                  onChangeText={setPartialAmountInput}
                                  allowFontScaling={false}
                                />
                                <TouchableOpacity
                                  style={[styles.popoverActionBtn, { backgroundColor: 'rgba(245, 158, 11, 0.2)', borderColor: colors.warning }]}
                                  onPress={() => handleSetMonthStatus(activeMonthPopover.id, 'Partial', Number(partialAmountInput) || 0)}
                                >
                                  <Text style={[styles.popoverActionText, { color: colors.warning }]} allowFontScaling={false}>
                                    Save Partial
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        )}
                      </View>
                    )}

                    {/* ADDITIONAL DETAILS (OPTIONAL) (Matches Web Screenshot 1:1) */}
                    <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: colors.cardBorder, paddingTop: 10 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 1, paddingRight: 6 }}>
                          <Text style={styles.subSectionHeader} allowFontScaling={false}>
                            ADDITIONAL DETAILS (OPTIONAL)
                          </Text>
                          <Text style={styles.helperText} allowFontScaling={false}>
                            Government IDs, Emergency Contacts, Employment Parameters & Address History
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => setShowTenantExtra(!showTenantExtra)}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }} allowFontScaling={false}>
                            {showTenantExtra ? 'Hide Details ⌃' : 'Show Details ⌵'}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {showTenantExtra && (
                        <View style={{ marginTop: 8 }}>
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.inputLabel} allowFontScaling={false}>SSN / TAX ID</Text>
                              <TextInput style={styles.input} placeholder="XXX-XX-XXXX" placeholderTextColor={colors.placeholder} value={tSsn} onChangeText={setTSsn} allowFontScaling={false} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.inputLabel} allowFontScaling={false}>ID NUMBER</Text>
                              <TextInput style={styles.input} placeholder="DL-123456" placeholderTextColor={colors.placeholder} value={tIdNumber} onChangeText={setTIdNumber} allowFontScaling={false} />
                            </View>
                          </View>
                          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.inputLabel} allowFontScaling={false}>EMERGENCY CONTACT</Text>
                              <TextInput style={styles.input} placeholder="Jane Doe" placeholderTextColor={colors.placeholder} value={tEmergencyName} onChangeText={setTEmergencyName} allowFontScaling={false} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.inputLabel} allowFontScaling={false}>EMERGENCY PHONE</Text>
                              <TextInput style={styles.input} keyboardType="phone-pad" placeholder="(512) 555-9999" placeholderTextColor={colors.placeholder} value={tEmergencyPhone} onChangeText={setTEmergencyPhone} allowFontScaling={false} />
                            </View>
                          </View>
                          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.inputLabel} allowFontScaling={false}>EMPLOYER</Text>
                              <TextInput style={styles.input} placeholder="Acme Corp" placeholderTextColor={colors.placeholder} value={tEmployer} onChangeText={setTEmployer} allowFontScaling={false} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.inputLabel} allowFontScaling={false}>WORK PHONE</Text>
                              <TextInput style={styles.input} keyboardType="phone-pad" placeholder="(512) 555-8888" placeholderTextColor={colors.placeholder} value={tEmployerPhone} onChangeText={setTEmergencyPhone} allowFontScaling={false} />
                            </View>
                          </View>
                        </View>
                      )}
                    </View>

                    {/* Automated Workflow Execution Banner (Matches Web Screenshot 1:1) */}
                    <View style={styles.workflowBanner}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                        <Ionicons name="shield-checkmark" size={16} color={colors.success} style={{ marginTop: 1 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.workflowBannerTitle} allowFontScaling={false}>
                            Automated Workflow Execution:
                          </Text>
                          <Text style={styles.workflowBannerText} allowFontScaling={false}>
                            Submitting will automatically create the Active Tenant account with portal password, generate an Active Lease agreement, auto bypass screening, and mark Move In Workflow as COMPLETED.
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                {/* VACANT ADVERTISING PREFERENCE */}
                {uStatus === 'Vacant' && !editingUnitId && (
                  <View style={[styles.sectionBox, { marginTop: 12 }]}>
                    <Text style={styles.sectionBoxTitle} allowFontScaling={false}>VACANT ADVERTISING</Text>
                    <Text style={styles.cardAddress} allowFontScaling={false}>
                      Do you want to advertise this vacant unit on rental portals?
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                      <TouchableOpacity
                        style={[styles.chip, uWantToAdvertise === 'yes' && styles.chipActive]}
                        onPress={() => setUWantToAdvertise('yes')}
                      >
                        <Text style={[styles.chipText, uWantToAdvertise === 'yes' && styles.chipTextActive]} allowFontScaling={false}>Yes, Advertise</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.chip, uWantToAdvertise === 'no' && styles.chipActive]}
                        onPress={() => setUWantToAdvertise('no')}
                      >
                        <Text style={[styles.chipText, uWantToAdvertise === 'no' && styles.chipTextActive]} allowFontScaling={false}>No</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsUnitModalOpen(false)}>
                  <Text style={styles.cancelBtnText} allowFontScaling={false}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSaveUnit} disabled={submitting}>
                  {submitting ? (
                    <ActivityIndicator size="small" color="#0f172a" />
                  ) : (
                    <Text style={styles.submitBtnText} allowFontScaling={false}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </View>
  );
};

// ----------------------------------------------------------------------------
// STYLESHEET
// ----------------------------------------------------------------------------
const getStyles = (colors, isDarkMode) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mutedText: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 8,
    },

    // Header
    topHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    screenTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 8,
    },
    addBtnText: {
      fontSize: 12.5,
      fontWeight: '700',
      color: '#0f172a',
      marginLeft: 4,
    },

    // Tabs
    tabsRow: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 3,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 7,
      borderRadius: 6,
    },
    tabActive: {
      backgroundColor: isDarkMode ? '#334155' : '#e2e8f0',
    },
    tabText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
    },
    tabTextActive: {
      color: colors.textPrimary,
      fontWeight: '700',
    },

    // Search
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 10,
      height: 38,
      marginBottom: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 13,
      color: colors.textPrimary,
      paddingVertical: 0,
    },

    // List
    scrollList: {
      flex: 1,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      padding: 12,
      marginBottom: 10,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    cardAddress: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 5,
    },
    badgeActive: {
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
    },
    badgeMuted: {
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
    },
    badgeText: {
      fontSize: 10.5,
      fontWeight: '700',
    },
    badgeTextActive: {
      color: colors.success,
    },
    badgeTextMuted: {
      color: colors.warning,
    },

    // Info Row
    infoRow: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderRadius: 6,
      padding: 8,
      marginVertical: 4,
    },
    infoItem: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 9,
      fontWeight: '700',
      color: colors.textMuted,
      marginBottom: 2,
    },
    infoValue: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textPrimary,
    },

    // Card Actions
    cardActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 12,
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.cardBorder,
    },
    btnSmall: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingVertical: 4,
    },
    btnSmallText: {
      fontSize: 11.5,
      fontWeight: '600',
      color: colors.textSecondary,
    },

    // Empty State
    emptyState: {
      alignItems: 'center',
      paddingVertical: 30,
    },
    emptyText: {
      fontSize: 13,
      color: colors.textMuted,
    },

    // Modal
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      padding: 16,
    },
    modalCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 7,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
    },
    detailKey: {
      fontSize: 12.5,
      color: colors.textMuted,
    },
    detailVal: {
      fontSize: 12.5,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    closeBtn: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderRadius: 8,
      paddingVertical: 9,
      alignItems: 'center',
      marginTop: 10,
    },
    closeBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textPrimary,
    },

    // Section Boxes inside Add Unit Modal
    sectionBox: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 10,
      marginTop: 8,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    sectionBoxTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: 0.3,
    },
    subSectionHeader: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.textMuted,
      letterSpacing: 0.5,
      marginTop: 6,
    },
    helperText: {
      fontSize: 9.5,
      color: colors.textMuted,
      marginTop: 1,
    },
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    toggleBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    toggleBadgeActive: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      borderColor: colors.success,
    },
    toggleBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textMuted,
    },
    toggleBadgeTextActive: {
      color: colors.success,
    },

    // Monthly Billing Status Box (Screenshot 3)
    billingStatusBox: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      padding: 10,
      marginTop: 10,
    },
    billingBoxTitle: {
      fontSize: 10.5,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    lateFeeToggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginVertical: 6,
    },
    lateFeeToggleText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    paidBadge: {
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    paidBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.success,
    },
    unpaidBadge: {
      backgroundColor: 'rgba(239, 68, 68, 0.12)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    unpaidBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.danger,
    },
    partialBadge: {
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    partialBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.warning,
    },
    monthChipsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 6,
    },
    monthChip: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 7,
      paddingVertical: 4,
    },
    monthChipPaid: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    monthChipUnpaid: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    monthChipPartial: {
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    monthChipText: {
      fontSize: 10,
      fontWeight: '600',
    },
    monthPopoverCard: {
      backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.primary,
      padding: 10,
      marginTop: 8,
    },
    monthPopoverHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    monthPopoverTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    monthPopoverSub: {
      fontSize: 10,
      color: colors.textMuted,
      marginTop: 2,
    },
    popoverActionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 7,
      paddingHorizontal: 8,
      borderRadius: 6,
      borderWidth: 1,
    },
    popoverActionText: {
      fontSize: 11,
      fontWeight: '700',
    },

    // Workflow Banner (Screenshot 3)
    workflowBanner: {
      backgroundColor: 'rgba(16, 185, 129, 0.08)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      borderWidth: 1,
      borderRadius: 8,
      padding: 10,
      marginTop: 12,
    },
    workflowBannerTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.success,
    },
    workflowBannerText: {
      fontSize: 10,
      color: colors.textSecondary,
      lineHeight: 14,
    },

    // Picker
    pickerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 6,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
    },
    pickerRowSelected: {
      backgroundColor: isDarkMode ? '#334155' : '#f1f5f9',
    },
    modalBtnRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 12,
    },
    cancelBtn: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    cancelBtnText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    submitBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitBtnText: {
      fontSize: 12.5,
      fontWeight: '700',
      color: '#0f172a',
    },

    // Inputs
    inputLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
      marginBottom: 4,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 7,
      fontSize: 13,
      color: colors.textPrimary,
    },
    datePickerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 9,
      minHeight: 38,
    },
    datePickerBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    errorText: {
      fontSize: 10.5,
      color: colors.danger,
      marginTop: 2,
    },
    chip: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 6,
      marginRight: 6,
    },
    chipActive: {
      borderColor: colors.primary,
      backgroundColor: isDarkMode ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.1)',
    },
    chipText: {
      fontSize: 11.5,
      color: colors.textSecondary,
    },
    chipTextActive: {
      color: colors.primary,
      fontWeight: '700',
    },

    // Add Property Form Full Modal (Web 1:1 Matching)
    propFullModalCard: {
      maxHeight: '94%',
      height: '92%',
      padding: 16,
      borderRadius: 14,
      backgroundColor: colors.surface,
      display: 'flex',
      flexDirection: 'column',
    },
    propHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
    },
    propMainTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.3,
    },
    propSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    propCloseBtn: {
      padding: 4,
    },
    formGroup: {
      marginTop: 11,
    },
    twoColRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 11,
    },
    fieldLabel: {
      fontSize: 10.5,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 5,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
    },
    fieldLabelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 5,
    },
    requiredStar: {
      color: colors.danger || '#ef4444',
      fontWeight: '700',
    },
    optionalTag: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textMuted,
      textTransform: 'uppercase',
    },
    addOwnerLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      paddingHorizontal: 4,
      paddingVertical: 1,
    },
    addOwnerLinkText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#2563eb',
    },
    propInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 9,
      fontSize: 13.5,
      color: colors.textPrimary,
      minHeight: 40,
    },
    propInputError: {
      borderColor: colors.danger || '#ef4444',
    },
    propSelectTrigger: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 9,
      minHeight: 40,
    },
    propSelectValue: {
      fontSize: 13.5,
      color: colors.textPrimary,
      fontWeight: '500',
      flex: 1,
    },
    // Payment Integration Box
    propPaymentBox: {
      backgroundColor: isDarkMode ? '#1e293b' : '#f0f9ff',
      borderColor: isDarkMode ? '#334155' : '#bae6fd',
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
      marginTop: 14,
    },
    propPaymentHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
    },
    propPaymentTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: '#0284c7',
      letterSpacing: 0.3,
    },
    companyDefaultBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
      borderColor: 'rgba(16, 185, 129, 0.4)',
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    companyDefaultBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#059669',
    },
    propPaymentSubtitle: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 4,
      lineHeight: 15,
    },
    propPaymentLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 5,
      letterSpacing: 0.3,
    },
    propPaymentDropdown: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 9,
      minHeight: 40,
    },
    propPaymentDropdownVal: {
      fontSize: 13,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    propPaymentHint: {
      fontSize: 10,
      color: colors.textMuted,
      marginTop: 4,
      lineHeight: 14,
    },
    // Additional Details Accordion Box
    propAccordionBox: {
      backgroundColor: colors.background,
      borderColor: colors.cardBorder,
      borderWidth: 1,
      borderRadius: 10,
      marginTop: 14,
      overflow: 'hidden',
    },
    propAccordionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.surface,
    },
    propAccordionTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: 0.3,
    },
    propAccordionSub: {
      fontSize: 10.5,
      color: colors.textMuted,
      marginTop: 2,
    },
    propAccordionToggleText: {
      fontSize: 11.5,
      fontWeight: '700',
      color: '#2563eb',
    },
    propAccordionBody: {
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: colors.cardBorder,
    },
    // Bottom Footer Actions Bar
    propFooterBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.cardBorder,
      marginTop: 4,
    },
    propCancelBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingVertical: 9,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    propCancelBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    propDraftBtn: {
      paddingVertical: 9,
      paddingHorizontal: 14,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      backgroundColor: isDarkMode ? '#334155' : '#f1f5f9',
    },
    propDraftBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    propSubmitBtn: {
      backgroundColor: '#2563eb',
      paddingVertical: 9,
      paddingHorizontal: 18,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 110,
    },
    propSubmitBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#ffffff',
    },
  });

export default PropertiesScreen;
