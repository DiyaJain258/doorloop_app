import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useAuthStore, useThemeStore } from '../store/useStore';
import { useThemeColors } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export const ManagerServicesScreen = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const { language } = useThemeStore();
  const { colors, isDarkMode } = useThemeColors();
  const styles = getStyles(colors, isDarkMode);

  const menuItems = [
    {
      id: 'properties',
      label: language === 'es' ? 'Propiedades y Unidades' : language === 'hi' ? 'संपत्तियां और इकाइयां' : 'Properties & Units',
      subtitle: language === 'es' ? 'Gestionar activos residenciales y comerciales' : 'Manage residential, commercial assets & rental units',
      icon: 'business-outline',
      color: '#38bdf8',
    },
    {
      id: 'leads',
      label: language === 'es' ? 'Arrendamientos' : language === 'hi' ? 'पट्टा / लीजिंग' : 'Leasing Pipeline',
      subtitle: language === 'es' ? 'Solicitudes, contratos y renovaciones' : 'Applications, tenant screening, lease contracts & renewals',
      icon: 'key-outline',
      color: '#f43f5e',
    },
    {
      id: 'tenants',
      label: language === 'es' ? 'Directorio de Inquilinos' : language === 'hi' ? 'किरायेदार सूची' : 'Tenant Directory',
      subtitle: language === 'es' ? 'Residentes activos y documentos' : 'Active residents, lease statuses & tenant documents',
      icon: 'people-outline',
      color: '#3b82f6',
    },
    {
      id: 'maintenance',
      label: language === 'es' ? 'Mantenimiento y Reparaciones' : language === 'hi' ? 'रखरखाव और मरम्मत' : 'Maintenance & Repairs',
      subtitle: language === 'es'
        ? 'Tickets de servicio, órdenes de trabajo, violaciones DOB y contratistas'
        : language === 'hi'
        ? 'सेवा अनुरोध, कार्य आदेश, DOB उल्लंघन और ठेकेदार'
        : 'Service tickets, work orders, DOB violations & contractor dispatches',
      icon: 'hammer-outline',
      color: '#f59e0b',
    },
    {
      id: 'documents',
      label: language === 'es' ? 'Documentos y Archivos' : language === 'hi' ? 'दस्तावेज़ और फ़ाइलें' : 'Documents & Files',
      subtitle: language === 'es' ? 'Contratos de arrendamiento y títulos' : 'Manage lease agreements, deeds and portfolio file assets',
      icon: 'folder-open-outline',
      color: '#6366f1',
    },
    {
      id: 'owners',
      label: language === 'es' ? 'Gestión de Propietarios' : language === 'hi' ? 'मालिक प्रबंधन' : 'Owner Management',
      subtitle: language === 'es' ? 'Propietarios, distribuciones y contactos' : 'Property owners, distributions, portfolios & contacts',
      icon: 'person-circle-outline',
      color: '#0ea5e9',
    },
    {
      id: 'rent',
      label: language === 'es' ? 'Alquiler y Pagos' : language === 'hi' ? 'किराया और भुगतान' : 'Rent & Payments',
      subtitle: language === 'es' ? 'Pagos de alquiler, facturas y recibos' : 'Track rent payments, invoices, receipts & rent ledger',
      icon: 'cash-outline',
      color: '#10b981',
    },
    {
      id: 'accounting',
      label: language === 'es' ? 'Contabilidad y Libros' : language === 'hi' ? 'लेखांकन' : 'Accounting & Ledgers',
      subtitle: language === 'es' ? 'Catálogo de cuentas y gastos operativos' : 'Chart of accounts, rental income & vendor operating expenses',
      icon: 'journal-outline',
      color: '#a855f7',
    },
    {
      id: 'reports',
      label: language === 'es' ? 'Informes y Análisis' : language === 'hi' ? 'रिपोर्ट और विश्लेषण' : 'Reports & Analytics',
      subtitle: language === 'es' ? 'Estados financieros, ocupación y rent roll' : 'Financial statements, leasing, occupancy & rent roll',
      icon: 'analytics-outline',
      color: '#ec4899',
    },
    {
      id: 'communication',
      label: 'Tenant & Owner Chat',
      subtitle: 'Real-time messaging, broadcasting alerts & chat logs',
      icon: 'chatbubbles-outline',
      color: '#06b6d4',
    },
    {
      id: 'notifications',
      label: 'Activity Notifications',
      subtitle: 'Real-time system events, overdue alerts & activity log',
      icon: 'notifications-outline',
      color: '#eab308',
    },
    {
      id: 'ai',
      label: 'AI Copilot Assistant',
      subtitle: 'AI document generator, lease drafting & smart analysis',
      icon: 'hardware-chip-outline',
      color: '#8b5cf6',
    },
    {
      id: 'company-settings',
      label: 'Company Settings',
      subtitle: 'Company profile, late fee policy, unit deletion & users',
      icon: 'settings-outline',
      color: '#64748b',
    },
    {
      id: 'integrations',
      label: 'Integrations & Marketplace',
      subtitle: 'Configure Stripe, WhatsApp Cloud API, and Twilio SMS',
      icon: 'apps-outline',
      color: '#10b981',
    },
  ];

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText} allowFontScaling={false}>
              {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'P'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} allowFontScaling={false}>
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Property Manager'}
            </Text>
            <Text style={styles.profileRole} allowFontScaling={false}>
              Property Manager · WhatsLandlord Staff
            </Text>
          </View>
        </View>

        <Text style={styles.sectionHeader} allowFontScaling={false}>SERVICES MENU</Text>

        {/* Menu Options */}
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => onNavigate(item.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuLabel} allowFontScaling={false}>{item.label}</Text>
              <Text style={styles.menuSubtitle} allowFontScaling={false}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={16} color="#475569" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Log Out Button docked at the bottom */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => onNavigate('logout')}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.logoutBtnText} allowFontScaling={false}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (colors, isDarkMode) => StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 20 },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  profileRole: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  sectionHeader: { fontSize: 10, fontWeight: '800', color: colors.textMuted, marginBottom: 10, letterSpacing: 1 },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextContainer: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  menuSubtitle: { fontSize: 11.5, color: colors.textSecondary, marginTop: 2 },

  bottomButtonContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  logoutBtn: { 
    backgroundColor: '#ef4444', 
    borderRadius: 12, 
    paddingVertical: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
  },
  logoutBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
});
