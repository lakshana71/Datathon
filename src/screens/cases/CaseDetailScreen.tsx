// CrimeSphere AI — CaseDetailScreen
import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { CaseStackParamList } from '../../types/navigation';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { useCaseStore } from '../../store/caseStore';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Priority, TimelineEntry, Evidence } from '../../types';

type Props = {
  navigation: StackNavigationProp<CaseStackParamList, 'CaseDetail'>;
  route: RouteProp<CaseStackParamList, 'CaseDetail'>;
};

const priorityColors: Record<Priority, string> = {
  urgent: Colors.red,
  review: Colors.amber,
  routine: Colors.green,
};

const evidenceIcons: Record<string, string> = {
  document: '📄',
  photo: '📷',
  cctv: '📹',
  sketch: '✏️',
  screenshot: '🖥',
  audio: '🎙',
};

export const CaseDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { caseId } = route.params;
  const getCaseById = useCaseStore((s) => s.getCaseById);
  const caseItem = getCaseById(caseId);
  const insets = useSafeAreaInsets();

  if (!caseItem) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <EmptyState icon="📂" title="Case not found" subtitle={`No case with ID ${caseId}`} />
      </View>
    );
  }

  const pc = priorityColors[caseItem.priority];

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Custom back header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Cases</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{caseItem.firNumber}</Text>
        <Pressable
          onPress={() => navigation.navigate('ReportPreview', { caseId })}
          style={styles.reportBtn}
        >
          <Text style={styles.reportBtnText}>Report</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Title + stamp */}
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <Text style={styles.firNumber}>{caseItem.firNumber}</Text>
            <Text style={styles.title}>{caseItem.title}</Text>
          </View>
          <View style={[styles.stamp, { borderColor: pc }]}>
            <Text style={[styles.stampText, { color: pc }]}>
              {caseItem.priority.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Meta */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Case Details</Text>
          {[
            ['Filed', caseItem.filedDate],
            ['Complainant', caseItem.complainant],
            ['Investigating Officer', caseItem.investigatingOfficer],
            ['Location', caseItem.location],
            ['Sector', caseItem.sector],
            ['Category', caseItem.category],
            ['Status', caseItem.status.toUpperCase()],
          ].map(([label, value]) => (
            <View key={label} style={styles.metaRow}>
              <Text style={styles.metaLabel}>{label}</Text>
              <Text style={styles.metaValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Summary</Text>
          <Text style={styles.description}>{caseItem.description}</Text>
        </View>

        {/* Entities */}
        {caseItem.entities.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Extracted Entities</Text>
            <View style={styles.tagRow}>
              {caseItem.entities.map((e, i) => (
                <View key={i} style={styles.entityTag}>
                  <Text style={styles.entityTagText}>{e}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Linked Cases */}
        {caseItem.linkedCases.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Linked Cases</Text>
            {caseItem.linkedCases.map((id) => (
              <Pressable
                key={id}
                onPress={() => navigation.push('CaseDetail', { caseId: id })}
                style={styles.linkedCase}
              >
                <Text style={styles.linkedCaseText}>→ {id}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Evidence */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Evidence ({caseItem.evidence.length})</Text>
          {caseItem.evidence.length === 0 ? (
            <Text style={styles.emptyText}>No evidence recorded yet.</Text>
          ) : (
            caseItem.evidence.map((ev: Evidence) => (
              <Pressable
                key={ev.id}
                style={styles.evidenceRow}
                onPress={() =>
                  navigation.navigate('EvidenceViewer', { caseId, evidenceId: ev.id })
                }
              >
                <Text style={styles.evIcon}>{evidenceIcons[ev.type] ?? '📎'}</Text>
                <View style={styles.evInfo}>
                  <Text style={styles.evTitle}>{ev.title}</Text>
                  <Text style={styles.evDesc}>{ev.description}</Text>
                  <Text style={styles.evDate}>{ev.date}</Text>
                </View>
                <Text style={styles.evArrow}>→</Text>
              </Pressable>
            ))
          )}
        </View>

        {/* Timeline */}
        <View style={[styles.card, { marginBottom: 0 }]}>
          <Text style={styles.cardTitle}>Timeline</Text>
          {caseItem.timeline.map((entry: TimelineEntry, i: number) => (
            <View key={entry.id} style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, i === 0 && styles.timelineDotFirst]} />
                {i < caseItem.timeline.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineDate}>
                  {entry.date} · {entry.time}
                </Text>
                <Text style={styles.timelineEvent}>{entry.event}</Text>
                <Text style={styles.timelineOfficer}>{entry.officer}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
  },
  backBtn: { marginRight: 12 },
  backText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.md, color: Colors.inkNavy },
  headerTitle: { flex: 1, fontFamily: FontFamily.mono, fontSize: FontSize.base, color: Colors.gray },
  reportBtn: { backgroundColor: Colors.paperDim, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  reportBtnText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.base, color: Colors.inkNavy },
  scroll: { flex: 1 },
  content: { padding: 18, gap: 14, paddingBottom: 60 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
  titleLeft: { flex: 1, marginRight: 12 },
  firNumber: { fontFamily: FontFamily.mono, fontSize: FontSize.sm, color: Colors.gray },
  title: { fontFamily: FontFamily.display, fontSize: 22, fontWeight: '600', color: Colors.inkNavy, marginTop: 3 },
  stamp: { borderWidth: 2, borderRadius: 3, paddingHorizontal: 8, paddingVertical: 3, transform: [{ rotate: '-6deg' }] },
  stampText: { fontFamily: FontFamily.displayBold, fontSize: FontSize.sm, letterSpacing: 0.5 },
  card: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.line, borderRadius: 10, padding: 16, marginBottom: 0 },
  cardTitle: { fontFamily: FontFamily.display, fontSize: FontSize.xl, fontWeight: '600', color: Colors.inkNavy, marginBottom: 12 },
  metaRow: { flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: Colors.line },
  metaLabel: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.base, color: Colors.gray, width: 160 },
  metaValue: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: Colors.inkNavy, flex: 1 },
  description: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: Colors.inkNavy, lineHeight: 22 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  entityTag: { backgroundColor: Colors.paperDim, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3 },
  entityTagText: { fontFamily: FontFamily.mono, fontSize: FontSize.xs, color: Colors.inkNavy },
  linkedCase: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.line },
  linkedCaseText: { fontFamily: FontFamily.mono, fontSize: FontSize.md, color: Colors.red },
  emptyText: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: Colors.gray },
  evidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.line },
  evIcon: { fontSize: 22 },
  evInfo: { flex: 1 },
  evTitle: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: Colors.inkNavy },
  evDesc: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: Colors.gray },
  evDate: { fontFamily: FontFamily.mono, fontSize: FontSize.xs, color: Colors.gray, marginTop: 2 },
  evArrow: { fontFamily: FontFamily.body, fontSize: 18, color: Colors.gray },
  timelineRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  timelineLeft: { alignItems: 'center', width: 20 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.steelLight, marginTop: 4 },
  timelineDotFirst: { backgroundColor: Colors.red },
  timelineLine: { width: 1, flex: 1, backgroundColor: Colors.line, marginTop: 4 },
  timelineContent: { flex: 1, paddingBottom: 8 },
  timelineDate: { fontFamily: FontFamily.mono, fontSize: FontSize.xs, color: Colors.gray },
  timelineEvent: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: Colors.inkNavy, marginTop: 2 },
  timelineOfficer: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: Colors.gray, marginTop: 2 },
});
