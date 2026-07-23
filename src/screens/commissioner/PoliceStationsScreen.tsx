// CrimeSphere AI — PoliceStationsScreen (Commissioner Module)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { AppHeader } from '../../components/layout/AppHeader';
import { ScreenScrollView } from '../../components/layout/ScreenScrollView';
import { MOCK_POLICE_STATIONS } from '../../constants/mockData';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { DrawerParamList } from '../../types/navigation';
import type { PoliceStation } from '../../types';

type Props = {
  navigation: DrawerNavigationProp<DrawerParamList, 'PoliceStations'>;
};

export const PoliceStationsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filteredStations = MOCK_POLICE_STATIONS.filter(
    (st) =>
      st.name.toLowerCase().includes(search.toLowerCase()) ||
      st.code.toLowerCase().includes(search.toLowerCase()) ||
      st.stationHouseOfficer.toLowerCase().includes(search.toLowerCase())
  );

  return (
        <ScreenScrollView
      backgroundColor={Colors.paper}
      header={
        <AppHeader
          onMenuPress={() => navigation.openDrawer()}
          searchQuery={search}
          onSearchChange={setSearch}
        />
      }
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 48 }]}
      showsVerticalScrollIndicator={true}
    >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Police Station Management</Text>
            <Text style={styles.subtitle}>District Jurisdiction · 14 Sub-Division Police Stations</Text>
          </View>
          <View style={styles.badgeCount}>
            <Text style={styles.badgeCountText}>14 Stations</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {filteredStations.map((station) => (
            <View key={station.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.stationCode}>{station.code}</Text>
                  <Text style={styles.stationName}>{station.name}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    station.status === 'alert'
                      ? styles.statusAlert
                      : station.status === 'busy'
                      ? styles.statusBusy
                      : styles.statusOk,
                  ]}
                >
                  <Text style={styles.statusText}>{station.status.toUpperCase()}</Text>
                </View>
              </View>

              <View style={styles.shoRow}>
                <Text style={styles.shoLabel}>Station House Officer (SHO):</Text>
                <Text style={styles.shoVal}>{station.stationHouseOfficer}</Text>
              </View>
              <Text style={styles.address}>📍 {station.address}  ·  📞 {station.phone}</Text>

              <View style={styles.divider} />

              <Text style={styles.secTitle}>Force Personnel Deployment</Text>
              <View style={styles.statGrid}>
                <View style={styles.miniStat}>
                  <Text style={styles.statVal}>{station.inspectorsCount}</Text>
                  <Text style={styles.statLbl}>Inspectors</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={styles.statVal}>{station.sisCount}</Text>
                  <Text style={styles.statLbl}>Sub-Inspectors</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={styles.statVal}>{station.headConstablesCount}</Text>
                  <Text style={styles.statLbl}>Head Constables</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={styles.statVal}>{station.constablesCount}</Text>
                  <Text style={styles.statLbl}>Constables</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.secTitle}>Case Metrics & Workload</Text>
              <View style={styles.caseRow}>
                <View style={styles.caseMetricBox}>
                  <Text style={styles.metricLabel}>ACTIVE</Text>
                  <Text style={styles.bold}>{station.activeCasesCount}</Text>
                </View>
                <View style={styles.caseMetricBox}>
                  <Text style={styles.metricLabel}>PENDING</Text>
                  <Text style={styles.boldRed}>{station.pendingCasesCount}</Text>
                </View>
                <View style={styles.caseMetricBox}>
                  <Text style={styles.metricLabel}>CLOSED</Text>
                  <Text style={styles.boldGreen}>{station.closedCasesCount}</Text>
                </View>
                <View style={styles.caseMetricBox}>
                  <Text style={styles.metricLabel}>HIGH PRIO</Text>
                  <Text style={styles.boldUrgent}>{station.highPriorityCasesCount}</Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8 }]}
                  onPress={() => alert(`Inspecting station details for ${station.name}`)}
                >
                  <Text style={styles.actionBtnText}>👁 View Station</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, styles.actionBtnNavy, pressed && { opacity: 0.8 }]}
                  onPress={() => navigation.navigate('OfficerManagement')}
                >
                  <Text style={[styles.actionBtnText, { color: Colors.white }]}>👥 Roster & Personnel</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.actionBtn, styles.actionBtnRed, pressed && { opacity: 0.8 }]}
                  onPress={() => navigation.navigate('CaseAssignment')}
                >
                  <Text style={[styles.actionBtnText, { color: Colors.white }]}>🔄 Assign Cases</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScreenScrollView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, height: '100%', overflow: 'hidden' },
  bg: { flex: 1, height: '100%', backgroundColor: Colors.paper, overflow: 'hidden' },
  container: { padding: 20 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
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
  badgeCount: {
    backgroundColor: Colors.inkNavy,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeCountText: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  stationCode: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.red,
    letterSpacing: 0.5,
  },
  stationName: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize.lg,
    color: Colors.inkNavy,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusAlert: { backgroundColor: Colors.redDim },
  statusBusy: { backgroundColor: Colors.amberDim },
  statusOk: { backgroundColor: Colors.greenDim },
  statusText: {
    fontFamily: FontFamily.mono,
    fontSize: 10,
    color: Colors.inkNavy,
  },
  shoRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  shoLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
  shoVal: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.inkNavy,
  },
  address: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.gray,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.line,
    marginVertical: 10,
  },
  secTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.inkNavy,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniStat: {
    alignItems: 'center',
  },
  statVal: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.mdPlus,
    color: Colors.inkNavy,
    fontWeight: '700',
  },
  statLbl: {
    fontFamily: FontFamily.body,
    fontSize: 10,
    color: Colors.gray,
  },
  caseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  caseMetricBox: {
    flex: 1,
    backgroundColor: Colors.paperDim,
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  metricLabel: {
    fontFamily: FontFamily.mono,
    fontSize: 9,
    color: Colors.gray,
    marginBottom: 2,
  },
  bold: { fontFamily: FontFamily.mono, fontSize: FontSize.md, fontWeight: '700', color: Colors.inkNavy },
  boldRed: { fontFamily: FontFamily.mono, fontSize: FontSize.md, color: Colors.amber, fontWeight: '700' },
  boldGreen: { fontFamily: FontFamily.mono, fontSize: FontSize.md, color: Colors.green, fontWeight: '700' },
  boldUrgent: { fontFamily: FontFamily.mono, fontSize: FontSize.md, color: Colors.red, fontWeight: '700' },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    paddingTop: 12,
    flexWrap: 'wrap',
  },
  actionBtn: {
    backgroundColor: Colors.paperDim,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionBtnNavy: {
    backgroundColor: Colors.inkNavy,
    borderColor: Colors.inkNavy,
  },
  actionBtnRed: {
    backgroundColor: Colors.red,
    borderColor: Colors.red,
  },
  actionBtnText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.inkNavy,
  },
});
