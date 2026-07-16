// CrimeSphere AI — AlertsScreen (Police Intelligence Command Center)
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  Share,
  Alert as RNAlert,
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

interface CommandAlert {
  id: string;
  category: 'Critical' | 'Live Crime' | 'Patrol' | 'AI Intelligence' | 'Evidence' | 'Person' | 'Case' | 'Comms';
  priority: 'urgent' | 'review' | 'routine';
  title: string;
  description: string;
  time: string;
  timestamp: string;
  isRead: boolean;
  isPinned: boolean;
  aiConfidence?: number;
  linkedCaseId?: string | null;
  linkedSuspectId?: string | null;
  location?: string;
  officer?: string;
  actionParams?: Record<string, any>;
  resolved?: boolean;
}

// ─── Command Center Initial Alerts Data ───────────────────────────────────────
const INITIAL_ALERTS: CommandAlert[] = [
  {
    id: 'cmd-alert-1',
    category: 'Critical',
    priority: 'urgent',
    title: 'Active Weapon Detection Report',
    description: 'AI Camera #CCTV-101 detected a suspected handgun outside Hoodi metro exit.',
    time: 'Just now',
    timestamp: new Date().toISOString(),
    isRead: false,
    isPinned: true,
    aiConfidence: 96,
    location: 'Hoodi Metro Exit Gate 2',
    linkedCaseId: null,
    linkedSuspectId: null,
    officer: 'System AI',
  },
  {
    id: 'cmd-alert-2',
    category: 'AI Intelligence',
    priority: 'review',
    title: 'Anomalous Crime Cluster Detected',
    description: '3 chain snatching cases reported within 450m of Whitefield Circle in 4 days. Strong MO match (Pulsar 150, evening hours, 2 riders).',
    time: '2 mins ago',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    isRead: false,
    isPinned: true,
    aiConfidence: 89,
    location: 'Whitefield Circle Sector 6',
    linkedCaseId: 'KA-CR-1142',
    linkedSuspectId: 'S-2291',
    officer: 'Pattern Matching Engine',
  },
  {
    id: 'cmd-alert-3',
    category: 'Patrol',
    priority: 'urgent',
    title: 'Patrol Route Deviation Warning',
    description: 'Unit PCR-14 has deviated from assigned Hoodi beat route for 22 minutes without dispatch log.',
    time: '12 mins ago',
    timestamp: new Date(Date.now() - 720000).toISOString(),
    isRead: false,
    isPinned: false,
    location: 'Outer Ring Road, Hoodi Boundary',
    linkedCaseId: null,
    linkedSuspectId: null,
    officer: 'SI Manjunath',
  },
  {
    id: 'cmd-alert-4',
    category: 'Live Crime',
    priority: 'urgent',
    title: 'Live UPI Fraud Campaign Spike',
    description: '9 complaints of phishing SMS impersonating Bescom electricity bills in Whitefield PS limits.',
    time: '45 mins ago',
    timestamp: new Date(Date.now() - 2700000).toISOString(),
    isRead: true,
    isPinned: false,
    aiConfidence: 94,
    location: 'Whitefield Circle sub-limits',
    linkedCaseId: 'KA-CR-1156',
    linkedSuspectId: null,
    officer: 'Cyber Crime Unit',
  },
  {
    id: 'cmd-alert-5',
    category: 'Evidence',
    priority: 'review',
    title: 'Biometric Match Confirmed',
    description: 'Fingerprint match on crime scene document E-102 uploaded for Case KA-CR-1149. Link established to Raju (Alias Chintu).',
    time: '2 hrs ago',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    isRead: true,
    isPinned: false,
    aiConfidence: 98,
    location: 'Forensics Wing HQ',
    linkedCaseId: 'KA-CR-1149',
    linkedSuspectId: 'S-2291',
    officer: 'Forensic Lab AI',
  },
  {
    id: 'cmd-alert-6',
    category: 'Person',
    priority: 'review',
    title: 'Habitual Offender Locational Pin',
    description: 'Associate linked to Raju flagged using mobile tower activity inside Marathahalli Sector 3 boundary.',
    time: '3 hrs ago',
    timestamp: new Date(Date.now() - 1080000).toISOString(),
    isRead: true,
    isPinned: false,
    aiConfidence: 78,
    location: 'Marathahalli Bridge Sector',
    linkedCaseId: 'KA-CR-1142',
    linkedSuspectId: 'S-2291',
    officer: 'Intel Grid System',
  },
  {
    id: 'cmd-alert-7',
    category: 'Comms',
    priority: 'routine',
    title: 'Control Room Frequency Swapped',
    description: 'Main tactical radio link shifted to Frequency 412.85 MHz due to atmospheric static.',
    time: '4 hrs ago',
    timestamp: new Date(Date.now() - 1440000).toISOString(),
    isRead: true,
    isPinned: false,
    location: 'HQ Dispatch',
    linkedCaseId: null,
    linkedSuspectId: null,
    officer: 'Radio Desk Officer',
  },
  {
    id: 'cmd-alert-8',
    category: 'Case',
    priority: 'routine',
    title: 'Case File Assigned',
    description: 'FIR KA-CR-1138 has been reassigned to SI Deepa R. for final charge sheet draft.',
    time: '5 hrs ago',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    isRead: true,
    isPinned: false,
    location: 'Whitefield PS Registry',
    linkedCaseId: 'KA-CR-1138',
    linkedSuspectId: null,
    officer: 'ACP Swaminathan S.',
  },
];

