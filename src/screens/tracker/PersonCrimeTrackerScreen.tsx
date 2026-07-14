import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, ScrollView, Image } from 'react-native';
import { NetworkGraph } from '../../components/network/NetworkGraph';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList } from '../../types/navigation';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, CaseStackParamList } from '../../types/navigation';

type TrackerScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'PersonCrimeTracker'>,
  StackNavigationProp<CaseStackParamList>
>;

// Mock Data
const MOCK_PERSON = {
  id: 'CS-88901',
  name: 'John Doe',
  alias: 'JD, The Ghost',
  dob: '12-May-1985',
  riskScore: 92,
  status: 'WANTED',
  crimes: [
    { type: 'Narcotics', count: 3 },
    { type: 'Extortion', count: 1 },
    { type: 'Assault', count: 2 },
  ],
  timeline: [
    { date: '2022-01-15', event: 'First Arrest (Assault)' },
    { date: '2023-06-22', event: 'Named in FIR-2023-089' },
    { date: '2024-02-10', event: 'Evaded capture at Checkpoint Alpha' },
  ],
};

const initialNodes = [
  { id: 'CS-88901', group: 'person', label: 'John Doe (Target)' },
  { id: 'FIR-2023-089', group: 'fir', label: 'FIR-2023-089' },
  { id: 'FIR-2022-114', group: 'fir', label: 'FIR-2022-114' },
  { id: 'CS-99212', group: 'person', label: 'Mike Johnson (Associate)' },
  { id: '+91-9876543210', group: 'phone', label: '+91-9876543210' },
  { id: 'MH-01-AB-1234', group: 'vehicle', label: 'MH-01-AB-1234' },
  { id: 'ACC-556789', group: 'account', label: 'ACC-556789' },
];

const initialLinks = [
  { source: 'CS-88901', target: 'FIR-2023-089', value: 1 },
  { source: 'CS-88901', target: 'FIR-2022-114', value: 1 },
  { source: 'CS-88901', target: 'CS-99212', value: 1 },
  { source: 'CS-88901', target: '+91-9876543210', value: 1 },
  { source: 'CS-88901', target: 'MH-01-AB-1234', value: 1 },
  { source: 'CS-88901', target: 'ACC-556789', value: 1 },
  { source: 'CS-99212', target: 'FIR-2023-089', value: 1 },
];

export const PersonCrimeTrackerScreen = () => {
  const navigation = useNavigation<TrackerScreenNavigationProp>();
  const [selectedPerson, setSelectedPerson] = useState(MOCK_PERSON);

  const handleNodePress = (node: any) => {
    if (node.group === 'fir') {
      // Navigate to CaseDetails screen
      navigation.navigate('CaseFiles'); 
      // Note: Ideally we navigate directly to CaseDetail:
      navigation.navigate('CaseDetail', { caseId: node.id });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.openDrawer()}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.title}>PERSON CRIME HISTORY TRACKER</Text>
      </View>

      <View style={styles.mainLayout}>
        {/* Left Side: Profile View */}
        <View style={styles.profileSidebar}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>JD</Text>
              </View>
              <View>
                <Text style={styles.personName}>{selectedPerson.name}</Text>
                <Text style={styles.personId}>ID: {selectedPerson.id}</Text>
              </View>
            </View>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{selectedPerson.status}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Aliases</Text>
              <Text style={styles.infoText}>{selectedPerson.alias}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI Risk Score</Text>
              <View style={styles.riskBarContainer}>
                <View style={[styles.riskBar, { width: `${selectedPerson.riskScore}%` }]} />
              </View>
              <Text style={styles.riskText}>{selectedPerson.riskScore}/100 - Critical Risk</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Crime Summary</Text>
              {selectedPerson.crimes.map((c, i) => (
                <View key={i} style={styles.crimeRow}>
                  <Text style={styles.crimeType}>{c.type}</Text>
                  <Text style={styles.crimeCount}>{c.count} Cases</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Investigation Timeline</Text>
              {selectedPerson.timeline.map((t, i) => (
                <View key={i} style={styles.timelineRow}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineDate}>{t.date}</Text>
                    <Text style={styles.timelineEvent}>{t.event}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Right Side: Network Graph */}
        <View style={styles.graphContainer}>
          <View style={styles.graphHeader}>
            <Text style={styles.graphTitle}>Entity Connections</Text>
            <Text style={styles.graphSubtitle}>Tap on an FIR node to view case details.</Text>
          </View>
          <NetworkGraph 
            nodes={initialNodes} 
            links={initialLinks} 
            onNodePress={handleNodePress} 
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f171e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2f3542',
    backgroundColor: 'rgba(15, 23, 30, 0.9)',
    zIndex: 10,
  },
  menuBtn: {
    padding: 10,
    marginRight: 10,
  },
  menuIcon: {
    color: '#dfe4ea',
    fontSize: 24,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  profileSidebar: {
    width: 320,
    borderRightWidth: 1,
    borderRightColor: '#2f3542',
    backgroundColor: 'rgba(15, 23, 30, 0.95)',
    padding: 20,
  },
  graphContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  graphHeader: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(15, 23, 30, 0.8)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2f3542',
  },
  graphTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  graphSubtitle: {
    color: '#a4b0be',
    fontSize: 12,
    marginTop: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff4757',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  personName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  personId: {
    color: '#a4b0be',
    fontSize: 12,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 71, 87, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ff4757',
    alignSelf: 'flex-start',
    marginBottom: 25,
  },
  statusText: {
    color: '#ff4757',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#57606f',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  infoText: {
    color: '#dfe4ea',
    fontSize: 14,
  },
  riskBarContainer: {
    height: 8,
    backgroundColor: '#2f3542',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  riskBar: {
    height: '100%',
    backgroundColor: '#ff4757',
  },
  riskText: {
    color: '#ff4757',
    fontSize: 12,
    fontWeight: 'bold',
  },
  crimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2f3542',
  },
  crimeType: {
    color: '#dfe4ea',
    fontSize: 14,
  },
  crimeCount: {
    color: '#a4b0be',
    fontSize: 14,
    fontWeight: 'bold',
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1e90ff',
    marginTop: 4,
    marginRight: 15,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDate: {
    color: '#1e90ff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  timelineEvent: {
    color: '#dfe4ea',
    fontSize: 13,
  },
});
