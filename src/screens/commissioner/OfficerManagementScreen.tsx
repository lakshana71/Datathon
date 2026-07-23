// CrimeSphere AI — OfficerManagementScreen (Commissioner Module)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { AppHeader } from '../../components/layout/AppHeader';
import { MOCK_OFFICERS_DIRECTORY } from '../../constants/mockData';
import { AvatarCircle } from '../../components/officer/OfficerAvatar';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { DrawerParamList } from '../../types/navigation';
import type { Role, Officer } from '../../types';

type Props = {
  navigation: DrawerNavigationProp<DrawerParamList, 'OfficerManagement'>;
};

const ROLE_FILTERS: { label: string; role: Role | 'all' }[] = [
  { label: 'All Personnel', role: 'all' },
  { label: 'Inspectors', role: 'inspector' },
  { label: 'Sub-Inspectors', role: 'sub_inspector' },
  { label: 'Head Constables', role: 'head_constable' },
  { label: 'Constables', role: 'constable' },
];

export const OfficerManagementScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<Role | 'all'>('all');

  const filteredOfficers = MOCK_OFFICERS_DIRECTORY.filter((off) => {
    const matchesSearch =
      off.name.toLowerCase().includes(search.toLowerCase()) ||
      off.badgeNumber.toLowerCase().includes(search.toLowerCase()) ||
      off.station.toLowerCase().includes(search.toLowerCase());
    const matchesRole = selectedRoleFilter === 'all' || off.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const handleReassign = (officer: Officer) => {
    Alert.alert(
      'Reassign Officer',
      `Reassign ${officer.name} (${officer.badgeNumber}) to a new Police Station or Beat Assignment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Assign Station', onPress: () => Alert.alert('Updated', `${officer.name} station assignment updated successfully.`) },
      ]
    );
  };

  return (
    <View style={styles.flex}>
      <AppHeader
        onMenuPress={() => navigation.openDrawer()}
        searchQuery={search}
        onSearchChange={setSearch}
      />
      <ScrollView
        style={styles.bg}
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 48, flexGrow: 1 }]}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Officer Management</Text>
            <Text style={styles.subtitle}>Personnel Roster & Duty Assignments Across District</Text>
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {ROLE_FILTERS.map((f) => {
            const active = selectedRoleFilter === f.role;
            return (
              <Pressable
                key={f.role}
                onPress={() => setSelectedRoleFilter(f.role)}
                style={[styles.filterPill, active && styles.filterPillActive]}
              >
                <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.list}>
          {filteredOfficers.map((officer) => (
            <View key={officer.id} style={styles.officerCard}>
              <View style={styles.cardTop}>
                <AvatarCircle initials={officer.initials} size={44} />
                <View style={styles.infoCol}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{officer.name}</Text>
                    <Text style={styles.badge}>{officer.badgeNumber}</Text>
                  </View>
                  <Text style={styles.rank}>{officer.rank} · {officer.station}</Text>
                  <Text style={styles.assignment}>Assignment: {officer.currentAssignment}</Text>
                  <Text style={styles.subMeta}>✉️ {officer.email}  ·  📅 Joined: {officer.joiningDate}</Text>
                </View>
              </View>

              <View style={styles.statsBar}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Active Cases</Text>
                  <Text style={styles.statVal}>{officer.casesCount || 0}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Efficiency Rating</Text>
                  <Text style={[styles.statVal, { color: Colors.green }]}>{officer.performanceScore || 85}%</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Contact</Text>
                  <Text style={styles.statValSub}>{officer.phone}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Force</Text>
                  <Text style={styles.statValSub}>{officer.force}</Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <Pressable
                  onPress={() => alert(`Full record dossier for ${officer.name} (${officer.badgeNumber})`)}
                  style={[styles.actionBtn, styles.actionBtnOutline]}
                >
                  <Text style={styles.actionBtnOutlineText}>👁 Record</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleReassign(officer)}
                  style={[styles.actionBtn, styles.reassignBtn]}
                >
                  <Text style={styles.reassignBtnText}>🔄 Reassign Beat</Text>
                </Pressable>
                <Pressable
                  onPress={() => Alert.alert('Transfer Station', `Initiating station transfer for ${officer.name}...`)}
                  style={[styles.actionBtn, styles.actionBtnNavy]}
                >
                  <Text style={styles.actionBtnNavyText}>🏛 Transfer Station</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, minHeight: 0 },
  bg: { flex: 1, minHeight: 0, backgroundColor: Colors.paper },
  container: { padding: 20 },
  headerRow: { marginBottom: 16 },
  title: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2xl'],
    color: Colors.inkNavy,
  },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.gray,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.paperDim,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  filterPillActive: {
    backgroundColor: Colors.inkNavy,
    borderColor: Colors.inkNavy,
  },
  filterPillText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.smPlus,
    color: Colors.gray,
  },
  filterPillTextActive: {
    color: Colors.white,
  },
  list: { gap: 14 },
  officerCard: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  infoCol: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.mdPlus,
    color: Colors.inkNavy,
  },
  badge: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.red,
  },
  rank: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.gray,
    marginTop: 2,
  },
  assignment: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.inkNavy,
    marginTop: 2,
    fontStyle: 'italic',
  },
  subMeta: {
    fontFamily: FontFamily.mono,
    fontSize: 9.5,
    color: Colors.gray,
    marginTop: 2,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: Colors.paperDim,
    borderRadius: 6,
    padding: 10,
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  statItem: { alignItems: 'center' },
  statLabel: {
    fontFamily: FontFamily.body,
    fontSize: 10,
    color: Colors.gray,
  },
  statVal: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
    fontWeight: '700',
  },
  statValSub: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 6,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionBtnOutline: {
    backgroundColor: Colors.paperDim,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  actionBtnOutlineText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.inkNavy,
  },
  reassignBtn: {
    backgroundColor: Colors.red,
  },
  reassignBtnText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  actionBtnNavy: {
    backgroundColor: Colors.inkNavy,
  },
  actionBtnNavyText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
});
