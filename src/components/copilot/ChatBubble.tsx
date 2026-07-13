// CrimeSphere AI — ChatBubble Component
// Notebook-style chat bubbles for the Duty Notebook / AI Copilot screen
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import type { ChatMessage } from '../../types';

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isCopilot = message.role === 'copilot';

  return (
    <View style={[styles.entry, isCopilot && styles.copilotEntry]}>
      <Text style={[styles.meta, isCopilot && styles.copilotMeta]}>
        {isCopilot ? 'NOTE BACK' : 'INSP. R. KUMARASWAMY'} · {message.time}
      </Text>
      <Text style={[styles.msg, isCopilot && styles.copilotMsg]}>
        {message.content}
      </Text>
    </View>
  );
};

// Typing indicator (three animated dots)
export const TypingIndicator: React.FC = () => {
  return (
    <View style={styles.entry}>
      <Text style={[styles.meta, styles.copilotMeta]}>NOTE BACK · typing…</Text>
      <View style={styles.typingDots}>
        <View style={[styles.dot, styles.dot1]} />
        <View style={[styles.dot, styles.dot2]} />
        <View style={[styles.dot, styles.dot3]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  entry: {
    marginBottom: 18,
    paddingLeft: 26,
  },
  copilotEntry: {},
  meta: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
    marginBottom: 3,
    letterSpacing: 0.4,
  },
  copilotMeta: {
    color: Colors.red,
  },
  msg: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.lg,
    color: Colors.inkNavy,
    lineHeight: 26,
  },
  copilotMsg: {
    fontFamily: FontFamily.displayMedium,
    fontSize: 18,
    lineHeight: 30,
    color: Colors.inkNavy2,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 5,
    paddingTop: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray,
    opacity: 0.5,
  },
  dot1: {},
  dot2: { opacity: 0.7 },
  dot3: { opacity: 0.9 },
});
