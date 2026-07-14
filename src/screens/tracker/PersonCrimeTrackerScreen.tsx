// CrimeSphere AI — PersonCrimeTrackerScreen
// Intelligence board for cross-referencing suspects by ID, name, phone, vehicle, or FIR.
// Design follows the official CrimeSphere palette: cream/paper background, ink navy, steel, accent colors.

import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Text, SafeAreaView,
  TextInput, ScrollView, Pressable, Animated
} from 'react-native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList, CaseStackParamList } from '../../types/navigation';
import { useNavigation, useRoute, RouteProp, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Suspect, SuspectProfileCard, IntelCluster, SuspectPickerCard } from '../../components/tracker/TrackerComponents';

type TrackerScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'PersonCrimeTracker'>,
  StackNavigationProp<CaseStackParamList>
>;

// ─── Mock Suspects Database ──────────────────────────────────────────────────

const SUSPECTS_DB: Record<string, Suspect> = {
  'CS-88901': {
    id: 'CS-88901',
    name: 'John Doe',
    alias: 'JD, The Ghost',
    dob: '12-May-1985',
    status: 'WANTED',
    riskScore: 92,
    crimes: [
      { type: 'Narcotics Distribution', count: 3 },
      { type: 'Extortion', count: 1 },
      { type: 'Assault', count: 2 },
    ],
    timeline: [
      { date: '15 Jan 2022', event: 'First Arrest — Assault charge filed at Whitefield PS' },
      { date: '22 Jun 2023', event: 'Named primary suspect in FIR-2023-089' },
      { date: '10 Feb 2024', event: 'Evaded capture at Checkpoint Alpha, MG Road' },
    ],
    linkedFIRs: ['FIR-2023-089', 'KA-CR-1142'],
    phones: ['+91-9876543210', '+91-9988776655'],
    vehicles: ['MH-01-AB-1234', 'KA-03-XY-9876'],
    accounts: ['HDFC ****3321', 'SBI ****7812'],
    associates: [
      { id: 'CS-99212', name: 'Mike Johnson' },
      { id: 'CS-77189', name: 'Jane Smith' }
    ]
  },
  'CS-99212': {
    id: 'CS-99212',
    name: 'Mike Johnson',
    alias: 'Big Mike',
    dob: '18-Aug-1989',
    status: 'UNDER WATCH',
    riskScore: 78,
    crimes: [
      { type: 'Financial Fraud', count: 2 },
      { type: 'Extortion', count: 1 },
    ],
    timeline: [
      { date: '10 Mar 2023', event: 'Suspicious transactions flagged by HDFC Cyber Cell' },
      { date: '22 Jun 2023', event: 'Linked to John Doe in FIR-2023-089' },
    ],
    linkedFIRs: ['FIR-2023-089'],
    phones: ['+91-9998887776'],
    vehicles: ['KA-51-MM-5566'],
    accounts: ['HDFC ****3321'],
    associates: [{ id: 'CS-88901', name: 'John Doe' }]
  },
  'CS-77189': {
    id: 'CS-77189',
    name: 'Jane Smith',
    alias: 'Lady Luck',
    dob: '04-Jan-1992',
    status: 'ACTIVE',
    riskScore: 84,
    crimes: [
      { type: 'Cyber Crime', count: 4 },
    ],
    timeline: [
      { date: '12 Aug 2023', event: 'IP traced to ransomware campaign targeting Bengaluru firms' },
      { date: '05 Jan 2024', event: 'Device MAC matches John Doe associate safehouse' },
    ],
    linkedFIRs: ['KA-CR-1156'],
    phones: ['+91-8887776665'],
    vehicles: [],
    accounts: ['Paytm ****8877'],
    associates: [{ id: 'CS-88901', name: 'John Doe' }]
  }
};

const ALL_SUSPECTS = Object.values(SUSPECTS_DB);

// ─── Cluster Accent Configuration ─────────────────────────────────────────────

