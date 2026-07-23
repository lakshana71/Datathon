// CrimeSphere AI — PerformanceDashboardScreen (Commissioner Module)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { AppHeader } from '../../components/layout/AppHeader';
import { ScreenScrollView } from '../../components/layout/ScreenScrollView';
import { MOCK_STATION_PERFORMANCE } from '../../constants/mockData';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { DrawerParamList } from '../../types/navigation';

type Props = {
  navigation: DrawerNavigationProp<DrawerParamList, 'PerformanceDashboard'>;
};

export const PerformanceDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const filteredStations = MOCK_STATION_PERFORMANCE.filter((st) =>
    st.stationName.toLowerCase().includes(search.toLowerCase())
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
          <Text style={styles.title}>Performance Dashboard</Text>
          <Text style={styles.subtitle}>Station SLA Compliance, Investigation Velocity & Efficiency Scores</Text>
        </View>

        <View style={styles.list}>
          {filteredStations.map((st) => (
            <View key={st.stationId} style={styles.card}>
              <View style={styles.topRow}>
                <Text style={styles.stationName}>{st.stationName}</Text>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>Score: {st.score}/100</Text>
                </View>
              </View>

              <View style={styles.grid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricVal}>{st.resolutionRate}%</Text>
                  <Text style={styles.metricLbl}>Resolution Rate</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricVal}>{st.avgDisposalDays}d</Text>
                  <Text style={styles.metricLbl}>Avg Disposal</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricVal, st.pendingFirSlaBreach > 2 ? styles.redVal : undefined]}>
                    {st.pendingFirSlaBreach}
                  </Text>
                  <Text style={styles.metricLbl}>SLA Breaches</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricVal}>{st.evidenceCollectionRate}%</Text>
                  <Text style={styles.metricLbl}>Evidence Index</Text>
                </View>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${st.score}%` }]} />
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  onPress={() => alert(`Conducting efficiency audit for ${st.stationName}...`)}
                  style={[styles.actionBtn, styles.btnOutline]}
                >
                  <Text style={styles.btnOutlineText}>🔍 Audit Station</Text>
                </Pressable>
                <Pressable
                  onPress={() => alert(`SLA warning notice issued to SHO of ${st.stationName}.`)}
                  style={[styles.actionBtn, styles.btnRed]}
                >
                  <Text style={styles.btnRedText}>⚠️ Issue SLA Warning</Text>
                </Pressable>
                <Pressable
                  onPress={() => alert(`Exporting performance report for ${st.stationName} in PDF format.`)}
                  style={[styles.actionBtn, styles.btnNavy]}
                >
                  <Text style={styles.btnNavyText}>📄 Export Audit</Text>
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
  container: { padding: 20, gap: 16 },
  headerRow: { marginBottom: 4 },
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
  list: { gap: 12 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stationName: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize.lg,
    color: Colors.inkNavy,
  },
  scoreBadge: {
    backgroundColor: Colors.paperDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  scoreText: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.inkNavy,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricItem: { alignItems: 'center' },
  metricVal: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.lg,
    color: Colors.inkNavy,
    fontWeight: '700',
  },
  redVal: { color: Colors.red },
  metricLbl: {
    fontFamily: FontFamily.body,
    fontSize: 10,
    color: Colors.gray,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.paperDim,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.inkNavy,
    borderRadius: 3,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
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
  btnRed: {
    backgroundColor: Colors.redDim,
    borderWidth: 1,
    borderColor: Colors.red,
  },
  btnRedText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.red,
  },
  btnNavy: {
    backgroundColor: Colors.inkNavy,
  },
  btnNavyText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
});
