import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import apiClient from '../api/client';
import { useAuthStore, useThemeStore } from '../store/useStore';
import { useThemeColors } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

export const TenantDashboard = ({ onNavigate }) => {
  const { user, logout, refreshAccessToken } = useAuthStore();
  const { language } = useThemeStore();
  const { colors, isDarkMode } = useThemeColors();
  const styles = getStyles(colors, isDarkMode);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Live Tenant Data matching Web Frontend /portal/tenant/metrics & /portal/tenant/leases
  const [tenantData, setTenantData] = useState({
    name: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Resident',
    propertyName: 'No Active Lease',
    unitNumber: 'N/A',
    currentRent: 0,
    outstandingBalance: 0,
    nextDueDate: 'N/A',
    leaseExpiration: 'N/A',
    activeVisitors: 0,
    packagesWaiting: 0,
  });

  const [screeningReport, setScreeningReport] = useState(null);
  const [latestNotice, setLatestNotice] = useState(null);

  // Modals
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [ticketModalVisible, setTicketModalVisible] = useState(false);
  const [screeningModalOpen, setScreeningModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Ticket Form
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');

  // Screening Form
  const [screeningDob, setScreeningDob] = useState('');
  const [screeningSsn, setScreeningSsn] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [consent, setConsent] = useState(false);

  // Fetch live data matching Web APIs:
  // 1. GET /portal/tenant/metrics
  // 2. GET /portal/tenant/leases
  // 3. GET /portal/tenant/profile
  // 4. GET /portal/screening/reports
  // 5. GET /portal/tenant/notifications
  const fetchTenantPortalData = async () => {
    try {
      setLoading(true);
      const [metricsRes, leasesRes, profileRes, screeningRes, notifsRes] = await Promise.all([
        apiClient.get('/portal/tenant/metrics', logout, refreshAccessToken).catch(() => null),
        apiClient.get('/leases', logout, refreshAccessToken).catch(() => apiClient.get('/portal/tenant/leases', logout, refreshAccessToken).catch(() => null)),
        apiClient.get('/portal/tenant/profile', logout, refreshAccessToken).catch(() => null),
        apiClient.get('/portal/screening/reports', logout, refreshAccessToken).catch(() => null),
        apiClient.get('/portal/tenant/notifications', logout, refreshAccessToken).catch(() => null),
      ]);

      const metrics = metricsRes?.data || metricsRes || {};
      const leases = leasesRes?.data || leasesRes || [];
      const profile = profileRes?.data || profileRes || {};
      const reports = screeningRes?.data || screeningRes || [];
      const notifs = notifsRes?.data || notifsRes || [];

      const lease = leases.length > 0 ? leases[0] : null;
      const propName = lease?.property?.name || lease?.propertyName || profile?.companyName || (lease ? 'Property' : 'No Active Lease');
      const unitNum = lease?.unit?.unitNumber || lease?.unitNumber || profile?.unitNumber || (lease ? 'Unit' : 'N/A');

      // Match tenant screening report
      const myEmail = user?.email || profile?.email || '';
      const myReport = Array.isArray(reports)
        ? reports.find(
            (r) =>
              (r.email && r.email.toLowerCase() === myEmail.toLowerCase()) ||
              (r.tenant?.email && r.tenant.email.toLowerCase() === myEmail.toLowerCase())
          )
        : null;
      setScreeningReport(myReport);

      // Check for unread management notices
      if (Array.isArray(notifs) && notifs.length > 0) {
        const unread = notifs.find((n) => !n.read && !n.isRead);
        setLatestNotice(unread || null);
      }

      const rentAmount = Number(metrics.currentRent || metrics.currentRentDue || lease?.rentAmount || 0);
      const outBal = Number(metrics.outstandingBalance ?? 0);

      setTenantData({
        name:
          user?.name ||
          `${profile.firstName || user?.firstName || ''} ${profile.lastName || user?.lastName || ''}`.trim() ||
          'Resident',
        propertyName: propName,
        unitNumber: unitNum,
        currentRent: rentAmount,
        outstandingBalance: outBal,
        nextDueDate: metrics.nextDueDate || (lease ? '1st of next month' : 'N/A'),
        leaseExpiration: metrics.leaseExpiration || (lease?.endDate ? lease.endDate.split('T')[0] : 'N/A'),
        activeVisitors: Number(metrics.activeVisitors || 0),
        packagesWaiting: Number(metrics.packagesWaiting || 0),
      });
    } catch (e) {
      console.log('Error fetching live tenant data:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTenantPortalData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTenantPortalData();
  };

  const handlePayRent = async () => {
    const payAmount = tenantData.outstandingBalance > 0 ? tenantData.outstandingBalance : tenantData.currentRent;
    if (payAmount <= 0) return;
    try {
      setSubmitting(true);
      await apiClient.post(
        '/payments',
        {
          amount: Number(payAmount),
          baseAmount: Number(payAmount),
          paymentMethod: 'ACH',
          status: 'Paid',
          paidDate: new Date().toISOString(),
          referenceNumber: `RCP-${Math.floor(100000 + Math.random() * 900000)}-ZTR`,
          tenantId: user?.id && user.id.length > 10 ? user.id : undefined,
        },
        logout,
        refreshAccessToken
      );
      setPayModalVisible(false);
      Alert.alert(
        'Payment Successful',
        `Thank you! Your rent payment of $${payAmount.toLocaleString()} has been processed successfully.`
      );
      fetchTenantPortalData();
    } catch (e) {
      Alert.alert('Payment Error', e.message || 'Payment processing failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!ticketTitle.trim() || !ticketDesc.trim()) {
      Alert.alert('Error', 'Please fill in both title and description.');
      return;
    }
    try {
      setSubmitting(true);
      await apiClient.post(
        '/portal/tenant/maintenance',
        {
          title: ticketTitle.trim(),
          description: ticketDesc.trim(),
          priority: 'Medium',
          category: 'Plumbing',
        },
        logout,
        refreshAccessToken
      ).catch(() => null);

      setTicketModalVisible(false);
      setTicketTitle('');
      setTicketDesc('');
      Alert.alert('Success', 'Repair request submitted to property management.');
      fetchTenantPortalData();
    } catch (e) {
      Alert.alert('Error', 'Could not submit repair ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setDocFile(res.assets[0]);
      }
    } catch (err) {
      console.log('DocumentPicker Error:', err);
    }
  };

  const handleSubmitDocuments = async () => {
    if (!consent) {
      Alert.alert('Consent Required', 'Please authorize background verification.');
      return;
    }
    if (!screeningDob.trim() || !screeningSsn.trim() || !docFile) {
      Alert.alert('Validation Error', 'Please complete all fields and select a file.');
      return;
    }
    try {
      setSubmitting(true);
      await apiClient.put(
        `/portal/screening/reports/${screeningReport.id}`,
        {
          dob: screeningDob.trim(),
          ssn: screeningSsn.trim(),
          authorized: true,
          status: 'Pending Documents',
        },
        logout,
        refreshAccessToken
      );

      const formData = new FormData();
      formData.append('document', {
        uri: Platform.OS === 'ios' ? docFile.uri.replace('file://', '') : docFile.uri,
        name: docFile.name || 'id_proof.pdf',
        type: docFile.mimeType || 'application/pdf',
      });

      await apiClient.post(
        `/portal/screening/reports/${screeningReport.id}/upload`,
        formData,
        logout,
        refreshAccessToken
      );

      Alert.alert('Success', 'Verification documents uploaded successfully.');
      setScreeningModalOpen(false);
      fetchTenantPortalData();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to submit documents.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading Tenant Portal...</Text>
      </View>
    );
  }

  const isPaidInFull = tenantData.outstandingBalance <= 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#38bdf8" />}
    >
      {/* Welcome Banner */}
      <View style={styles.welcomeSection}>
        <Text style={[styles.welcomeGreeting, { color: colors.textPrimary }]} allowFontScaling={false}>
          Hello, {tenantData.name} 👋
        </Text>
        <Text style={[styles.welcomeLocation, { color: colors.textSecondary }]} allowFontScaling={false}>
          📍 {tenantData.propertyName} · Unit {tenantData.unitNumber}
        </Text>
      </View>

      {/* Management Notice / Alert Banner */}
      {latestNotice && (
        <View style={[styles.alertBanner, { backgroundColor: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)' }]}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons name="sparkles" size={14} color="#6366f1" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#6366f1', textTransform: 'uppercase' }}>
                Management Notice
              </Text>
            </View>
            <Text style={[styles.alertMessage, { color: colors.textPrimary }]}>{latestNotice.message || latestNotice.title}</Text>
          </View>
          <TouchableOpacity
            style={styles.alertActionBtn}
            onPress={() => setPayModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.alertActionBtnText}>Pay Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Screening Pending Alert */}
      {screeningReport &&
        (screeningReport.status === 'Pending Documents' || screeningReport.status === 'Pending Consent') && (
          <TouchableOpacity
            style={[styles.alertBanner, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}
            onPress={() => setScreeningModalOpen(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="alert-circle" size={20} color="#ef4444" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#ef4444' }}>Verification Required</Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
                Please upload your ID/W2 proof to complete tenant screening.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ef4444" />
          </TouchableOpacity>
        )}

      {/* =========================================================================
          CARD 1: CURRENT RENT DUE (Clean DoorLoop Minimalist Card)
          ========================================================================= */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]} allowFontScaling={false}>
            Current rent due
          </Text>
        </View>

        <View style={styles.cardBodyPadding}>
          <Text style={[styles.bigAmount, { color: colors.textPrimary }]} allowFontScaling={false}>
            ${tenantData.currentRent.toLocaleString()}
          </Text>
          <Text style={[styles.subDate, { color: colors.textSecondary }]} allowFontScaling={false}>
            Due date: {tenantData.nextDueDate}
          </Text>

          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={() => setPayModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="card-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryActionBtnText} allowFontScaling={false}>
              Pay Rent Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* =========================================================================
          CARD 2: OUTSTANDING BALANCE & STATUS
          ========================================================================= */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]} allowFontScaling={false}>
            Outstanding balance
          </Text>
        </View>

        <View style={styles.cardBodyPadding}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text
              style={[
                styles.bigAmount,
                { color: isPaidInFull ? '#10b981' : '#ef4444' },
              ]}
              allowFontScaling={false}
            >
              ${tenantData.outstandingBalance.toLocaleString()}
            </Text>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isPaidInFull ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: isPaidInFull ? '#10b981' : '#ef4444' },
                ]}
                allowFontScaling={false}
              >
                {isPaidInFull ? 'Paid in full' : 'Balance overdue'}
              </Text>
            </View>
          </View>
          <Text style={[styles.subDate, { color: colors.textSecondary, marginTop: 8 }]} allowFontScaling={false}>
            {isPaidInFull ? 'No pending invoices or charges' : 'Please settle open invoices via portal payment'}
          </Text>
        </View>
      </View>

      {/* =========================================================================
          CARD 3: LEASE DETAILS & HOME
          ========================================================================= */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]} allowFontScaling={false}>
            Lease agreement
          </Text>
        </View>

        <View style={styles.cardBodyPadding}>
          <View style={styles.leaseDetailRow}>
            <Text style={[styles.leaseLabel, { color: colors.textSecondary }]} allowFontScaling={false}>
              Property:
            </Text>
            <Text style={[styles.leaseValue, { color: colors.textPrimary }]} allowFontScaling={false}>
              {tenantData.propertyName}
            </Text>
          </View>

          <View style={styles.leaseDetailRow}>
            <Text style={[styles.leaseLabel, { color: colors.textSecondary }]} allowFontScaling={false}>
              Unit:
            </Text>
            <Text style={[styles.leaseValue, { color: colors.textPrimary }]} allowFontScaling={false}>
              Unit {tenantData.unitNumber}
            </Text>
          </View>

          <View style={styles.leaseDetailRow}>
            <Text style={[styles.leaseLabel, { color: colors.textSecondary }]} allowFontScaling={false}>
              Expires on:
            </Text>
            <Text style={[styles.leaseValue, { color: colors.textPrimary }]} allowFontScaling={false}>
              {tenantData.leaseExpiration}
            </Text>
          </View>

          {onNavigate && (
            <TouchableOpacity
              style={[styles.outlineBtn, { borderColor: colors.cardBorder, marginTop: 14 }]}
              onPress={() => onNavigate('lease')}
              activeOpacity={0.7}
            >
              <Text style={[styles.outlineBtnText, { color: colors.textPrimary }]} allowFontScaling={false}>
                View Lease Agreement
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* =========================================================================
          CARD 4: QUICK RESIDENT ACTIONS
          ========================================================================= */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={[styles.actionTile, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          onPress={() => setPayModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBox, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
            <Ionicons name="card" size={22} color="#0284c7" />
          </View>
          <Text style={[styles.actionTileTitle, { color: colors.textPrimary }]} allowFontScaling={false}>
            Pay Rent
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionTile, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          onPress={() => setTicketModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
            <Ionicons name="hammer" size={22} color="#ef4444" />
          </View>
          <Text style={[styles.actionTileTitle, { color: colors.textPrimary }]} allowFontScaling={false}>
            Repair
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionTile, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          onPress={() => onNavigate && onNavigate('messages')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Ionicons name="chatbubbles" size={22} color="#10b981" />
          </View>
          <Text style={[styles.actionTileTitle, { color: colors.textPrimary }]} allowFontScaling={false}>
            Messages
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionTile, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          onPress={() => onNavigate && onNavigate('documents')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Ionicons name="document-text" size={22} color="#f59e0b" />
          </View>
          <Text style={[styles.actionTileTitle, { color: colors.textPrimary }]} allowFontScaling={false}>
            Documents
          </Text>
        </TouchableOpacity>
      </View>

      {/* =========================================================================
          PAY RENT MODAL
          ========================================================================= */}
      <Modal visible={payModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.modalIconCenter}>
              <Ionicons name="card-outline" size={40} color="#0284c7" />
            </View>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]} allowFontScaling={false}>
              Confirm Rent Payment
            </Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]} allowFontScaling={false}>
              Amount to pay: $
              {(tenantData.outstandingBalance > 0
                ? tenantData.outstandingBalance
                : tenantData.currentRent
              ).toLocaleString()}
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setPayModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelBtnText} allowFontScaling={false}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirmBtn]}
                onPress={handlePayRent}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.modalConfirmBtnText} allowFontScaling={false}>
                    Pay Now
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =========================================================================
          SUBMIT REPAIR MODAL
          ========================================================================= */}
      <Modal visible={ticketModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]} allowFontScaling={false}>
              Request Maintenance Repair
            </Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]} allowFontScaling={false}>
              Our team will review and dispatch a technician.
            </Text>

            <TextInput
              style={[styles.inputField, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.cardBorder }]}
              placeholder="What is the issue? (e.g. Leaking faucet)"
              placeholderTextColor="#94a3b8"
              value={ticketTitle}
              onChangeText={setTicketTitle}
            />

            <TextInput
              style={[
                styles.inputField,
                { height: 80, textAlignVertical: 'top', backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.cardBorder },
              ]}
              placeholder="Describe the issue in detail..."
              placeholderTextColor="#94a3b8"
              multiline
              value={ticketDesc}
              onChangeText={setTicketDesc}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setTicketModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelBtnText} allowFontScaling={false}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirmBtn]}
                onPress={handleCreateTicket}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.modalConfirmBtnText} allowFontScaling={false}>
                    Submit Request
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =========================================================================
          SCREENING VERIFICATION MODAL
          ========================================================================= */}
      <Modal visible={screeningModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]} allowFontScaling={false}>
              Tenant Screening Verification
            </Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]} allowFontScaling={false}>
              Please verify identity details and upload proof.
            </Text>

            <TextInput
              style={[styles.inputField, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.cardBorder }]}
              placeholder="Date of Birth (YYYY-MM-DD)"
              placeholderTextColor="#94a3b8"
              value={screeningDob}
              onChangeText={setScreeningDob}
            />

            <TextInput
              style={[styles.inputField, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.cardBorder }]}
              placeholder="SSN (Last 4 digits or Full)"
              placeholderTextColor="#94a3b8"
              value={screeningSsn}
              onChangeText={setScreeningSsn}
            />

            <TouchableOpacity
              style={[styles.outlineBtn, { borderColor: colors.cardBorder, marginBottom: 14 }]}
              onPress={handlePickDocument}
            >
              <Ionicons name="cloud-upload-outline" size={18} color="#0284c7" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#0284c7' }}>
                {docFile ? docFile.name : 'Choose ID / W2 Document'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
              onPress={() => setConsent(!consent)}
            >
              <Ionicons
                name={consent ? 'checkbox' : 'square-outline'}
                size={20}
                color={consent ? '#10b981' : colors.textSecondary}
                style={{ marginRight: 8 }}
              />
              <Text style={{ fontSize: 12, color: colors.textSecondary, flex: 1 }}>
                I authorize background verification and identity screening.
              </Text>
            </TouchableOpacity>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setScreeningModalOpen(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelBtnText} allowFontScaling={false}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirmBtn]}
                onPress={handleSubmitDocuments}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.modalConfirmBtnText} allowFontScaling={false}>
                    Submit Proof
                  </Text>
                )}
              </TouchableOpacity>
            </View>
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
      paddingBottom: 40,
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

    welcomeSection: {
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    welcomeGreeting: {
      fontSize: 22,
      fontWeight: '800',
      letterSpacing: -0.4,
    },
    welcomeLocation: {
      fontSize: 13.5,
      fontWeight: '500',
      marginTop: 4,
    },

    alertBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 14,
      padding: 14,
      marginBottom: 16,
    },
    alertMessage: {
      fontSize: 12.5,
      fontWeight: '600',
      lineHeight: 18,
    },
    alertActionBtn: {
      backgroundColor: '#6366f1',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
      marginLeft: 12,
    },
    alertActionBtnText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: '800',
    },

    // Card (Matching DoorLoop Clean Card Design)
    card: {
      borderRadius: 16,
      borderWidth: 1,
      marginBottom: 16,
      overflow: 'hidden',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.05,
      shadowRadius: 8,
    },
    cardHeader: {
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 6,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    cardBodyPadding: {
      paddingHorizontal: 18,
      paddingBottom: 18,
      paddingTop: 4,
    },
    bigAmount: {
      fontSize: 30,
      fontWeight: '900',
      letterSpacing: -0.5,
    },
    subDate: {
      fontSize: 13,
      fontWeight: '500',
      marginTop: 4,
    },
    primaryActionBtn: {
      backgroundColor: '#0284c7',
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 13,
      marginTop: 16,
      elevation: 1,
    },
    primaryActionBtnText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '800',
    },

    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
    },
    statusBadgeText: {
      fontSize: 12,
      fontWeight: '800',
    },

    leaseDetailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 6,
    },
    leaseLabel: {
      fontSize: 13,
      fontWeight: '500',
    },
    leaseValue: {
      fontSize: 13.5,
      fontWeight: '700',
    },

    outlineBtn: {
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    outlineBtnText: {
      fontSize: 13,
      fontWeight: '700',
    },

    // Quick Actions
    quickActionsContainer: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 16,
    },
    actionTile: {
      flex: 1,
      borderRadius: 14,
      borderWidth: 1,
      paddingVertical: 14,
      alignItems: 'center',
      elevation: 1,
    },
    actionIconBox: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    actionTileTitle: {
      fontSize: 12,
      fontWeight: '700',
    },

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    modalBox: {
      borderRadius: 18,
      borderWidth: 1,
      padding: 22,
      elevation: 5,
    },
    modalIconCenter: {
      alignItems: 'center',
      marginBottom: 12,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 6,
    },
    modalSub: {
      fontSize: 13,
      textAlign: 'center',
      marginBottom: 18,
    },
    inputField: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 13.5,
      marginBottom: 12,
    },
    modalBtnRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    modalBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    modalCancelBtn: {
      backgroundColor: 'rgba(100, 116, 139, 0.15)',
    },
    modalCancelBtnText: {
      fontSize: 13.5,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    modalConfirmBtn: {
      backgroundColor: '#0284c7',
    },
    modalConfirmBtnText: {
      fontSize: 13.5,
      fontWeight: '800',
      color: '#ffffff',
    },
  });

export default TenantDashboard;
