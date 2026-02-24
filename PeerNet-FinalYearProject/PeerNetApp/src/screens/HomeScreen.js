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
} from '../services/FirestoreService';
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

    // Location update
    (async () => {
      try {
        await requestLocationPermission();
        const coords = await getCurrentLocation();
        await updateUserLocation(user.uid, coords.latitude, coords.longitude);
      } catch (e) {
        console.warn('Location error:', e.message);
      }
    })();

    return unsub;
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
    <LinearGradient colors={['#0A0E21', '#141830']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {name.split(' ')[0]} 👋</Text>
            <Text style={styles.subGreeting}>Share or request internet nearby</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarBtn}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* Coin Balance Card */}
        <LinearGradient colors={['#1E90FF', '#6D28D9']} style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Coin Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.coinIcon}>🪙</Text>
            <Text style={styles.balanceAmount}>{coins}</Text>
            <Text style={styles.balanceUnit}>Coins</Text>
          </View>
          <Text style={styles.inrEquiv}>≈ ₹{(coins * 0.1).toFixed(0)} value</Text>
          <TouchableOpacity
            style={styles.buyBtn}
            onPress={() => navigation.navigate('BuyCoins')}
          >
            <Text style={styles.buyBtnText}>+ Buy Coins</Text>
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
            <LinearGradient colors={['#1E90FF', '#0060CC']} style={styles.actionGrad}>
              <Text style={styles.actionIcon}>🌐</Text>
              <Text style={styles.actionTitle}>Request{'\n'}Internet</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('ProviderRequests')}
          >
            <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={styles.actionGrad}>
              <Text style={styles.actionIcon}>📥</Text>
              <Text style={styles.actionTitle}>Incoming{'\n'}Requests</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Wallet')}
          >
            <LinearGradient colors={['#FFD700', '#FF8C00']} style={styles.actionGrad}>
              <Text style={styles.actionIcon}>👛</Text>
              <Text style={styles.actionTitle}>My{'\n'}Wallet</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('TransactionHistory')}
          >
            <LinearGradient colors={['#14B8A6', '#0D9488']} style={styles.actionGrad}>
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
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
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
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
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
  coinIcon: { fontSize: 28 },
  balanceAmount: { fontSize: 48, fontWeight: '900', color: '#fff', lineHeight: 56 },
  balanceUnit: { fontSize: 18, color: 'rgba(255,255,255,0.7)', marginBottom: 8 },
  inrEquiv: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 14 },
  buyBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  buyBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
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
  availTitle: { color: '#fff', fontWeight: '700', fontSize: 15 },
  availSub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  actionCard: { width: '47%', borderRadius: 16, overflow: 'hidden' },
  actionGrad: { padding: 20, minHeight: 110, justifyContent: 'space-between' },
  actionIcon: { fontSize: 28 },
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
  statCardMid: { borderColor: 'rgba(30,144,255,0.3)' },
  statVal: { color: '#fff', fontSize: 16, fontWeight: '800' },
  statLabel: { color: COLORS.textSecondary, fontSize: 10, marginTop: 4, textAlign: 'center' },
  logoutBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
  },
  logoutText: { color: COLORS.error, fontWeight: '700', fontSize: 15 },
});