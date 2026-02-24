import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getAuth } from '@react-native-firebase/auth';
import { getAvailableProviders } from '../services/FirestoreService';
import { COLORS } from '../theme/colors';

const NearbyProvidersScreen = ({ navigation }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProviders = async () => {
    const user = getAuth().currentUser;
    if (!user) return;
    try {
      const data = await getAvailableProviders(user.uid);
      setProviders(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProviders(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProviders();
  };

  const renderItem = ({ item }) => (
    <View style={styles.provCard}>
      <View style={styles.provAvatar}>
        <Text style={styles.provAvatarText}>
          {(item.name || item.email || 'U').charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.provInfo}>
        <Text style={styles.provName}>{item.name || 'Provider'}</Text>
        <Text style={styles.provEmail} numberOfLines={1}>{item.email}</Text>
        <View style={styles.availBadge}>
          <View style={styles.availDot} />
          <Text style={styles.availText}>Available to Share</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.reqBtn}
        onPress={() => navigation.navigate('RequestInternet')}
      >
        <LinearGradient colors={['#1E90FF', '#0060CC']} style={styles.reqBtnGrad}>
          <Text style={styles.reqBtnText}>Request</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#0A0E21', '#141830']} style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nearby Providers</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Scanning for providers...</Text>
        </View>
      ) : (
        <FlatList
          data={providers}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyIcon}>📡</Text>
              <Text style={styles.emptyTitle}>No Providers Found</Text>
              <Text style={styles.emptyText}>
                Pull to refresh. Ask someone to enable "Share Hotspot" in HotFiNet.
              </Text>
            </View>
          }
        />
      )}
    </LinearGradient>
  );
};

export default NearbyProvidersScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16 },
  backBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10 },
  backBtnText: { color: COLORS.primary, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  provCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 12 },
  provAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  provAvatarText: { color: '#fff', fontWeight: '800', fontSize: 22 },
  provInfo: { flex: 1 },
  provName: { color: '#fff', fontWeight: '700', fontSize: 15 },
  provEmail: { color: COLORS.textMuted, fontSize: 12 },
  availBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  availDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: COLORS.success },
  availText: { color: COLORS.success, fontSize: 11, fontWeight: '600' },
  reqBtn: { borderRadius: 10, overflow: 'hidden' },
  reqBtnGrad: { paddingVertical: 10, paddingHorizontal: 16 },
  reqBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingHorizontal: 40, paddingTop: 60 },
  loadingText: { color: COLORS.textSecondary, fontSize: 14, marginTop: 10 },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  emptyText: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 20 },
});