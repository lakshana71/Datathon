// CrimeSphere AI — DigitalNotebookScreen (AI Investigation Workspace)
// Kanban command-center layout for managing daily investigation tasks.
// Colors and typography follow the official CrimeSphere palette exactly.

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, SafeAreaView, Pressable
} from 'react-native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList } from '../../types/navigation';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import {
  MissionCard, EvidenceProgress, PremiumVoiceNotePlayer,
  KanbanTaskCard, SectionHeader, Mission, NotebookTask
} from '../../components/notebook/NotebookComponents';

type DigitalNotebookScreenProp = DrawerNavigationProp<DrawerParamList, 'DutyNotebook'>;

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_TASKS: NotebookTask[] = [
  { id: '1', title: 'Analyse CCTV footage from MG Road Camera 04', category: 'CCTV', status: 'TODO' },
  { id: '2', title: 'Verify suspect vehicle registration logs', category: 'ANPR', status: 'DOING' },
  { id: '3', title: 'Cross-match call records (CDR) against FIR timeline', category: 'CDR', status: 'DOING' },
  { id: '4', title: 'Secure Whitefield safehouse operational logs', category: 'Intel', status: 'DONE' },
  { id: '5', title: 'File forensics request for mobile device exhibit', category: 'Forensics', status: 'TODO' },
];

const MISSIONS: Mission[] = [
  { id: 'M1', title: 'Identify primary safehouse location', target: 'John Doe associates', priority: 'URGENT' },
  { id: 'M2', title: 'Audit suspicious transaction pathways', target: 'Bank Account HDFC ****3321', priority: 'HIGH' },
];

const TIMELINE_EVENTS = [
  { time: '11:15', label: 'CCTV Logs Imported', desc: 'MG Road camera 04 raw stream archived to evidence store.', color: Colors.steel },
  { time: '09:40', label: 'Fingerprint Match Confirmed', desc: 'Suspect prints matched against latent lift exhibit L-08.', color: Colors.green },
  { time: '08:00', label: 'Shift Briefing Completed', desc: 'Whitefield Sub-Division briefing attended. 3 active cases reviewed.', color: Colors.amber },
];

const VOICE_NOTES = [
  { title: 'Suspect safehouse tip-off — CI report', duration: '0:45', date: 'Today, 11:20' },
  { title: 'Witness statement — Lakshmi N.', duration: '1:12', date: 'Yesterday, 16:30' },
];

