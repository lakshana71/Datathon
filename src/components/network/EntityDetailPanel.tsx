import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInRight, FadeOutRight } from 'react-native-reanimated';

type Node = {
  id: string;
  group: string;
  label: string;
  details?: any;
};

interface Props {
  entity: Node;
  onClose: () => void;
}

export const EntityDetailPanel: React.FC<Props> = ({ entity, onClose }) => {
  return (
    <Animated.View
      entering={FadeInRight}
      exiting={FadeOutRight}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{entity.label}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entity Information</Text>
          <Text style={styles.infoText}>Type: {entity.group.toUpperCase()}</Text>
          <Text style={styles.infoText}>ID: {entity.id}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Assessment</Text>
          <View style={styles.riskBadge}>
            <Text style={styles.riskText}>HIGH RISK - Score 87/100</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Investigation Insights</Text>
          <Text style={styles.insightText}>
            • This {entity.group} is connected to 3 open FIRs in the past 6 months.
            {'\n'}• Shows a high transaction volume with suspicious accounts.
            {'\n'}• Recommended action: Request detailed call records (CDR).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Linked Cases (2)</Text>
          <View style={styles.caseCard}>
            <Text style={styles.caseText}>FIR-2023-089 (Narcotics)</Text>
          </View>
          <View style={styles.caseCard}>
            <Text style={styles.caseText}>FIR-2024-112 (Money Laundering)</Text>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 320,
    backgroundColor: 'rgba(15, 23, 30, 0.95)', // Palantir dark style
    borderLeftWidth: 1,
    borderLeftColor: '#2f3542',
    shadowColor: '#000',
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2f3542',
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 5,
  },
  closeText: {
    color: '#ffffff',
    fontSize: 24,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#a4b0be',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  infoText: {
    color: '#dfe4ea',
    fontSize: 14,
    marginBottom: 4,
  },
  riskBadge: {
    backgroundColor: 'rgba(255, 71, 87, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ff4757',
    alignSelf: 'flex-start',
  },
  riskText: {
    color: '#ff4757',
    fontWeight: 'bold',
    fontSize: 12,
  },
  insightText: {
    color: '#7bed9f',
    fontSize: 14,
    lineHeight: 20,
  },
  caseCard: {
    backgroundColor: '#2f3542',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  caseText: {
    color: '#dfe4ea',
    fontSize: 13,
  },
});
