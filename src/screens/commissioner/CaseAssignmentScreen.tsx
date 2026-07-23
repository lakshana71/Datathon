// CrimeSphere AI — CaseAssignmentScreen (Commissioner Module)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { AppHeader } from '../../components/layout/AppHeader';
import { MOCK_CASES, MOCK_OFFICERS_DIRECTORY } from '../../constants/mockData';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { DrawerParamList } from '../../types/navigation';
import type { Case } from '../../types';

type Props = {
  navigation: DrawerNavigationProp<DrawerParamList, 'CaseAssignment'>;
};

export const CaseAssignmentScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [cases, setCases] = useState<Case[]>(MOCK_CASES);
  const [search, setSearch] = useState('');

  const filteredCases = search.trim()
    ? cases.filter(
        (c) =>
          c.firNumber.toLowerCase().includes(search.toLowerCase()) ||
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.location.toLowerCase().includes(search.toLowerCase()) ||
          c.investigatingOfficer.toLowerCase().includes(search.toLowerCase())
      )
    : cases;

  const handleTransfer = (c: Case) => {
    Alert.alert(
      'Transfer Case & Reassign IO',
      `Transfer ${c.firNumber} (${c.title}) to another Police Station or Investigating Officer?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Assign to SI Deepa R.', onPress: () => updateIO(c.id, 'SI Deepa R.') },
        { text: 'Assign to SI Manjunath', onPress: () => updateIO(c.id, 'SI Manjunath') },
      ]
    );
  };

  const updateIO = (caseId: string, newIO: string) => {
    setCases((prev) =>
      prev.map((item) => (item.id === caseId ? { ...item, investigatingOfficer: newIO } : item))
    );
    Alert.alert('Transfer Complete', `Case ${caseId} has been reassigned to ${newIO}.`);
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
          <Text style={styles.title}>Case Assignment & Transfer</Text>
          <Text style={styles.subtitle}>Inter-Station & Officer Re-assignment Control Panel</Text>
        </View>

        <View style={styles.list}>
          {filteredCases.map((item) => (
            <View key={item.id} style={styles.caseCard}>
              <View style={styles.topRow}>
                <Text style={styles.firNumber}>{item.firNumber}</Text>
                <View style={[styles.prioBadge, item.priority === 'urgent' ? styles.urgent : styles.review]}>
                  <Text style={styles.prioText}>{item.priority.toUpperCase()}</Text>
                </View>
              </View>

              <Text style={styles.caseTitle}>{item.title}</Text>
              <Text style={styles.caseMeta}>📍 Location: {item.location} (Sector {item.sector})  ·  📅 Filed: {item.filedDate}</Text>
              <Text style={styles.caseSubMeta}>👤 Complainant: {item.complainant}  ·  📂 Category: {item.category}  ·  🔗 Linked: {item.linkedCases.length} cases</Text>
              <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>

              <View style={styles.ioRow}>
                <Text style={styles.ioLabel}>Assigned Investigating Officer (IO):</Text>
                <Text style={styles.ioVal}>{item.investigatingOfficer || 'Unassigned (Pending Re-assignment)'}</Text>
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  onPress={() => navigation.navigate('CaseDetail', { caseId: item.id })}
                  style={[styles.actionBtn, styles.btnOutline]}
                >
                  <Text style={styles.btnOutlineText}>👁 View Case</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleTransfer(item)}
                  style={[styles.actionBtn, styles.transferBtn]}
                >
                  <Text style={styles.transferText}>🔄 Transfer / Reassign IO</Text>
                </Pressable>
                <Pressable
                  onPress={() => Alert.alert('Escalate Priority', `Case ${item.firNumber} escalated to High Priority review.`)}
                  style={[styles.actionBtn, styles.btnRed]}
                >
                  <Text style={styles.btnRedText}>⚡ Escalate</Text>
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
  caseCard: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  firNumber: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.red,
    fontWeight: '700',
  },
  prioBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgent: { backgroundColor: Colors.redDim },
  review: { backgroundColor: Colors.amberDim },
  prioText: {
    fontFamily: FontFamily.mono,
    fontSize: 10,
    color: Colors.inkNavy,
  },
  caseTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
    marginBottom: 4,
  },
  caseMeta: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.gray,
    marginBottom: 2,
  },
  caseSubMeta: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.gray,
    marginBottom: 6,
  },
  desc: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.inkNavy,
    lineHeight: 16,
    marginBottom: 10,
  },
  ioRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
    backgroundColor: Colors.paperDim,
    padding: 8,
    borderRadius: 6,
  },
  ioLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  ioVal: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.inkNavy,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingHorizontal: 12,
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
  transferBtn: {
    backgroundColor: Colors.inkNavy,
  },
  transferText: {
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
