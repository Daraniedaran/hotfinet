import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Easing,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { listenRequestStatus, markRequestConnected } from '../services/FirestoreService';
import { COLORS } from '../theme/colors';
import WifiManager from 'react-native-wifi-reborn';

const WaitingForAcceptScreen = ({ navigation, route }) => {
    const {
        requestId,
        providerId,
        providerName,
        mb,
        coinsOffered,
    } = route.params;

    const pulse = useRef(new Animated.Value(1)).current;
    const spin = useRef(new Animated.Value(0)).current;

    const [connecting, setConnecting] = useState(false);
    const [connectMsg, setConnectMsg] = useState('Waiting for Provider');
    const [connectSub, setConnectSub] = useState(`${providerName || 'Provider'} will see your request shortly`);

    useEffect(() => {
        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.15, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ]),
        ).start();

        // Spin animation
        Animated.loop(
            Animated.timing(spin, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true }),
        ).start();
    }, []);

    const spinInterpolate = spin.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    useEffect(() => {
        if (!requestId) return;

        let isConnectingLocal = false;

        const unsub = listenRequestStatus(requestId, async (req) => {
            if (req.status === 'accepted' && !isConnectingLocal) {
                isConnectingLocal = true;
                setConnecting(true);
                setConnectMsg('Connecting to Hotspot...');
                setConnectSub(`Joining "${req.hotspotSSID}" automatically`);

                try {
                    await WifiManager.connectToProtectedSSID(req.hotspotSSID, req.hotspotPassword, false, false);
                    setConnectMsg('Connected! Starting session...');
                    await markRequestConnected(req.id, req.providerId, req.requesterId);
                } catch (e) {
                    console.log("Wifi Connection Error", e);
                    Alert.alert('Connection Failed', 'Could not connect to the hotspot. Please try again or connect manually.');
                    setConnecting(false);
                    isConnectingLocal = false;
                }
            } else if (req.status === 'connected') {
                navigation.replace('Session', {
                    requestId: req.id,
                    requesterId: req.requesterId,
                    providerId: req.providerId,
                    mb: req.mb,
                    coinsOffered: req.coinsOffered,
                    requesterName: providerName,
                });
            } else if (req.status === 'ignored') {
                Alert.alert(
                    '❌ Request Declined',
                    `${providerName} declined your request. Your coins have been refunded.`,
                    [{ text: 'OK', onPress: () => navigation.goBack() }],
                );
            }
        });

        return unsub;
    }, [requestId]);

    return (
        <LinearGradient colors={['#0c1222ff', '#082161ff']} style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Waiting</Text>
                <View style={{ width: 60 }} />
            </View>

            <View style={styles.centerArea}>
                {/* Animated radar / waiting indicator */}
                <View style={styles.radarContainer}>
                    <Animated.View style={[styles.radarRing, styles.radarOuter, { transform: [{ scale: pulse }] }]} />
                    <Animated.View style={[styles.radarRing, styles.radarMiddle, { transform: [{ scale: pulse }], opacity: 0.5 }]} />
                    <Animated.View style={[styles.spinnerWrapper, { transform: [{ rotate: spinInterpolate }] }]}>
                        <Text style={styles.radarIcon}>📡</Text>
                    </Animated.View>
                </View>

                <Text style={styles.waitTitle}>{connectMsg}</Text>
                <Text style={styles.waitSub}>
                    {connectSub}
                </Text>

                {/* Request details */}
                <View style={styles.detailsCard}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Provider</Text>
                        <Text style={styles.detailValue}>{providerName || 'Provider'}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Data Requested</Text>
                        <Text style={styles.detailValue}>{mb} MB</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Coins Held</Text>
                        <Text style={[styles.detailValue, { color: COLORS.gold }]}>🪙 {coinsOffered}</Text>
                    </View>
                </View>

                {/* Info note */}
                <View style={styles.noteCard}>
                    <Text style={styles.noteText}>
                        ⚡ Once the provider accepts, your device will automatically connect to their Wi-Fi hotspot and start the session.
                    </Text>
                </View>
            </View>
        </LinearGradient>
    );
};

export default WaitingForAcceptScreen;

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16 },
    backBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10 },
    backBtnText: { color: COLORS.primary, fontWeight: '800' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
    centerArea: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 40 },
    radarContainer: { width: 160, height: 160, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
    radarRing: { position: 'absolute', borderRadius: 999, borderWidth: 2 },
    radarOuter: { width: 160, height: 160, borderColor: 'rgba(30,144,255,0.2)' },
    radarMiddle: { width: 110, height: 110, borderColor: 'rgba(30,144,255,0.35)' },
    spinnerWrapper: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
    radarIcon: { fontSize: 40, },
    waitTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 8 },
    waitSub: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 32, lineHeight: 20 },
    detailsCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 16 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    detailLabel: { color: COLORS.textSecondary, fontSize: 14, },
    detailValue: { color: '#fff', fontWeight: '800', fontSize: 15 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
    noteCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    noteText: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
