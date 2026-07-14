// CrimeSphere AI — NotebookComponents
// Reusable UI components for the Digital Investigation Workspace.
// All colors and typography match the official CrimeSphere palette.

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Mission {
  id: string;
  title: string;
  target: string;
  priority: 'URGENT' | 'HIGH' | 'ROUTINE';
}

export interface NotebookTask {
  id: string;
  title: string;
  category: string;
  status: 'TODO' | 'DOING' | 'DONE';
}

// ─── MissionCard ─────────────────────────────────────────────────────────────

export const MissionCard: React.FC<{ mission: Mission }> = ({ mission }) => {
  const priorityColor =
    mission.priority === 'URGENT' ? Colors.red :
    mission.priority === 'HIGH' ? Colors.amber : Colors.green;
  const priorityBg =
    mission.priority === 'URGENT' ? Colors.redDim :
    mission.priority === 'HIGH' ? Colors.amberDim : Colors.greenDim;

  return (
    <View style={missionStyles.card}>
      <View style={[missionStyles.priorityStripe, { backgroundColor: priorityColor }]} />
      <View style={missionStyles.cardBody}>
        <View style={[missionStyles.badge, { backgroundColor: priorityBg, borderColor: priorityColor + '60' }]}>
          <Text style={[missionStyles.badgeText, { color: priorityColor }]}>{mission.priority}</Text>
        </View>
        <Text style={missionStyles.title}>{mission.title}</Text>
        <Text style={missionStyles.target}>Target: {mission.target}</Text>
      </View>
    </View>
  );
};

const missionStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 8,
    overflow: 'hidden',
  },
  priorityStripe: {
    width: 3,
  },
  cardBody: {
    flex: 1,
    padding: 11,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 5,
  },
  badgeText: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
    marginBottom: 3,
  },
  target: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
});

// ─── EvidenceProgress (Radial SVG Ring) ──────────────────────────────────────

export const EvidenceProgress: React.FC<{ percentage: number; label: string; color: string }> = ({
  percentage, label, color,
}) => {
  const radius = 32;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={progressStyles.container}>
      <View style={progressStyles.svgWrapper}>
        <Svg width="86" height="86" viewBox="0 0 86 86">
          <G rotation="-90" origin="43, 43">
            <Circle cx="43" cy="43" r={radius} fill="transparent" stroke={Colors.paperDim} strokeWidth={strokeWidth} />
            <Circle
              cx="43" cy="43" r={radius}
              fill="transparent" stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </G>
        </Svg>
        <View style={progressStyles.center}>
          <Text style={[progressStyles.pct, { color }]}>{percentage}%</Text>
        </View>
      </View>
      <Text style={progressStyles.label} numberOfLines={2}>{label}</Text>
    </View>
  );
};

const progressStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 90,
  },
  svgWrapper: {
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pct: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  label: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 14,
  },
});

// ─── VoiceNotePlayer ─────────────────────────────────────────────────────────

export const PremiumVoiceNotePlayer: React.FC<{
  note: { title: string; duration: string; date: string };
}> = ({ note }) => {
  const [playing, setPlaying] = useState(false);
  const bars = [4, 10, 16, 22, 12, 18, 8, 20, 14, 6, 18, 10];

  return (
    <View style={voiceStyles.card}>
      <TouchableOpacity
        style={[voiceStyles.playBtn, playing && voiceStyles.playBtnActive]}
        onPress={() => setPlaying(p => !p)}
      >
        <Text style={[voiceStyles.playIcon, playing && voiceStyles.playIconActive]}>
          {playing ? '⏸' : '▶'}
        </Text>
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={voiceStyles.title}>{note.title}</Text>
        <Text style={voiceStyles.meta}>{note.date}  ·  {note.duration}</Text>
        <View style={voiceStyles.wave}>
          {bars.map((h, i) => (
            <View
              key={i}
              style={[voiceStyles.bar, {
                height: h * 0.7,
                backgroundColor: playing ? Colors.steel : Colors.paperDim,
              }]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const voiceStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  playBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.paper,
    borderWidth: 1.5,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnActive: {
    backgroundColor: Colors.inkNavy,
    borderColor: Colors.inkNavy,
  },
  playIcon: {
    fontSize: 13,
    color: Colors.gray,
  },
  playIconActive: {
    color: Colors.white,
  },
  title: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
  },
  meta: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
    marginTop: 2,
  },
  wave: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    gap: 2,
    marginTop: 6,
  },
  bar: {
    width: 3,
    borderRadius: 1.5,
    minHeight: 3,
  },
});

// ─── KanbanTaskCard ───────────────────────────────────────────────────────────

export const KanbanTaskCard: React.FC<{
  task: NotebookTask;
  onPress: () => void;
  actionLabel: string;
  accentColor: string;
}> = ({ task, onPress, actionLabel, accentColor }) => (
  <Pressable
    style={({ pressed }) => [
      kanbanStyles.card,
      pressed && { backgroundColor: Colors.paper }
    ]}
    onPress={onPress}
  >
    <View style={[kanbanStyles.catBadge, { backgroundColor: accentColor + '15', borderColor: accentColor + '50' }]}>
      <Text style={[kanbanStyles.catText, { color: accentColor }]}>{task.category}</Text>
    </View>
    <Text style={[kanbanStyles.title, task.status === 'DONE' && kanbanStyles.titleDone]}>
      {task.title}
    </Text>
    <Text style={[kanbanStyles.action, { color: accentColor }]}>{actionLabel}</Text>
  </Pressable>
);

const kanbanStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 10,
    marginBottom: 8,
  },
  catBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 6,
  },
  catText: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  title: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
    lineHeight: 18,
    marginBottom: 6,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: Colors.gray,
  },
  action: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    alignSelf: 'flex-end',
  },
});

// ─── SectionHeader ─────────────────────────────────────────────────────────────

export const SectionHeader: React.FC<{ title: string; count?: number }> = ({ title, count }) => (
  <View style={secStyles.row}>
    <Text style={secStyles.title}>{title}</Text>
    {count !== undefined && (
      <View style={secStyles.badge}>
        <Text style={secStyles.badgeText}>{count}</Text>
      </View>
    )}
  </View>
);

const secStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  title: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  badge: {
    backgroundColor: Colors.paperDim,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  badgeText: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
});
