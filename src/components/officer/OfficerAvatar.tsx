// CrimeSphere AI — OfficerAvatar Component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';

interface OfficerAvatarProps {
  initials: string;
  name: string;
  rank: string;
  size?: 'small' | 'medium' | 'large';
}

export const OfficerAvatar: React.FC<OfficerAvatarProps> = ({
  initials,
  name,
  rank,
  size = 'small',
}) => {
  const avatarSize = size === 'large' ? 56 : size === 'medium' ? 44 : 34;
  const fontSize = size === 'large' ? 20 : size === 'medium' ? 16 : 14;
  const showText = size !== 'small';

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}>
        <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
      </View>
      {(showText || size === 'small') && (
        <View style={styles.info}>
          <Text style={[styles.name, size === 'large' && styles.nameLarge]}>{name}</Text>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
      )}
    </View>
  );
};

// Stand-alone avatar circle (no text)
export const AvatarCircle: React.FC<{ initials: string; size?: number }> = ({
  initials,
  size = 34,
}) => {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    backgroundColor: Colors.steel,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  initials: {
    fontFamily: FontFamily.display,
    fontWeight: '600',
    color: Colors.white,
  },
  info: {
    justifyContent: 'center',
  },
  name: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
  },
  nameLarge: {
    fontSize: FontSize['2xl'],
  },
  rankText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
});
