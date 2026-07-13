// CrimeSphere AI — ForgotPasswordScreen
import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types/navigation';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';

type Props = {
  navigation: StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [badgeNumber, setBadgeNumber] = useState('');
  const [step, setStep] = useState<'badge' | 'otp' | 'done'>('badge');
  const [otp, setOtp] = useState('');

  const handleRequestReset = () => {
    if (!badgeNumber.trim()) {
      Alert.alert('Required', 'Please enter your badge number.');
      return;
    }
    setStep('otp');
  };

  const handleVerifyOtp = () => {
    if (!otp.trim() || otp.length < 4) {
      Alert.alert('Invalid OTP', 'Please enter the 4-digit OTP sent to your registered number.');
      return;
    }
    setStep('done');
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.bg}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back to Sign In</Text>
        </Pressable>

        <View style={styles.form}>
          <Text style={styles.title}>Reset Duty PIN</Text>
          <Text style={styles.subtitle}>
            Contact your Station Officer if you need emergency access.
          </Text>

          {step === 'badge' && (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Badge Number</Text>
                <TextInput
                  style={styles.input}
                  value={badgeNumber}
                  onChangeText={setBadgeNumber}
                  placeholder="e.g. KSP-WF-4421"
                  placeholderTextColor={Colors.gray}
                  autoCapitalize="characters"
                />
              </View>
              <Text style={styles.hint}>
                An OTP will be sent to your registered mobile number on record.
              </Text>
              <Pressable onPress={handleRequestReset} style={styles.btn}>
                <Text style={styles.btnText}>Send OTP</Text>
              </Pressable>
            </>
          )}

          {step === 'otp' && (
            <>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  OTP sent to the registered number for badge {badgeNumber}. Valid for 10 minutes.
                </Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>One-Time Password</Text>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="0000"
                  placeholderTextColor={Colors.gray}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
              <Pressable onPress={handleVerifyOtp} style={styles.btn}>
                <Text style={styles.btnText}>Verify OTP</Text>
              </Pressable>
            </>
          )}

          {step === 'done' && (
            <View style={styles.successBox}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successTitle}>Identity Verified</Text>
              <Text style={styles.successText}>
                A temporary PIN has been sent to your registered number. Use it to log in and set a new PIN from Settings.
              </Text>
              <Pressable onPress={() => navigation.navigate('Login')} style={styles.btn}>
                <Text style={styles.btnText}>Back to Sign In</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bg: { flex: 1, backgroundColor: Colors.paper },
  container: { flexGrow: 1, paddingHorizontal: 28, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 24 },
  backText: { fontFamily: FontFamily.bodyMedium, fontSize: FontSize.md, color: Colors.inkNavy },
  form: {
    width: '100%', maxWidth: 420,
    backgroundColor: Colors.card, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.line, padding: 24,
  },
  title: { fontFamily: FontFamily.display, fontSize: 22, color: Colors.inkNavy, marginBottom: 6 },
  subtitle: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: Colors.gray, marginBottom: 22, lineHeight: 20 },
  field: { marginBottom: 14 },
  label: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.base, color: Colors.inkNavy, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: Colors.line, borderRadius: 7,
    paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 11 : 9,
    fontFamily: FontFamily.body, fontSize: FontSize.md,
    backgroundColor: Colors.white, color: Colors.inkNavy,
  },
  otpInput: { letterSpacing: 10, fontFamily: FontFamily.mono, fontSize: 22, textAlign: 'center' },
  hint: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: Colors.gray, marginBottom: 16, lineHeight: 18 },
  infoBox: { backgroundColor: Colors.amberDim, borderRadius: 6, padding: 10, marginBottom: 14, borderLeftWidth: 3, borderLeftColor: Colors.amber },
  infoText: { fontFamily: FontFamily.body, fontSize: FontSize.base, color: Colors.amber },
  btn: { backgroundColor: Colors.inkNavy, borderRadius: 8, paddingVertical: 13, alignItems: 'center', marginTop: 4 },
  btnText: { fontFamily: FontFamily.bodySemiBold, fontSize: FontSize.md, color: Colors.white },
  successBox: { alignItems: 'center', paddingVertical: 8 },
  successIcon: { fontSize: 36, color: Colors.green, marginBottom: 10 },
  successTitle: { fontFamily: FontFamily.display, fontSize: 20, color: Colors.inkNavy, marginBottom: 8 },
  successText: { fontFamily: FontFamily.body, fontSize: FontSize.md, color: Colors.gray, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
});
