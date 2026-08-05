import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
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

const { width } = Dimensions.get('window');
const RADAR_CENTER = width / 2;

const RadarAnimation = () => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const s1 = anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  const o1 = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 0, 0] });

  const s2 = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.8] });
  const o2 = anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.6, 0] });

  const s3 = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] });
  const o3 = anim.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 0, 0.8, 0] });

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <View style={styles.radarCenter}>
        <Animated.View style={[styles.radarRing, { transform: [{ scale: s1 }], opacity: o1 }]} />
        <Animated.View style={[styles.radarRing, { transform: [{ scale: s2 }], opacity: o2 }]} />
        <Animated.View style={[styles.radarRing, { transform: [{ scale: s3 }], opacity: o3 }]} />

        {/* Static Rings */}
        <View style={[styles.staticRing, { width: width * 0.4, height: width * 0.4 }]} />
        <View style={[styles.staticRing, { width: width * 0.7, height: width * 0.7 }]} />
      </View>
    </View>
  );
};

const RequestInternetScreen = ({ navigation }) => {
  const [mb, setMb] = useState('200');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(null);
  const [userCoins, setUserCoins] = useState(0);
  const [userName, setUserName] = useState('Me');
  const [uid, setUid] = useState(null);

  const coinsNeeded = calculateCoinsForMB(parseInt(mb) || 0);

  useEffect(() => {
    const user = getAuth().currentUser;
    if (!user) return;
    setUid(user.uid);

    const unsub = listenUserProfile(user.uid, (data) => {
      setUserCoins(data?.coins || 0);
      if (data?.name) setUserName(data.name);
    });

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
      `Request ${mbVal} MB from ${provider.name || provider.email}?\n\nCoins will be transferred automatically at the end of the session based on the actual MB used.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setRequesting(provider.id);
            try {
              const newRequestId = await createRequest(uid, provider.id, mbVal, coinsNeeded, userName);
              navigation.replace('WaitingForAccept', {
                requestId: newRequestId,
                providerId: provider.id,
                providerName: provider.name || provider.email || 'Provider',
                mb: mbVal,
                coinsOffered: coinsNeeded,
              });
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

  // Calculate radar positions for providers
  const getProviderPosition = (index, total) => {
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2; // Start from top
    const radius = total === 1 ? width * 0.25 : width * 0.25 + (index % 2) * 30; // Stagger radius slightly if many

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    return {
      transform: [{ translateX: x }, { translateY: y }]
    };
  };

  return (
    <LinearGradient colors={['#0c1222ff', '#082161ff']} style={styles.container}>

      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select to Connect</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.radarSubTitle}>Searching for nearby devices...</Text>

      {/* Radar Area */}
      <View style={styles.radarContainer}>
        <RadarAnimation />

        {/* Providers */}
        {providers.map((provider, i) => (
          <View key={provider.id} style={[styles.avatarWrapper, getProviderPosition(i, providers.length)]}>
            <TouchableOpacity
              onPress={() => handleRequest(provider)}
              style={styles.providerAvatar}
              disabled={requesting === provider.id}
            >
              {requesting === provider.id ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.providerInitial}>
                  {(provider.name || provider.email || 'U').charAt(0).toUpperCase()}
                </Text>
              )}
            </TouchableOpacity>
            <Text style={styles.providerName} numberOfLines={1}>
              {provider.name || provider.email?.split('@')[0] || 'Provider'}
            </Text>
          </View>
        ))}

        {/* Central User (Me) */}
        <View style={styles.centerAvatar}>
          <LinearGradient colors={['#26A69A', '#00796B']} style={styles.centerAvatarGrad}>
            <Text style={styles.centerInitial}>{(userName || 'M').charAt(0).toUpperCase()}</Text>
          </LinearGradient>
          <Text style={styles.centerName}>Me</Text>
        </View>
      </View>

      {/* Floating QR Button */}
      <TouchableOpacity
        style={styles.qrFab}
        onPress={() => navigation.navigate('QRScanner')}
      >
        <Text style={styles.qrFabText}>Manual QR Scan</Text>
      </TouchableOpacity>

      {/* Bottom Sheet Request Form */}
      <View style={styles.bottomCard}>
        <View style={styles.dragger} />

        <Text style={styles.cardTitle}>Data Requirements</Text>

        <View style={styles.mbInputWrapper}>
          <TextInput
            style={styles.mbInput}
            value={mb}
            onChangeText={setMb}
            keyboardType="numeric"
            placeholder="200"
            placeholderTextColor="rgba(0,0,0,0.3)"
          />
          <Text style={styles.mbUnit}>MB</Text>
        </View>

        <View style={styles.presetsRow}>
          {['50', '200', '500', '1000'].map(val => (
            <TouchableOpacity
              key={val}
              style={[styles.presetBtn, mb === val && styles.presetBtnActive]}
              onPress={() => setMb(val)}
            >
              <Text style={[styles.presetText, mb === val && styles.presetTextActive]}>{val} MB</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cost Preview */}
        <View style={styles.costPreview}>
          <Text style={styles.costText}>Estimated Cost: <Text style={{ fontWeight: '900', color: COLORS.primary }}>🪙 {coinsNeeded}</Text></Text>
          {userCoins < coinsNeeded && (
            <Text style={{ color: COLORS.error, fontSize: 12, marginTop: 4, textAlign: 'center' }}>
              ⚠️ Not enough coins. <Text style={{ textDecorationLine: 'underline' }} onPress={() => navigation.navigate('BuyCoins')}>Get more</Text>
            </Text>
          )}
        </View>
      </View>

    </LinearGradient>
  );
};

export default RequestInternetScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 52, paddingHorizontal: 20 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 },
  backBtnText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  radarSubTitle: { color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 10, fontSize: 14, },

  // Radar UI
  radarContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  radarCenter: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  radarRing: { position: 'absolute', width: width * 0.9, height: width * 0.9, borderRadius: width, backgroundColor: 'rgba(255,255,255,0.1)' },
  staticRing: { position: 'absolute', borderRadius: width, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },

  avatarWrapper: { position: 'absolute', width: 60, height: 80, justifyContent: 'center', alignItems: 'center' },
  providerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
  providerInitial: { color: COLORS.primary, fontSize: 22, fontWeight: '800' },
  providerName: { color: '#fff', fontSize: 11, fontWeight: '600', marginTop: 4, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3, width: 80, textAlign: 'center' },

  centerAvatar: { width: 80, height: 100, justifyContent: 'center', alignItems: 'center' },
  centerAvatarGrad: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  centerInitial: { color: '#fff', fontSize: 28, fontWeight: '900' },
  centerName: { color: '#fff', fontSize: 13, fontWeight: '800', marginTop: 8 },

  // Bottom Sheet UI
  bottomCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  dragger: { width: 40, height: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 16, textAlign: 'center' },

  mbInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, paddingHorizontal: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(30,144,255,0.3)' },
  mbInput: { flex: 1, fontSize: 32, fontWeight: '900', color: '#fff', paddingVertical: 14, textAlign: 'center' },
  mbUnit: { fontSize: 18, fontWeight: '800', color: COLORS.textMuted },

  presetsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 20 },
  presetBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  presetBtnActive: { backgroundColor: 'rgba(30,144,255,0.2)', borderColor: COLORS.primary },
  presetText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 13 },
  presetTextActive: { color: COLORS.primary, fontWeight: '800' },

  costPreview: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  costText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },

  qrFab: { position: 'absolute', bottom: 330, alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', zIndex: 10 },
  qrFabText: { color: '#fff', fontSize: 13, fontWeight: '800' },
});