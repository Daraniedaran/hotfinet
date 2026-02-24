import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getAuth } from '@react-native-firebase/auth';
import { listenUserProfile } from '../services/FirestoreService';
import { getTransactionHistory, coinsToINR } from '../services/walletService';
import { COLORS } from '../theme/colors';

const COIN_PACKAGES = [
  { id: 1, coins: 100, inr: 10, label: 'Starter', color: ['#1E90FF', '#0060CC'] },
  { id: 2, coins: 500, inr: 50, label: 'Popular 🔥', color: ['#8B5CF6', '#6D28D9'] },
  { id: 3, coins: 1000, inr: 100, label: 'Value', color: ['#FFD700', '#FF8C00'] },
  { id: 4, coins: 2000, inr: 200, label: 'Pro', color: ['#14B8A6', '#059669'] },
];

const txIcon = (type) => {
  switch (type) {
    case 'received': return '🟢';
    case 'spent': return '🔴';
    case 'purchase': return '🔵';
    case 'bonus': return '🎁';
    case 'refund': return '↩️';
    default: return '⚪';
  }
};

const WalletScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [txList, setTxList] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const user = getAuth().currentUser;
    if (!user) return;
    setUid(user.uid);

    const unsub = listenUserProfile(user.uid, setProfile);

    getTransactionHistory(user.uid).then(data => {
      setTxList(data.slice(0, 5));
      setLoadingTx(false);
    });

    return unsub;
  }, []);

  const coins = profile?.coins ?? 0;

  const renderTx = ({ item }) => {
    const isPositive = ['received', 'purchase', 'bonus', 'refund'].includes(item.type);
    return (
      <View style={styles.txRow}>
        <Text style={styles.txIcon}>{txIcon(item.type)}</Text>
        <View style={styles.txInfo}>
          <Text style={styles.txDesc} numberOfLines={1}>{item.description}</Text>
          <Text style={styles.txDate}>
            {item.createdAt?.toDate
              ? item.createdAt.toDate().toLocaleDateString('en-IN')
              : 'Just now'}
          </Text>
        </View>
        <Text style={[styles.txAmount, { color: isPositive ? COLORS.success : COLORS.error }]}>
          {isPositive ? '+' : '-'}{item.coins} 🪙
        </Text>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#0A0E21', '#141830']} style={styles.container}>
      <FlatList
        data={txList}
        keyExtractor={item => item.id}
        renderItem={renderTx}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>My Wallet</Text>
              <View style={{ width: 60 }} />
            </View>

            {/* Balance Card */}
            <LinearGradient colors={['#1E90FF', '#6D28D9']} style={styles.balCard}>
              <Text style={styles.balLabel}>Total Coin Balance</Text>
              <View style={styles.balRow}>
                <Text style={styles.balCoin}>🪙</Text>
                <Text style={styles.balAmount}>{coins}</Text>
              </View>
              <Text style={styles.balInr}>≈ ₹{coinsToINR(coins)} Indian Rupees</Text>
              <View style={styles.rateRow}>
                <View style={styles.rateChip}><Text style={styles.rateText}>200 MB = 100 🪙</Text></View>
                <View style={styles.rateChip}><Text style={styles.rateText}>1 🪙 = ₹0.10</Text></View>
              </View>
            </LinearGradient>

            {/* Buy Coins Packages */}
            <Text style={styles.sectionTitle}>Buy Coins</Text>
            <View style={styles.pkgGrid}>
              {COIN_PACKAGES.map(pkg => (
                <TouchableOpacity
                  key={pkg.id}
                  style={styles.pkgCard}
                  onPress={() => navigation.navigate('BuyCoins', { package: pkg })}
                >
                  <LinearGradient colors={pkg.color} style={styles.pkgGrad}>
                    <Text style={styles.pkgLabel}>{pkg.label}</Text>
                    <Text style={styles.pkgCoins}>🪙 {pkg.coins}</Text>
                    <Text style={styles.pkgInr}>₹{pkg.inr}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            {/* Transaction Header */}
            <View style={styles.txHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
                <Text style={styles.viewAll}>View All →</Text>
              </TouchableOpacity>
            </View>

            {loadingTx && <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />}
            {!loadingTx && txList.length === 0 && (
              <Text style={styles.emptyText}>No transactions yet</Text>
            )}
          </>
        }
        contentContainerStyle={styles.scroll}
      />
    </LinearGradient>
  );
};

export default WalletScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10 },
  backBtnText: { color: COLORS.primary, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  balCard: { borderRadius: 20, padding: 22, marginBottom: 24 },
  balLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 6 },
  balRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  balCoin: { fontSize: 32 },
  balAmount: { fontSize: 52, fontWeight: '900', color: '#fff' },
  balInr: { color: 'rgba(255,255,255,0.65)', fontSize: 14, marginBottom: 14 },
  rateRow: { flexDirection: 'row', gap: 10 },
  rateChip: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10 },
  rateText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  pkgGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  pkgCard: { width: '47%', borderRadius: 14, overflow: 'hidden' },
  pkgGrad: { padding: 16, minHeight: 90 },
  pkgLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginBottom: 4 },
  pkgCoins: { color: '#fff', fontSize: 20, fontWeight: '900' },
  pkgInr: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 2 },
  txHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  viewAll: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  txRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, marginBottom: 8, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  txIcon: { fontSize: 22 },
  txInfo: { flex: 1 },
  txDesc: { color: '#fff', fontSize: 14, fontWeight: '600' },
  txDate: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '800' },
  emptyText: { color: COLORS.textMuted, textAlign: 'center', marginVertical: 20, fontSize: 14 },
});