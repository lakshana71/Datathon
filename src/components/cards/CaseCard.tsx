// CrimeSphere AI — CaseCard Component
// Mirrors the "file folder" case card design from the HTML prototype
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import type { Case, Priority } from '../../types';

interface CaseCardProps {
  caseItem: Case;
  onPress: () => void;
}

const stampConfig: Record<Priority, { label: string; color: string }> = {
  urgent: { label: 'URGENT', color: Colors.red },
  review: { label: 'REVIEW', color: Colors.amber },
  routine: { label: 'ROUTINE', color: Colors.green },
};

export const CaseCard: React.FC<CaseCardProps> = ({ caseItem, onPress }) => {
  const stamp = stampConfig[caseItem.priority];

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Case ${caseItem.firNumber}: ${caseItem.title}`}
    >
      {/* Header */}
      <View style={styles.top}>
        <View style={styles.topLeft}>
          <Text style={styles.caseId}>{caseItem.firNumber}</Text>
          <Text style={styles.caseTitle}>{caseItem.title}</Text>
        </View>
        <View style={[styles.stamp, { borderColor: stamp.color }]}>
          <Text style={[styles.stampText, { color: stamp.color }]}>{stamp.label}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.meta}>
          Filed {caseItem.filedDate} · {caseItem.complainant} · {caseItem.investigatingOfficer}
          {'\n'}
          {caseItem.description}
        </Text>
        <View style={styles.tagRow}>
          {caseItem.entities.map((entity, i) => (
            <View key={i} style={styles.entityTag}>
              <Text style={styles.entityTagText}>{entity}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerNote}>{caseItem.footerNote}</Text>
        <Text style={styles.openBtn}>Open file →</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 4,
    shadowColor: Colors.line,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 1,
    marginBottom: 14,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    borderStyle: 'dashed',
  },
  topLeft: {
    flex: 1,
    marginRight: 10,
  },
  caseId: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
  caseTitle: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.inkNavy,
    marginTop: 3,
  },
  stamp: {
    borderWidth: 2,
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    transform: [{ rotate: '-6deg' }],
    marginTop: 2,
  },
  stampText: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize.sm,
    letterSpacing: 0.5,
  },
  body: {
    padding: 12,
    paddingHorizontal: 16,
  },
  meta: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.gray,
    lineHeight: 20,
    marginBottom: 10,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  entityTag: {
    backgroundColor: Colors.paperDim,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginRight: 4,
    marginBottom: 4,
  },
  entityTagText: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.inkNavy,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    backgroundColor: Colors.paperDim,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  footerNote: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.smPlus,
    color: Colors.gray,
    flex: 1,
  },
  openBtn: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.inkNavy,
    marginLeft: 8,
  },
});
