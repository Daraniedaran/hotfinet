import firestore from '@react-native-firebase/firestore';
import { GeoPoint } from '@react-native-firebase/firestore';

export const updateUserLocation = async (userId, lat, lng) => {
    try {
        await firestore().collection('users').doc(userId).update({
            location: new GeoPoint(lat, lng),
            lastActive: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating location:', error);
    }
};

export const getNearbyProviders = async () => {
    // Note: Real geo-queries need GeoFire or a bounding box. 
    // For this prototype, we fetch all providers and filter client-side 
    // or just return all for demo purposes if dataset is small.
    try {
        const snapshot = await firestore()
            .collection('users')
            .where('role', '==', 'Provider')
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching providers:', error);
        return [];
    }
};

export const createInternetRequest = async (requesterId, providerId, coins) => {
    try {
        await firestore().collection('requests').add({
            requesterId,
            providerId,
            status: 'pending', // pending, accepted, rejected, completed
            coins,
            createdAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
        throw error;
    }
};

export const listenToRequests = (userId, onUpdate) => {
    // Listen for requests where current user is the provider
    return firestore()
        .collection('requests')
        .where('providerId', '==', userId)
        .where('status', '==', 'pending')
        .onSnapshot(snapshot => {
            const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            onUpdate(requests);
        });
};

export const updateRequestStatus = async (requestId, status) => {
    try {
        await firestore().collection('requests').doc(requestId).update({
            status: status,
        });
    } catch (error) {
        throw error;
    }
};
export const toggleAvailability = async (userId, isAvailable) => {
    try {
        await firestore().collection('users').doc(userId).update({
            isAvailable: isAvailable
        });
    } catch (error) {
        console.error('Error toggling availability:', error);
    }
};
