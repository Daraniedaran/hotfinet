import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { WalletContext } from '../context/WalletContext';

const WalletScreen = () => {
  const { coins, addCoins } = useContext(WalletContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💰 My Wallet</Text>
      <Text style={styles.coins}>Coins: {coins}</Text>

      <Button title="Add 10 Coins" onPress={() => addCoins(10)} />
    </View>
  );
};

export default WalletScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  coins: {
    fontSize: 22,
    marginBottom: 20,
  },
});