export const AlertsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  const [alerts, setAlerts] = useState<CommandAlert[]>(INITIAL_ALERTS);
  const [filter, setFilter] = useState<'all' | 'critical' | 'ai' | 'patrol' | 'cases' | 'unread' | 'pinned'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<CommandAlert | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [clockTime, setClockTime] = useState('');

  // Pulsing animations for command deck
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Live clock update
    const updateClock = () => {
      const d = new Date();
      setClockTime(d.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);

    // Pulse loops
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    return () => clearInterval(interval);
  }, []);

  // Filter & Search Logic
  const filteredAlerts = alerts.filter((alert) => {
    // 1. Filter by category tabs
    if (filter === 'critical' && alert.priority !== 'urgent') return false;
    if (filter === 'ai' && alert.category !== 'AI Intelligence') return false;
    if (filter === 'patrol' && alert.category !== 'Patrol') return false;
    if (filter === 'cases' && !alert.linkedCaseId) return false;
    if (filter === 'unread' && alert.isRead) return false;
    if (filter === 'pinned' && !alert.isPinned) return false;

    // 2. Filter by search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      return (
        alert.title.toLowerCase().includes(q) ||
        alert.description.toLowerCase().includes(q) ||
        alert.category.toLowerCase().includes(q) ||
        (alert.location && alert.location.toLowerCase().includes(q)) ||
        (alert.linkedCaseId && alert.linkedCaseId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.isRead && !a.resolved).length;
  const criticalCount = alerts.filter((a) => a.priority === 'urgent' && !a.resolved).length;

  // Actions
  const handleMarkAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    RNAlert.alert('Command Log', 'All incoming feeds marked as acknowledged.');
  };

  const handleMarkResolved = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true, isRead: true } : a)));
    setDetailsModalVisible(false);
    setSelectedAlert(null);
  };

  const handleTogglePin = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isPinned: !a.isPinned } : a))
    );
    if (selectedAlert && selectedAlert.id === id) {
      setSelectedAlert((prev) => prev ? { ...prev, isPinned: !prev.isPinned } : null);
    }
  };

  const handleShare = async (alertItem: CommandAlert) => {
    try {
      await Share.share({
        message: `🚨 [KSP COMMAND CENTER ALERT]\nPriority: ${alertItem.priority.toUpperCase()}\nCategory: ${alertItem.category}\nTitle: ${alertItem.title}\nDetails: ${alertItem.description}\nLocation: ${alertItem.location || 'N/A'}\nTimestamp: ${alertItem.time}`,
      });
    } catch (e) {
      console.log('Error sharing:', e);
    }
  };

  const handleAssignPatrol = (alertItem: CommandAlert) => {
    RNAlert.alert(
      'Tactical Operations',
      `Dispatch nearest PCR unit to: ${alertItem.location || 'Report coordinates'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Dispatch',
          onPress: () => {
            RNAlert.alert('Success', 'PCR-14 and PCR-09 rerouted. ETA 3.5 minutes.');
            handleMarkResolved(alertItem.id);
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority: 'urgent' | 'review' | 'routine') => {
    if (priority === 'urgent') return Colors.red;
    if (priority === 'review') return Colors.amber;
    return Colors.green;
  };

  const getPriorityBg = (priority: 'urgent' | 'review' | 'routine') => {
    if (priority === 'urgent') return Colors.redDim;
    if (priority === 'review') return Colors.amberDim;
    return Colors.greenDim;
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Critical': return '🚨';
      case 'Live Crime': return '⚠️';
      case 'Patrol': return '🚔';
      case 'AI Intelligence': return '🧠';
      case 'Evidence': return '📁';
      case 'Person': return '👤';
      case 'Case': return '📋';
      case 'Comms': return '📡';
      default: return '🔔';
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const isWide = Platform.OS === 'web' && screenWidth >= 992;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <AppHeader
        onMenuPress={() => navigation.openDrawer()}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showSearch={true}
      />

      <View style={styles.commandBanner}>
        <View style={styles.bannerLeft}>
          <View style={styles.liveGridStatus}>
            <Animated.View style={[styles.liveIndicatorDot, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={styles.bannerTextLive}>KSP LIVE INTELLIGENCE FEED</Text>
          </View>
          <Text style={styles.bannerClock}>{clockTime || '14:20:00'}</Text>
        </View>
        <View style={styles.bannerRight}>
          <View style={styles.bannerPill}>
            <Text style={styles.bannerPillText}>{unreadCount} Acknowledged</Text>
          </View>
          <TouchableOpacity style={styles.acknowledgeAllBtn} onPress={handleMarkAllRead}>
            <Text style={styles.ackAllBtnText}>Acknowledged All</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer}>
        {/* Statistics Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: Colors.inkNavy }]}>{alerts.length}</Text>
            <Text style={styles.statLabel}>Total Feeds</Text>
            <View style={styles.statGraph} />
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 3, borderLeftColor: Colors.red }]}>
            <Text style={[styles.statValue, { color: Colors.red }]}>{criticalCount}</Text>
            <Text style={styles.statLabel}>Critical Threat</Text>
            <View style={[styles.statGraph, { backgroundColor: Colors.red + '15' }]} />
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 3, borderLeftColor: Colors.amber }]}>
            <Text style={[styles.statValue, { color: Colors.amber }]}>
              {alerts.filter((a) => a.category === 'AI Intelligence' && !a.resolved).length}
            </Text>
            <Text style={styles.statLabel}>AI Insights</Text>
            <View style={[styles.statGraph, { backgroundColor: Colors.amber + '15' }]} />
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 3, borderLeftColor: Colors.green }]}>
            <Text style={[styles.statValue, { color: Colors.green }]}>{unreadCount}</Text>
            <Text style={styles.statLabel}>Unread Feeds</Text>
            <View style={[styles.statGraph, { backgroundColor: Colors.green + '15' }]} />
          </View>
        </View>

        {/* Section Wrapper */}
        <View style={[styles.mainLayout, isWide && styles.mainLayoutRow]}>
          
          {/* Main Feed Lane */}
          <View style={[styles.feedLane, isWide && { flex: 7 }]}>
            {/* Horizontal Filter Row */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScrollView}
              contentContainerStyle={styles.filterContainer}
            >
              {[
                { id: 'all', label: 'All Feeds' },
                { id: 'critical', label: '🚨 Critical' },
                { id: 'ai', label: '🧠 AI Intel' },
                { id: 'patrol', label: '🚔 Patrols' },
                { id: 'cases', label: '📁 Case Linked' },
                { id: 'unread', label: '✉️ Unread' },
                { id: 'pinned', label: '📌 Pinned' },
              ].map((tab) => {
                const active = filter === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setFilter(tab.id as any)}
                    style={[styles.filterTab, active && styles.filterTabActive]}
                  >
                    <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* List */}
            {filteredAlerts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📡</Text>
                <Text style={styles.emptyText}>No alerts found matching filters</Text>
              </View>
            ) : (
              filteredAlerts.map((alert) => (
                <Pressable
                  key={alert.id}
                  style={({ pressed }) => [
                    styles.alertCard,
                    pressed && styles.alertCardPressed,
                    !alert.isRead && styles.alertCardUnread,
                    alert.resolved && styles.alertCardResolved,
                  ]}
                  onPress={() => {
                    setSelectedAlert(alert);
                    setDetailsModalVisible(true);
                    // Mark as read automatically when opened
                    setAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, isRead: true } : a)));
                  }}
                >
                  {/* Left priority strip */}
                  <View style={[styles.priorityStrip, { backgroundColor: getPriorityColor(alert.priority) }]} />

                  <View style={styles.cardHeader}>
                    <View style={styles.headerLeft}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryIcon}>{getCategoryIcon(alert.category)}</Text>
                        <Text style={styles.categoryText}>{alert.category.toUpperCase()}</Text>
                      </View>
                      {alert.aiConfidence && (
                        <View style={styles.aiBadge}>
                          <Text style={styles.aiBadgeText}>AI {alert.aiConfidence}%</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.headerRight}>
                      <TouchableOpacity onPress={() => handleTogglePin(alert.id)} style={styles.iconBtn}>
                        <Text style={[styles.pinIcon, alert.isPinned && styles.pinIconActive]}>📌</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.cardTitle}>{alert.title}</Text>
                  <Text style={styles.cardDesc} numberOfLines={3}>{alert.description}</Text>

                  <View style={styles.cardFooter}>
                    <Text style={styles.cardTime}>🕒 {alert.time}</Text>
                    {alert.location && <Text style={styles.cardLoc} numberOfLines={1}>📍 {alert.location}</Text>}
                  </View>

                  {/* Actions Row */}
                  <View style={styles.cardActionRow}>
                    <TouchableOpacity
                      style={styles.quickActionBtn}
                      onPress={() => {
                        setSelectedAlert(alert);
                        setDetailsModalVisible(true);
                      }}
                    >
                      <Text style={styles.quickActionText}>Inspect</Text>
                    </TouchableOpacity>

                    {alert.linkedCaseId && (
                      <TouchableOpacity
                        style={styles.quickActionBtn}
                        onPress={() => navigation.navigate('CaseFiles', { screen: 'CaseDetail', params: { caseId: alert.linkedCaseId } } as any)}
                      >
                        <Text style={styles.quickActionText}>Open Case</Text>
                      </TouchableOpacity>
                    )}

                    {alert.linkedSuspectId && (
                      <TouchableOpacity
                        style={styles.quickActionBtn}
                        onPress={() => navigation.navigate('PersonCrimeTracker', { query: alert.linkedSuspectId } as any)}
                      >
                        <Text style={styles.quickActionText}>Track Suspect</Text>
                      </TouchableOpacity>
                    )}

                    {alert.category === 'Patrol' && (
                      <TouchableOpacity
                        style={[styles.quickActionBtn, styles.actionAccentBtn]}
                        onPress={() => handleAssignPatrol(alert)}
                      >
                        <Text style={styles.actionAccentText}>Reroute</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.quickActionBtn} onPress={() => handleShare(alert)}>
                      <Text style={styles.quickActionText}>Share</Text>
                    </TouchableOpacity>
                  </View>
                </Pressable>
              ))
            )}
          </View>

          {/* Right Panel Widget Lane (Visible on Wide screens) */}
          {isWide && (
            <View style={[styles.widgetLane, { flex: 4 }]}>
              {/* AI Prediction Widget */}
              <View style={styles.widgetCard}>
                <Text style={styles.widgetHeading}>🤖 Predictive Threat Analysis</Text>
                <View style={styles.divider} />
                <Text style={styles.widgetBody}>
                  The KSP Neural Engine has flagged Whitefield Sector 6 with a **74% crime probability spike** between 18:00 and 21:00. 
                </Text>
                <View style={styles.alertRecommendationPill}>
                  <Text style={styles.recommendationText}>⚠️ RECOMMENDED ACTION: Increase visible PCR presence near Hoodi road.</Text>
                </View>
                <TouchableOpacity
                  style={styles.widgetActionBtn}
                  onPress={() => navigation.navigate('CrimeMap')}
                >
                  <Text style={styles.widgetActionText}>Open Tactical Map</Text>
                </TouchableOpacity>
              </View>

              {/* Secure Comms status widget */}
              <View style={styles.widgetCard}>
                <Text style={styles.widgetHeading}>📡 Tactical Communications</Text>
                <View style={styles.divider} />
                <View style={styles.commsGrid}>
                  <View style={styles.commsRow}>
                    <Text style={styles.commsDot}>🟢</Text>
                    <Text style={styles.commsLabel}>Command Frequency:</Text>
                    <Text style={styles.commsValue}>412.85 MHz</Text>
                  </View>
                  <View style={styles.commsRow}>
                    <Text style={styles.commsDot}>🟢</Text>
                    <Text style={styles.commsLabel}>GPS Telemetry Status:</Text>
                    <Text style={styles.commsValue}>Synced</Text>
                  </View>
                  <View style={styles.commsRow}>
                    <Text style={styles.commsDot}>🟡</Text>
                    <Text style={styles.commsLabel}>Radar Grid:</Text>
                    <Text style={styles.commsValue}>Whitefield PS Area</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

        </View>
      </ScrollView>

      {/* ── Details Dossier Modal ────────────────────────────────────────────── */}
      {selectedAlert && (
        <Modal
          visible={detailsModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDetailsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>🔍 INTEL DOSSIER — KSP COMMAND</Text>
                <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                  <Text style={styles.modalCloseIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
                <View style={styles.modalCategoryRow}>
                  <View style={[styles.priorityPill, { backgroundColor: getPriorityBg(selectedAlert.priority) }]}>
                    <Text style={[styles.priorityPillText, { color: getPriorityColor(selectedAlert.priority) }]}>
                      {selectedAlert.priority.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.modalCategoryBadge}>
                    <Text style={styles.modalCategoryBadgeText}>
                      {getCategoryIcon(selectedAlert.category)} {selectedAlert.category}
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalAlertTitle}>{selectedAlert.title}</Text>
                
                <View style={styles.metadataCard}>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>ID Code:</Text>
                    <Text style={styles.metaValue}>{selectedAlert.id}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Timestamp:</Text>
                    <Text style={styles.metaValue}>{selectedAlert.timestamp}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Telemetry Area:</Text>
                    <Text style={styles.metaValue}>{selectedAlert.location || 'Not Specified'}</Text>
                  </View>
                  {selectedAlert.aiConfidence && (
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>AI Threat Confidence:</Text>
                      <Text style={[styles.metaValue, { color: Colors.red, fontWeight: 'bold' }]}>
                        {selectedAlert.aiConfidence}% match likelihood
                      </Text>
                    </View>
                  )}
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Reporting Unit:</Text>
                    <Text style={styles.metaValue}>{selectedAlert.officer || 'Command Engine'}</Text>
                  </View>
                </View>

                <Text style={styles.sectionHeading}>DETAILED INTELLIGENCE REPORT</Text>
                <Text style={styles.modalAlertDesc}>{selectedAlert.description}</Text>

                {selectedAlert.linkedCaseId && (
                  <View style={styles.linkedCasePanel}>
                    <Text style={styles.linkedCaseTitle}>📂 Linked Case File: {selectedAlert.linkedCaseId}</Text>
                    <Text style={styles.linkedCaseDesc}>
                      Tapping "Open Case File" below will redirect you to the main registry dossier where you can view evidence, incident timeline logs, and victim records.
                    </Text>
                  </View>
                )}

                {selectedAlert.linkedSuspectId && (
                  <View style={styles.linkedCasePanel}>
                    <Text style={styles.linkedCaseTitle}>👤 Linked Offender Profile: {selectedAlert.linkedSuspectId}</Text>
                    <Text style={styles.linkedCaseDesc}>
                      Our database has linked this profile to known repeat offenders with active tags inside Whitefield PS subdivision.
                    </Text>
                  </View>
                )}

                <View style={styles.modalActionsGrid}>
                  <TouchableOpacity
                    style={[styles.modalActionBtn, styles.modalActionResolve]}
                    onPress={() => handleMarkResolved(selectedAlert.id)}
                  >
                    <Text style={styles.modalActionTextWhite}>✓ Mark Acknowledged</Text>
                  </TouchableOpacity>

                  {selectedAlert.linkedCaseId && (
                    <TouchableOpacity
                      style={styles.modalActionBtn}
                      onPress={() => {
                        setDetailsModalVisible(false);
                        navigation.navigate('CaseFiles', { screen: 'CaseDetail', params: { caseId: selectedAlert.linkedCaseId } } as any);
                      }}
                    >
                      <Text style={styles.modalActionText}>📂 Open Case File</Text>
                    </TouchableOpacity>
                  )}

                  {selectedAlert.linkedSuspectId && (
                    <TouchableOpacity
                      style={styles.modalActionBtn}
                      onPress={() => {
                        setDetailsModalVisible(false);
                        navigation.navigate('PersonCrimeTracker', { query: selectedAlert.linkedSuspectId } as any);
                      }}
                    >
                      <Text style={styles.modalActionText}>👤 Open Person Profile</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.modalActionBtn}
                    onPress={() => {
                      setDetailsModalVisible(false);
                      navigation.navigate('CrimeMap');
                    }}
                  >
                    <Text style={styles.modalActionText}>🗺 Open Crime Map</Text>
                  </TouchableOpacity>

                  {selectedAlert.category === 'Patrol' && (
                    <TouchableOpacity
                      style={[styles.modalActionBtn, styles.modalActionDispatch]}
                      onPress={() => handleAssignPatrol(selectedAlert)}
                    >
                      <Text style={styles.modalActionTextWhite}>🚔 Assign Patrol</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.modalActionBtn}
                    onPress={() => handleShare(selectedAlert)}
                  >
                    <Text style={styles.modalActionText}>📤 Share Dossier</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  commandBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.inkNavy,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  liveGridStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.red,
  },
  bannerTextLive: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: '#00FF66',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bannerClock: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.smPlus,
    color: Colors.sidebarMuted,
  },
  bannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bannerPill: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bannerPillText: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  acknowledgeAllBtn: {
    backgroundColor: Colors.red,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  ackAllBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 8,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  statValue: {
    fontFamily: FontFamily.displayBold,
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.gray,
    marginTop: 2,
  },
  statGraph: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.inkNavy + '10',
  },
  mainLayout: {
    gap: 16,
  },
  mainLayoutRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  feedLane: {
    gap: 12,
  },
  filterScrollView: {
    marginBottom: 4,
  },
  filterContainer: {
    gap: 8,
    paddingRight: 16,
  },
  filterTab: {
    backgroundColor: Colors.paperDim,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  filterTabActive: {
    backgroundColor: Colors.inkNavy,
    borderColor: Colors.inkNavy,
  },
  filterTabText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  filterTabTextActive: {
    color: Colors.white,
  },
  emptyContainer: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.gray,
  },
  alertCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 8,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  alertCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.red,
  },
  alertCardResolved: {
    opacity: 0.6,
  },
  alertCardPressed: {
    opacity: 0.9,
  },
  priorityStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.paperDim,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryIcon: {
    fontSize: 10,
  },
  categoryText: {
    fontFamily: FontFamily.mono,
    fontSize: 9,
    color: Colors.inkNavy,
  },
  aiBadge: {
    backgroundColor: Colors.red + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: Colors.red,
  },
  aiBadgeText: {
    fontFamily: FontFamily.mono,
    fontSize: 9,
    color: Colors.red,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 4,
  },
  pinIcon: {
    fontSize: 12,
    opacity: 0.3,
  },
  pinIconActive: {
    opacity: 1,
  },
  cardTitle: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.lgPlus,
    fontWeight: '600',
    color: Colors.inkNavy,
    marginBottom: 4,
  },
  cardDesc: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.gray,
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.line + '50',
    paddingTop: 8,
    marginBottom: 10,
  },
  cardTime: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  cardLoc: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.gray,
    maxWidth: '65%',
  },
  cardActionRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  quickActionBtn: {
    backgroundColor: Colors.paperDim,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: Colors.line,
  },
  quickActionText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.inkNavy,
  },
  actionAccentBtn: {
    backgroundColor: Colors.red,
    borderColor: Colors.red,
  },
  actionAccentText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  widgetLane: {
    gap: 16,
  },
  widgetCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 8,
    padding: 16,
    gap: 10,
  },
  widgetHeading: {
    fontFamily: FontFamily.display,
    fontSize: FontSize.lgPlus,
    fontWeight: '600',
    color: Colors.inkNavy,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.line,
  },
  widgetBody: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.gray,
    lineHeight: 18,
  },
  alertRecommendationPill: {
    backgroundColor: Colors.amber + '15',
    padding: 10,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: Colors.amber,
  },
  recommendationText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.amber,
    lineHeight: 14,
  },
  widgetActionBtn: {
    backgroundColor: Colors.inkNavy,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  widgetActionText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  commsGrid: {
    gap: 8,
  },
  commsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commsDot: {
    fontSize: 10,
  },
  commsLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.gray,
    flex: 1,
  },
  commsValue: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.xs,
    color: Colors.inkNavy,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 33, 61, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.inkNavy,
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    backgroundColor: Colors.inkNavy,
  },
  modalHeaderTitle: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.smPlus,
    color: '#00FF66',
    fontWeight: '700',
  },
  modalCloseIcon: {
    fontSize: 16,
    color: Colors.white,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 16,
    gap: 14,
  },
  modalCategoryRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  priorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  priorityPillText: {
    fontFamily: FontFamily.mono,
    fontSize: 9,
    fontWeight: '700',
  },
  modalCategoryBadge: {
    backgroundColor: Colors.paperDim,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  modalCategoryBadgeText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 10,
    color: Colors.inkNavy,
  },
  modalAlertTitle: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2xl'],
    fontWeight: '600',
    color: Colors.inkNavy,
  },
  metadataCard: {
    backgroundColor: Colors.paperDim + '40',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  metaValue: {
    fontFamily: FontFamily.monoMedium,
    fontSize: FontSize.xs,
    color: Colors.inkNavy,
  },
  sectionHeading: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.red,
    fontWeight: '700',
    marginTop: 8,
  },
  modalAlertDesc: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.mdPlus,
    color: Colors.inkNavy,
    lineHeight: 20,
  },
  linkedCasePanel: {
    backgroundColor: Colors.paperDim + '60',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 6,
    padding: 12,
    gap: 6,
  },
  linkedCaseTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
  },
  linkedCaseDesc: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.xs,
    color: Colors.gray,
    lineHeight: 15,
  },
  modalActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    paddingBottom: 20,
  },
  modalActionBtn: {
    backgroundColor: Colors.paperDim,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    minWidth: '45%',
  },
  modalActionResolve: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  modalActionDispatch: {
    backgroundColor: Colors.red,
    borderColor: Colors.red,
  },
  modalActionText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.inkNavy,
  },
  modalActionTextWhite: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
});
