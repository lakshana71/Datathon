// CrimeSphere AI — ChatInput Component
import React, { useState } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet, Platform } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isLoading = false,
  placeholder = 'Ask about a case, a person, a vehicle, or a pattern...',
}) => {
  const [value, setValue] = useState('');

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor={Colors.gray}
        multiline
        maxLength={500}
        returnKeyType="send"
        onSubmitEditing={handleSend}
        editable={!isLoading}
        accessibilityLabel="Ask a question"
      />
      <Pressable
        onPress={handleSend}
        disabled={isLoading || !value.trim()}
        style={({ pressed }) => [
          styles.btn,
          (isLoading || !value.trim()) && styles.btnDisabled,
          pressed && styles.btnPressed,
        ]}
        accessibilityLabel="Send message"
      >
        <Text style={styles.btnText}>{isLoading ? '…' : 'Ask'}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    paddingLeft: 26,
    marginTop: 6,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 9 : 7,
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    backgroundColor: Colors.white,
    color: Colors.inkNavy,
    maxHeight: 100,
  },
  btn: {
    backgroundColor: Colors.inkNavy,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 7,
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnPressed: {
    opacity: 0.85,
  },
  btnText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.white,
  },
});
