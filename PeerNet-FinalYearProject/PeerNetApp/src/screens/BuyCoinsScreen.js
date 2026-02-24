import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { getAuth } from '@react-native-firebase/auth';
import { creditCoinsFromPurchase } from '../services/FirestoreService';
import { COLORS } from '../theme/colors';

const COIN_PACKAGES = [
    { id: 1, coins: 100, inr: 10, label: 'Starter', color: ['#1E90FF', '#0060CC'], desc: 'Good for 200 MB' },
    { id: 2, coins: 500, inr: 50, label: 'Popular 🔥', color: ['#8B5CF6', '#6D28D9'], desc: 'Good for 1 GB', badge: 'BEST VALUE' },
    { id: 3, coins: 1000, inr: 100, label: 'Value Pack', color: ['#FFD700', '#FF8C00'], desc: 'Good for 2 GB' },
    { id: 4, coins: 2000, inr: 200, label: 'Pro Pack', color: ['#14B8A6', '#059669'], desc: 'Good for 4 GB' },
];

const BuyCoinsScreen = ({ navigation, route }) => {
    const [selected, setSelected] = useState(route?.params?.package ?? null);
    const [processing, setProcessing] = useState(false);

    const handleBuy = async () => {
        if (!selected) {
            Alert.alert('Select a Package', 'Please select a coin package to continue.');
            return;
        }

        const user = getAuth().currentUser;
        if (!user) return;

        Alert.alert(
            '🪙 Confirm Purchase',
            `Buy ${selected.coins} coins for ₹${selected.inr}?\n\nThis is a demo payment — coins will be credited instantly.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: `Pay ₹${selected.inr}`,
                    onPress: async () => {
                        setProcessing(true);
                        try {
                            // Simulated payment — in production connect Razorpay here
                            await new Promise(resolve => setTimeout(resolve, 1500));
                            await creditCoinsFromPurchase(user.uid, selected.coins, selected.inr);
                            Alert.alert(
                                '✅ Payment Successful!',
                                `${selected.coins} coins have been credited to your wallet!`,
                                [{ text: 'Go to Wallet', onPress: () => navigation.navigate('Wallet') }]
                            );
                        } catch (e) {
                            Alert.alert('Error', e.message);
                        } finally {
                            setProcessing(false);
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
                    <Text style={styles.headerTitle}>Buy Coins</Text>
                    <View style={{ width: 60 }} />
                </View>

                {/* Info Banner */}
                <View style={styles.infoBanner}>
                    <Text style={styles.infoTitle}>🪙 HotFiNet Coin Economy</Text>
                    <Text style={styles.infoText}>1 Coin = ₹0.10  •  100 Coins = 200 MB internet</Text>
                </View>

                <Text style={styles.sectionTitle}>Choose a Package</Text>

                {COIN_PACKAGES.map(pkg => {
                    const isSelected = selected?.id === pkg.id;
                    return (
                        <TouchableOpacity
                            key={pkg.id}
                            onPress={() => setSelected(pkg)}
                            style={[styles.pkgCard, isSelected && styles.pkgCardSelected]}
                        >
                            <LinearGradient
                                colors={pkg.color}
                                style={styles.pkgColorBar}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            />
                            <View style={styles.pkgBody}>
                                <View style={styles.pkgTitleRow}>
                                    <Text style={styles.pkgLabel}>{pkg.label}</Text>
                                    {pkg.badge && (
                                        <View style={styles.badgeChip}>
                                            <Text style={styles.badgeText}>{pkg.badge}</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.pkgCoins}>🪙 {pkg.coins} Coins</Text>
                                <Text style={styles.pkgDesc}>{pkg.desc}</Text>
                            </View>
                            <View style={styles.pkgPriceArea}>
                                <Text style={styles.pkgPrice}>₹{pkg.inr}</Text>
                                {isSelected && <Text style={styles.checkMark}>✓</Text>}
                            </View>
                        </TouchableOpacity>
                    );
                })}

                {/* Payment Note */}
                <View style={styles.noteCard}>
                    <Text style={styles.noteTitle}>ℹ️ Payment Info</Text>
                    <Text style={styles.noteText}>
                        This is a demo simulation. Coins will be instantly credited after confirming. In production, UPI / GPay / PhonePe via Razorpay would be used.
                    </Text>
                </View>

                {/* Buy Button */}
                {processing ? (
                    <View style={styles.processingCard}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.processingText}>Processing payment...</Text>
                    </View>
                ) : (
                    <TouchableOpacity onPress={handleBuy} disabled={!selected}>
                        <LinearGradient
                            colors={selected ? ['#1E90FF', '#0060CC'] : ['#333', '#333']}
                            style={styles.buyBtn}
                        >
                            <Text style={styles.buyBtnText}>
                                {selected ? `Pay ₹${selected.inr} → Get ${selected.coins} Coins` : 'Select a Package'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </LinearGradient>
    );
};

export default BuyCoinsScreen;

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 40 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    backBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10 },
    backBtnText: { color: COLORS.primary, fontWeight: '700' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
    infoBanner: { backgroundColor: 'rgba(30,144,255,0.12)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(30,144,255,0.3)', padding: 14, marginBottom: 24 },
    infoTitle: { color: COLORS.primary, fontWeight: '700', fontSize: 14, marginBottom: 4 },
    infoText: { color: COLORS.textSecondary, fontSize: 13 },
    sectionTitle: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
    pkgCard: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, marginBottom: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
    pkgCardSelected: { borderColor: COLORS.primary },
    pkgColorBar: { width: 8 },
    pkgBody: { flex: 1, padding: 16 },
    pkgTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    pkgLabel: { color: '#fff', fontWeight: '800', fontSize: 15 },
    badgeChip: { backgroundColor: COLORS.primary, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
    badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
    pkgCoins: { color: COLORS.gold, fontWeight: '700', fontSize: 16 },
    pkgDesc: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
    pkgPriceArea: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, gap: 4 },
    pkgPrice: { color: '#fff', fontWeight: '900', fontSize: 20 },
    checkMark: { color: COLORS.success, fontSize: 18, fontWeight: '900' },
    noteCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14, marginVertical: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    noteTitle: { color: COLORS.textSecondary, fontWeight: '700', fontSize: 13, marginBottom: 6 },
    noteText: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18 },
    processingCard: { alignItems: 'center', padding: 24, gap: 12 },
    processingText: { color: COLORS.textSecondary, fontSize: 14 },
    buyBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
    buyBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
