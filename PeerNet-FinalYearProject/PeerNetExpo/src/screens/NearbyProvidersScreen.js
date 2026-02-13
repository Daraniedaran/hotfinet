import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NearbyProvidersScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📶 Nearby Providers</Text>
    </View>
  );
};

export default NearbyProvidersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
