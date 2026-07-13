// CrimeSphere AI — FilterChip Component
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, isActive, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        isActive && styles.chipActive,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <Text style={[styles.text, isActive && styles.textActive]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.card,
  },
  chipActive: {
    backgroundColor: Colors.inkNavy,
    borderColor: Colors.inkNavy,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.gray,
  },
  textActive: {
    color: Colors.white,
  },
});
