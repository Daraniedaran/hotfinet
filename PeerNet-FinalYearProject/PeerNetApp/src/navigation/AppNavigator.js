import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import NearbyProvidersScreen from '../screens/NearbyProvidersScreen';
import RequestInternetScreen from '../screens/RequestInternetScreen';
import WalletScreen from '../screens/WalletScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />
        <Stack.Screen
          name="NearbyProviders"
          component={NearbyProvidersScreen}
          options={{ title: 'Nearby Providers' }}
        />
        <Stack.Screen
          name="RequestInternet"
          component={RequestInternetScreen}
          options={{ title: 'Request Internet' }}
        />
        <Stack.Screen
          name="Wallet"
          component={WalletScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
