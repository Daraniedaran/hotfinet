import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WalletContext } from '../context/WalletContext';

const WalletScreen = () => {
  const { coins } = useContext(WalletContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💰 My Wallet</Text>
      <Text style={styles.balance}>{coins} Coins</Text>
      <Text style={styles.note}>10 Coins = ₹1</Text>
    </View>
  );
};

export default WalletScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  balance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e90ff',
  },
  note: {
    marginTop: 10,
    fontSize: 14,
    color: '#555',
  },
});
