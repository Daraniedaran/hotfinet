import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Animated,
  Alert,
  InteractionManager,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getAuth } from '@react-native-firebase/auth';
import { logoutUser } from '../services/AuthService';
import {
  requestLocationPermission,
  getCurrentLocation,
} from '../services/LocationService';
import {
  updateUserLocation,
  toggleAvailability,
  listenUserProfile,
  saveFCMToken,
} from '../services/FirestoreService';
import {
  requestNotificationPermission,
  getFCMToken,
  listenForegroundMessages,
  listenInAppNotifications,
} from '../services/NotificationService';
import { COLORS } from '../theme/colors';

const HomeScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [uid, setUid] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const user = getAuth().currentUser;
    if (!user) return;
    setUid(user.uid);

    // Real-time profile listener
    const unsub = listenUserProfile(user.uid, (data) => {
      setProfile(data);
      setIsAvailable(data.isAvailable || false);
    });

    // Delay permission requests to guarantee React Native fully attaches to the Android Activity
    let locationTimeout = setTimeout(async () => {
      try {
        await requestLocationPermission();
        const coords = await getCurrentLocation();
        await updateUserLocation(user.uid, coords.latitude, coords.longitude);
      } catch (e) {
        console.warn('Location error:', e.message);
      }
    }, 3000);

    // ── Notifications setup ──────────────────────────────────────────────
    let unsubFCM;
    let unsubInApp;
    let notificationTimeout = setTimeout(async () => {
      try {
        const granted = await requestNotificationPermission();
        if (granted) {
          const token = await getFCMToken();
          if (token) await saveFCMToken(user.uid, token);
        }
      } catch (e) {
        console.warn('[HomeScreen] Notification setup error:', e.message);
      }
    }, 1500);

    // Listen to foreground FCM messages (remote push when app is open)
    unsubFCM = listenForegroundMessages();

    // Listen to Firestore-backed in-app notifications
    unsubInApp = listenInAppNotifications(user.uid);

    return () => {
      unsub();
      clearTimeout(locationTimeout);
      clearTimeout(notificationTimeout);
      if (unsubFCM) unsubFCM();
      if (unsubInApp) unsubInApp();
    };
  }, []);

  // Pulse for available indicator
  useEffect(() => {
    if (isAvailable) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.4, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isAvailable]);

  const handleToggle = async (value) => {
    setIsAvailable(value);
    if (uid) await toggleAvailability(uid, value);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive', onPress: async () => {
          try { await logoutUser(); } catch (e) { Alert.alert('Error', e.message); }
        },
      },
    ]);
  };

  const coins = profile?.coins ?? 0;
  const name = profile?.name ?? 'User';

  return (
    <LinearGradient colors={['#0c1222ff', '#082161ff']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {name.split(' ')[0]} 👋</Text>
            <Text style={styles.subGreeting}>Share or request internet nearby</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarBtnWrapper}>
            <LinearGradient colors={['#42A5F5', '#1976D2']} style={styles.avatarBtnGrad}>
              <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Coin Balance Card */}
        <LinearGradient colors={['#3A8DFF', '#8B5CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Coin Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.coinIcon}>🪙</Text>
            <Text style={styles.balanceAmount}>{coins}</Text>
            <Text style={styles.balanceUnit}>Coins</Text>
          </View>
          <Text style={styles.inrEquiv}>≈ ₹{(coins * 0.1).toFixed(0)} value</Text>
          <TouchableOpacity
            style={styles.buyBtnWrapper}
            onPress={() => navigation.navigate('BuyCoins')}
          >
            <LinearGradient colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buyBtnGrad}>
              <Text style={styles.buyBtnText}>+ Buy Coins</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        {/* Availability Toggle */}
        <View style={styles.availCard}>
          <View style={styles.availLeft}>
            <Animated.View style={[
              styles.availDot,
              { backgroundColor: isAvailable ? COLORS.success : COLORS.textMuted },
              isAvailable && { transform: [{ scale: pulseAnim }] },
            ]} />
            <View>
              <Text style={styles.availTitle}>Share Hotspot</Text>
              <Text style={styles.availSub}>
                {isAvailable ? '🟢 You are visible to nearby users' : '⚫ Currently offline'}
              </Text>
            </View>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={handleToggle}
            trackColor={{ false: '#333', true: COLORS.primary }}
            thumbColor={isAvailable ? '#fff' : '#888'}
          />
        </View>

        {/* Action Grid */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('RequestInternet')}
          >
            <LinearGradient colors={['#42A5F5', '#1976D2']} style={styles.actionGrad}>
              <Text style={styles.actionIcon}>🌐</Text>
              <Text style={styles.actionTitle}>Request{'\n'}Internet</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('ProviderRequests')}
          >
            <LinearGradient colors={['#AB47BC', '#7B1FA2']} style={styles.actionGrad}>
              <Text style={styles.actionIcon}>📥</Text>
              <Text style={styles.actionTitle}>Incoming{'\n'}Requests</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Wallet')}
          >
            <LinearGradient colors={['#FFCA28', '#F57C00']} style={styles.actionGrad}>
              <Text style={styles.actionIcon}>👛</Text>
              <Text style={styles.actionTitle}>My{'\n'}Wallet</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('TransactionHistory')}
          >
            <LinearGradient colors={['#26A69A', '#00796B']} style={styles.actionGrad}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionTitle}>History</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        {profile && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statVal}>{profile.totalSessionsAsProvider || 0}</Text>
              <Text style={styles.statLabel}>Sessions Shared</Text>
            </View>
            <View style={[styles.statCard, styles.statCardMid]}>
              <Text style={styles.statVal}>{profile.totalMBShared || 0} MB</Text>
              <Text style={styles.statLabel}>MB Shared</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statVal}>{profile.totalMBConsumed || 0} MB</Text>
              <Text style={styles.statLabel}>MB Used</Text>
            </View>
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtnWrapper}>
          <LinearGradient colors={['rgba(239,68,68,0.05)', 'rgba(220,38,38,0.2)']} style={styles.logoutBtnGrad}>
            <Text style={styles.logoutText}>🚪 Logout</Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 22, fontWeight: '800', color: '#fff' },
  subGreeting: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  avatarBtnWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#8E2DE2',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  avatarBtnGrad: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  balanceCard: {
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
  },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 8 },
  balanceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginBottom: 4 },
  coinIcon: { fontSize: 28, },
  balanceAmount: { fontSize: 48, fontWeight: '900', color: '#fff', lineHeight: 56 },
  balanceUnit: { fontSize: 18, color: 'rgba(255,255,255,0.7)', marginBottom: 8 },
  inrEquiv: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 14 },
  buyBtnWrapper: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    overflow: 'hidden',
  },
  buyBtnGrad: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtnText: { color: '#fff', fontWeight: '800', fontSize: 13, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  availCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  availLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  availDot: { width: 12, height: 12, borderRadius: 6 },
  availTitle: { color: '#fff', fontWeight: '800', fontSize: 15 },
  availSub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  actionCard: { width: '47%', borderRadius: 16, overflow: 'hidden' },
  actionGrad: { padding: 20, minHeight: 110, justifyContent: 'space-between' },
  actionIcon: { fontSize: 28, },
  actionTitle: { color: '#fff', fontWeight: '800', fontSize: 15 },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  statCardMid: { borderColor: 'rgba(255,255,255,0.08)' },
  statVal: { color: '#fff', fontSize: 16, fontWeight: '800' },
  statLabel: { color: COLORS.textSecondary, fontSize: 10, marginTop: 4, textAlign: 'center' },
  logoutBtnWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
  },
  logoutBtnGrad: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  logoutText: { color: '#ff6b6b', fontWeight: '800', fontSize: 15 },
});