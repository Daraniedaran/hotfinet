import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WalletContext } from '../context/WalletContext';
import { createInternetRequest } from '../services/FirestoreService';

const RequestInternetScreen = ({ navigation }) => {
  const { deductCoins } = useContext(WalletContext);
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    const requiredCoins = 200;
    setLoading(true);

    try {
      const success = deductCoins(requiredCoins);
      if (!success) {
        Alert.alert('Insufficient Coins', 'Please buy coins to continue.');
        return;
      }

      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert("Error", "User not found. Please login again.");
        return;
      }

      // In a real app, you'd select a specific provider. 
      // For this demo, we'll just broadcast a request or pick a dummy provider ID if needed, 
      // but the service method expects a providerId.
      // Let's assume we are broadcasting or requesting from "any" (which might need backend support).
      // For now, we'll use a placeholder provider ID to satisfy the schema.
      const dummyProviderId = "PLACEHOLDER_PROVIDER_ID";

      await createInternetRequest(userId, dummyProviderId, requiredCoins);

      Alert.alert(
        'Success',
        `${requiredCoins} coins deducted. Request sent!`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert("Request Failed", "Could not send request. Please try again.");
      console.error(error);
      // Refund coins if request failed? (Omitted for prototype simplicity)
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request Internet</Text>

      <TouchableOpacity style={styles.button} onPress={handleRequest} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>REQUEST (200 Coins)</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default RequestInternetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: 'bold'
  },
  button: {
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
});
