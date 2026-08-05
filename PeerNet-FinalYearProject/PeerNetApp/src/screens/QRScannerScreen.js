import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Platform,
    Linking,
    StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Camera, CameraType } from 'react-native-camera-kit';
import { parseHotspotQR } from '../services/QRService';
import { COLORS } from '../theme/colors';

const QRScannerScreen = ({ navigation, route }) => {
    const {
        requestId,
        requesterId,
        providerId,
        mb,
        coinsOffered,
        hotspotSSID,
        hotspotPassword,
        providerName,
    } = route?.params || {};

    const [scanned, setScanned] = useState(false);
    const [scannedData, setScannedData] = useState(null);
    const [showManual, setShowManual] = useState(false);

    const handleBarCodeRead = useCallback((event) => {
        if (scanned) return;

        const qrValue = event.nativeEvent?.codeStringValue || event?.nativeEvent?.codeStringValue || '';
        if (!qrValue) return;

        setScanned(true);

        const parsed = parseHotspotQR(qrValue);
        if (parsed.ssid) {
            setScannedData(parsed);
        } else {
            Alert.alert(
                '⚠️ Invalid QR Code',
                'This doesn\'t appear to be a WiFi QR code. Please scan the provider\'s hotspot QR.',
                [{ text: 'Scan Again', onPress: () => setScanned(false) }],
            );
        }
    }, [scanned]);

    const handleConnect = () => {
        const ssid = scannedData?.ssid || hotspotSSID;
        const pass = scannedData?.password || hotspotPassword;

        Alert.alert(
            '📶 WiFi Credentials Scanned',
            `Network: ${ssid}\nPassword: ${pass}\n\nPlease connect to this WiFi network manually from your device settings, then come back and tap "Start Session".`,
            [
                {
                    text: 'Open WiFi Settings', onPress: () => {
                        if (Platform.OS === 'android') {
                            Linking.sendIntent('android.settings.WIFI_SETTINGS').catch(() => {
                                Linking.openSettings();
                            });
                        } else {
                            Linking.openURL('App-Prefs:WIFI');
                        }
                    }
                },
                { text: 'Start Session', onPress: handleStartSession },
            ],
        );
    };

    const handleStartSession = () => {
        if (!requestId) {
            Alert.alert(
                'Action Required',
                'You must initiate an internet request before starting a session. Please go back to the previous screen, enter your MB requirement, and tap the provider\'s avatar on the radar.',
                [{ text: 'Go Back', onPress: () => navigation.goBack() }]
            );
            return;
        }

        navigation.replace('Session', {
            requestId,
            requesterId,
            providerId,
            mb,
            coinsOffered,
            requesterName: providerName || 'Provider',
        });
    };

    const handleManualConnect = () => {
        if (!hotspotSSID) {
            Alert.alert('Unavailable', 'Hotspot credentials not yet available. Please scan the QR code.');
            return;
        }
        setShowManual(true);
        setScannedData({ ssid: hotspotSSID, password: hotspotPassword });
    };

    // Show scanned result / manual credentials overlay
    if (scannedData || showManual) {
        return (
            <LinearGradient colors={['#0B1120', '#0B1120']} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.resultContainer}>
                    {/* Success icon */}
                    <View style={styles.successIcon}>
                        <Text style={{ fontSize: 56, }}>✅</Text>
                    </View>

                    <Text style={styles.resultTitle}>
                        {showManual ? 'Hotspot Credentials' : 'QR Code Scanned!'}
                    </Text>
                    <Text style={styles.resultSub}>
                        Connect to this WiFi network to start your session
                    </Text>

                    {/* Credentials card */}
                    <View style={styles.credCard}>
                        <View style={styles.credRow}>
                            <Text style={styles.credLabel}>Network (SSID)</Text>
                            <Text style={styles.credValue}>{scannedData?.ssid || hotspotSSID}</Text>
                        </View>
                        <View style={styles.credDivider} />
                        <View style={styles.credRow}>
                            <Text style={styles.credLabel}>Password</Text>
                            <Text style={styles.credValue}>{scannedData?.password || hotspotPassword}</Text>
                        </View>
                    </View>

                    {/* Session info */}
                    {(mb !== undefined && coinsOffered !== undefined) && (
                        <View style={styles.sessionInfo}>
                            <View style={styles.sessionChip}>
                                <Text style={styles.sessionChipText}>{mb} MB</Text>
                            </View>
                            <View style={styles.sessionChip}>
                                <Text style={[styles.sessionChipText, { color: COLORS.gold }]}>🪙 {coinsOffered}</Text>
                            </View>
                        </View>
                    )}

                    {/* Instructions */}
                    <View style={styles.instructCard}>
                        <Text style={styles.instructText}>
                            1. Open your phone's WiFi settings{'\n'}
                            2. Connect to "{scannedData?.ssid || hotspotSSID}"{'\n'}
                            3. Come back and tap "Start Session"
                        </Text>
                    </View>

                    {/* Action buttons */}
                    <TouchableOpacity onPress={handleConnect} style={{ width: '100%', borderRadius: 14, overflow: 'hidden', elevation: 4, shadowColor: '#26A69A', shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } }}>
                        <LinearGradient colors={['#26A69A', '#00796B']} style={styles.connectBtn}>
                            <Text style={styles.connectBtnText}>📶 Open WiFi Settings</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleStartSession} style={{ width: '100%', marginTop: 14, borderRadius: 14, overflow: 'hidden', elevation: 4, shadowColor: '#42A5F5', shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } }}>
                        <LinearGradient colors={['#42A5F5', '#1976D2']} style={styles.connectBtn}>
                            <Text style={styles.connectBtnText}>▶ Start Session</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {!showManual && (
                        <TouchableOpacity onPress={() => { setScanned(false); setScannedData(null); }} style={styles.rescanBtn}>
                            <Text style={styles.rescanBtnText}>🔄 Scan Again</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>
        );
    }

    return (
        <View style={styles.scanContainer}>
            <StatusBar barStyle="light-content" />
            <Camera
                style={styles.camera}
                cameraType={CameraType.Back}
                scanBarcode={true}
                onReadCode={handleBarCodeRead}
                showFrame={false}
            />

            {/* Overlay */}
            <View style={styles.overlay}>
                {/* Top bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Text style={styles.backBtnText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.scanTitle}>Scan QR Code</Text>
                    <View style={{ width: 60 }} />
                </View>

                {/* Scan frame */}
                <View style={styles.frameContainer}>
                    <View style={styles.scanFrame}>
                        {/* Corner decorations */}
                        <View style={[styles.corner, styles.cornerTL]} />
                        <View style={[styles.corner, styles.cornerTR]} />
                        <View style={[styles.corner, styles.cornerBL]} />
                        <View style={[styles.corner, styles.cornerBR]} />
                    </View>
                </View>

                {/* Bottom info */}
                <View style={styles.bottomBar}>
                    <Text style={styles.scanHint}>
                        Point your camera at the QR code on the provider's phone
                    </Text>

                    <TouchableOpacity onPress={handleManualConnect} style={styles.manualBtn}>
                        <Text style={styles.manualBtnText}>⌨️ Enter Manually</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default QRScannerScreen;

const styles = StyleSheet.create({
    // Scanner view
    scanContainer: { flex: 1, backgroundColor: '#000' },
    camera: { flex: 1 },
    overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
    topBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10 },
    backBtnText: { color: '#fff', fontWeight: '800' },
    scanTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
    frameContainer: { alignItems: 'center', justifyContent: 'center' },
    scanFrame: { width: 250, height: 250, position: 'relative' },
    corner: { position: 'absolute', width: 30, height: 30, borderColor: '#1E90FF', borderWidth: 3 },
    cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
    cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
    cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
    cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
    bottomBar: {
        alignItems: 'center', paddingHorizontal: 20, paddingBottom: 50, paddingTop: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    scanHint: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', marginBottom: 16, lineHeight: 20 },
    manualBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    manualBtnText: { color: 'rgba(255,255,255,0.7)', fontWeight: '600', fontSize: 14 },

    // Result view
    container: { flex: 1 },
    resultContainer: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 80 },
    successIcon: { marginBottom: 20 },
    resultTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 8 },
    resultSub: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 24 },
    credCard: {
        width: '100%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16,
        padding: 18, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', marginBottom: 16,
    },
    credRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    credLabel: { color: COLORS.textSecondary, fontSize: 13, },
    credValue: { color: '#fff', fontWeight: '800', fontSize: 14 },
    credDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
    sessionInfo: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    sessionChip: {
        backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, paddingVertical: 8,
        paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    sessionChipText: { color: '#fff', fontWeight: '800', fontSize: 14 },
    instructCard: {
        width: '100%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12,
        padding: 14, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    instructText: { color: COLORS.textMuted, fontSize: 12, lineHeight: 20 },
    connectBtn: { paddingVertical: 16, alignItems: 'center' },
    connectBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    rescanBtn: { marginTop: 12, paddingVertical: 10 },
    rescanBtnText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 14 },
});
