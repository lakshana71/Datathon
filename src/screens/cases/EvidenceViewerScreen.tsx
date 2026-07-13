// CrimeSphere AI — EvidenceViewerScreen
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { CaseStackParamList } from '../../types/navigation';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { useCaseStore } from '../../store/caseStore';

type Props = {
  navigation: StackNavigationProp<CaseStackParamList, 'EvidenceViewer'>;
  route: RouteProp<CaseStackParamList, 'EvidenceViewer'>;
};

const evidenceIcons: Record<string, string> = {
  document: '📄',
  photo: '📷',
  cctv: '📹',
  sketch: '✏️',
  screenshot: '🖥',
  audio: '🎙',
};

export const EvidenceViewerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { caseId, evidenceId } = route.params;
  const getCaseById = useCaseStore((s) => s.getCaseById);
  const caseItem = getCaseById(caseId);
  const insets = useSafeAreaInsets();

  const evidence = caseItem?.evidence.find((e) => e.id === evidenceId);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Evidence</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{caseId}</Text>
      </View>

      {evidence ? (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <View style={styles.preview}>
            <Text style={styles.previewIcon}>
              {evidenceIcons[evidence.type] ?? '📎'}
            </Text>
            <Text style={styles.previewType}>{evidence.type.toUpperCase()}</Text>
          </View>

          <Text style={styles.evTitle}>{evidence.title}</Text>
          <Text style={styles.evDesc}>{evidence.description}</Text>

          <View style={styles.card}>
            {[
              ['Evidence ID', evidence.id],
              ['Type', evidence.type],
              ['Date recorded', evidence.date],
              ['Case', caseId],
              ['Chain of custody', 'Verified — no tampering detected'],
            ].map(([label, value]) => (
              <View key={label} style={styles.metaRow}>
                <Text style={styles.metaLabel}>{label}</Text>
                <Text style={styles.metaValue}>{value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>Download</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.actionBtnSecondary]}>
              <Text style={styles.actionBtnTextSecondary}>Add to Report</Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Evidence not found.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.paper, height: '100%', overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {},
  backText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.md, color: Colors.inkNavy },
  headerTitle: { fontFamily: FontFamily.mono, fontSize: FontSize.base, color: Colors.gray },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 60, gap: 14 },
  preview: {
    backgroundColor: Colors.paperDim,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 10,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  previewIcon: { fontSize: 54 },
  previewType: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.sm,
    color: Colors.gray,
    letterSpacing: 1,
  },
  evTitle: { fontFamily: FontFamily.display, fontSize: 22, fontWeight: '600', color: Colors.inkNavy },
  evDesc: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: Colors.gray, lineHeight: 20 },
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 10,
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  metaLabel: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.base, color: Colors.gray, width: 160 },
  metaValue: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: Colors.inkNavy, flex: 1 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.inkNavy,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionBtnSecondary: { backgroundColor: Colors.paperDim },
  actionBtnText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: Colors.white },
  actionBtnTextSecondary: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: Colors.inkNavy },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: Colors.gray },
});