const CLUSTER_CONFIG = [
  { key: 'linkedFIRs', title: 'Linked Cases (FIRs)', icon: '📁', color: Colors.red },
  { key: 'phones',     title: 'Communications',       icon: '📞', color: Colors.steel },
  { key: 'vehicles',   title: 'Registered Vehicles',  icon: '🚗', color: Colors.amber },
  { key: 'accounts',   title: 'Financial Accounts',   icon: '🏦', color: Colors.green },
  { key: 'associates', title: 'Known Associates',      icon: '👥', color: Colors.inkNavy2, isAssociates: true },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export const PersonCrimeTrackerScreen = () => {
  const navigation = useNavigation<TrackerScreenNavigationProp>();
  const route = useRoute<RouteProp<DrawerParamList, 'PersonCrimeTracker'>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSuspectId, setCurrentSuspectId] = useState('CS-88901');
  const [filteredSuspects, setFilteredSuspects] = useState(ALL_SUSPECTS);

  // Handle incoming route params (from CaseDetail "Suspects" node tap)
  useEffect(() => {
    const q = route.params?.query;
    if (q) {
      setSearchQuery(q);
      runSearch(q);
    }
  }, [route.params?.query]);

  const runSearch = (q: string) => {
    const lower = q.toLowerCase().trim();
    if (!lower) {
      setFilteredSuspects(ALL_SUSPECTS);
      return;
    }
    const results = ALL_SUSPECTS.filter(s =>
      s.id.toLowerCase().includes(lower) ||
      s.name.toLowerCase().includes(lower) ||
      s.alias.toLowerCase().includes(lower) ||
      s.phones.some(p => p.includes(lower)) ||
      s.vehicles.some(v => v.toLowerCase().includes(lower)) ||
      s.linkedFIRs.some(f => f.toLowerCase().includes(lower))
    );
    setFilteredSuspects(results);
    if (results.length === 1) {
      setCurrentSuspectId(results[0].id);
    }
  };

  const handleSearch = () => runSearch(searchQuery);

  const handleFIRClick = (firId: string) => {
    navigation.navigate('CaseDetail', { caseId: firId });
  };

  const handleAssociateClick = (associate: { id: string; name: string }) => {
    if (SUSPECTS_DB[associate.id]) {
      setCurrentSuspectId(associate.id);
    }
  };

  const currentSuspect = SUSPECTS_DB[currentSuspectId];

  return (
    <SafeAreaView style={styles.root}>
      {/* ── Top Header Bar ────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.openDrawer()}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.topBarTitle}>Criminal Intelligence</Text>
          <Text style={styles.topBarSub}>Person Crime History Tracker</Text>
        </View>
        <View style={styles.topBarBadge}>
          <View style={styles.topBarDot} />
          <Text style={styles.topBarBadgeText}>LIVE</Text>
        </View>
      </View>

      <View style={styles.bodyRow}>
        {/* ── Left: Suspect Selector Sidebar ──────────────────────────── */}
        <View style={styles.selectorSidebar}>
          {/* Search */}
          <View style={styles.searchBox}>
            <Text style={styles.searchLabel}>SEARCH SUSPECT</Text>
            <View style={styles.searchInputRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Name, ID, FIR, Phone, Vehicle..."
                placeholderTextColor={Colors.gray}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                <Text style={styles.searchBtnText}>GO</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.searchHint}>
              {filteredSuspects.length} result{filteredSuspects.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Suspect list */}
          <ScrollView style={styles.suspectList} showsVerticalScrollIndicator={false}>
            {filteredSuspects.map(s => (
              <SuspectPickerCard
                key={s.id}
                suspect={s}
                isActive={s.id === currentSuspectId}
                onPress={() => setCurrentSuspectId(s.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* ── Center: Suspect Profile Card ────────────────────────────── */}
        <View style={styles.profileCol}>
          {currentSuspect ? (
            <SuspectProfileCard suspect={currentSuspect} />
          ) : (
            <View style={styles.emptyProfile}>
              <Text style={styles.emptyText}>Select a suspect to view their intelligence file.</Text>
            </View>
          )}
        </View>

        {/* ── Right: Intelligence Clusters ────────────────────────────── */}
        <ScrollView style={styles.clustersCol} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 14, gap: 0 }}>
          {currentSuspect && CLUSTER_CONFIG.map(cfg => {
            const rawItems = (currentSuspect as any)[cfg.key] as any[];
            return (
              <IntelCluster
                key={cfg.key}
                title={cfg.title}
                icon={cfg.icon}
                items={rawItems}
                accentColor={cfg.color}
                isAssociates={cfg.isAssociates}
                onItemPress={cfg.isAssociates ? handleAssociateClick : cfg.key === 'linkedFIRs' ? handleFIRClick : () => {}}
              />
            );
          })}

          {/* AI Insight Card */}
          {currentSuspect && (
            <View style={styles.aiCard}>
              <View style={styles.aiCardHeader}>
                <Text style={styles.aiCardIcon}>🤖</Text>
                <Text style={styles.aiCardTitle}>AI INVESTIGATION INSIGHTS</Text>
              </View>
              <Text style={styles.aiCardText}>
                {`Suspect ${currentSuspect.name} (${currentSuspect.id}) presents a high network density with ${currentSuspect.associates.length} known associates across ${currentSuspect.linkedFIRs.length} active FIRs. Priority action: cross-match call data records (CDR) against FIR timeline windows. Financial trace via ${currentSuspect.accounts[0] || 'registered account'} is recommended.`}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.paper,
  },

  // Header
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inkNavy,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 2,
    borderBottomColor: Colors.steel,
  },
  menuBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  menuIcon: {
    color: Colors.sidebarText,
    fontSize: 18,
  },
  topBarTitle: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize['2xl'],
    color: Colors.white,
  },
  topBarSub: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.sidebarMuted,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  topBarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.green + '22',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.green + '60',
    gap: 5,
  },
  topBarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
  },
  topBarBadgeText: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.green,
    fontWeight: '700',
  },

  // Body layout
  bodyRow: {
    flex: 1,
    flexDirection: 'row',
  },

  // Left selector sidebar
  selectorSidebar: {
    width: 220,
    borderRightWidth: 1,
    borderRightColor: Colors.line,
    backgroundColor: Colors.card,
  },
  searchBox: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  searchLabel: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
    letterSpacing: 1,
    marginBottom: 6,
  },
  searchInputRow: {
    flexDirection: 'row',
    gap: 6,
  },
  searchInput: {
    flex: 1,
    height: 34,
    backgroundColor: Colors.paper,
    borderRadius: 6,
    paddingHorizontal: 10,
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.inkNavy,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  searchBtn: {
    width: 36,
    height: 34,
    backgroundColor: Colors.inkNavy,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.white,
    fontWeight: '700',
  },
  searchHint: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
    marginTop: 5,
  },
  suspectList: {
    flex: 1,
  },

  // Center profile
  profileCol: {
    flex: 1.3,
    padding: 14,
    borderRightWidth: 1,
    borderRightColor: Colors.line,
  },
  emptyProfile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.lg,
    color: Colors.gray,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Right clusters
  clustersCol: {
    flex: 1,
    backgroundColor: Colors.paper,
  },

  // AI Insight card
  aiCard: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.line,
    borderLeftWidth: 3,
    borderLeftColor: Colors.inkNavy,
    padding: 14,
    marginTop: 10,
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  aiCardIcon: {
    fontSize: 16,
  },
  aiCardTitle: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.inkNavy,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  aiCardText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.inkNavy2,
    lineHeight: 20,
  },
});
