import React, { useEffect, useState, useRef } from 'react';
import { Text, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import LinearGradient from 'react-native-linear-gradient';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WalletScreen from '../screens/WalletScreen';
import BuyCoinsScreen from '../screens/BuyCoinsScreen';
import RequestInternetScreen from '../screens/RequestInternetScreen';
import NearbyProvidersScreen from '../screens/NearbyProvidersScreen';
import ProviderRequestsScreen from '../screens/ProviderRequestsScreen';
import QRDisplayScreen from '../screens/QRDisplayScreen';
import SessionScreen from '../screens/SessionScreen';
import SessionCompleteScreen from '../screens/SessionCompleteScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';

const Stack = createNativeStackNavigator();

// ── Standalone loading screen shown while Firebase resolves auth ──
const LoadingScreen = () => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.3, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <LinearGradient colors={['#0A0E21', '#141830', '#0A0E21']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.Text style={{ fontSize: 56, transform: [{ scale: pulse }] }}>📡</Animated.Text>
      <Text style={{ color: '#fff', fontSize: 36, fontWeight: '900', letterSpacing: 2, marginTop: 20 }}>HotFiNet</Text>
      <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 8 }}>Share Internet. Earn Coins.</Text>
    </LinearGradient>
  );
};

const AppNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setInitializing(false);
    });
    return unsub;
  }, []);

  // Show branded loading screen while Firebase checks auth state (< 1 second)
  if (initializing) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {user ? (
          // ── Authenticated Stack ──────────────────────────────────────────
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="BuyCoins" component={BuyCoinsScreen} />
            <Stack.Screen name="RequestInternet" component={RequestInternetScreen} />
            <Stack.Screen name="NearbyProviders" component={NearbyProvidersScreen} />
            <Stack.Screen name="ProviderRequests" component={ProviderRequestsScreen} />
            <Stack.Screen name="QRDisplay" component={QRDisplayScreen} />
            <Stack.Screen name="Session" component={SessionScreen} />
            <Stack.Screen name="SessionComplete" component={SessionCompleteScreen} />
            <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
          </>
        ) : (
          // ── Unauthenticated Stack ────────────────────────────────────────
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;