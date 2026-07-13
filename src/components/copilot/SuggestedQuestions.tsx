// CrimeSphere AI — SuggestedQuestions Component
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  questions,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Suggested</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {questions.map((q, i) => (
          <Pressable
            key={i}
            onPress={() => onSelect(q)}
            style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
          >
            <Text style={styles.chipText}>{q}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 26,
    marginBottom: 8,
  },
  label: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
    letterSpacing: 0.4,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  list: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    backgroundColor: Colors.paperDim,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipPressed: {
    backgroundColor: Colors.inkNavy,
    borderColor: Colors.inkNavy,
  },
  chipText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.inkNavy,
  },
});
