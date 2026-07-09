// CrimeSphere AI — StatCard Component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import type { StatCard as StatCardType } from '../../types';

interface StatCardProps {
  stat: StatCardType;
}

const barColors: Record<string, string> = {
  red: Colors.red,
  amber: Colors.amber,
  green: Colors.green,
  navy: Colors.steel,
};

export const StatCard: React.FC<StatCardProps> = ({ stat }) => {
  const barColor = barColors[stat.color] ?? Colors.steel;
  const deltaColor = stat.trend === 'up' ? Colors.red : Colors.green;

  return (
    <View style={styles.container}>
      <View style={[styles.bar, { backgroundColor: barColor }]} />
      <Text style={styles.num}>{stat.value}</Text>
      <Text style={styles.lbl}>{stat.label}</Text>
      <Text style={[styles.delta, { color: deltaColor }]}>{stat.delta}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 10,
    padding: 16,
    paddingLeft: 20,
    position: 'relative',
    overflow: 'hidden',
    minWidth: 140,
  },
  bar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  num: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize.display,
    lineHeight: 36,
    color: Colors.inkNavy,
  },
  lbl: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.gray,
    marginTop: 6,
  },
  delta: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.sm,
    marginTop: 8,
  },
});
