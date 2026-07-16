// CrimeSphere AI — SettingsScreen
// Tactical Police Command Settings Portal
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
  Platform,
  Alert as RNAlert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { DrawerParamList } from '../../types/navigation';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { AppHeader } from '../../components/layout/AppHeader';
import { useAuthStore } from '../../store/authStore';

// ─── Shared sub-components ────────────────────────────────────────────────────

interface SectionCardProps {
  icon: string;
  title: string;
  children: React.ReactNode;
}
const SectionCard: React.FC<SectionCardProps> = ({ icon, title, children }) => (
  <View style={card.wrapper}>
    <View style={card.header}>
      <Text style={card.icon}>{icon}</Text>
      <Text style={card.title}>{title}</Text>
    </View>
    <View style={card.divider} />
    {children}
  </View>
);
const card = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  icon: { fontSize: 15 },
  title: {
    fontFamily: FontFamily.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    color: Colors.inkNavy,
    fontWeight: '700',
  },
  divider: { height: 1, backgroundColor: Colors.line },
});

interface RowPressProps {
  icon: string;
  label: string;
  sub?: string;
  onPress: () => void;
  danger?: boolean;
  last?: boolean;
}
const RowPress: React.FC<RowPressProps> = ({ icon, label, sub, onPress, danger, last }) => (
  <TouchableOpacity
    style={[row.base, !last && row.border]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={row.left}>
      <Text style={[row.icon, danger && { color: Colors.red }]}>{icon}</Text>
      <View style={row.textBlock}>
        <Text style={[row.label, danger && { color: Colors.red }]}>{label}</Text>
        {sub ? <Text style={row.sub}>{sub}</Text> : null}
      </View>
    </View>
    <Text style={[row.chevron, danger && { color: Colors.red }]}>›</Text>
  </TouchableOpacity>
);

interface RowToggleProps {
  icon: string;
  label: string;
  sub?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}
const RowToggle: React.FC<RowToggleProps> = ({ icon, label, sub, value, onChange, last }) => (
  <View style={[row.base, !last && row.border]}>
    <View style={row.left}>
      <Text style={row.icon}>{icon}</Text>
      <View style={row.textBlock}>
        <Text style={row.label}>{label}</Text>
        {sub ? <Text style={row.sub}>{sub}</Text> : null}
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: Colors.line, true: Colors.inkNavy + 'CC' }}
      thumbColor={value ? Colors.red : Colors.paperDim}
      ios_backgroundColor={Colors.line}
    />
  </View>
);

interface RowInfoProps {
  icon: string;
  label: string;
  sub: string;
  last?: boolean;
}
const RowInfo: React.FC<RowInfoProps> = ({ icon, label, sub, last }) => (
  <View style={[row.base, !last && row.border]}>
    <View style={row.left}>
      <Text style={row.icon}>{icon}</Text>
      <View style={row.textBlock}>
        <Text style={row.label}>{label}</Text>
        <Text style={row.sub}>{sub}</Text>
      </View>
    </View>
  </View>
);

const row = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    minHeight: 56,
  },
  border: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.line,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  icon: { fontSize: 18, width: 24, textAlign: 'center' },
  textBlock: { flex: 1 },
  label: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
    lineHeight: 18,
  },
  sub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.sm,
    color: Colors.gray,
    marginTop: 1,
    lineHeight: 15,
  },
  chevron: {
    fontFamily: FontFamily.body,
    fontSize: 22,
    color: Colors.gray,
    lineHeight: 24,
  },
});

