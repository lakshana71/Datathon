// CrimeSphere AI — AlertCard Component
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import type { Alert, Severity } from '../../types';

// SVG-free icons using Unicode / drawn as View shapes
// (react-native-svg will replace these in the full build)
const AlertIconInner: React.FC<{ type: string; color: string }> = ({ type, color }) => (
  <Text style={{ color, fontSize: 16 }}>
    {type === 'pattern' ? '⚠' : type === 'patrol' ? '⏱' : type === 'trend' ? '↑' : '✓'}
  </Text>
);

const bgColors: Record<Severity, string> = {
  red: Colors.redDim,
  amber: Colors.amberDim,
  green: Colors.greenDim,
  navy: '#E2E6EE',
};

const iconColors: Record<Severity, string> = {
  red: Colors.red,
  amber: Colors.amber,
  green: Colors.green,
  navy: Colors.steel,
};

interface AlertCardProps {
  alert: Alert;
  onPress?: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onPress }) => {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed, !alert.isRead && styles.unread]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Alert: ${alert.title}`}
    >
      <View style={[styles.iconBox, { backgroundColor: bgColors[alert.severity] }]}>
        <AlertIconInner type={alert.type} color={iconColors[alert.severity]} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{alert.title}</Text>
        <Text style={styles.desc}>{alert.description}</Text>
      </View>
      <Text style={styles.time}>{alert.time}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    padding: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: Colors.card,
  },
  unread: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.red,
  },
  pressed: {
    opacity: 0.9,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  body: {
    flex: 1,
  },
  title: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.mdPlus,
    color: Colors.inkNavy,
    marginBottom: 2,
  },
  desc: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.gray,
    lineHeight: 18,
  },
  time: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
});
