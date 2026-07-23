// CrimeSphere AI — ReportsScreen (Commissioner Module)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { AppHeader } from '../../components/layout/AppHeader';
import { ScreenScrollView } from '../../components/layout/ScreenScrollView';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { DrawerParamList } from '../../types/navigation';

type Props = {
  navigation: DrawerNavigationProp<DrawerParamList, 'Reports'>;
};

const REPORTS_LIST = [
  { id: 'rep-1', title: 'Monthly District Crime Review (July 2026)', date: '22 Jul 2026', scope: 'District-Wide', type: 'PDF' },
  { id: 'rep-2', title: 'Station Disposal SLA Performance Audit', date: '20 Jul 2026', scope: 'Sub-Division', type: 'XLS' },
  { id: 'rep-3', title: 'Cyber Crime Cluster & Financial Recovery Summary', date: '18 Jul 2026', scope: 'Special Unit', type: 'PDF' },
  { id: 'rep-4', title: 'High Priority Unsolved Cases Quarterly Executive Brief', date: '15 Jul 2026', scope: 'Commissioner Office', type: 'PDF' },
];

export const ReportsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filteredReports = REPORTS_LIST.filter(
    (rep) =>
      rep.title.toLowerCase().includes(search.toLowerCase()) ||
      rep.scope.toLowerCase().includes(search.toLowerCase())
  );

  const handleGenerate = (title: string) => {
    Alert.alert('Generating Report', `Generating official report "${title}"... PDF download will commence shortly.`);
  };

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
            <Text style={styles.title}>District & Station Reports</Text>
            <Text style={styles.subtitle}>Official Executive Crime Statistics & Operational Audit Reports</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Available Reports</Text>
          {filteredReports.map((rep) => (
            <View key={rep.id} style={styles.repRow}>
              <View style={styles.repInfo}>
                <Text style={styles.repTitle}>{rep.title}</Text>
                <Text style={styles.repMeta}>Scope: {rep.scope}  ·  Published: {rep.date}  ·  Format: {rep.type}</Text>
              </View>
              <View style={styles.btnRow}>
                <Pressable onPress={() => alert(`Previewing official report "${rep.title}"...`)} style={styles.previewBtn}>
                  <Text style={styles.previewText}>👁 Preview</Text>
                </Pressable>
                <Pressable onPress={() => handleGenerate(rep.title)} style={styles.downloadBtn}>
                  <Text style={styles.downloadText}>⬇ Download {rep.type}</Text>
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
  repRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  repInfo: { flex: 1, paddingRight: 10 },
  repTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.smPlus,
    color: Colors.inkNavy,
  },
  repMeta: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.gray,
    marginTop: 2,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  previewBtn: {
    backgroundColor: Colors.paperDim,
    borderWidth: 1,
    borderColor: Colors.line,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 5,
  },
  previewText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.inkNavy,
  },
  downloadBtn: {
    backgroundColor: Colors.inkNavy,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
  },
  downloadText: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
});
