// CrimeSphere AI — SideDrawer (Custom Drawer Content)
// Mirrors the HTML sidebar exactly: dark navy bg, red active border, group labels
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Platform,
  Image,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { useAuthStore } from '../../store/authStore';
import { AvatarCircle } from '../officer/OfficerAvatar';

interface NavItem {
  id: string;
  label: string;
  screen: string;
  icon: string;
  group?: string;
}

const COMMISSIONER_NAV_ITEMS: NavItem[] = [
  // Overview — same as inspector
  { id: 'overview-label', label: 'Overview', screen: '', icon: '', group: 'label' },
  { id: 'ControlRoom', label: 'Control Room', screen: 'ControlRoom', icon: '⊞' },
  // Commissioner Admin tools
  { id: 'admin-label', label: 'Commissioner Admin', screen: '', icon: '', group: 'label' },
  { id: 'PoliceStations', label: 'Police Stations', screen: 'PoliceStations', icon: '🏛' },
  { id: 'OfficerManagement', label: 'Officer Mgmt', screen: 'OfficerManagement', icon: '👥' },
  { id: 'FIRManagement', label: 'FIR Management', screen: 'FIRManagement', icon: '📋' },
  { id: 'DistrictAnalytics', label: 'District Analytics', screen: 'DistrictAnalytics', icon: '📊' },
  { id: 'CrimeAnalytics', label: 'Crime Analytics', screen: 'CrimeAnalytics', icon: '📈' },
  { id: 'Reports', label: 'Reports', screen: 'Reports', icon: '📄' },
  { id: 'CaseAssignment', label: 'Assignments', screen: 'CaseAssignment', icon: '🔄' },
  { id: 'PerformanceDashboard', label: 'Performance', screen: 'PerformanceDashboard', icon: '🎯' },
  // More — same as inspector
  { id: 'more-label', label: 'More', screen: '', icon: '', group: 'label' },
  { id: 'Profile', label: 'Profile', screen: 'Profile', icon: '👤' },
  { id: 'Settings', label: 'Settings', screen: 'Settings', icon: '⚙' },
];

const STANDARD_NAV_ITEMS: NavItem[] = [
  { id: 'overview-label', label: 'Overview', screen: '', icon: '', group: 'label' },
  { id: 'ControlRoom', label: 'Control Room', screen: 'ControlRoom', icon: '⊞' },
  { id: 'investigation-label', label: 'Investigation', screen: '', icon: '', group: 'label' },
  { id: 'CaseFiles', label: 'Case Files', screen: 'CaseFiles', icon: '📁' },
  { id: 'ComplaintLetters', label: 'Complaints', screen: 'ComplaintLetters', icon: '📬' },
  { id: 'Documents', label: 'Documents', screen: 'Documents', icon: '🗂' },
  { id: 'PersonCrimeTracker', label: 'Crime Tracker', screen: 'PersonCrimeTracker', icon: '◎' },
  { id: 'DutyNotebook', label: 'Duty Notebook', screen: 'DutyNotebook', icon: '💬' },
  { id: 'fieldops-label', label: 'Field Ops', screen: '', icon: '', group: 'label' },
  { id: 'CrimeMap', label: 'Crime Map', screen: 'CrimeMap', icon: '🗺' },
  { id: 'Alerts', label: 'Alerts', screen: 'Alerts', icon: '🔔' },
  { id: 'more-label', label: 'More', screen: '', icon: '', group: 'label' },
  { id: 'Profile', label: 'Profile', screen: 'Profile', icon: '👤' },
  { id: 'Settings', label: 'Settings', screen: 'Settings', icon: '⚙' },
];

