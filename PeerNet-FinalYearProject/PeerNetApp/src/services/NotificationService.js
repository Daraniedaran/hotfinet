import {
    getMessaging,
    requestPermission,
    AuthorizationStatus,
    getToken,
    getAPNSToken,
    onMessage,
} from '@react-native-firebase/messaging';
import { Platform, Alert } from 'react-native';
import {
    getFirestore,
    collection,
    query,
    orderBy,
    limit,
    onSnapshot,
    updateDoc,
    doc,
} from '@react-native-firebase/firestore';

const db = () => getFirestore();
const msg = () => getMessaging();

// ─── Permission & Token ────────────────────────────────────────────────────

/**
 * Request notification permission (Android 13+ / iOS).
 * Returns true if granted.
 */
export const requestNotificationPermission = async () => {
    const authStatus = await requestPermission(msg());
    const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;
    return enabled;
};

/**
 * Returns the current FCM device token, or null on failure.
 */
export const getFCMToken = async () => {
    try {
        // Ensure we have an APNs token on iOS before getting FCM token
        if (Platform.OS === 'ios') {
            const apnsToken = await getAPNSToken(msg());
            if (!apnsToken) return null;
        }
        return await getToken(msg());
    } catch (e) {
        console.warn('[NotificationService] getFCMToken error:', e.message);
        return null;
    }
};

// ─── Foreground FCM listener ───────────────────────────────────────────────

/**
 * Listen to foreground FCM messages and display them as in-app alerts.
 * Returns an unsubscribe function.
 */
export const listenForegroundMessages = () => {
    return onMessage(msg(), async (remoteMessage) => {
        const title = remoteMessage?.notification?.title || remoteMessage?.data?.title || 'HotFiNet';
        const body = remoteMessage?.notification?.body || remoteMessage?.data?.body || '';
        Alert.alert(title, body);
    });
};

// ─── In-App Notification Listener (Firestore-backed) ──────────────────────

/**
 * Listen to the latest UNREAD notification for a user in Firestore.
 * When a new one arrives, shows an in-app Alert and marks it as read.
 *
 * @param {string} uid – target user's uid
 * @param {(n: {title: string, body: string}) => void} [onReceived] – optional callback
 * @returns unsubscribe function
 */
export const listenInAppNotifications = (uid, onReceived) => {
    const q = query(
        collection(db(), 'users', uid, 'notifications'),
        orderBy('createdAt', 'desc'),
        limit(5)
    );

    // Track already-seen doc IDs so we only alert on truly new arrivals
    const seen = new Set();

    return onSnapshot(q, (snap) => {
        snap.docs.forEach(async (d) => {
            const data = d.data();
            if (data.read || seen.has(d.id)) return;

            seen.add(d.id);

            const title = data.title || 'HotFiNet';
            const body = data.body || '';

            // Show in-app alert
            Alert.alert(title, body);
            if (onReceived) onReceived({ title, body });

            // Mark as read
            try {
                await updateDoc(doc(db(), 'users', uid, 'notifications', d.id), { read: true });
            } catch (e) {
                console.warn('[NotificationService] markRead error:', e.message);
            }
        });
    });
};
