// CrimeSphere AI — ControlRoomScreen (Dashboard)
// Mirrors the HTML "overview" view exactly
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { StatCard } from '../../components/cards/StatCard';
import { TickerItem } from '../../components/cards/TickerItem';
import { SimpleBars } from '../../components/charts/IncidentBarChart';
import { AppHeader } from '../../components/layout/AppHeader';
import {
  MOCK_STATS,
  MOCK_LIVE_FEED,
  MOCK_PRIORITY_CASES,
  MOCK_BAR_DATA,
} from '../../constants/mockData';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { DrawerParamList } from '../../types/navigation';

type Props = {
  navigation: DrawerNavigationProp<DrawerParamList, 'ControlRoom'>;
};

export const ControlRoomScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <AppHeader onMenuPress={() => navigation.openDrawer()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.red} />}
      >
        {/* Page Head */}
        <View style={styles.pageHeadContainer}>
          <View style={styles.pageHeadText}>
            <Text style={styles.eyebrow}>Control Room</Text>
            <Text style={styles.heading}>Good afternoon, Inspector.</Text>
            <Text style={styles.subtitle}>
              Here's where things stand across the sub-division right now.
            </Text>
          </View>
          <Image
            source={require('../../../assets/karnataka_police_logo.png')}
            style={styles.kspLogo}
            resizeMode="contain"
          />
        </View>

        {/* Stat Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statRow}
        >
          {MOCK_STATS.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </ScrollView>

        {/* Charts + Live Feed row */}
        <View style={styles.twoCol}>
          {/* Bar Chart Card */}
          <View style={[styles.card, styles.chartCard]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Reported incidents, last 7 days</Text>
              <Text style={styles.cardTag}>SECTOR 4–9</Text>
            </View>
            <SimpleBars data={MOCK_BAR_DATA} />
          </View>

          {/* Live Feed Card */}
          <View style={[styles.card, styles.feedCard]}>
            <Text style={styles.cardTitle}>Live feed</Text>
            <View style={styles.ticker}>
              {MOCK_LIVE_FEED.map((item, i) => (
                <TickerItem
                  key={item.id}
                  item={item}
                  isLast={i === MOCK_LIVE_FEED.length - 1}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Priority Cases */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Cases likely to need attention today</Text>
            <Text style={styles.cardTag}>SORTED BY PRIORITY</Text>
          </View>
          <View style={styles.ticker}>
            {MOCK_PRIORITY_CASES.map((item, i) => (
              <TickerItem
                key={item.id}
                item={item}
                isLast={i === MOCK_PRIORITY_CASES.length - 1}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  scroll: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 60,
    gap: 18,
  },
  pageHeadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 16,
  },
  pageHeadText: {
    flex: 1,
  },
  kspLogo: {
    width: 64,
    height: 64,
  },
  eyebrow: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.sm,
    letterSpacing: 1,
    color: Colors.red,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heading: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['4xl'],
    fontWeight: '600',
    color: Colors.inkNavy,
  },
  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.mdPlus,
    color: Colors.gray,
    marginTop: 5,
    lineHeight: 20,
  },
  statRow: {
    flexDirection: 'row',
    gap: 14,
    paddingRight: 4,
  },
  twoCol: {
    gap: 16,
  },
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 10,
    padding: 18,
  },
  chartCard: {
    flex: 1,
  },
  feedCard: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.inkNavy,
    flex: 1,
    marginRight: 8,
  },
  cardTag: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  ticker: {
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
