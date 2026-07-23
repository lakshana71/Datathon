// CrimeSphere AI — AppHeader Component
// Mirrors the HTML topbar: search box, station tag, officer info
import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { useAuthStore } from '../../store/authStore';
import { MOCK_OFFICER } from '../../constants/mockData';
import { AvatarCircle } from '../officer/OfficerAvatar';

interface AppHeaderProps {
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  showSearch?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onMenuPress,
  onSearchPress,
  searchQuery = '',
  onSearchChange,
  showSearch = true,
}) => {
  const { officer: storeOfficer } = useAuthStore();
  const officer = storeOfficer || MOCK_OFFICER;

  return (
    <View style={styles.container}>
      {/* Hamburger (mobile only) */}
      <Pressable onPress={onMenuPress} style={styles.menuBtn} accessibilityLabel="Open menu">
        <Text style={styles.menuIcon}>☰</Text>
      </Pressable>

      {/* Search Box */}
      {showSearch && (
        <Pressable style={styles.searchBox} onPress={onSearchPress}>
          <Text style={styles.searchIcon}>🔍</Text>
          {onSearchChange ? (
            <TextInput
              style={styles.searchInput}
              placeholder="Search FIR number, name, phone, vehicle..."
              placeholderTextColor={Colors.gray}
              value={searchQuery}
              onChangeText={onSearchChange}
              returnKeyType="search"
            />
          ) : (
            <Text style={styles.searchPlaceholder}>
              Search FIR number, name, phone, vehicle...
            </Text>
          )}
        </Pressable>
      )}

      {/* Right side */}
      <View style={styles.right}>
        <View style={styles.stationTag}>
          <Text style={styles.stationText}>{officer.shift}</Text>
        </View>
        <View style={styles.officer}>
          <AvatarCircle initials={officer.initials} size={34} />
          <View style={styles.officerInfo}>
            <Text style={styles.officerName}>{officer.name}</Text>
            <Text style={styles.officerRank}>{officer.rank}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    zIndex: 5,
  },
  menuBtn: {
    padding: 4,
  },
  menuIcon: {
    fontSize: 20,
    color: Colors.inkNavy,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: 400,
  },
  searchIcon: {
    fontSize: 13,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
    padding: 0,
  },
  searchPlaceholder: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.gray,
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stationTag: {
    backgroundColor: Colors.paperDim,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  stationText: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.smPlus,
    color: Colors.gray,
  },
  officer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  officerInfo: {
    justifyContent: 'center',
  },
  officerName: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
  },
  officerRank: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
});