export const SideDrawer: React.FC<DrawerContentComponentProps> = (props) => {
  const { state, navigation } = props;
  const insets = useSafeAreaInsets();
  const { officer, logout } = useAuthStore();
  const activeRouteName = state.routes[state.index]?.name ?? '';

  const isComm = officer?.role === 'commissioner';
  // Commissioner gets their own nav (same item count as inspector)
  const navItems = isComm ? COMMISSIONER_NAV_ITEMS : STANDARD_NAV_ITEMS;

  const { height: winH } = useWindowDimensions();
  const [footerH, setFooterH] = useState(0);
  const onFooterLayout = useCallback((e: any) => {
    setFooterH(e.nativeEvent.layout.height);
  }, []);

  // On web: explicit pixel height for the scroll so it knows its bounds.
  // On native: flex:1 works because native layout propagates heights.
  const scrollH =
    Platform.OS === 'web' && winH > 0 && footerH > 0
      ? winH - footerH
      : undefined;
  return (
    <View style={[styles.container, { backgroundColor: Colors.sidebarBg }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.sidebarBg} />

      {/* Single ScrollView — explicit height on web so it can scroll */}
      <ScrollView
        style={[styles.scrollView, scrollH ? { height: scrollH } : null]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Brand ──────────────────────────────────────────────── */}
        <View style={styles.brand}>
          <Image
            source={require('../../../assets/karnataka_police_logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <View style={styles.brandTextContainer}>
            <Text style={styles.brandTitle}>CrimeSphere</Text>
            <Text style={styles.brandSub}>Crime Intelligence Platform</Text>
          </View>
        </View>

        <View style={styles.brandDivider} />

        {/* ── Nav items ──────────────────────────────────────────── */}
        <View style={styles.navList}>
          {navItems.map((item) => {
            if (item.group === 'label') {
              return (
                <Text key={item.id} style={styles.groupLabel}>
                  {item.label}
                </Text>
              );
            }
            const isActive = activeRouteName === item.screen;
            return (
              <Pressable
                key={item.id}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => navigation.navigate(item.screen)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <Text style={styles.navIcon}>{item.icon}</Text>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer pinned at bottom — measured so scroll knows how much space it gets */}
      <View
        onLayout={onFooterLayout}
        style={[styles.foot, { paddingBottom: Math.max(insets.bottom, 6) + 6 }]}
      >
        <View style={styles.footOfficer}>
          {officer && <AvatarCircle initials={officer.initials} size={28} />}
          <View style={{ flex: 1 }}>
            <Text style={styles.footStation} numberOfLines={1}>
              {officer?.name || 'Duty Officer'}
            </Text>
            <Text style={styles.footForce} numberOfLines={1}>
              {officer?.rank || 'Karnataka State Police'}
            </Text>
          </View>
        </View>
        <Pressable onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  },
  // Plain ScrollView — no DrawerContentScrollView fighting us with insets
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },

  // Brand
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 10,
    paddingBottom: 16,
  },
  brandLogo: {
    width: 44,
    height: 44,
  },
  brandTextContainer: {
    flex: 1,
  },
  brandTitle: {
    fontFamily: FontFamily.display,
    fontSize: 19,
    fontWeight: '600',
    color: Colors.sidebarText,
    letterSpacing: 0.2,
  },
  brandSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.sidebarMuted,
    marginTop: 4,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  brandDivider: {
    height: 1,
    backgroundColor: Colors.sidebarSeparator,
    marginBottom: 8,
    marginHorizontal: 10,
  },

  // Nav
  navList: {
    gap: 0,
  },
  groupLabel: {
    fontFamily: FontFamily.mono,
    fontSize: 10.5,
    color: Colors.sidebarLabel,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingTop: 16,
    paddingBottom: 6,
    paddingHorizontal: 10,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 2,
    borderLeftWidth: 3,
    borderLeftColor: Colors.transparent,
  },
  navItemActive: {
    backgroundColor: Colors.sidebarActiveItem,
    borderLeftColor: Colors.red,
  },
  navIcon: {
    fontSize: 14,
    width: 18,
    textAlign: 'center',
    opacity: 0.85,
  },
  navLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.mdPlus,
    color: Colors.sidebarItem,
  },
  navLabelActive: {
    color: Colors.white,
    fontFamily: FontFamily.bodyMedium,
  },

  // Footer — always pinned at the bottom
  foot: {
    paddingHorizontal: 22,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.sidebarSeparator,
    gap: 10,
    backgroundColor: Colors.sidebarBg,
  },
  footOfficer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footStation: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.sidebarMuted,
    lineHeight: 16,
  },
  footForce: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: '#5A6070',
  },
  logoutBtn: {
    paddingVertical: 6,
  },
  logoutText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.base,
    color: '#E05A4E',
  },
});
