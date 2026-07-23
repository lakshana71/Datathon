// CrimeSphere AI — FIRManagementScreen (Commissioner Module)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { AppHeader } from '../../components/layout/AppHeader';
import { MOCK_CASES } from '../../constants/mockData';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { DrawerParamList } from '../../types/navigation';
import type { CaseStatus } from '../../types';

type Props = {
  navigation: DrawerNavigationProp<DrawerParamList, 'FIRManagement'>;
};

const STATUS_FILTERS: { label: string; value: CaseStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Pending', value: 'pending' },
  { label: 'Closed', value: 'closed' },
];

const STATUS_COLOR: Record<string, string> = {
  open: Colors.red,
  pending: Colors.amber,
  closed: Colors.green,
};
const STATUS_BG: Record<string, string> = {
  open: Colors.redDim,
  pending: Colors.amberDim,
  closed: Colors.greenDim,
};

export const FIRManagementScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');

  const filtered = MOCK_CASES.filter((c) => {
    const matchSearch =
      c.firNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.complainant.toLowerCase().includes(search.toLowerCase()) ||
      c.investigatingOfficer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
            <Text style={styles.title}>FIR Management</Text>
            <Text style={styles.subtitle}>First Information Reports — District-Wide Registry</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filtered.length} FIRs</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.value;
            return (
              <Pressable
                key={f.value}
                onPress={() => setStatusFilter(f.value)}
                style={[styles.pill, active && styles.pillActive]}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.statsRow}>
          {(['open', 'pending', 'closed'] as CaseStatus[]).map((s) => {
            const cnt = MOCK_CASES.filter((c) => c.status === s).length;
            return (
              <View key={s} style={[styles.statCard, { borderTopColor: STATUS_COLOR[s], borderTopWidth: 3 }]}>
                <Text style={[styles.statVal, { color: STATUS_COLOR[s] }]}>{cnt}</Text>
                <Text style={styles.statLbl}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.list}>
          {filtered.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No FIRs match your search</Text>
            </View>
          ) : (
            filtered.map((c) => (
              <View key={c.id} style={styles.firCard}>
                <View style={styles.firTop}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.firNum}>{c.firNumber}</Text>
                    <Text style={styles.firTitle} numberOfLines={2}>{c.title}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[c.status] }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLOR[c.status] }]}>
                      {c.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.firMeta}>
                  <Text style={styles.metaItem}>👤 {c.complainant}</Text>
                  <Text style={styles.metaItem}>🔍 {c.investigatingOfficer}</Text>
                  <Text style={styles.metaItem}>📅 {c.filedDate}  ·  📍 {c.location}</Text>
                </View>
                <View style={styles.priorityRow}>
                  <View style={[
                    styles.prioBadge,
                    c.priority === 'urgent' ? styles.prioUrgent : c.priority === 'review' ? styles.prioReview : styles.prioRoutine,
                  ]}>
                    <Text style={styles.prioText}>{c.priority.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.category}>{c.category}</Text>
                </View>

                <View style={styles.actionRow}>
                  <Pressable
                    onPress={() => navigation.navigate('CaseDetail', { caseId: c.id })}
                    style={[styles.actionBtn, styles.btnOutline]}
                  >
                    <Text style={styles.btnOutlineText}>👁 View FIR</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => navigation.navigate('CaseAssignment')}
                    style={[styles.actionBtn, styles.btnNavy]}
                  >
                    <Text style={styles.btnNavyText}>🔄 Reassign IO</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => alert(`Exporting FIR ${c.firNumber} to official PDF format...`)}
                    style={[styles.actionBtn, styles.btnRed]}
                  >
                    <Text style={styles.btnRedText}>📄 Export PDF</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, minHeight: 0 },
  bg: { flex: 1, minHeight: 0, backgroundColor: Colors.paper },
  container: { padding: 20, gap: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: { fontFamily: FontFamily.display, fontSize: FontSize['2xl'], color: Colors.inkNavy },
  subtitle: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: Colors.gray, marginTop: 2 },
  countBadge: { backgroundColor: Colors.inkNavy, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  countText: { fontFamily: FontFamily.mono, fontSize: FontSize.xs, color: Colors.white },
  filterRow: { flexDirection: 'row', marginBottom: 4 },
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.paperDim, marginRight: 8, borderWidth: 1, borderColor: Colors.line },
  pillActive: { backgroundColor: Colors.inkNavy, borderColor: Colors.inkNavy },
  pillText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.smPlus, color: Colors.gray },
  pillTextActive: { color: Colors.white },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 8, borderWidth: 1, borderColor: Colors.line, padding: 12, alignItems: 'center' },
  statVal: { fontFamily: FontFamily.mono, fontSize: FontSize['2xl'], fontWeight: '700' },
  statLbl: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: Colors.gray, marginTop: 2 },
  list: { gap: 12 },
  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyIcon: { fontSize: 36 },
  emptyText: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: Colors.gray },
  firCard: { backgroundColor: Colors.card, borderRadius: 10, borderWidth: 1, borderColor: Colors.line, padding: 16, gap: 10 },
  firTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  firNum: { fontFamily: FontFamily.mono, fontSize: FontSize.xs, color: Colors.red, fontWeight: '700', marginBottom: 2 },
  firTitle: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: Colors.inkNavy },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  statusText: { fontFamily: FontFamily.mono, fontSize: 10, fontWeight: '700' },
  firMeta: { gap: 4 },
  metaItem: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: Colors.gray },
  priorityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: Colors.line, paddingTop: 8 },
  prioBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  prioUrgent: { backgroundColor: Colors.redDim },
  prioReview: { backgroundColor: Colors.amberDim },
  prioRoutine: { backgroundColor: Colors.greenDim },
  prioText: { fontFamily: FontFamily.mono, fontSize: 10, color: Colors.inkNavy },
  category: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: Colors.gray, textTransform: 'capitalize' },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  btnOutline: {
    backgroundColor: Colors.paperDim,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  btnOutlineText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.inkNavy,
  },
  btnNavy: {
    backgroundColor: Colors.inkNavy,
  },
  btnNavyText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  btnRed: {
    backgroundColor: Colors.red,
  },
  btnRedText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
});
