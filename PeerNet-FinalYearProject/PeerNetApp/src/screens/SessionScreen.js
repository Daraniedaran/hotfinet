import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { completeSession } from '../services/FirestoreService';
import { COLORS } from '../theme/colors';

// Assume avg speed: 2 MB per minute
const MB_PER_MINUTE = 2;

const SessionScreen = ({ navigation, route }) => {
    const {
        requestId,
        requesterId,
        providerId,
        mb,
        coinsOffered,
        requesterName,
    } = route.params;

    const [elapsed, setElapsed] = useState(0); // seconds
    const [ending, setEnding] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setElapsed(prev => prev + 1);
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, []);

    const elapsedMin = elapsed / 60;
    const estimatedMB = Math.min(Math.round(elapsedMin * MB_PER_MINUTE), mb);

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Proportionally calculate coins used
    const coinsUsed = mb > 0 ? Math.ceil((estimatedMB / mb) * coinsOffered) : coinsOffered;
    const progressPct = Math.min((estimatedMB / mb) * 100, 100);

    const handleEndSession = () => {
        Alert.alert(
            '🏁 End Session',
            `End internet sharing?\n\nEstimated ${estimatedMB} MB used → ${coinsUsed} coins earned.`,
            [
                { text: 'Continue Sharing', style: 'cancel' },
                {
                    text: 'End Session',
                    style: 'destructive',
                    onPress: async () => {
                        clearInterval(intervalRef.current);
                        setEnding(true);
                        try {
                            await completeSession(requestId, requesterId, providerId, coinsUsed, estimatedMB);
                            navigation.replace('SessionComplete', {
                                coinsEarned: coinsUsed,
                                mbShared: estimatedMB,
                                duration: elapsed,
                                requesterName,
                            });
                        } catch (e) {
                            Alert.alert('Error', e.message);
                            setEnding(false);
                            // Restart timer
                            intervalRef.current = setInterval(() => {
                                setElapsed(prev => prev + 1);
                            }, 1000);
                        }
                    },
                },
            ]
        );
    };

    return (
        <LinearGradient colors={['#0A0E21', '#141830']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Live Indicator */}
                <View style={styles.liveRow}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE SESSION</Text>
                </View>

                {/* Timer */}
                <LinearGradient colors={['#1E90FF', '#6D28D9']} style={styles.timerCard}>
                    <Text style={styles.timerLabel}>Session Duration</Text>
                    <Text style={styles.timerValue}>{formatTime(elapsed)}</Text>
                    <Text style={styles.timerSub}>Sharing with {requesterName}</Text>
                </LinearGradient>

                {/* Usage Card */}
                <View style={styles.usageCard}>
                    <Text style={styles.usageTitle}>📊 Estimated Usage</Text>

                    <View style={styles.usageRow}>
                        <Text style={styles.usageLabel}>MB Used</Text>
                        <Text style={styles.usageValue}>{estimatedMB} / {mb} MB</Text>
                    </View>

                    {/* Progress bar */}
                    <View style={styles.progressBg}>
                        <LinearGradient
                            colors={['#1E90FF', '#10B981']}
                            style={[styles.progressFill, { width: `${progressPct}%` }]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        />
                    </View>
                    <Text style={styles.progressPct}>{Math.round(progressPct)}% used</Text>

                    <View style={styles.divider} />

                    <View style={styles.usageRow}>
                        <Text style={styles.usageLabel}>Coins To Earn</Text>
                        <Text style={[styles.usageValue, { color: COLORS.gold }]}>🪙 {coinsUsed}</Text>
                    </View>
                    <View style={styles.usageRow}>
                        <Text style={styles.usageLabel}>INR Equivalent</Text>
                        <Text style={styles.usageValue}>₹{(coinsUsed * 0.1).toFixed(1)}</Text>
                    </View>
                </View>

                {/* Info Note */}
                <View style={styles.noteCard}>
                    <Text style={styles.noteText}>
                        ℹ️ Usage is estimated at {MB_PER_MINUTE} MB/min. Actual usage may vary. End the session when done sharing.
                    </Text>
                </View>

                {/* End Session */}
                <TouchableOpacity onPress={handleEndSession} disabled={ending}>
                    <LinearGradient
                        colors={ending ? ['#555', '#555'] : ['#EF4444', '#DC2626']}
                        style={styles.endBtn}
                    >
                        <Text style={styles.endBtnText}>
                            {ending ? 'Ending Session...' : '⏹ Confirm & End Session'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
};

export default SessionScreen;

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
    liveRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 },
    liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444' },
    liveText: { color: COLORS.error, fontWeight: '800', fontSize: 13, letterSpacing: 2 },
    timerCard: { borderRadius: 20, padding: 30, alignItems: 'center', marginBottom: 20 },
    timerLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 8 },
    timerValue: { fontSize: 64, fontWeight: '900', color: '#fff', letterSpacing: 4 },
    timerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 8 },
    usageCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 14 },
    usageTitle: { color: '#fff', fontWeight: '800', fontSize: 16, marginBottom: 14 },
    usageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    usageLabel: { color: COLORS.textSecondary, fontSize: 14 },
    usageValue: { color: '#fff', fontWeight: '700', fontSize: 15 },
    progressBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, marginVertical: 10, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    progressPct: { color: COLORS.textMuted, fontSize: 12, textAlign: 'right' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 12 },
    noteCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    noteText: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18 },
    endBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
    endBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
