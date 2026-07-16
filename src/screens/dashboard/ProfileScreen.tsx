// CrimeSphere AI — ProfileScreen (Police Officer Profile Dashboard)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { DrawerParamList } from '../../types/navigation';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { AppHeader } from '../../components/layout/AppHeader';

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const isWide = Platform.OS === 'web' && screenWidth >= 992;

  // Officer Static Data
  const officerData = {
    name: 'Insp. R. Kumaraswamy',
    initials: 'RK',
    rank: 'Inspector of Police',
    designation: 'Circle Inspector (CI)',
    badgeNumber: 'KSP-WF-4421',
    age: '42 Years',
    policeStation: 'Whitefield Police Station',
    jurisdiction: 'Whitefield PS Circle (Hoodi, ITPL, Varthur, Marathahalli)',
    department: 'Law & Order & Crime Investigation',
    yearsOfService: '14 Years',
    phone: '+91-80-2845-0001',
    email: 'r.kumaraswamy@ksp.gov.in',
    shift: '08:00 - 20:00 (Day Shift)',
    status: 'Active (On Duty)',
    reportingOfficer: 'ACP Swaminathan S. (Whitefield Sub-Division)',
    specialization: 'Cyber Forensics & Homicide Investigation',
    activeCases: 6,
    resolvedCases: 18,
    patrolAssignment: 'Command Coordination Liaison (PCR-14 & PCR-09)',
    emergencyContact: 'Mrs. Asha Kumaraswamy (Spouse) — +91-98450-99999',
    lastLogin: 'Just now via Secure Tactical VPN',
    awards: [
      { title: "President's Police Medal", year: '2024', desc: 'Meritorious Service excellence' },
      { title: "Chief Minister's Gold Medal", year: '2021', desc: 'Outstanding cyber crime investigation' },
      { title: "KSP Commendation", year: '2025', desc: 'Busting multi-state banking fraud ring' },
    ],
    certifications: [
      'Advanced Cyber Forensics (National Forensic Sciences University - NFSU)',
      'Tactical Command & Crisis Management (National Police Academy - SVPNPA)',
      'Modern Crime Scene Management & Ballistics',
    ]
  };

  const handleOpenSchedule = () => {
    setScheduleModalVisible(true);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <AppHeader
        onMenuPress={() => navigation.openDrawer()}
        showSearch={false}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer}>
        {/* Main layout: responsive split or unified column */}
        <View style={[styles.profileLayout, isWide && styles.profileLayoutRow]}>
          
          {/* Left / Top Side: Core Officer Card & Quick Actions */}
          <View style={[styles.profileCardCol, isWide && { flex: 4.5 }]}>
            
            {/* Primary Profile ID Card */}
            <View style={styles.officerMainCard}>
              <View style={styles.mainCardHeader}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>{officerData.initials}</Text>
                  <View style={styles.dutyStatusDot} />
                </View>
                <View style={styles.mainCardInfo}>
                  <Text style={styles.officerName}>{officerData.name}</Text>
                  <Text style={styles.officerRank}>{officerData.rank}</Text>
                  <View style={styles.badgeRow}>
                    <Text style={styles.badgeLabel}>BADGE ID:</Text>
                    <Text style={styles.badgeValue}>{officerData.badgeNumber}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.compactGrid}>
                <View style={styles.compactItem}>
                  <Text style={styles.compactLabel}>DUTY STATUS</Text>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>{officerData.status.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.compactItem}>
                  <Text style={styles.compactLabel}>STATION</Text>
                  <Text style={styles.compactVal}>{officerData.policeStation}</Text>
                </View>
                <View style={styles.compactItem}>
                  <Text style={styles.compactLabel}>DEPARTMENT</Text>
                  <Text style={styles.compactVal}>{officerData.department}</Text>
                </View>
                <View style={styles.compactItem}>
                  <Text style={styles.compactLabel}>SHIFT TIMING</Text>
                  <Text style={styles.compactVal}>{officerData.shift}</Text>
                </View>
              </View>
            </View>

            {/* Quick Actions Panel */}
            <Text style={styles.sectionTitle}>QUICK ACTION HUB</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('CaseFiles')}
              >
                <Text style={styles.actionIcon}>📁</Text>
                <Text style={styles.actionLabel}>View Cases</Text>
                <Text style={styles.actionSub}>6 Active Files</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={handleOpenSchedule}
              >
                <Text style={styles.actionIcon}>🗓️</Text>
                <Text style={styles.actionLabel}>Duty Schedule</Text>
                <Text style={styles.actionSub}>Day Shift Logs</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('CrimeMap')}
              >
                <Text style={styles.actionIcon}>🗺️</Text>
                <Text style={styles.actionLabel}>Crime Map</Text>
                <Text style={styles.actionSub}>Live GPS Feed</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate('DutyNotebook')}
              >
                <Text style={styles.actionIcon}>💬</Text>
                <Text style={styles.actionLabel}>Duty Notebook</Text>
                <Text style={styles.actionSub}>Shift Notes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, { minWidth: '100%' }]}
                onPress={() => navigation.navigate('Alerts')}
              >
                <Text style={styles.actionIcon}>📡</Text>
                <Text style={styles.actionLabel}>Intelligence Reports</Text>
                <Text style={styles.actionSub}>AI-Powered Police Command Center</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right / Bottom Side: Detailed Service Record & Credentials */}
          <View style={[styles.profileDetailsCol, isWide && { flex: 7.5 }]}>
            
            {/* Dossier Information Card */}
            <View style={styles.detailsCard}>
              <Text style={styles.cardHeaderTitle}>🏛️ KSP OFFICIAL RECORD</Text>
              <View style={styles.divider} />
              
              <View style={styles.infoRowGrid}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Rank / Designation</Text>
                  <Text style={styles.infoValue}>{officerData.designation}</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Age</Text>
                  <Text style={styles.infoValue}>{officerData.age}</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Years of Service</Text>
                  <Text style={styles.infoValue}>{officerData.yearsOfService}</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Specialization</Text>
                  <Text style={styles.infoValue}>{officerData.specialization}</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Official Contact</Text>
                  <Text style={styles.infoValue}>{officerData.phone}</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Official Email</Text>
                  <Text style={styles.infoValue}>{officerData.email}</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Reporting Officer</Text>
                  <Text style={styles.infoValue}>{officerData.reportingOfficer}</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Last Secure Login</Text>
                  <Text style={styles.infoValue}>{officerData.lastLogin}</Text>
                </View>
              </View>

              <View style={styles.subDivider} />

              <Text style={styles.detailsSubheading}>📍 Jurisdiction & Beat</Text>
              <Text style={styles.detailsText}>{officerData.jurisdiction}</Text>

              <View style={styles.subDivider} />

              <Text style={styles.detailsSubheading}>🚔 Current Patrol Assignment</Text>
              <Text style={styles.detailsText}>{officerData.patrolAssignment}</Text>

              <View style={styles.subDivider} />

              <Text style={styles.detailsSubheading}>🚨 Emergency Contact</Text>
              <Text style={styles.detailsText}>{officerData.emergencyContact}</Text>
            </View>

            {/* Awards & Certifications Card */}
            <View style={styles.detailsCard}>
              <Text style={styles.cardHeaderTitle}>🎖️ HONOURS & QUALIFICATIONS</Text>
              <View style={styles.divider} />
              
              <Text style={styles.detailsSubheading}>Awards & Commendations</Text>
              {officerData.awards.map((award, index) => (
                <View key={index} style={styles.awardItem}>
                  <View style={styles.awardHeader}>
                    <Text style={styles.awardTitle}>🏆 {award.title}</Text>
                    <Text style={styles.awardYear}>{award.year}</Text>
                  </View>
                  <Text style={styles.awardDesc}>{award.desc}</Text>
                </View>
              ))}

              <View style={styles.subDivider} />

              <Text style={styles.detailsSubheading}>Specialized Training & Certifications</Text>
              {officerData.certifications.map((cert, index) => (
                <Text key={index} style={styles.certBullet}>• {cert}</Text>
              ))}
            </View>

          </View>
        </View>
      </ScrollView>

      {/* ── Schedule Modal ────────────────────────────────────────────── */}
      <Modal
        visible={scheduleModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setScheduleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🗓️ INSPEC. KUMARASWAMY - DUTY SCHEDULE</Text>
              <TouchableOpacity onPress={() => setScheduleModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <View style={styles.scheduleRow}>
                <Text style={styles.scheduleTime}>08:00 - 08:30</Text>
                <Text style={styles.scheduleTask}>Morning Briefing & Patrol Handover</Text>
              </View>
              <View style={styles.scheduleRow}>
                <Text style={styles.scheduleTime}>08:30 - 11:30</Text>
                <Text style={styles.scheduleTask}>FIR Review & Case Registry Inspections</Text>
              </View>
              <View style={styles.scheduleRow}>
                <Text style={styles.scheduleTime}>11:30 - 14:00</Text>
                <Text style={styles.scheduleTask}>Tactical Command Liaison (Whitefield PS HQ)</Text>
              </View>
              <View style={styles.scheduleRow}>
                <Text style={styles.scheduleTime}>14:00 - 15:30</Text>
                <Text style={styles.scheduleTask}>LUNCH / Command Deck Monitoring</Text>
              </View>
              <View style={styles.scheduleRow}>
                <Text style={styles.scheduleTime}>15:30 - 18:30</Text>
                <Text style={styles.scheduleTask}>Interrogations & Investigator Reviews</Text>
              </View>
              <View style={styles.scheduleRow}>
                <Text style={styles.scheduleTime}>18:30 - 20:00</Text>
                <Text style={styles.scheduleTask}>Sub-Division Operations Briefing & Handover</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  profileLayout: {
    gap: 16,
  },
  profileLayoutRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  profileCardCol: {
    gap: 16,
  },
  profileDetailsCol: {
    gap: 16,
  },
  officerMainCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 8,
    padding: 18,
    gap: 14,
  },
  mainCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.inkNavy,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    fontFamily: FontFamily.displayBold,
    fontSize: 24,
    color: Colors.white,
  },
  dutyStatusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.green,
    position: 'absolute',
    bottom: 2,
    right: 2,
    borderWidth: 2,
    borderColor: Colors.card,
  },
  mainCardInfo: {
    flex: 1,
    gap: 2,
  },
  officerName: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize.lgPlus,
    fontWeight: '700',
    color: Colors.inkNavy,
  },
  officerRank: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.gray,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  badgeLabel: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.steel,
    opacity: 0.8,
  },
  badgeValue: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.xs,
    color: Colors.red,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.line,
  },
  subDivider: {
    height: 1,
    backgroundColor: Colors.line + '50',
    marginVertical: 10,
  },
  compactGrid: {
    gap: 10,
  },
  compactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactLabel: {
    fontFamily: FontFamily.mono,
    fontSize: 9,
    color: Colors.gray,
    letterSpacing: 0.5,
  },
  compactVal: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.inkNavy,
  },
  statusPill: {
    backgroundColor: Colors.greenDim,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: Colors.green,
  },
  statusText: {
    fontFamily: FontFamily.mono,
    fontSize: 8.5,
    color: Colors.green,
    fontWeight: '700',
  },
  sectionTitle: {
    fontFamily: FontFamily.mono,
    fontSize: 10,
    color: Colors.red,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 8,
    padding: 14,
    gap: 4,
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  actionLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.smPlus,
    color: Colors.inkNavy,
  },
  actionSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  detailsCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 8,
    padding: 18,
  },
  cardHeaderTitle: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.inkNavy,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  infoRowGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 8,
  },
  infoBox: {
    width: '46%',
    gap: 2,
  },
  infoLabel: {
    fontFamily: FontFamily.body,
    fontSize: 10,
    color: Colors.gray,
  },
  infoValue: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.inkNavy,
  },
  detailsSubheading: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.smPlus,
    color: Colors.inkNavy,
    marginBottom: 4,
    marginTop: 4,
  },
  detailsText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.gray,
    lineHeight: 16,
  },
  awardItem: {
    backgroundColor: Colors.paperDim + '30',
    padding: 10,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: Colors.line,
    marginBottom: 8,
    gap: 2,
  },
  awardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  awardTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.inkNavy,
  },
  awardYear: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 9,
    color: Colors.red,
  },
  awardDesc: {
    fontFamily: FontFamily.body,
    fontSize: 9.5,
    color: Colors.gray,
    lineHeight: 13,
  },
  certBullet: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.gray,
    lineHeight: 16,
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 33, 61, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.inkNavy,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.inkNavy,
    padding: 14,
  },
  modalTitle: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: '#00FF66',
    fontWeight: '700',
  },
  modalClose: {
    fontSize: 14,
    color: Colors.white,
  },
  modalContent: {
    padding: 14,
    gap: 8,
  },
  scheduleRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.line,
    gap: 12,
    alignItems: 'center',
  },
  scheduleTime: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 9.5,
    color: Colors.red,
    width: 80,
  },
  scheduleTask: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.inkNavy,
    flex: 1,
  },
});