const AI_INSIGHTS = [
  'High priority correlation: Suspect vehicle KA-03-XY-9876 was observed near the CCTV blind-spot on MG Road between 22:00–23:30 on incident date.',
  'Action needed: Phone number +91-9876543210 was linked to a Whitefield tower ping within 10 minutes of the assault timeline. Request CDR immediately.',
  'Pattern flagged: 3 linked FIRs (KA-CR-1142, FIR-2023-089, FIR-2022-114) share the same vehicle type (2-wheeler) and victim profile. Recommend consolidated investigation.',
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export const DigitalNotebookScreen = () => {
  const navigation = useNavigation<DigitalNotebookScreenProp>();
  const [tasks, setTasks] = useState<NotebookTask[]>(INITIAL_TASKS);
  const [chatInput, setChatInput] = useState('');
  const [aiMessages, setAiMessages] = useState(AI_INSIGHTS);
  const [noteText, setNoteText] = useState('');

  const moveTask = (id: string, next: 'TODO' | 'DOING' | 'DONE') =>
    setTasks(ts => ts.map(t => t.id === id ? { ...t, status: next } : t));

  const sendAI = () => {
    if (!chatInput.trim()) return;
    setAiMessages(m => [...m, `Query: "${chatInput}" — Analysis pending. Correlation index updated across 3 active case files.`]);
    setChatInput('');
  };

  const todo  = tasks.filter(t => t.status === 'TODO');
  const doing = tasks.filter(t => t.status === 'DOING');
  const done  = tasks.filter(t => t.status === 'DONE');

  return (
    <SafeAreaView style={styles.root}>

      {/* ── Top Header ────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.openDrawer()}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.topBarTitle}>Investigation Workspace</Text>
          <Text style={styles.topBarSub}>AI-Powered Digital Duty Notebook</Text>
        </View>
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</Text>
        </View>
      </View>

      {/* ── Main Body ─────────────────────────────────────────────── */}
      <View style={styles.bodyRow}>

        {/* ── Left Column: Missions + Progress + Voice Notes + Tactical ── */}
        <ScrollView
          style={styles.leftCol}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.leftColContent}
        >
          <SectionHeader title="Today's Missions" count={MISSIONS.length} />
          <View style={styles.missionStack}>
            {MISSIONS.map(m => <MissionCard key={m.id} mission={m} />)}
          </View>

          <View style={styles.divider} />

          <SectionHeader title="Evidence Acquisition" />
          <View style={styles.progressRow}>
            <EvidenceProgress percentage={75} label="CCTV Footage" color={Colors.steel} />
            <EvidenceProgress percentage={40} label="CDR Analytics" color={Colors.amber} />
            <EvidenceProgress percentage={90} label="Forensics Lab" color={Colors.green} />
          </View>

          <View style={styles.divider} />

          <SectionHeader title="Voice Memos" count={VOICE_NOTES.length} />
          <View style={styles.voiceStack}>
            {VOICE_NOTES.map((n, i) => <PremiumVoiceNotePlayer key={i} note={n} />)}
          </View>

          <View style={styles.divider} />

          <SectionHeader title="Tactical Inputs" />
          <View style={styles.quickActionsGrid}>
            {[
              { icon: '🎙', label: 'Dictate Note' },
              { icon: '📸', label: 'Attach Photo' },
              { icon: '⚡', label: 'Raise Alert' },
              { icon: '📤', label: 'Share Brief' },
            ].map((a, i) => (
              <TouchableOpacity key={i} style={styles.quickBtn}>
                <Text style={styles.quickIcon}>{a.icon}</Text>
                <Text style={styles.quickLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* ── Center Column: Kanban Board ───────────────────────────── */}
        <View style={styles.centerCol}>
          <View style={styles.kanbanHeaderRow}>
            <Text style={styles.kanbanTitle}>Investigation Pipeline</Text>
            <View style={[styles.kanbanStatusDot, { backgroundColor: Colors.green }]} />
            <Text style={styles.kanbanStatusText}>{done.length}/{tasks.length} resolved</Text>
          </View>
          <View style={styles.kanbanBoard}>

            {/* Backlog column */}
            <View style={styles.kanbanCol}>
              <View style={styles.colHeader}>
                <View style={[styles.colDot, { backgroundColor: Colors.gray }]} />
                <Text style={styles.colTitle}>Backlog</Text>
                <Text style={styles.colCount}>{todo.length}</Text>
              </View>
              <ScrollView contentContainerStyle={styles.colScrollContent}>
                {todo.map(t => (
                  <KanbanTaskCard
                    key={t.id} task={t}
                    actionLabel="Start →"
                    accentColor={Colors.steel}
                    onPress={() => moveTask(t.id, 'DOING')}
                  />
                ))}
              </ScrollView>
            </View>

            {/* In Progress column */}
            <View style={[styles.kanbanCol, styles.kanbanColMiddle]}>
              <View style={styles.colHeader}>
                <View style={[styles.colDot, { backgroundColor: Colors.amber }]} />
                <Text style={[styles.colTitle, { color: Colors.amber }]}>In Progress</Text>
                <Text style={styles.colCount}>{doing.length}</Text>
              </View>
              <ScrollView contentContainerStyle={styles.colScrollContent}>
                {doing.map(t => (
                  <KanbanTaskCard
                    key={t.id} task={t}
                    actionLabel="Complete ✓"
                    accentColor={Colors.amber}
                    onPress={() => moveTask(t.id, 'DONE')}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Resolved column */}
            <View style={styles.kanbanCol}>
              <View style={styles.colHeader}>
                <View style={[styles.colDot, { backgroundColor: Colors.green }]} />
                <Text style={[styles.colTitle, { color: Colors.green }]}>Resolved</Text>
                <Text style={styles.colCount}>{done.length}</Text>
              </View>
              <ScrollView contentContainerStyle={styles.colScrollContent}>
                {done.map(t => (
                  <KanbanTaskCard
                    key={t.id} task={t}
                    actionLabel="← Reopen"
                    accentColor={Colors.green}
                    onPress={() => moveTask(t.id, 'TODO')}
                  />
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Timeline strip below Kanban */}
          <View style={styles.timelinePanel}>
            <SectionHeader title="Activity Logs" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.timelineScrollContent}>
              {TIMELINE_EVENTS.map((e, i) => (
                <View key={i} style={styles.tlRow}>
                  <Text style={[styles.tlTime, { color: e.color }]}>{e.time}</Text>
                  <View style={[styles.tlDot, { backgroundColor: e.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tlLabel}>{e.label}</Text>
                    <Text style={styles.tlDesc}>{e.desc}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* ── Right Column: Notes + AI Copilot + Export ─────────── */}
        <ScrollView style={styles.rightCol} showsVerticalScrollIndicator={false} contentContainerStyle={styles.rightColContent}>

          {/* Investigation Note */}
          <SectionHeader title="Investigation Notes" />
          <View style={styles.noteCard}>
            <TextInput
              style={styles.noteInput}
              multiline
              placeholder="Record field observations, lead analysis, witness assessments..."
              placeholderTextColor={Colors.gray}
              value={noteText}
              onChangeText={setNoteText}
            />
          </View>

          <View style={styles.divider} />

          {/* AI Copilot */}
          <SectionHeader title="AI Copilot" />
          <View style={styles.aiPanel}>
            <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.aiMessagesContent}>
              {aiMessages.map((msg, i) => (
                <View key={i} style={[styles.aiMessage, { borderLeftColor: Colors.inkNavy }]}>
                  <Text style={styles.aiMsgText}>{msg}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.aiInputRow}>
              <TextInput
                style={styles.aiInput}
                placeholder="Ask AI Copilot..."
                placeholderTextColor={Colors.gray}
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={sendAI}
              />
              <TouchableOpacity style={styles.aiSendBtn} onPress={sendAI}>
                <Text style={styles.aiSendText}>ASK</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Export */}
          <SectionHeader title="Dispatch & Export" />
          <View style={styles.exportCard}>
            <Text style={styles.exportDesc}>
              Compile today's tasks, notes, and activity logs into a formatted intelligence briefing document.
            </Text>
            <TouchableOpacity style={styles.exportBtn}>
              <Text style={styles.exportBtnText}>Export Intelligence Log</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.exportBtn, styles.exportBtnSecondary]}>
              <Text style={styles.exportBtnSecondaryText}>Share via CCTNS</Text>
            </TouchableOpacity>
          </View>
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

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inkNavy,
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 14,
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
  menuIcon: { color: Colors.sidebarText, fontSize: 18 },
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
    marginTop: 2,
  },
  dateBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  dateText: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.sm,
    color: Colors.sidebarText,
  },

  bodyRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  leftCol: {
    width: 300,
    borderRightWidth: 1,
    borderRightColor: Colors.line,
    backgroundColor: Colors.card,
    flexShrink: 0,
  },
  leftColContent: {
    padding: 24,
    paddingBottom: 40,
  },
  centerCol: {
    flex: 1.5,
    minWidth: 420,
    borderRightWidth: 1,
    borderRightColor: Colors.line,
    padding: 24,
  },
  rightCol: {
    flex: 1.1,
    minWidth: 320,
    maxWidth: 400,
    backgroundColor: Colors.card,
  },
  rightColContent: {
    padding: 24,
    paddingBottom: 40,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.line,
    marginVertical: 24,
  },

  missionStack: {
    gap: 14,
    marginTop: 14,
  },

  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    backgroundColor: Colors.paper,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.line,
    marginTop: 14,
  },

  voiceStack: {
    gap: 12,
    marginTop: 14,
  },

  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },
  quickBtn: {
    width: '48%',
    backgroundColor: Colors.paper,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.line,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickIcon: { fontSize: 20, marginBottom: 8 },
  quickLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.inkNavy2,
    textAlign: 'center',
  },

  // Kanban
  kanbanHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  kanbanTitle: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
    letterSpacing: 1.2,
    flex: 1,
    textTransform: 'uppercase',
  },
  kanbanStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  kanbanStatusText: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  kanbanBoard: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
    minHeight: 260,
  },
  kanbanCol: {
    flex: 1,
    minWidth: 0,
    backgroundColor: Colors.paper,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 14,
  },
  kanbanColMiddle: {
    borderTopWidth: 3,
    borderTopColor: Colors.amber,
  },
  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  colScrollContent: {
    gap: 12,
    paddingBottom: 4,
  },
  colDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  colTitle: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.sm,
    color: Colors.steel,
    fontWeight: '700',
    flex: 1,
    textTransform: 'uppercase',
  },
  colCount: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },

  // Timeline strip
  timelinePanel: {
    marginTop: 20,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 18,
    maxHeight: 230,
  },
  timelineScrollContent: {
    marginTop: 2,
  },
  tlRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  tlTime: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    fontWeight: '700',
    width: 36,
    paddingTop: 2,
  },
  tlDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginTop: 4,
  },
  tlLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
  },
  tlDesc: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.gray,
    marginTop: 3,
    lineHeight: 18,
  },

  // Notes
  noteCard: {
    backgroundColor: Colors.paper,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 16,
    marginTop: 14,
  },
  noteInput: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
    minHeight: 110,
    textAlignVertical: 'top',
    lineHeight: 21,
  },

  // AI Copilot
  aiPanel: {
    backgroundColor: Colors.paper,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.line,
    overflow: 'hidden',
    marginTop: 14,
  },
  aiMessagesContent: {
    paddingBottom: 4,
  },
  aiMessage: {
    borderLeftWidth: 3,
    marginHorizontal: 14,
    marginTop: 14,
    paddingLeft: 12,
    paddingVertical: 3,
  },
  aiMsgText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.inkNavy2,
    lineHeight: 19,
  },
  aiInputRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    marginTop: 14,
  },
  aiInput: {
    flex: 1,
    height: 38,
    backgroundColor: Colors.card,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  aiSendBtn: {
    backgroundColor: Colors.inkNavy,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 6,
  },
  aiSendText: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Export
  exportCard: {
    backgroundColor: Colors.paper,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 18,
    marginTop: 14,
  },
  exportDesc: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.gray,
    lineHeight: 20,
    marginBottom: 16,
  },
  exportBtn: {
    backgroundColor: Colors.inkNavy,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  exportBtnText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.white,
  },
  exportBtnSecondary: {
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  exportBtnSecondaryText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
  },
});