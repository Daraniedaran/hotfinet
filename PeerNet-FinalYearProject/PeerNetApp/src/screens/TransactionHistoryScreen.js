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
import { getTransactionHistory } from '../services/walletService';
import { COLORS } from '../theme/colors';

const txIcon = (type) => {
    switch (type) {
        case 'received': return { icon: '🟢', label: 'Coins Received' };
        case 'spent': return { icon: '🔴', label: 'Coins Spent' };
        case 'purchase': return { icon: '🔵', label: 'Coins Purchased' };
        case 'bonus': return { icon: '🎁', label: 'Bonus' };
        case 'refund': return { icon: '↩️', label: 'Refund' };
        default: return { icon: '⚪', label: 'Transaction' };
    }
};

const TransactionHistoryScreen = ({ navigation }) => {
    const [txList, setTxList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = getAuth().currentUser;
        if (!user) return;
        getTransactionHistory(user.uid).then(data => {
            setTxList(data);
            setLoading(false);
        });
    }, []);

    const renderItem = ({ item }) => {
        const { icon, label } = txIcon(item.type);
        const isPositive = ['received', 'purchase', 'bonus', 'refund'].includes(item.type);

        return (
            <View style={styles.txCard}>
                <Text style={styles.txIcon}>{icon}</Text>
                <View style={styles.txBody}>
                    <Text style={styles.txDesc} numberOfLines={2}>{item.description || label}</Text>
                    <Text style={styles.txDate}>
                        {item.createdAt?.toDate
                            ? item.createdAt.toDate().toLocaleString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            })
                            : 'Just now'}
                    </Text>
                </View>
                <Text style={[styles.txCoins, { color: isPositive ? COLORS.success : COLORS.error }]}>
                    {isPositive ? '+' : '-'}{item.coins}
                    {'\n'}<Text style={styles.txCoinLabel}>coins</Text>
                </Text>
            </View>
        );
    };

    return (
        <LinearGradient colors={['#0A0E21', '#141830']} style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transaction History</Text>
                <View style={{ width: 60 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : txList.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyIcon}>📋</Text>
                    <Text style={styles.emptyTitle}>No Transactions Yet</Text>
                    <Text style={styles.emptyText}>Share or buy data to see your history here</Text>
                </View>
            ) : (
                <FlatList
                    data={txList}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </LinearGradient>
    );
};

export default TransactionHistoryScreen;

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16 },
    backBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10 },
    backBtnText: { color: COLORS.primary, fontWeight: '700' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
    list: { paddingHorizontal: 20, paddingBottom: 40 },
    txCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', gap: 12 },
    txIcon: { fontSize: 26 },
    txBody: { flex: 1 },
    txDesc: { color: '#fff', fontSize: 14, fontWeight: '600' },
    txDate: { color: COLORS.textMuted, fontSize: 11, marginTop: 3 },
    txCoins: { fontWeight: '800', fontSize: 16, textAlign: 'right' },
    txCoinLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '400' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    emptyIcon: { fontSize: 48 },
    emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
    emptyText: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' },
});
