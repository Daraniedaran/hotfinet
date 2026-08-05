import React, { useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Share,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { generateHotspotQR } from '../services/QRService';
import { listenRequestStatus } from '../services/FirestoreService';
import { COLORS } from '../theme/colors';

const QRDisplayScreen = ({ navigation, route }) => {
    const {
        requestId,
        requesterId,
        providerId,
        mb,
        coinsOffered,
        ssid,
        password,
        requesterName,
    } = route.params;

    const qrValue = generateHotspotQR(ssid, password);

    const handleStartSession = () => {
        navigation.replace('Session', {
            requestId,
            requesterId,
            providerId,
            mb,
            coinsOffered,
            requesterName,
        });
    };

    useEffect(() => {
        if (!requestId) return;

        const unsub = listenRequestStatus(requestId, (req) => {
            if (req.status === 'connected') {
                handleStartSession();
            }
        });

        return unsub;
    }, [requestId]);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Connect to hotspot:\nSSID: ${ssid}\nPassword: ${password}`,
            });
        } catch (e) {
            console.warn(e);
        }
    };

    return (
        <LinearGradient colors={['#0B1120', '#0B1120']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Text style={styles.backBtnText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Hotspot QR</Text>
                    <View style={{ width: 60 }} />
                </View>

                {/* Status banner */}
                <LinearGradient colors={['#1D976C', '#116B4B']} style={styles.statusBanner}>
                    <Text style={styles.statusIcon}>✅</Text>
                    <View>
                        <Text style={styles.statusTitle}>Request Accepted!</Text>
                        <Text style={styles.statusSub}>{requesterName} can now scan the QR below</Text>
                    </View>
                </LinearGradient>

                {/* Session Info */}
                <View style={styles.infoRow}>
                    <View style={styles.infoChip}>
                        <Text style={styles.infoVal}>{mb} MB</Text>
                        <Text style={styles.infoLbl}>Requested</Text>
                    </View>
                    <View style={styles.infoChip}>
                        <Text style={[styles.infoVal, { color: COLORS.gold }]}>🪙 {coinsOffered}</Text>
                        <Text style={styles.infoLbl}>You'll Earn</Text>
                    </View>
                    <View style={styles.infoChip}>
                        <Text style={[styles.infoVal, { color: COLORS.primary }]}>≈ ₹{(coinsOffered * 0.1).toFixed(0)}</Text>
                        <Text style={styles.infoLbl}>INR Value</Text>
                    </View>
                </View>

                {/* QR Card */}
                <View style={styles.qrCard}>
                    <Text style={styles.qrTitle}>📡 Auto-Connecting...</Text>
                    <Text style={styles.qrSub}>Receiver is connecting automatically to your network.</Text>

                    {/* QR Code as fallback */}
                    <View style={styles.qrWrapper}>
                        <Text style={{ textAlign: 'center', marginBottom: 10, color: '#666' }}>Manual fallback</Text>
                        <QRCode
                            value={qrValue}
                            size={180}
                            backgroundColor="white"
                            color="black"
                        />
                    </View>

                    {/* WiFi details */}
                    <View style={styles.wifiDetails}>
                        <View style={styles.wifiRow}>
                            <Text style={styles.wifiLabel}>Network (SSID)</Text>
                            <Text style={styles.wifiValue}>{ssid}</Text>
                        </View>
                        <View style={styles.wifiDivider} />
                        <View style={styles.wifiRow}>
                            <Text style={styles.wifiLabel}>Password</Text>
                            <Text style={styles.wifiValue}>{password}</Text>
                        </View>
                    </View>

                    <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
                        <Text style={styles.shareBtnText}>📤 Share Credentials Manually</Text>
                    </TouchableOpacity>
                </View>

                {/* Instructions */}
                <View style={styles.instructCard}>
                    <Text style={styles.instructTitle}>How it works</Text>
                    {[
                        '1. The receiver phone will join your hotspot automatically.',
                        '2. Once connected, the internet session will start immediately.',
                        '3. If auto-connect fails, they can scan this QR code manually.',
                    ].map((step, i) => (
                        <Text key={i} style={styles.instructStep}>{step}</Text>
                    ))}
                </View>

                {/* Start Session Manual fallback */}
                <TouchableOpacity onPress={handleStartSession} style={styles.startBtnWrapper}>
                    <LinearGradient colors={['#42A5F5', '#1976D2']} style={styles.startBtn}>
                        <Text style={styles.startBtnText}>▶ Start Session Timer (Fallback)</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
};

export default QRDisplayScreen;

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 40 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    backBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10 },
    backBtnText: { color: COLORS.primary, fontWeight: '800' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
    statusBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 16, marginBottom: 16 },
    statusIcon: { fontSize: 28, },
    statusTitle: { color: '#fff', fontWeight: '800', fontSize: 16 },
    statusSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
    infoRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    infoChip: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    infoVal: { color: '#fff', fontWeight: '800', fontSize: 16 },
    infoLbl: { color: COLORS.textSecondary, fontSize: 11, marginTop: 3 },
    qrCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 16 },
    qrTitle: { color: '#fff', fontWeight: '800', fontSize: 17, marginBottom: 4 },
    qrSub: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 20 },
    qrWrapper: { alignItems: 'center', backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 20 },
    wifiDetails: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, marginBottom: 14 },
    wifiRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
    wifiLabel: { color: COLORS.textSecondary, fontSize: 13, },
    wifiValue: { color: '#fff', fontWeight: '800', fontSize: 14 },
    wifiDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
    shareBtn: { alignItems: 'center', paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    shareBtnText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 14 },
    instructCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, marginBottom: 16, gap: 8 },
    instructTitle: { color: COLORS.textSecondary, fontWeight: '800', fontSize: 13, marginBottom: 4 },
    instructStep: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
    startBtnWrapper: { borderRadius: 14, overflow: 'hidden', elevation: 4, shadowColor: '#42A5F5', shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
    startBtn: { paddingVertical: 16, alignItems: 'center' },
    startBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
