// CrimeSphere AI — TickerItem Component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import type { TickerItem as TickerItemType, Severity } from '../../types';

interface TickerItemProps {
  item: TickerItemType;
  isLast?: boolean;
}

const dotColors: Record<Severity, string> = {
  red: Colors.red,
  amber: Colors.amber,
  green: Colors.green,
  navy: Colors.steel,
};

export const TickerItem: React.FC<TickerItemProps> = ({ item, isLast = false }) => {
  return (
    <View style={[styles.container, !isLast && styles.borderBottom]}>
      <View style={[styles.dot, { backgroundColor: dotColors[item.severity] }]} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.detail}>{item.detail}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'flex-start',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.basePlus,
    color: Colors.inkNavy,
    marginBottom: 2,
  },
  detail: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.basePlus,
    color: Colors.gray,
    lineHeight: 18,
  },
  time: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
    marginTop: 3,
  },
});
