import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { WalletContext } from '../context/WalletContext';

const RequestInternetScreen = () => {
  const { deductCoins } = useContext(WalletContext);

  const handleRequest = () => {
    const requiredCoins = 200; // example

    const success = deductCoins(requiredCoins);

    if (success) {
      Alert.alert(
        'Success',
        `${requiredCoins} coins deducted. Internet requested!`
      );
    } else {
      Alert.alert(
        'Insufficient Coins',
        'Please buy coins to continue.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request Internet</Text>

      <TouchableOpacity style={styles.button} onPress={handleRequest}>
        <Text style={styles.buttonText}>REQUEST (200 Coins)</Text>
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
  },
  title: {
    fontSize: 20,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
