import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export const TaskItem = ({ task, onToggle }: { task: any; onToggle: () => void }) => {
  return (
    <TouchableOpacity style={styles.taskContainer} onPress={onToggle}>
      <View style={[styles.checkbox, task.completed && styles.checkboxCompleted]}>
        {task.completed && <Text style={styles.checkMark}>✓</Text>}
      </View>
      <Text style={[styles.taskText, task.completed && styles.taskTextCompleted]}>
        {task.title}
      </Text>
    </TouchableOpacity>
  );
};

export const VoiceNotePlayer = ({ note }: { note: any }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <View style={styles.voiceNoteContainer}>
      <TouchableOpacity 
        style={styles.playButton}
        onPress={() => setIsPlaying(!isPlaying)}
      >
        <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
      </TouchableOpacity>
      <View style={styles.waveformContainer}>
        <View style={styles.waveformLine} />
        <View style={styles.waveformLine} />
        <View style={[styles.waveformLine, { height: 15 }]} />
        <View style={[styles.waveformLine, { height: 25 }]} />
        <View style={[styles.waveformLine, { height: 10 }]} />
        <View style={styles.waveformLine} />
      </View>
      <Text style={styles.durationText}>{note.duration}</Text>
    </View>
  );
};

export const CaseAssignmentCard = ({ caseItem }: { caseItem: any }) => {
  return (
    <View style={styles.caseCard}>
      <View style={styles.caseHeader}>
        <Text style={styles.caseId}>{caseItem.id}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{caseItem.status}</Text>
        </View>
      </View>
      <Text style={styles.caseTitle}>{caseItem.title}</Text>
      <Text style={styles.caseDescription} numberOfLines={2}>{caseItem.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2f3542',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#7bed9f',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#7bed9f',
  },
  checkMark: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskText: {
    color: '#dfe4ea',
    fontSize: 14,
    flex: 1,
  },
  taskTextCompleted: {
    color: '#a4b0be',
    textDecorationLine: 'line-through',
  },
  voiceNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2f3542',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e90ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  playIcon: {
    color: '#fff',
    fontSize: 14,
  },
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  waveformLine: {
    width: 3,
    height: 8,
    backgroundColor: '#a4b0be',
    borderRadius: 2,
  },
  durationText: {
    color: '#a4b0be',
    fontSize: 12,
    marginLeft: 12,
  },
  caseCard: {
    backgroundColor: 'rgba(47, 53, 66, 0.5)',
    borderWidth: 1,
    borderColor: '#2f3542',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  caseId: {
    color: '#7bed9f',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadge: {
    backgroundColor: 'rgba(30, 144, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#1e90ff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  caseTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  caseDescription: {
    color: '#a4b0be',
    fontSize: 13,
    lineHeight: 18,
  },
});
