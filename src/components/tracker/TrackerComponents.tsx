// CrimeSphere AI — TrackerComponents
// Reusable components for the Person Crime History Tracker screen.
// Uses the official CrimeSphere color palette: ink navy, steel, cream paper, status colors.

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import Svg, { Circle, G, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Suspect {
  id: string;
  name: string;
  alias: string;
  dob: string;
  status: string;
  riskScore: number;
  crimes: { type: string; count: number }[];
  timeline: { date: string; event: string }[];
  linkedFIRs: string[];
  phones: string[];
  vehicles: string[];
  accounts: string[];
  associates: { id: string; name: string }[];
}

// ─── SuspectProfileCard ─────────────────────────────────────────────────────

interface SuspectProfileCardProps {
  suspect: Suspect;
}

export const SuspectProfileCard: React.FC<SuspectProfileCardProps> = ({ suspect }) => {
  const initials = suspect.name.split(' ').map(n => n[0]).join('').substring(0, 2);
  const riskColor = suspect.riskScore >= 85 ? Colors.red : suspect.riskScore >= 60 ? Colors.amber : Colors.green;
  const statusBg = suspect.status === 'WANTED' ? Colors.redDim : suspect.status === 'UNDER WATCH' ? Colors.amberDim : Colors.greenDim;
  const statusColor = suspect.status === 'WANTED' ? Colors.red : suspect.status === 'UNDER WATCH' ? Colors.amber : Colors.green;

  return (
    <View style={cardStyles.container}>
      {/* Top accent bar */}
      <View style={[cardStyles.topAccentBar, { backgroundColor: Colors.inkNavy }]} />

      {/* Header section */}
      <View style={cardStyles.header}>
        {/* Avatar */}
        <View style={[cardStyles.avatar, { backgroundColor: Colors.inkNavy2 }]}>
          <Text style={cardStyles.avatarText}>{initials}</Text>
        </View>
        {/* Identity */}
        <View style={{ flex: 1 }}>
          <Text style={cardStyles.name}>{suspect.name}</Text>
          <Text style={cardStyles.alias}>aka "{suspect.alias}"</Text>
          <View style={cardStyles.idRow}>
            <Text style={cardStyles.idLabel}>CS-ID</Text>
            <Text style={cardStyles.idValue}>{suspect.id}</Text>
          </View>
        </View>
        {/* Status badge */}
        <View style={[cardStyles.statusBadge, { backgroundColor: statusBg, borderColor: statusColor }]}>
          <Text style={[cardStyles.statusText, { color: statusColor }]}>{suspect.status}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={cardStyles.divider} />

      {/* Risk Score row */}
      <View style={cardStyles.riskRow}>
        <View style={{ flex: 1 }}>
          <Text style={cardStyles.riskLabel}>AI RISK ASSESSMENT</Text>
          <View style={cardStyles.riskBarBg}>
            <View style={[cardStyles.riskBarFill, { width: `${suspect.riskScore}%` as any, backgroundColor: riskColor }]} />
          </View>
        </View>
        <View style={[cardStyles.riskScoreBadge, { borderColor: riskColor + '60', backgroundColor: riskColor + '12' }]}>
          <Text style={[cardStyles.riskScoreText, { color: riskColor }]}>{suspect.riskScore}</Text>
          <Text style={[cardStyles.riskScoreSlash, { color: riskColor }]}>/100</Text>
        </View>
      </View>

      <View style={cardStyles.divider} />

      {/* Meta details */}
      <View style={cardStyles.metaGrid}>
        <MetaItem label="DATE OF BIRTH" value={suspect.dob} />
        <MetaItem label="LINKED FIRS" value={suspect.linkedFIRs.length.toString()} />
        <MetaItem label="ASSOCIATES" value={suspect.associates.length.toString()} />
        <MetaItem label="VEHICLES ON RECORD" value={suspect.vehicles.length.toString()} />
      </View>

      <View style={cardStyles.divider} />

      {/* Crime Summary */}
      <ScrollView style={{ maxHeight: 160 }} showsVerticalScrollIndicator={false}>
        <Text style={cardStyles.sectionLabel}>CRIME SUMMARY</Text>
        {suspect.crimes.map((c, idx) => (
          <View key={idx} style={cardStyles.crimeRow}>
            <View style={[cardStyles.crimeDot, { backgroundColor: Colors.steel }]} />
            <Text style={cardStyles.crimeType}>{c.type}</Text>
            <View style={[cardStyles.crimeCountBadge, { backgroundColor: Colors.paperDim }]}>
              <Text style={cardStyles.crimeCount}>{c.count}</Text>
            </View>
          </View>
        ))}

        <Text style={[cardStyles.sectionLabel, { marginTop: 14 }]}>INVESTIGATION TIMELINE</Text>
        {suspect.timeline.map((t, idx) => (
          <View key={idx} style={cardStyles.timelineRow}>
            <View style={cardStyles.timelineLine}>
              <View style={[cardStyles.timelineDot, { backgroundColor: Colors.steel }]} />
              {idx < suspect.timeline.length - 1 && <View style={cardStyles.timelineConnector} />}
            </View>
            <View style={cardStyles.timelineRight}>
              <Text style={cardStyles.timelineDate}>{t.date}</Text>
              <Text style={cardStyles.timelineEvent}>{t.event}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const MetaItem = ({ label, value }: { label: string; value: string }) => (
  <View style={cardStyles.metaItem}>
    <Text style={cardStyles.metaLabel}>{label}</Text>
    <Text style={cardStyles.metaValue}>{value}</Text>
  </View>
);

// ─── IntelCluster ────────────────────────────────────────────────────────────

interface IntelClusterProps {
  title: string;
  icon: string;
  items: string[] | { id: string; name: string }[];
  accentColor: string;
  onItemPress: (item: any) => void;
  isAssociates?: boolean;
}

export const IntelCluster: React.FC<IntelClusterProps> = ({
  title, icon, items, accentColor, onItemPress, isAssociates,
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={[clusterStyles.container, { borderLeftColor: accentColor }]}>
      {/* Cluster Header */}
      <Pressable style={clusterStyles.header} onPress={() => setExpanded(e => !e)}>
        <View style={[clusterStyles.iconBadge, { backgroundColor: accentColor + '18', borderColor: accentColor + '40' }]}>
          <Text style={clusterStyles.iconText}>{icon}</Text>
        </View>
        <Text style={clusterStyles.title}>{title}</Text>
        <View style={clusterStyles.countBadge}>
          <Text style={clusterStyles.countText}>{items.length}</Text>
        </View>
        <Text style={[clusterStyles.chevron, { color: accentColor }]}>{expanded ? '▲' : '▼'}</Text>
      </Pressable>

      {/* Items */}
      {expanded && (
        <View style={clusterStyles.itemsContainer}>
          {items.length === 0 ? (
            <Text style={clusterStyles.emptyText}>No records found.</Text>
          ) : (
            items.map((item, idx) => {
              const label = isAssociates ? (item as any).name : (item as string);
              return (
                <Pressable
                  key={idx}
                  style={({ pressed }) => [
                    clusterStyles.itemRow,
                    pressed && { backgroundColor: accentColor + '08' },
                    idx < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: Colors.line },
                  ]}
                  onPress={() => onItemPress(item)}
                >
                  <View style={[clusterStyles.itemDot, { backgroundColor: accentColor }]} />
                  <Text style={clusterStyles.itemLabel} numberOfLines={1}>{label}</Text>
                  <Text style={[clusterStyles.itemArrow, { color: accentColor }]}>›</Text>
                </Pressable>
              );
            })
          )}
        </View>
      )}
    </View>
  );
};

// ─── SuspectPickerCard (for the search results sidebar) ─────────────────────

interface SuspectPickerCardProps {
  suspect: Suspect;
  isActive: boolean;
  onPress: () => void;
}

export const SuspectPickerCard: React.FC<SuspectPickerCardProps> = ({ suspect, isActive, onPress }) => {
  const initials = suspect.name.split(' ').map(n => n[0]).join('').substring(0, 2);
  const riskColor = suspect.riskScore >= 85 ? Colors.red : suspect.riskScore >= 60 ? Colors.amber : Colors.green;

  return (
    <Pressable
      style={[pickerStyles.card, isActive && pickerStyles.cardActive]}
      onPress={onPress}
    >
      <View style={[pickerStyles.avatar, isActive && { borderColor: Colors.steel }]}>
        <Text style={pickerStyles.avatarText}>{initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[pickerStyles.name, isActive && { color: Colors.inkNavy }]}>{suspect.name}</Text>
        <Text style={pickerStyles.id}>{suspect.id}</Text>
      </View>
      <View style={[pickerStyles.riskDot, { backgroundColor: riskColor }]} />
    </Pressable>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const cardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.line,
    overflow: 'hidden',
    shadowColor: Colors.inkNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  topAccentBar: {
    height: 3,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.steelLight,
  },
  avatarText: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize['2xl'],
    color: Colors.white,
  },
  name: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize['2xl'],
    color: Colors.inkNavy,
  },
  alias: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.gray,
    marginTop: 2,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  idLabel: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
    letterSpacing: 1,
  },
  idValue: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.sm,
    color: Colors.steel,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.line,
    marginHorizontal: 16,
  },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  riskLabel: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  riskBarBg: {
    height: 6,
    backgroundColor: Colors.paperDim,
    borderRadius: 3,
    overflow: 'hidden',
  },
  riskBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  riskScoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  riskScoreText: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize['3xl'],
    lineHeight: 30,
  },
  riskScoreSlash: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.sm,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  metaItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.paper,
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  metaLabel: {
    fontFamily: FontFamily.mono,
    fontSize: 8.5,
    color: Colors.gray,
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  metaValue: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
  },
  sectionLabel: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  crimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    gap: 10,
  },
  crimeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  crimeType: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
    flex: 1,
  },
  crimeCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  crimeCount: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
  timelineRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 10,
  },
  timelineLine: {
    width: 14,
    alignItems: 'center',
    paddingTop: 4,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.steel,
    backgroundColor: Colors.card,
  },
  timelineConnector: {
    flex: 1,
    width: 1,
    backgroundColor: Colors.line,
    marginTop: 4,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 12,
  },
  timelineDate: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.xs,
    color: Colors.gray,
    marginBottom: 2,
  },
  timelineEvent: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
    lineHeight: 18,
  },
});

const clusterStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.line,
    borderLeftWidth: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 14,
  },
  title: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
    flex: 1,
  },
  countBadge: {
    backgroundColor: Colors.paper,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  countText: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  chevron: {
    fontFamily: FontFamily.mono,
    fontSize: 10,
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  itemDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  itemLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
    flex: 1,
  },
  itemArrow: {
    fontFamily: FontFamily.body,
    fontSize: 18,
  },
  emptyText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.gray,
    padding: 12,
    fontStyle: 'italic',
  },
});

const pickerStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    gap: 10,
  },
  cardActive: {
    backgroundColor: Colors.paper,
    borderLeftWidth: 3,
    borderLeftColor: Colors.steel,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.steel,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.steelLight,
  },
  avatarText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  name: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.inkNavy2,
  },
  id: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
    marginTop: 2,
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
