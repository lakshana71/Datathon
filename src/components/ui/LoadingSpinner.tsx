// CrimeSphere AI — LoadingSpinner Component
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  fullScreen = false,
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={Colors.red} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

// Skeleton pulse for card loading states
export const SkeletonCard: React.FC<{ height?: number }> = ({ height = 100 }) => {
  return (
    <View style={[styles.skeleton, { height }]} />
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  message: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.sm,
    color: Colors.gray,
    marginTop: 12,
    letterSpacing: 0.4,
  },
  skeleton: {
    backgroundColor: Colors.paperDim,
    borderRadius: 10,
    marginBottom: 14,
    opacity: 0.7,
  },
});
