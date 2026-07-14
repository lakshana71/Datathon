import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const FILTER_TYPES = [
  { id: 'person', label: 'Persons', color: '#ff4757' },
  { id: 'vehicle', label: 'Vehicles', color: '#ffa502' },
  { id: 'phone', label: 'Phones', color: '#1e90ff' },
  { id: 'fir', label: 'FIRs', color: '#2ed573' },
  { id: 'account', label: 'Accounts', color: '#eccc68' },
];

interface Props {
  activeFilters: string[];
  onToggleFilter: (id: string) => void;
}

export const NetworkFilters: React.FC<Props> = ({ activeFilters, onToggleFilter }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Filters</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterList}>
        {FILTER_TYPES.map(filter => {
          const isActive = activeFilters.includes(filter.id);
          return (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                { borderColor: filter.color },
                isActive && { backgroundColor: filter.color }
              ]}
              onPress={() => onToggleFilter(filter.id)}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(15, 23, 30, 0.85)',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2f3542',
  },
  title: {
    color: '#a4b0be',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  filterList: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    color: '#dfe4ea',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#000000', // Better contrast when background is filled
  },
});
