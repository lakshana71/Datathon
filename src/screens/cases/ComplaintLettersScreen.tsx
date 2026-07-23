// CrimeSphere AI — ComplaintLettersScreen (All Roles)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { AppHeader } from '../../components/layout/AppHeader';
import { MOCK_CASES } from '../../constants/mockData';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { DrawerParamList } from '../../types/navigation';

type Props = {
  navigation: DrawerNavigationProp<DrawerParamList, 'ComplaintLetters'>;
};

// Derive complaint records from cases
const COMPLAINT_LETTERS = MOCK_CASES.map((c, i) => ({
  id: `CL-${String(i + 1).padStart(3, '0')}`,
  firNumber: c.firNumber,
  complainant: c.complainant,
  subject: c.title,
  date: c.filedDate,
  location: c.location,
  status: c.status,
  priority: c.priority,
}));

const STATUS_COLOR: Record<string, string> = {
  open: Colors.red,
  pending: Colors.amber,
  closed: Colors.green,
};

export const ComplaintLettersScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filtered = COMPLAINT_LETTERS.filter(
    (cl) =>
      cl.firNumber.toLowerCase().includes(search.toLowerCase()) ||
      cl.complainant.toLowerCase().includes(search.toLowerCase()) ||
      cl.subject.toLowerCase().includes(search.toLowerCase())
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
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Complaint Letters</Text>
            <Text style={styles.subtitle}>Registered Complaints & Petition Registry</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filtered.length} letters</Text>
          </View>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📬</Text>
            <Text style={styles.emptyText}>No complaints match your search</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((cl) => (
              <Pressable
                key={cl.id}
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
                onPress={() =>
                  Alert.alert(
                    `Complaint: ${cl.id}`,
                    `Complainant: ${cl.complainant}\nSubject: ${cl.subject}\nFIR: ${cl.firNumber}\nDate: ${cl.date}`
                  )
                }
              >
                <View style={styles.topRow}>
                  <View style={styles.idRow}>
                    <Text style={styles.clId}>{cl.id}</Text>
                    <Text style={styles.firRef}> · {cl.firNumber}</Text>
                  </View>
                  <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[cl.status] }]} />
                </View>
                <Text style={styles.subject} numberOfLines={2}>{cl.subject}</Text>
                <Text style={styles.complainant}>📝 {cl.complainant}</Text>
                <View style={styles.footer}>
                  <Text style={styles.footDate}>📅 {cl.date}</Text>
                  <Text style={styles.footLocation}>📍 {cl.location}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bg: { flex: 1, backgroundColor: Colors.paper },
  container: { padding: 20, gap: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: { fontFamily: FontFamily.display, fontSize: FontSize['2xl'], color: Colors.inkNavy },
  subtitle: { fontFamily: FontFamily.body, fontSize: FontSize.sm, color: Colors.gray, marginTop: 2 },
  countBadge: { backgroundColor: Colors.inkNavy, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  countText: { fontFamily: FontFamily.mono, fontSize: FontSize.xs, color: Colors.white },
  emptyBox: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: Colors.gray },
  list: { gap: 10 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 16,
    gap: 6,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  idRow: { flexDirection: 'row', alignItems: 'center' },
  clId: { fontFamily: FontFamily.monoMedium, fontSize: FontSize.sm, color: Colors.inkNavy },
  firRef: { fontFamily: FontFamily.mono, fontSize: FontSize.sm, color: Colors.red },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  subject: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: Colors.inkNavy },
  complainant: { fontFamily: FontFamily.body, fontSize: FontSize.xs, color: Colors.gray },
  footer: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    paddingTop: 8,
    marginTop: 2,
  },
  footDate: { fontFamily: FontFamily.mono, fontSize: FontSize.xs, color: Colors.gray },
  footLocation: { fontFamily: FontFamily.mono, fontSize: FontSize.xs, color: Colors.gray },
});
