// CrimeSphere AI — DistrictAnalyticsScreen (Commissioner Module)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { AppHeader } from '../../components/layout/AppHeader';
import { MOCK_MONTHLY_TREND, MOCK_CATEGORY_DATA } from '../../constants/mockData';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { DrawerParamList } from '../../types/navigation';

type Props = {
  navigation: DrawerNavigationProp<DrawerParamList, 'DistrictAnalytics'>;
};

export const DistrictAnalyticsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const maxVal = Math.max(...MOCK_MONTHLY_TREND.map((d) => d.cases));
  const filteredCategories = MOCK_CATEGORY_DATA.filter((cat) =>
    cat.category.toLowerCase().includes(search.toLowerCase())
  );

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
          <Text style={styles.title}>District Analytics</Text>
          <Text style={styles.subtitle}>Comprehensive District Crime Trends & Incident Distribution</Text>
        </View>

        {/* Overview Stats */}
        <View style={styles.rowGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total District Cases</Text>
            <Text style={styles.statVal}>494</Text>
            <Text style={styles.statSub}>Jan - Jul 2026</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Disposal Rate</Text>
            <Text style={[styles.statVal, { color: Colors.green }]}>84.6%</Text>
            <Text style={styles.statSub}>Above State Avg (78%)</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Avg Charge-Sheet Time</Text>
            <Text style={[styles.statVal, { color: Colors.amber }]}>14.2 Days</Text>
            <Text style={styles.statSub}>SLA Target: 15 Days</Text>
          </View>
        </View>

        {/* Monthly Trend Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Crime Registration (2026)</Text>
          <View style={styles.chartContainer}>
            {MOCK_MONTHLY_TREND.map((item) => {
              const heightPct = (item.cases / maxVal) * 100;
              return (
                <View key={item.month} style={styles.barCol}>
                  <Text style={styles.barVal}>{item.cases}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: `${heightPct}%` }]} />
                  </View>
                  <Text style={styles.barLabel}>{item.month}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Category Distribution */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Crime Category Distribution</Text>
          <View style={styles.catList}>
            {filteredCategories.map((cat) => (
              <View key={cat.category} style={styles.catRow}>
                <View style={styles.catHeader}>
                  <Text style={styles.catName}>{cat.category}</Text>
                  <Text style={styles.catCount}>{cat.count} open FIRs</Text>
                </View>
                <View style={styles.catBarTrack}>
                  <View
                    style={[
                      styles.catBarFill,
                      { width: `${(cat.count / 27) * 100}%`, backgroundColor: cat.color },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, minHeight: 0 },
  bg: { flex: 1, minHeight: 0, backgroundColor: Colors.paper },
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
  rowGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 14,
  },
  statLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  statVal: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize['2xl'],
    color: Colors.inkNavy,
    fontWeight: '700',
    marginVertical: 4,
  },
  statSub: {
    fontFamily: FontFamily.mono,
    fontSize: 10,
    color: Colors.gray,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 16,
  },
  cardTitle: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize.mdPlus,
    color: Colors.inkNavy,
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: 20,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
  },
  barVal: {
    fontFamily: FontFamily.mono,
    fontSize: 10,
    color: Colors.gray,
    marginBottom: 4,
  },
  barTrack: {
    width: 24,
    height: 110,
    backgroundColor: Colors.paperDim,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    backgroundColor: Colors.inkNavy,
    borderRadius: 4,
  },
  barLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.gray,
    marginTop: 6,
  },
  catList: { gap: 12 },
  catRow: {},
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  catName: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.inkNavy,
  },
  catCount: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  catBarTrack: {
    height: 8,
    backgroundColor: Colors.paperDim,
    borderRadius: 4,
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
