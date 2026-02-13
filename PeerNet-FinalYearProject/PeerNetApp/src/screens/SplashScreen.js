import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({ navigation }) => {

  useEffect(() => {

    const checkLogin = async () => {
      const isLoggedIn = await AsyncStorage.getItem('userLoggedIn');

      setTimeout(() => {
        if (isLoggedIn === 'true') {
          navigation.replace('Home');
        } else {
          navigation.replace('Login');
        }
      }, 2000);
    };

    checkLogin();

  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>PeerNet</Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 30,
    fontWeight: 'bold',
  },
});
