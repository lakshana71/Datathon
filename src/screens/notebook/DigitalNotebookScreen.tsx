import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList } from '../../types/navigation';
import { useNavigation } from '@react-navigation/native';
import { TaskItem, VoiceNotePlayer, CaseAssignmentCard } from '../../components/notebook/NotebookComponents';

type DigitalNotebookScreenProp = DrawerNavigationProp<DrawerParamList, 'DutyNotebook'>;

export const DigitalNotebookScreen = () => {
  const navigation = useNavigation<DigitalNotebookScreenProp>();
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Review CCTV footage from MG Road', completed: false },
    { id: 2, title: 'Interview witness for FIR-2023-089', completed: true },
    { id: 3, title: 'File forensics request for mobile device', completed: false },
  ]);
  const [noteText, setNoteText] = useState('');

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.openDrawer()}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.title}>DIGITAL INVESTIGATION NOTEBOOK</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Daily Tasks Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Tasks</Text>
          <View style={styles.card}>
            {tasks.map(task => (
              <TaskItem key={task.id} task={task} onToggle={() => toggleTask(task.id)} />
            ))}
          </View>
        </View>

        {/* Assigned Cases Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned Cases</Text>
          <CaseAssignmentCard caseItem={{
            id: 'FIR-2023-089',
            status: 'ACTIVE',
            title: 'Narcotics Distribution Network',
            description: 'Investigating local distribution ring in Koramangala area. Primary suspect identified as John Doe.'
          }} />
          <CaseAssignmentCard caseItem={{
            id: 'FIR-2024-112',
            status: 'PENDING ARREST',
            title: 'Money Laundering Operation',
            description: 'Suspicious transactions linked to multiple shell accounts.'
          }} />
        </View>

        {/* Investigation Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investigation Notes</Text>
          <View style={styles.card}>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Record your observations..."
              placeholderTextColor="#57606f"
              value={noteText}
              onChangeText={setNoteText}
            />
            <View style={styles.noteActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Text style={styles.actionText}>📸 Add Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Text style={styles.actionText}>🎙 Record Audio</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Voice Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Memos</Text>
          <VoiceNotePlayer note={{ duration: '0:45' }} />
          <VoiceNotePlayer note={{ duration: '1:12' }} />
        </View>

        {/* AI Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Summary</Text>
          <View style={[styles.card, { borderColor: '#1e90ff', borderWidth: 1 }]}>
            <Text style={styles.aiText}>
              "You have completed 1 of 3 tasks today. The witness interview for FIR-2023-089 has been concluded. Next priority is reviewing the MG Road CCTV footage. Consider requesting a warrant for the primary suspect."
            </Text>
            <TouchableOpacity style={styles.exportBtn}>
              <Text style={styles.exportBtnText}>Generate Daily Report (PDF)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f171e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2f3542',
    backgroundColor: 'rgba(15, 23, 30, 0.9)',
  },
  menuBtn: {
    padding: 10,
    marginRight: 10,
  },
  menuIcon: {
    color: '#dfe4ea',
    fontSize: 24,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#a4b0be',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: 'rgba(47, 53, 66, 0.3)',
    borderRadius: 8,
    padding: 15,
  },
  textInput: {
    color: '#ffffff',
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2f3542',
  },
  actionBtn: {
    backgroundColor: '#2f3542',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  actionText: {
    color: '#dfe4ea',
    fontSize: 12,
  },
  aiText: {
    color: '#7bed9f',
    lineHeight: 22,
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 15,
  },
  exportBtn: {
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  exportBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
