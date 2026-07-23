// CrimeSphere AI — CrimeAnalyticsScreen (Commissioner Module)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { AppHeader } from '../../components/layout/AppHeader';
import { ScreenScrollView } from '../../components/layout/ScreenScrollView';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { DrawerParamList } from '../../types/navigation';

type Props = {
  navigation: DrawerNavigationProp<DrawerParamList, 'CrimeAnalytics'>;
};

export const CrimeAnalyticsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

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
          <Text style={styles.title}>Crime Pattern & Intelligence Analytics</Text>
          <Text style={styles.subtitle}>Modus Operandi Clustering, Recidivism Risk & Hotspot Forecasts</Text>
        </View>

        {/* Intelligence Cards */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Identified Crime Clusters (Whitefield Sub-Division)</Text>
          <View style={styles.clusterItem}>
            <View style={styles.clusterBadge}>
              <Text style={styles.clusterBadgeText}>CLUSTER 01</Text>
            </View>
            <Text style={styles.clusterTitle}>Hoodi 2-Wheeler Chain Snatching Pattern</Text>
            <Text style={styles.clusterDesc}>
              3 FIRs (1142, 1098, 1076) linked by identical MO, suspect composite, and 18:00–20:00 time windows near Hoodi Circle.
            </Text>
            <View style={styles.clusterFoot}>
              <Text style={styles.footTag}>Assigned: SI Manjunath</Text>
              <Text style={styles.footStatus}>High Recidivism Risk</Text>
            </View>
            <View style={styles.clusterActions}>
              <Pressable
                onPress={() => alert('Launching deep AI cluster investigation & graph analysis...')}
                style={[styles.actionBtn, styles.btnOutline]}
              >
                <Text style={styles.btnOutlineText}>🔍 Cluster Graph</Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('CrimeMap')}
                style={[styles.actionBtn, styles.btnNavy]}
              >
                <Text style={styles.btnNavyText}>🚔 Live Patrol Feed</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.clusterItem}>
            <View style={[styles.clusterBadge, { backgroundColor: Colors.amber }]}>
              <Text style={styles.clusterBadgeText}>CLUSTER 02</Text>
            </View>
            <Text style={styles.clusterTitle}>ITPL Corridor Motorcycle Thefts</Text>
            <Text style={styles.clusterDesc}>
              4 incidents in basement parking lots across ITPL Main Road with master key bypass. CCTV analysis underway.
            </Text>
            <View style={styles.clusterFoot}>
              <Text style={styles.footTag}>Assigned: HC Prakash</Text>
              <Text style={styles.footStatus}>Pattern Under Review</Text>
            </View>
            <View style={styles.clusterActions}>
              <Pressable
                onPress={() => alert('Launching deep AI cluster investigation & graph analysis...')}
                style={[styles.actionBtn, styles.btnOutline]}
              >
                <Text style={styles.btnOutlineText}>🔍 Cluster Graph</Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('CrimeMap')}
                style={[styles.actionBtn, styles.btnNavy]}
              >
                <Text style={styles.btnNavyText}>🚔 Live Patrol Feed</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Crime Typology Matrix */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Modus Operandi & Hotspot Matrix</Text>
          <View style={styles.matrixRow}>
            <Text style={styles.matrixHead}>Cyber Fraud (UPI/App)</Text>
            <Text style={styles.matrixVal}>9 Cases · Whitefield Main Rd</Text>
          </View>
          <View style={styles.matrixRow}>
            <Text style={styles.matrixHead}>Property / Vehicle Theft</Text>
            <Text style={styles.matrixVal}>8 Cases · ITPL & Hoodi</Text>
          </View>
          <View style={styles.matrixRow}>
            <Text style={styles.matrixHead}>Physical Assault / Disputes</Text>
            <Text style={styles.matrixVal}>4 Cases · Sector 4 & Marathahalli</Text>
          </View>
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
    marginBottom: 14,
  },
  clusterItem: {
    backgroundColor: Colors.paperDim,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 14,
    marginBottom: 12,
  },
  clusterBadge: {
    backgroundColor: Colors.red,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  clusterBadgeText: {
    fontFamily: FontFamily.mono,
    fontSize: 10,
    color: Colors.white,
  },
  clusterTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
    marginBottom: 4,
  },
  clusterDesc: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.gray,
    marginBottom: 10,
    lineHeight: 18,
  },
  clusterFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    paddingTop: 8,
  },
  footTag: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.inkNavy,
  },
  footStatus: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.red,
  },
  clusterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  btnOutline: {
    backgroundColor: Colors.card,
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
  matrixRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  matrixHead: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.inkNavy,
  },
  matrixVal: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
});