// ─── Shared Modal shell ───────────────────────────────────────────────────────
interface ModalShellProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}
const ModalShell: React.FC<ModalShellProps> = ({ visible, title, onClose, children }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={mst.overlay}>
      <View style={mst.box}>
        <View style={mst.header}>
          <Text style={mst.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={mst.close}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          style={{ maxHeight: 420 }}
          contentContainerStyle={mst.body}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

interface ModalOptionProps {
  label: string;
  active: boolean;
  onPress: () => void;
}
const ModalOption: React.FC<ModalOptionProps> = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[mst.option, active && mst.optionActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[mst.optionLabel, active && mst.optionLabelActive]}>{label}</Text>
    {active && <Text style={mst.optionCheck}>✓</Text>}
  </TouchableOpacity>
);

const mst = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20,33,61,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  box: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.inkNavy,
    width: '100%',
    maxWidth: 380,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.inkNavy,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  title: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.smPlus,
    color: '#00FF66',
    fontWeight: '700',
    flex: 1,
  },
  close: {
    fontSize: 16,
    color: Colors.white,
    marginLeft: 12,
  },
  body: {
    padding: 16,
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.paperDim + '40',
  },
  optionActive: {
    borderColor: Colors.inkNavy,
    backgroundColor: Colors.inkNavy + '10',
  },
  optionLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
  },
  optionLabelActive: {
    fontFamily: FontFamily.bodySemiBold,
  },
  optionCheck: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.green,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const { logout } = useAuthStore();

  type ModalKey = 'password' | 'language' | 'mapview' | 'timeout' | 'support' | null;
  const [modal, setModal] = useState<ModalKey>(null);

  // Map toggles
  const [mapHotspots, setMapHotspots] = useState(true);
  const [mapPatrols,  setMapPatrols]  = useState(true);
  const [mapCctv,     setMapCctv]     = useState(true);
  const [mapView,     setMapView]     = useState('Satellite Grid');

  // Alert toggles
  const [alertCritical, setAlertCritical] = useState(true);
  const [alertPatrol,   setAlertPatrol]   = useState(true);
  const [alertCase,     setAlertCase]     = useState(false);
  const [alertAi,       setAlertAi]       = useState(true);
  const [alertSound,    setAlertSound]    = useState(true);

  // AI
  const [aiVoice,       setAiVoice]       = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(true);

  // Security
  const [biometric, setBiometric] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [timeout,   setTimeout]   = useState('15 Minutes');

  // Officer
  const [language, setLanguage] = useState('English (IN)');

  // Password fields (local, no real auth)
  const [pwOld,     setPwOld]     = useState('');
  const [pwNew,     setPwNew]     = useState('');
  const [pwConfirm, setPwConfirm] = useState('');

  // Support fields
  const [suppSubject, setSuppSubject] = useState('');
  const [suppBody,    setSuppBody]    = useState('');

  const handleLogout = () =>
    RNAlert.alert(
      'Terminate Command Session',
      'Securely log out and close the tactical link?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );

  const handleSavePassword = () => {
    if (!pwOld || !pwNew || !pwConfirm) {
      RNAlert.alert('Incomplete', 'All fields are required.'); return;
    }
    if (pwNew !== pwConfirm) {
      RNAlert.alert('Mismatch', 'New passwords do not match.'); return;
    }
    RNAlert.alert('Security Desk', 'Command password updated successfully.');
    setPwOld(''); setPwNew(''); setPwConfirm('');
    setModal(null);
  };

  const handleSupport = () => {
    if (!suppSubject.trim()) {
      RNAlert.alert('Required', 'Please enter a subject.'); return;
    }
    RNAlert.alert('Ticket Filed', 'IT Support will radio you on the tactical channel.');
    setSuppSubject(''); setSuppBody('');
    setModal(null);
  };

  const screenW = Dimensions.get('window').width;
  const isWide  = Platform.OS === 'web' && screenW >= 900;

  return (
    <View style={styles.screen}>
      <View style={{ paddingTop: insets.top }}>
        <AppHeader
          onMenuPress={() => navigation.openDrawer()}
          showSearch={false}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, isWide && styles.contentWide]}
        showsVerticalScrollIndicator={false}
      >
        {/* Page eyebrow */}
        <View style={styles.pageHead}>
          <Text style={styles.eyebrow}>COMMAND PORTAL · WHITEFIELD PS</Text>
          <Text style={styles.heading}>Settings</Text>
          <Text style={styles.subtext}>
            Manage your tactical preferences, security, and system configuration.
          </Text>
        </View>

        {/* Two-column grid on wide screens */}
        <View style={[styles.grid, isWide && styles.gridWide]}>

          {/* ── COLUMN 1 ───────────────────────────────────────── */}
          <View style={[styles.col, isWide && { flex: 1 }]}>

            {/* OFFICER */}
            <SectionCard icon="👮" title="OFFICER SETTINGS">
              <RowPress
                icon="👤"
                label="Official Profile Dossier"
                sub="View rank, badge ID, awards & service record"
                onPress={() => navigation.navigate('Profile')}
              />
              <RowPress
                icon="🔑"
                label="Change Security Password"
                sub="Update your tactical command password"
                onPress={() => setModal('password')}
              />
              <RowPress
                icon="🌐"
                label="App Language"
                sub={`Active: ${language}`}
                onPress={() => setModal('language')}
              />
              <RowPress
                icon="🚪"
                label="Logout & Close Session"
                sub="Terminate secure command link"
                onPress={handleLogout}
                danger
                last
              />
            </SectionCard>

            {/* MAP CONFIG */}
            <SectionCard icon="🗺️" title="MAP CONFIGURATION">
              <RowToggle
                icon="🔴"
                label="Crime Hotspot Heatmap"
                sub="Show density glow overlay regions"
                value={mapHotspots}
                onChange={setMapHotspots}
              />
              <RowToggle
                icon="🚔"
                label="Patrol Vehicles (PCR) GPS"
                sub="Live real-time patrol positions"
                value={mapPatrols}
                onChange={setMapPatrols}
              />
              <RowToggle
                icon="📹"
                label="CCTV Network Overlay"
                sub="Active CCTV stream nodes on map"
                value={mapCctv}
                onChange={setMapCctv}
              />
              <RowPress
                icon="📐"
                label="Default Map View"
                sub={`Layout: ${mapView}`}
                onPress={() => setModal('mapview')}
                last
              />
            </SectionCard>

            {/* AI ASSISTANT */}
            <SectionCard icon="🤖" title="AI COPILOT ASSISTANT">
              <RowToggle
                icon="🗣️"
                label="Voice Interaction Mode"
                sub="Dictate case notes & field logs by voice"
                value={aiVoice}
                onChange={setAiVoice}
              />
              <RowToggle
                icon="💡"
                label="AI Tactical Suggestions"
                sub="Predictive recommendations & pattern flags"
                value={aiSuggestions}
                onChange={setAiSuggestions}
                last
              />
            </SectionCard>

          </View>

          {/* ── COLUMN 2 ───────────────────────────────────────── */}
          <View style={[styles.col, isWide && { flex: 1 }]}>

            {/* ALERTS */}
            <SectionCard icon="🔔" title="TACTICAL ALERT FEEDS">
              <RowToggle
                icon="🚨"
                label="Critical Threat Alerts"
                sub="Weapon reports, perimeter breaches"
                value={alertCritical}
                onChange={setAlertCritical}
              />
              <RowToggle
                icon="🚏"
                label="Patrol Deviation Warnings"
                sub="PCR route deviation triggers"
                value={alertPatrol}
                onChange={setAlertPatrol}
              />
              <RowToggle
                icon="📁"
                label="Case File Activity Alerts"
                sub="Evidence tags, registry updates"
                value={alertCase}
                onChange={setAlertCase}
              />
              <RowToggle
                icon="🧠"
                label="AI Prediction Feed"
                sub="Pattern matching engine updates"
                value={alertAi}
                onChange={setAlertAi}
              />
              <RowToggle
                icon="🔊"
                label="Audible Emergency Alarm"
                sub="Play sound on urgent-priority alerts"
                value={alertSound}
                onChange={setAlertSound}
                last
              />
            </SectionCard>

            {/* SECURITY */}
            <SectionCard icon="🛡️" title="DEVICE SECURITY">
              <RowToggle
                icon="🧬"
                label="Biometric Authentication"
                sub="Fingerprint/face lock on app entry"
                value={biometric}
                onChange={setBiometric}
              />
              <RowToggle
                icon="🔐"
                label="Two-Factor Authentication (2FA)"
                sub="Require OTP on each login via secure net"
                value={twoFactor}
                onChange={setTwoFactor}
              />
              <RowPress
                icon="⏱️"
                label="Auto Session Timeout"
                sub={`Log out after: ${timeout}`}
                onPress={() => setModal('timeout')}
                last
              />
            </SectionCard>

            {/* ABOUT */}
            <SectionCard icon="ℹ️" title="SYSTEM INFORMATION">
              <RowInfo
                icon="💠"
                label="CrimeSphere Software"
                sub="v3.5.0-Tactical  ·  Build KSP-8812  ·  KSP Certified"
              />
              <RowPress
                icon="🤝"
                label="Help & Support Desk"
                sub="Submit a ticket or read field manuals"
                onPress={() => setModal('support')}
              />
              <RowInfo
                icon="📞"
                label="Contact IT Support"
                sub="Radio: 412.85 MHz  ·  Extension: Ext 8801"
                last
              />
            </SectionCard>

          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Password Modal ──────────────────────────────────────────── */}
      <ModalShell
        visible={modal === 'password'}
        title="🔑  CHANGE SECURITY PASSWORD"
        onClose={() => setModal(null)}
      >
        <Text style={styles.inputLabel}>Current Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Enter current password"
          placeholderTextColor={Colors.gray}
          value={pwOld}
          onChangeText={setPwOld}
          autoCapitalize="none"
        />
        <Text style={styles.inputLabel}>New Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Enter new password"
          placeholderTextColor={Colors.gray}
          value={pwNew}
          onChangeText={setPwNew}
          autoCapitalize="none"
        />
        <Text style={styles.inputLabel}>Confirm New Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Re-enter new password"
          placeholderTextColor={Colors.gray}
          value={pwConfirm}
          onChangeText={setPwConfirm}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.primaryBtn} onPress={handleSavePassword}>
          <Text style={styles.primaryBtnText}>Update Password</Text>
        </TouchableOpacity>
      </ModalShell>

      {/* ── Language Modal ──────────────────────────────────────────── */}
      <ModalShell
        visible={modal === 'language'}
        title="🌐  APP LANGUAGE"
        onClose={() => setModal(null)}
      >
        {['English (IN)', 'ಕನ್ನಡ (Kannada)', 'Hindi (हिन्दी)', 'Telugu (తెలుగు)'].map((l) => (
          <ModalOption
            key={l}
            label={l}
            active={language === l}
            onPress={() => { setLanguage(l); setModal(null); }}
          />
        ))}
      </ModalShell>

      {/* ── Default Map View Modal ──────────────────────────────────── */}
      <ModalShell
        visible={modal === 'mapview'}
        title="📐  DEFAULT MAP LAYOUT"
        onClose={() => setModal(null)}
      >
        {['Satellite Grid', 'Standard Terrain', 'Dark Ops Mode', 'Heatmap Focus'].map((v) => (
          <ModalOption
            key={v}
            label={v}
            active={mapView === v}
            onPress={() => { setMapView(v); setModal(null); }}
          />
        ))}
      </ModalShell>

      {/* ── Session Timeout Modal ───────────────────────────────────── */}
      <ModalShell
        visible={modal === 'timeout'}
        title="⏱️  AUTO SESSION TIMEOUT"
        onClose={() => setModal(null)}
      >
        {['5 Minutes', '10 Minutes', '15 Minutes', '30 Minutes', '1 Hour', 'Never (Not Recommended)'].map((t) => (
          <ModalOption
            key={t}
            label={t}
            active={timeout === t}
            onPress={() => { setTimeout(t); setModal(null); }}
          />
        ))}
      </ModalShell>

      {/* ── IT Support Ticket Modal ─────────────────────────────────── */}
      <ModalShell
        visible={modal === 'support'}
        title="🤝  TACTICAL SUPPORT DESK"
        onClose={() => setModal(null)}
      >
        <Text style={styles.inputLabel}>Issue Category / Subject</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. PCR-14 GPS telemetry lag"
          placeholderTextColor={Colors.gray}
          value={suppSubject}
          onChangeText={setSuppSubject}
        />
        <Text style={styles.inputLabel}>Detailed Description</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Describe the issue in detail..."
          placeholderTextColor={Colors.gray}
          value={suppBody}
          onChangeText={setSuppBody}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <TouchableOpacity style={styles.primaryBtn} onPress={handleSupport}>
          <Text style={styles.primaryBtnText}>Submit Support Ticket</Text>
        </TouchableOpacity>
      </ModalShell>

    </View>
  );
};

// ─── Screen Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  scroll: { flex: 1 },
  content: {
    padding: 18,
    gap: 18,
  },
  contentWide: {
    paddingHorizontal: 32,
  },

  pageHead: {
    gap: 4,
    marginBottom: 4,
  },
  eyebrow: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.xs,
    color: Colors.red,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heading: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['4xl'],
    fontWeight: '600',
    color: Colors.inkNavy,
    lineHeight: 34,
  },
  subtext: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.mdPlus,
    color: Colors.gray,
    lineHeight: 19,
  },

  grid: { gap: 16 },
  gridWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },
  col: { gap: 16 },

  // Input styles used inside modals
  inputLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
    marginBottom: 4,
    marginTop: 4,
  },
  input: {
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.inkNavy,
    marginBottom: 4,
  },
  inputMultiline: {
    height: 90,
    paddingTop: 10,
  },
  primaryBtn: {
    backgroundColor: Colors.inkNavy,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.white,
    letterSpacing: 0.3,
  },
});
