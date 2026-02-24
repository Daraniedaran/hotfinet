import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../theme/colors';

const SessionCompleteScreen = ({ navigation, route }) => {
    const { coinsEarned, mbShared, duration, requesterName } = route.params;
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]).start();
    }, []);

    const formatDuration = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        if (m > 0) return `${m} min ${s} sec`;
        return `${s} seconds`;
    };

    return (
        <LinearGradient colors={['#0A0E21', '#141830']} style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Success icon */}
                <Animated.View style={[styles.successCircle, { transform: [{ scale: scaleAnim }] }]}>
                    <LinearGradient colors={['#10B981', '#059669']} style={styles.successGrad}>
                        <Text style={styles.checkIcon}>✓</Text>
                    </LinearGradient>
                </Animated.View>

                <Text style={styles.title}>Session Complete!</Text>
                <Text style={styles.subtitle}>Great job! You've earned coins for sharing.</Text>

                {/* Summary Card */}
                <LinearGradient colors={['#141830', '#1C2040']} style={styles.summaryCard}>
                    <View style={styles.summRow}>
                        <Text style={styles.summLabel}>🌐 Data Shared</Text>
                        <Text style={styles.summValue}>{mbShared} MB</Text>
                    </View>
                    <View style={styles.summRow}>
                        <Text style={styles.summLabel}>⏱ Session Duration</Text>
                        <Text style={styles.summValue}>{formatDuration(duration)}</Text>
                    </View>
                    <View style={styles.summRow}>
                        <Text style={styles.summLabel}>👤 Shared with</Text>
                        <Text style={styles.summValue}>{requesterName}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summRow}>
                        <Text style={styles.summLabel}>💰 Coins Earned</Text>
                        <Text style={[styles.summValue, styles.coinsEarned]}>🪙 +{coinsEarned}</Text>
                    </View>
                    <Text style={styles.inrValue}>= ₹{(coinsEarned * 0.1).toFixed(1)} added to wallet</Text>
                </LinearGradient>

                {/* Actions */}
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <LinearGradient colors={['#1E90FF', '#0060CC']} style={styles.homeBtn}>
                        <Text style={styles.homeBtnText}>🏠 Back to Home</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.navigate('Wallet')}
                    style={styles.walletBtn}
                >
                    <Text style={styles.walletBtnText}>👛 View Wallet</Text>
                </TouchableOpacity>
            </Animated.View>
        </LinearGradient>
    );
};

export default SessionCompleteScreen;

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40, alignItems: 'center' },
    successCircle: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden', marginBottom: 24 },
    successGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    checkIcon: { fontSize: 48, color: '#fff' },
    title: { fontSize: 28, fontWeight: '900', color: '#fff', marginBottom: 8 },
    subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 28, textAlign: 'center' },
    summaryCard: { width: '100%', borderRadius: 18, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    summRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    summLabel: { color: COLORS.textSecondary, fontSize: 14 },
    summValue: { color: '#fff', fontWeight: '700', fontSize: 15 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 8 },
    coinsEarned: { color: COLORS.gold, fontSize: 22, fontWeight: '900' },
    inrValue: { color: COLORS.success, fontSize: 13, textAlign: 'right', marginTop: -4 },
    homeBtn: { borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40, alignItems: 'center', marginBottom: 12 },
    homeBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    walletBtn: { paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    walletBtnText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: 14 },
});
