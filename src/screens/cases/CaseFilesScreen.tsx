// CrimeSphere AI — CaseFilesScreen

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { DrawerParamList } from '../../types/navigation';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { CaseCard } from '../../components/cards/CaseCard';
import { FilterChip } from '../../components/ui/FilterChip';
import { AppHeader } from '../../components/layout/AppHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { useCaseStore } from '../../store/caseStore';
import { MOCK_CASE_FILTERS } from '../../constants/mockData';

type Props = {
  navigation: DrawerNavigationProp<DrawerParamList, 'CaseFiles'>;
};

export const CaseFilesScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const {
    activeFilter,
    setFilter,
    setSelectedCase,
    getFilteredCases,
  } = useCaseStore();

  const [refreshing, setRefreshing] = useState(false);

  const filteredCases = getFilteredCases();

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setRefreshing(false);
  };

  const handleOpenCase = (caseId: string) => {
    setSelectedCase(caseId);
    navigation.navigate('CaseDetail', { caseId });
  };

  const renderHeader = () => (
    <>
      {/* Page Heading */}
      <View style={styles.pageHead}>
        <Text style={styles.eyebrow}>Investigation</Text>

        <Text style={styles.heading}>
          Case Files
        </Text>

        <Text style={styles.subtitle}>
          Every FIR, its extracted details, and how it connects to
          other cases on record.
        </Text>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {MOCK_CASE_FILTERS.map((filter) => (
          <FilterChip
            key={filter.id}
            label={filter.label}
            isActive={activeFilter === filter.value}
            onPress={() => setFilter(filter.value)}
          />
        ))}
      </View>
    </>
  );

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      <AppHeader
        onMenuPress={() => navigation.openDrawer()}
      />

      <FlatList
        data={filteredCases}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CaseCard
            caseItem={item}
            onPress={() => handleOpenCase(item.id)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="📂"
            title="No cases match this filter"
            subtitle="Try changing the filter or search query."
          />
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.red}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.paper,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 80,
    flexGrow: 1,
  },

  pageHead: {
    marginBottom: 16,
  },

  eyebrow: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.sm,
    letterSpacing: 1,
    color: Colors.red,
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  heading: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['4xl'],
    fontWeight: '600',
    color: Colors.inkNavy,
  },

  subtitle: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.mdPlus,
    color: Colors.gray,
    marginTop: 5,
  },

  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 16,
    paddingRight: 8,
  },
});