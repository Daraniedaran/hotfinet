import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { registerUser } from '../services/AuthService';
import { COLORS } from '../theme/colors';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await registerUser(name.trim(), email.trim(), password);
      // AppNavigator auto-redirects via onAuthStateChanged
    } catch (err) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0c1222ff', '#082161ff']} style={styles.gradient}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={styles.logoArea}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>📡</Text>
            </View>
            <Text style={styles.title}>HotFiNet</Text>
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          {/* Welcome bonus banner */}
          <View style={styles.bonusBanner}>
            <Text style={styles.bonusIcon}>🎁</Text>
            <Text style={styles.bonusText}>
              <Text style={styles.bonusBold}>FREE 500 Coins</Text> on sign up = ₹50 value!
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Min. 6 characters"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Repeat password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
              <TouchableOpacity onPress={handleRegister} style={styles.buttonWrapper}>
                <LinearGradient colors={['#42A5F5', '#1976D2']} style={styles.button}>
                  <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.loginRow}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  logoArea: { alignItems: 'center', marginBottom: 20 },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(30,144,255,0.2)',
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: { fontSize: 32, },
  title: { fontSize: 34, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  bonusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.4)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  bonusIcon: { fontSize: 24, },
  bonusText: { color: COLORS.goldLight, fontSize: 14, flex: 1 },
  bonusBold: { fontWeight: '800', color: COLORS.gold },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 24,
    marginBottom: 24,
  },
  label: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 15,
  },
  buttonWrapper: {
    borderRadius: 14,
    marginTop: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#42A5F5',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  button: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  loginRow: { alignItems: 'center' },
  loginText: { color: COLORS.textSecondary, fontSize: 14, },
  loginLink: { color: COLORS.primary, fontWeight: '800' },
});