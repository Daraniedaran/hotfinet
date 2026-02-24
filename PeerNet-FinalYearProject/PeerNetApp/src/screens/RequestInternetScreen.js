import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getAuth } from '@react-native-firebase/auth';
import {
  getAvailableProviders,
  createRequest,
  listenUserProfile,
} from '../services/FirestoreService';
import { calculateCoinsForMB } from '../services/walletService';
import { COLORS } from '../theme/colors';

const RequestInternetScreen = ({ navigation }) => {
  const [mb, setMb] = useState('200');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(null);
  const [userCoins, setUserCoins] = useState(0);
  const [uid, setUid] = useState(null);

  const coinsNeeded = calculateCoinsForMB(parseInt(mb) || 0);

  useEffect(() => {
    const user = getAuth().currentUser;
    if (!user) return;
    setUid(user.uid);

    const unsub = listenUserProfile(user.uid, (data) => setUserCoins(data?.coins || 0));

    getAvailableProviders(user.uid)
      .then(data => {
        setProviders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return unsub;
  }, []);

  const handleRequest = async (provider) => {
    const mbVal = parseInt(mb);
    if (!mbVal || mbVal < 50) {
      Alert.alert('Invalid', 'Enter at least 50 MB.');
      return;
    }
    if (userCoins < coinsNeeded) {
      Alert.alert(
        '❌ Insufficient Coins',
        `You need ${coinsNeeded} coins but have ${userCoins}.\n\nWould you like to buy coins?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Buy Coins', onPress: () => navigation.navigate('BuyCoins') },
        ]
      );
      return;
    }

    Alert.alert(
      '📡 Send Request',
      `Request ${mbVal} MB from ${provider.name || provider.email}?\n\n${coinsNeeded} coins will be held until session ends.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setRequesting(provider.id);
            try {
              await createRequest(uid, provider.id, mbVal, coinsNeeded);
              Alert.alert(
                '✅ Request Sent!',
                `Waiting for ${provider.name || 'provider'} to accept...`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (e) {
              Alert.alert('Error', e.message);
            } finally {
              setRequesting(null);
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={['#0A0E21', '#141830']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Internet</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* MB Input Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📶 How much data do you need?</Text>
          <Text style={styles.cardSub}>Enter data amount in MB</Text>

          <View style={styles.mbInputRow}>
            <TextInput
              style={styles.mbInput}
              value={mb}
              onChangeText={setMb}
              keyboardType="numeric"
              placeholder="200"
              placeholderTextColor={COLORS.textMuted}
            />
            <Text style={styles.mbUnit}>MB</Text>
          </View>

          {/* Quick presets */}
          <View style={styles.presets}>
            {['100', '200', '500', '1000'].map(val => (
              <TouchableOpacity
                key={val}
                style={[styles.presetChip, mb === val && styles.presetChipActive]}
                onPress={() => setMb(val)}
              >
                <Text style={[styles.presetText, mb === val && styles.presetTextActive]}>
                  {val} MB
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cost calculation */}
          <LinearGradient colors={['rgba(30,144,255,0.15)', 'rgba(139,92,246,0.15)']} style={styles.costCard}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Coins Required</Text>
              <Text style={styles.costCoins}>🪙 {coinsNeeded}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Your Balance</Text>
              <Text style={[styles.costCoins, { color: userCoins >= coinsNeeded ? COLORS.success : COLORS.error }]}>
                🪙 {userCoins}
              </Text>
            </View>
            {userCoins < coinsNeeded && (
              <Text style={styles.insufficientText}>
                ⚠️ Need {coinsNeeded - userCoins} more coins.{' '}
                <Text style={styles.buyLink} onPress={() => navigation.navigate('BuyCoins')}>Buy Coins →</Text>
              </Text>
            )}
          </LinearGradient>
        </View>

        {/* Providers List */}
        <Text style={styles.sectionTitle}>
          {loading ? 'Finding providers...' : `${providers.length} Available Provider${providers.length !== 1 ? 's' : ''} Nearby`}
        </Text>

        {loading && <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />}

        {!loading && providers.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📡</Text>
            <Text style={styles.emptyTitle}>No providers nearby</Text>
            <Text style={styles.emptyText}>Ask someone to turn on "Share Hotspot" in HotFiNet</Text>
          </View>
        )}

        {providers.map(provider => (
          <View key={provider.id} style={styles.provCard}>
            <View style={styles.provAvatar}>
              <Text style={styles.provAvatarText}>
                {(provider.name || provider.email || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.provInfo}>
              <Text style={styles.provName}>{provider.name || 'Provider'}</Text>
              <Text style={styles.provEmail} numberOfLines={1}>{provider.email}</Text>
              <View style={styles.provReward}>
                <Text style={styles.provRewardText}>Pays 🪙 {coinsNeeded} on completion</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleRequest(provider)}
              disabled={requesting === provider.id}
              style={styles.reqBtn}
            >
              <LinearGradient colors={['#1E90FF', '#0060CC']} style={styles.reqBtnGrad}>
                {requesting === provider.id
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.reqBtnText}>Request</Text>
                }
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

export default RequestInternetScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10 },
  backBtnText: { color: COLORS.primary, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  card: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 18, marginBottom: 20 },
  cardTitle: { color: '#fff', fontWeight: '800', fontSize: 16, marginBottom: 4 },
  cardSub: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 16 },
  mbInputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  mbInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(30,144,255,0.4)', paddingHorizontal: 16, paddingVertical: 14, color: '#fff', fontSize: 28, fontWeight: '800' },
  mbUnit: { color: COLORS.textSecondary, fontSize: 18, fontWeight: '700' },
  presets: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  presetChip: { borderRadius: 10, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  presetChipActive: { backgroundColor: 'rgba(30,144,255,0.2)', borderColor: COLORS.primary },
  presetText: { color: COLORS.textSecondary, fontSize: 13 },
  presetTextActive: { color: COLORS.primary, fontWeight: '700' },
  costCard: { borderRadius: 12, padding: 14, gap: 8 },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  costLabel: { color: COLORS.textSecondary, fontSize: 14 },
  costCoins: { color: COLORS.gold, fontWeight: '800', fontSize: 16 },
  insufficientText: { color: COLORS.warning, fontSize: 12, marginTop: 4 },
  buyLink: { color: COLORS.primary, fontWeight: '700' },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  emptyCard: { alignItems: 'center', padding: 30, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },
  emptyText: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center' },
  provCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 12 },
  provAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  provAvatarText: { color: '#fff', fontWeight: '800', fontSize: 20 },
  provInfo: { flex: 1 },
  provName: { color: '#fff', fontWeight: '700', fontSize: 15 },
  provEmail: { color: COLORS.textMuted, fontSize: 12 },
  provReward: { marginTop: 4 },
  provRewardText: { color: COLORS.gold, fontSize: 12, fontWeight: '600' },
  reqBtn: { borderRadius: 10, overflow: 'hidden' },
  reqBtnGrad: { paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center', minWidth: 80 },
  reqBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});