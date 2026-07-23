// ScreenScrollView — Scrollable screen container for Expo Web + Native
//
// The CSS in App.tsx fixes react-native-screens' ScreenContainer (which is a plain
// View on web with no height, no positioning). With that CSS fix, simple flex:1 works.

import React, { ReactNode } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import type { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';

interface ScreenScrollViewProps extends Omit<ScrollViewProps, 'style'> {
  header: ReactNode;
  backgroundColor?: string;
  screenStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
}

export const ScreenScrollView: React.FC<ScreenScrollViewProps> = ({
  header,
  backgroundColor = '#FAFAF9',
  screenStyle,
  contentContainerStyle,
  children,
  ...scrollProps
}) => {
  return (
    <View style={[styles.screen, { backgroundColor }, screenStyle]}>
      {header}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={contentContainerStyle}
        {...scrollProps}
      >
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
});
