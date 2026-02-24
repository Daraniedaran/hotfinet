import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    // Fade + slide in
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    // Pulse animation for WiFi icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.2, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    // Navigate to Login after splash animation
    const timer = setTimeout(() => {
      if (navigation) navigation.replace('Login');
    }, 2200);
    return () => clearTimeout(timer);
  }, []);


  return (
    <LinearGradient colors={['#0A0E21', '#141830', '#0A0E21']} style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fade, transform: [{ translateY: slideUp }] }]}>
        {/* WiFi pulse rings */}
        <View style={styles.iconWrapper}>
          <Animated.View style={[styles.ring, styles.ring3, { transform: [{ scale: pulse }] }]} />
          <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: pulse }] }]} />
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>📡</Text>
          </View>
        </View>

        <Text style={styles.title}>HotFiNet</Text>
        <Text style={styles.tagline}>Share Internet. Earn Coins.</Text>

        <View style={styles.coinRow}>
          <Text style={styles.coinDot}>🟡</Text>
          <Text style={styles.coinText}>Peer-to-Peer Hotspot Economy</Text>
          <Text style={styles.coinDot}>🟡</Text>
        </View>
      </Animated.View>

      <Text style={styles.loadingText}>Loading...</Text>
    </LinearGradient>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center' },
  iconWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  ring: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 2,
  },
  ring3: {
    width: 130,
    height: 130,
    borderColor: 'rgba(30,144,255,0.15)',
  },
  ring2: {
    width: 100,
    height: 100,
    borderColor: 'rgba(30,144,255,0.3)',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(30,144,255,0.2)',
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 36 },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.primaryLight,
    marginBottom: 20,
    letterSpacing: 1,
  },
  coinRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  coinText: { color: COLORS.textSecondary, fontSize: 13 },
  coinDot: { fontSize: 12 },
  loadingText: {
    position: 'absolute',
    bottom: 50,
    color: COLORS.textMuted,
    fontSize: 13,
  },
});
