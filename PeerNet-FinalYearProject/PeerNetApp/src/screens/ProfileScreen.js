import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { getAuth } from '@react-native-firebase/auth';
import { getUserProfile, updateUserProfile } from '../services/FirestoreService';
import { generateHotspotQR } from '../services/QRService';
import { COLORS } from '../theme/colors';

const ProfileScreen = ({ navigation }) => {
    const [profile, setProfile] = useState(null);
    const [name, setName] = useState('');
    const [ssid, setSSID] = useState('');
    const [hotspotPass, setHotspotPass] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [qrValue, setQrValue] = useState('');

    useEffect(() => {
        const user = getAuth().currentUser;
        if (!user) return;
        getUserProfile(user.uid).then(data => {
            setProfile(data);
            setName(data?.name || '');
            setSSID(data?.hotspotSSID || '');
            setHotspotPass(data?.hotspotPassword || '');
            if (data?.hotspotSSID && data?.hotspotPassword) {
                setQrValue(generateHotspotQR(data.hotspotSSID, data.hotspotPassword));
            }
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        const user = getAuth().currentUser;
        if (!user) return;
        if (!name.trim()) { Alert.alert('Error', 'Name cannot be empty'); return; }
        setSaving(true);
        try {
            await updateUserProfile(user.uid, {
                name: name.trim(),
                hotspotSSID: ssid.trim(),
                hotspotPassword: hotspotPass.trim(),
            });
            if (ssid.trim() && hotspotPass.trim()) {
                setQrValue(generateHotspotQR(ssid.trim(), hotspotPass.trim()));
            }
            Alert.alert('✅ Saved', 'Profile updated successfully!');
        } catch (e) {
            Alert.alert('Error', e.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <LinearGradient colors={['#0A0E21', '#141830']} style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#0A0E21', '#141830']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Text style={styles.backBtnText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <View style={{ width: 60 }} />
                </View>

                {/* Avatar */}
                <View style={styles.avatarArea}>
                    <LinearGradient colors={['#1E90FF', '#8B5CF6']} style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{(name || 'U').charAt(0).toUpperCase()}</Text>
                    </LinearGradient>
                    <Text style={styles.emailText}>{profile?.email}</Text>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNum}>{profile?.totalSessionsAsProvider || 0}</Text>
                        <Text style={styles.statLbl}>Shared{'\n'}Sessions</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNum}>{profile?.totalMBShared || 0}</Text>
                        <Text style={styles.statLbl}>MB{'\n'}Shared</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNum}>{profile?.totalMBConsumed || 0}</Text>
                        <Text style={styles.statLbl}>MB{'\n'}Consumed</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNum}>{profile?.coins || 0}</Text>
                        <Text style={styles.statLbl}>🪙{'\n'}Coins</Text>
                    </View>
                </View>

                {/* Edit Form */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📋 Edit Profile</Text>

                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Your name"
                        placeholderTextColor={COLORS.textMuted}
                    />
                </View>

                {/* Hotspot Config */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📡 Hotspot Settings</Text>
                    <Text style={styles.cardSubtitle}>
                        Set your hotspot SSID and password. This generates a QR code that requesters can scan to connect.
                    </Text>

                    <Text style={styles.label}>Hotspot Name (SSID)</Text>
                    <TextInput
                        style={styles.input}
                        value={ssid}
                        onChangeText={setSSID}
                        placeholder="e.g. MyHotspot"
                        placeholderTextColor={COLORS.textMuted}
                    />

                    <Text style={styles.label}>Hotspot Password</Text>
                    <TextInput
                        style={styles.input}
                        value={hotspotPass}
                        onChangeText={setHotspotPass}
                        placeholder="Hotspot password"
                        placeholderTextColor={COLORS.textMuted}
                        secureTextEntry
                    />

                    {/* QR Preview */}
                    {qrValue ? (
                        <View style={styles.qrWrapper}>
                            <Text style={styles.qrLabel}>Your Hotspot QR Code</Text>
                            <View style={styles.qrBox}>
                                <QRCode
                                    value={qrValue}
                                    size={160}
                                    backgroundColor="white"
                                    color="black"
                                />
                            </View>
                            <Text style={styles.qrHint}>Requesters will see this QR to connect to your hotspot</Text>
                        </View>
                    ) : (
                        <View style={styles.qrPlaceholder}>
                            <Text style={styles.qrPlaceholderText}>
                                💡 Enter SSID & Password above and save to generate your QR code
                            </Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity onPress={handleSave} disabled={saving}>
                    <LinearGradient colors={['#1E90FF', '#0060CC']} style={styles.saveBtn}>
                        {saving
                            ? <ActivityIndicator size="small" color="#fff" />
                            : <Text style={styles.saveBtnText}>💾 Save Profile</Text>
                        }
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scroll: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 40 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
    backBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10 },
    backBtnText: { color: COLORS.primary, fontWeight: '700' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
    avatarArea: { alignItems: 'center', marginBottom: 24 },
    avatarCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    avatarText: { fontSize: 36, color: '#fff', fontWeight: '900' },
    emailText: { color: COLORS.textSecondary, fontSize: 14 },
    statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
    statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    statNum: { color: '#fff', fontWeight: '800', fontSize: 18 },
    statLbl: { color: COLORS.textSecondary, fontSize: 10, marginTop: 4, textAlign: 'center' },
    card: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 18, marginBottom: 16 },
    cardTitle: { color: '#fff', fontWeight: '800', fontSize: 16, marginBottom: 4 },
    cardSubtitle: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 12, lineHeight: 18 },
    label: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 6, marginTop: 12 },
    input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, paddingVertical: 12, color: '#fff', fontSize: 15 },
    qrWrapper: { alignItems: 'center', marginTop: 20 },
    qrLabel: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 14 },
    qrBox: { backgroundColor: 'white', padding: 16, borderRadius: 12 },
    qrHint: { color: COLORS.textMuted, fontSize: 11, marginTop: 10, textAlign: 'center' },
    qrPlaceholder: { marginTop: 14, padding: 16, backgroundColor: 'rgba(30,144,255,0.08)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(30,144,255,0.2)' },
    qrPlaceholderText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
    saveBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
    saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
