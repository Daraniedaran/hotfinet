import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { listenToRequests, updateRequestStatus } from '../services/FirestoreService';

const ProviderRequestsScreen = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const init = async () => {
            const storedUserId = await AsyncStorage.getItem('userId');
            setUserId(storedUserId);
            setLoading(false);
        };
        init();
    }, []);

    useEffect(() => {
        if (!userId) return;

        const unsubscribe = listenToRequests(userId, (newRequests) => {
            setRequests(newRequests);
        });

        return () => unsubscribe();
    }, [userId]);

    const handleAction = async (requestId, status) => {
        try {
            await updateRequestStatus(requestId, status);
            Alert.alert("Success", `Request ${status}`);
        } catch (error) {
            Alert.alert("Error", "Failed to update request");
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.text}>Requester ID: {item.requesterId}</Text>
            <Text style={styles.text}>Coins Offered: {item.coins}</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.acceptButton]}
                    onPress={() => handleAction(item.id, 'accepted')}
                >
                    <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.rejectButton]}
                    onPress={() => handleAction(item.id, 'rejected')}
                >
                    <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) return <ActivityIndicator size="large" color="#2E86DE" style={styles.loader} />;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Incoming Requests</Text>
            <FlatList
                data={requests}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.emptyText}>No pending requests.</Text>}
            />
        </View>
    );
};

export default ProviderRequestsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    loader: {
        marginTop: 50,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    text: {
        fontSize: 16,
        marginBottom: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        padding: 10,
        borderRadius: 5,
        width: '45%',
        alignItems: 'center',
    },
    acceptButton: {
        backgroundColor: '#27ae60',
    },
    rejectButton: {
        backgroundColor: '#c0392b',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
        fontSize: 16,
    }
});
