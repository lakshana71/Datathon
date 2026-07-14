// CrimeSphere AI — SideDrawer (Custom Drawer Content)
// Mirrors the HTML sidebar exactly: dark navy bg, red active border, group labels
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
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

const NAV_ITEMS: NavItem[] = [
  { id: 'overview-label', label: 'Overview', screen: '', icon: '', group: 'label' },
  { id: 'ControlRoom', label: 'Control Room', screen: 'ControlRoom', icon: '⊞' },
  { id: 'investigation-label', label: 'Investigation', screen: '', icon: '', group: 'label' },
  { id: 'CaseFiles', label: 'Case Files', screen: 'CaseFiles', icon: '📁' },
  { id: 'PersonCrimeTracker', label: 'Crime Tracker', screen: 'PersonCrimeTracker', icon: '◎' },
  { id: 'DutyNotebook', label: 'Duty Notebook', screen: 'DutyNotebook', icon: '💬' },
  { id: 'fieldops-label', label: 'Field Ops', screen: '', icon: '', group: 'label' },
  { id: 'CrimeMap', label: 'Crime Map', screen: 'CrimeMap', icon: '🗺' },
  { id: 'Alerts', label: 'Alerts', screen: 'Alerts', icon: '🔔' },
  { id: 'more-label', label: 'More', screen: '', icon: '', group: 'label' },
  { id: 'Search', label: 'Search', screen: 'Search', icon: '🔍' },
  { id: 'Notifications', label: 'Notifications', screen: 'Notifications', icon: '📬' },
  { id: 'Profile', label: 'Profile', screen: 'Profile', icon: '👤' },
  { id: 'Settings', label: 'Settings', screen: 'Settings', icon: '⚙' },
];

export const SideDrawer: React.FC<DrawerContentComponentProps> = (props) => {
  const { state, navigation } = props;
  const insets = useSafeAreaInsets();
  const { officer, logout } = useAuthStore();
  const activeRouteName = state.routes[state.index]?.name ?? '';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.sidebarBg} />

      {/* Brand */}
      <View style={styles.brand}>
        <View style={styles.brandHeader}>
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
      </View>

      {/* Nav */}
      <ScrollView
        style={styles.nav}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {NAV_ITEMS.map((item) => {
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
      </ScrollView>

      {/* Footer */}
      <View style={[styles.foot, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.footOfficer}>
          {officer && (
            <AvatarCircle initials={officer.initials} size={28} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.footStation}>Whitefield Sub-Division</Text>
            <Text style={styles.footForce}>Karnataka State Police</Text>
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
    backgroundColor: Colors.sidebarBg,
  },
  brand: {
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.sidebarSeparator,
    marginBottom: 8,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  nav: {
    flex: 1,
    paddingHorizontal: 12,
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
  foot: {
    paddingHorizontal: 22,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.sidebarSeparator,
    gap: 10,
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
