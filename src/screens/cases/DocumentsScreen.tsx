// CrimeSphere AI — DocumentsScreen (All Roles)
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
  navigation: DrawerNavigationProp<DrawerParamList, 'Documents'>;
};

// Aggregate documents from all cases
const ALL_DOCS = MOCK_CASES.flatMap((c) =>
  c.evidence
    .filter((e) => e.type === 'document' || e.type === 'screenshot')
    .map((e) => ({ ...e, firNumber: c.firNumber, caseTitle: c.title }))
);

const TYPE_ICON: Record<string, string> = {
  document: '📄',
  screenshot: '🖼',
  photo: '📷',
  cctv: '📹',
  audio: '🎙',
  sketch: '✏️',
};

export const DocumentsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filtered = ALL_DOCS.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.firNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.caseTitle.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase())
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
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 48 }]}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Documents</Text>
            <Text style={styles.subtitle}>Case-linked Documents, Screenshots & Annexures</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filtered.length} files</Text>
          </View>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyText}>No documents match your search</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filtered.map((doc) => (
              <Pressable
                key={`${doc.firNumber}-${doc.id}`}
                style={({ pressed }) => [styles.docCard, pressed && styles.docCardPressed]}
                onPress={() =>
                  Alert.alert(doc.title, `${doc.description}\n\nFIR: ${doc.firNumber}`)
                }
              >
                <View style={styles.docIconRow}>
                  <Text style={styles.docIcon}>{TYPE_ICON[doc.type] ?? '📄'}</Text>
                  <View style={styles.docTypeBadge}>
                    <Text style={styles.docTypeText}>{doc.type.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.docTitle} numberOfLines={2}>{doc.title}</Text>
                <Text style={styles.docDesc} numberOfLines={2}>{doc.description}</Text>
                <View style={styles.docMeta}>
                  <Text style={styles.metaFir}>{doc.firNumber}</Text>
                  <Text style={styles.metaDate}>{doc.date}</Text>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  docCard: {
    width: '47%',
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 14,
    gap: 6,
  },
  docCardPressed: { opacity: 0.8 },
  docIconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  docIcon: { fontSize: 24 },
  docTypeBadge: {
    backgroundColor: Colors.paperDim,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  docTypeText: {
    fontFamily: FontFamily.mono,
    fontSize: 9,
    color: Colors.gray,
  },
  docTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.smPlus,
    color: Colors.inkNavy,
  },
  docDesc: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.gray,
    lineHeight: 15,
  },
  docMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    paddingTop: 6,
    marginTop: 2,
  },
  metaFir: {
    fontFamily: FontFamily.mono,
    fontSize: 9.5,
    color: Colors.red,
  },
  metaDate: {
    fontFamily: FontFamily.mono,
    fontSize: 9.5,
    color: Colors.gray,
  },
});
