import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getAuth } from '@react-native-firebase/auth';
import {
  listenProviderRequests,
  acceptRequest,
  ignoreRequest,
  getUserProfile,
} from '../services/FirestoreService';
import { COLORS } from '../theme/colors';

const ProviderRequestsScreen = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [uid, setUid] = useState(null);
  const [accepting, setAccepting] = useState(null);
  const [ignoring, setIgnoring] = useState(null);
  const [requesterProfiles, setRequesterProfiles] = useState({});
  const [hotspotSSID, setHotspotSSID] = useState('');
  const [hotspotPass, setHotspotPass] = useState('');

  useEffect(() => {
    const user = getAuth().currentUser;
    if (!user) return;
    setUid(user.uid);

    // Load provider's hotspot info
    getUserProfile(user.uid).then(profile => {
      setHotspotSSID(profile?.hotspotSSID || '');
      setHotspotPass(profile?.hotspotPassword || '');
    });

    const unsub = listenProviderRequests(user.uid, async (reqs) => {
      setRequests(reqs);
      // Load requester profiles for names
      const profiles = {};
      for (const req of reqs) {
        if (!requesterProfiles[req.requesterId]) {
          const p = await getUserProfile(req.requesterId);
          if (p) profiles[req.requesterId] = p;
        }
      }
      if (Object.keys(profiles).length > 0) {
        setRequesterProfiles(prev => ({ ...prev, ...profiles }));
      }
    });

    return unsub;
  }, []);

  const handleAccept = async (req) => {
    if (!hotspotSSID || !hotspotPass) {
      Alert.alert(
        '⚠️ No Hotspot Configured',
        'Please set your hotspot SSID and password in your Profile first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Profile', onPress: () => navigation.navigate('Profile') },
        ]
      );
      return;
    }

    setAccepting(req.id);
    try {
      await acceptRequest(req.id);
      navigation.navigate('QRDisplay', {
        requestId: req.id,
        requesterId: req.requesterId,
        providerId: uid,
        mb: req.mb,
        coinsOffered: req.coinsOffered,
        ssid: hotspotSSID,
        password: hotspotPass,
        requesterName: requesterProfiles[req.requesterId]?.name || 'Requester',
      });
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setAccepting(null);
    }
  };

  const handleIgnore = async (req) => {
    Alert.alert(
      'Ignore Request?',
      `Ignore this request from ${requesterProfiles[req.requesterId]?.name || 'this user'}? Coins will be refunded to them.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Ignore',
          style: 'destructive',
          onPress: async () => {
            setIgnoring(req.id);
            try {
              await ignoreRequest(req.id, req.requesterId, req.coinsOffered);
            } catch (e) {
              Alert.alert('Error', e.message);
            } finally {
              setIgnoring(null);
            }
          },
        },
      ]
    );
  };

  const renderRequest = ({ item }) => {
    const requester = requesterProfiles[item.requesterId];
    const name = requester?.name || 'Unknown User';
    const initial = name.charAt(0).toUpperCase();

    return (
      <View style={styles.reqCard}>
        <View style={styles.reqHeader}>
          <View style={styles.reqAvatar}>
            <Text style={styles.reqAvatarText}>{initial}</Text>
          </View>
          <View style={styles.reqInfo}>
            <Text style={styles.reqName}>{name}</Text>
            <Text style={styles.reqEmail}>{requester?.email || item.requesterId.slice(0, 16) + '...'}</Text>
          </View>
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        </View>

        <View style={styles.reqDetails}>
          <View style={styles.detailChip}>
            <Text style={styles.detailIcon}>📶</Text>
            <Text style={styles.detailText}>{item.mb} MB</Text>
          </View>
          <View style={styles.detailChip}>
            <Text style={styles.detailIcon}>🪙</Text>
            <Text style={[styles.detailText, { color: COLORS.gold }]}>{item.coinsOffered} Coins</Text>
          </View>
          <View style={styles.detailChip}>
            <Text style={styles.detailIcon}>💰</Text>
            <Text style={styles.detailText}>≈ ₹{(item.coinsOffered * 0.1).toFixed(0)}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.ignoreBtn}
            onPress={() => handleIgnore(item)}
            disabled={ignoring === item.id}
          >
            {ignoring === item.id
              ? <ActivityIndicator size="small" color={COLORS.error} />
              : <Text style={styles.ignoreBtnText}>✕ Ignore</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptBtnWrapper}
            onPress={() => handleAccept(item)}
            disabled={accepting === item.id}
          >
            <LinearGradient colors={['#10B981', '#059669']} style={styles.acceptBtn}>
              {accepting === item.id
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.acceptBtnText}>✓ Accept</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#0A0E21', '#141830']} style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incoming Requests</Text>
        <View style={{ width: 60 }} />
      </View>

      {requests.length > 0 ? (
        <FlatList
          data={requests}
          keyExtractor={item => item.id}
          renderItem={renderRequest}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyArea}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>No Requests Yet</Text>
          <Text style={styles.emptyText}>
            Enable "Share Hotspot" on the home screen to appear as a provider
          </Text>
        </View>
      )}
    </LinearGradient>
  );
};

export default ProviderRequestsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16 },
  backBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10 },
  backBtnText: { color: COLORS.primary, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  reqCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(30,144,255,0.25)' },
  reqHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 },
  reqAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  reqAvatarText: { color: '#fff', fontWeight: '800', fontSize: 20 },
  reqInfo: { flex: 1 },
  reqName: { color: '#fff', fontWeight: '700', fontSize: 15 },
  reqEmail: { color: COLORS.textMuted, fontSize: 12, marginTop: 1 },
  newBadge: { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  newBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  reqDetails: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  detailChip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: 8 },
  detailIcon: { fontSize: 14 },
  detailText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  actionRow: { flexDirection: 'row', gap: 10 },
  ignoreBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.5)' },
  ignoreBtnText: { color: COLORS.error, fontWeight: '700', fontSize: 14 },
  acceptBtnWrapper: { flex: 1.5, borderRadius: 10, overflow: 'hidden' },
  acceptBtn: { paddingVertical: 12, alignItems: 'center' },
  acceptBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  emptyArea: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 56 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  emptyText: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22 },
});