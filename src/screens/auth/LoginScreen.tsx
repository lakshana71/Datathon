// CrimeSphere AI — LoginScreen
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types/navigation';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { useAuthStore } from '../../store/authStore';

import type { Role } from '../../types';
import { MOCK_ROLE_ACCOUNTS } from '../../constants/mockData';

type Props = {
  navigation: StackNavigationProp<AuthStackParamList, 'Login'>;
};

const ROLES_LIST: { role: Role; label: string; badge: string }[] = [
  { role: 'commissioner', label: 'Commissioner', badge: 'KSP-COMM-001' },
  { role: 'inspector', label: 'Inspector', badge: 'KSP-WF-4421' },
  { role: 'sub_inspector', label: 'Sub Inspector', badge: 'KSP-SI-1024' },
  { role: 'head_constable', label: 'Head Constable', badge: 'KSP-HC-3012' },
  { role: 'constable', label: 'Constable', badge: 'KSP-CONST-5088' },
];

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<Role>('inspector');
  const [badgeNumber, setBadgeNumber] = useState('KSP-WF-4421');
  const [pin, setPin] = useState('1234');
  const [pinVisible, setPinVisible] = useState(false);

  const selectRolePill = (item: typeof ROLES_LIST[0]) => {
    setSelectedRole(item.role);
    setBadgeNumber(item.badge);
    setPin('1234');
    clearError();
  };

  const handleLogin = async () => {
    if (!badgeNumber.trim() || !pin.trim()) {
      Alert.alert('Missing fields', 'Please enter your badge number and PIN.');
      return;
    }
    clearError();
    await login(badgeNumber.trim(), pin.trim(), selectedRole);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.bg}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.mark}>
            <Text style={styles.markText}>CS</Text>
          </View>
          <Text style={styles.appName}>CrimeSphere</Text>
          <Text style={styles.appSub}>Crime Intelligence Platform</Text>
          <View style={styles.divider} />
          <Text style={styles.stationLabel}>Whitefield Sub-Division · Karnataka State Police</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Officer Sign In</Text>
          <Text style={styles.formSub}>Select your role or enter badge credentials to sign in.</Text>

          {/* Role Pills Selector */}
          <View style={styles.roleSelectorContainer}>
            <Text style={styles.fieldLabel}>Select Duty Role (RBAC Demo):</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rolePillsRow}>
              {ROLES_LIST.map((item) => {
                const isActive = selectedRole === item.role;
                return (
                  <Pressable
                    key={item.role}
                    onPress={() => selectRolePill(item)}
                    style={[styles.rolePill, isActive && styles.rolePillActive]}
                  >
                    <Text style={[styles.rolePillText, isActive && styles.rolePillTextActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Badge Number</Text>
            <TextInput
              style={styles.input}
              value={badgeNumber}
              onChangeText={setBadgeNumber}
              placeholder="e.g. KSP-WF-4421"
              placeholderTextColor={Colors.gray}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="next"
              accessibilityLabel="Badge number"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Duty PIN</Text>
            <View style={styles.pinRow}>
              <TextInput
                style={[styles.input, styles.pinInput]}
                value={pin}
                onChangeText={setPin}
                placeholder="4–6 digit PIN"
                placeholderTextColor={Colors.gray}
                secureTextEntry={!pinVisible}
                keyboardType="numeric"
                maxLength={6}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                accessibilityLabel="Duty PIN"
              />
              <Pressable
                onPress={() => setPinVisible(!pinVisible)}
                style={styles.eyeBtn}
                accessibilityLabel={pinVisible ? 'Hide PIN' : 'Show PIN'}
              >
                <Text style={styles.eyeText}>{pinVisible ? '🙈' : '👁'}</Text>
              </Pressable>
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            style={({ pressed }) => [styles.loginBtn, pressed && styles.loginBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.loginBtnText}>Sign In to Duty</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotBtn}
            accessibilityRole="button"
          >
            <Text style={styles.forgotText}>Forgot PIN? Contact your Station Officer</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Secure access — Authorised personnel only.{'\n'}All activity is logged.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bg: { flex: 1, backgroundColor: Colors.paper },
  container: {
    flexGrow: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  brand: {
    alignItems: 'center',
    marginBottom: 40,
  },
  mark: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: Colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  markText: {
    fontFamily: FontFamily.displayBold,
    fontSize: 22,
    color: Colors.white,
  },
  appName: {
    fontFamily: FontFamily.display,
    fontSize: 28,
    fontWeight: '600',
    color: Colors.inkNavy,
    letterSpacing: 0.2,
  },
  appSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.gray,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: Colors.line,
    marginVertical: 14,
  },
  stationLabel: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.smPlus,
    color: Colors.gray,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  form: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: 24,
    marginBottom: 24,
  },
  formTitle: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['3xl'],
    color: Colors.inkNavy,
    marginBottom: 6,
  },
  formSub: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    color: Colors.gray,
    marginBottom: 22,
    lineHeight: 20,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.inkNavy,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 11 : 9,
    fontFamily: FontFamily.body,
    fontSize: FontSize.md,
    backgroundColor: Colors.white,
    color: Colors.inkNavy,
  },
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pinInput: {
    flex: 1,
    letterSpacing: 6,
    fontFamily: FontFamily.mono,
  },
  eyeBtn: {
    padding: 8,
  },
  eyeText: {
    fontSize: 18,
  },
  errorBox: {
    backgroundColor: Colors.redDim,
    borderRadius: 6,
    padding: 10,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: Colors.red,
  },
  errorText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.red,
  },
  loginBtn: {
    backgroundColor: Colors.inkNavy,
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  loginBtnPressed: {
    opacity: 0.85,
  },
  loginBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  forgotBtn: {
    alignItems: 'center',
    marginTop: 14,
  },
  forgotText: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.base,
    color: Colors.gray,
    textDecorationLine: 'underline',
  },
  roleSelectorContainer: {
    marginBottom: 16,
  },
  rolePillsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
  },
  rolePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.paperDim,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  rolePillActive: {
    backgroundColor: Colors.inkNavy,
    borderColor: Colors.inkNavy,
  },
  rolePillText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.smPlus,
    color: Colors.gray,
  },
  rolePillTextActive: {
    color: Colors.white,
  },
  footer: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.sm,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.8,
  },
});
