import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestLocationPermission, getCurrentLocation } from '../services/LocationService';
import { updateUserLocation, toggleAvailability } from '../services/FirestoreService';
import { getUserRole } from '../services/AuthService';

const HomeScreen = ({ navigation }) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const init = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      setUserId(storedUserId);

      if (storedUserId) {
        const userRole = await getUserRole(storedUserId);
        setRole(userRole);
      }

      await requestLocationPermission();
      updateLocation(storedUserId);
    };

    init();
  }, []);

  const updateLocation = async (uid) => {
    try {
      const coords = await getCurrentLocation();
      if (uid) {
        await updateUserLocation(uid, coords.latitude, coords.longitude);
      }
    } catch (error) {
      console.log("Error getting location:", error);
    }
  };

  const handleToggle = async (value) => {
    setIsAvailable(value);
    if (userId) {
      await toggleAvailability(userId, value);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userLoggedIn');
    await AsyncStorage.removeItem('userId');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚀 HotFiNet</Text>

      {role === 'Provider' && (
        <View style={styles.providerControl}>
          <Text style={styles.label}>Available to Share:</Text>
          <Switch value={isAvailable} onValueChange={handleToggle} />
        </View>
      )}

      {role === 'Requester' && (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('RequestInternet')}
          >
            <Text style={styles.buttonText}>REQUEST INTERNET</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('NearbyProviders')}
          >
            <Text style={styles.buttonText}>FIND PROVIDERS</Text>
          </TouchableOpacity>
        </>
      )}

      {role === 'Provider' && (
        <TouchableOpacity
          style={[styles.button, styles.providerButton]}
          onPress={() => navigation.navigate('ProviderRequests')}
        >
          <Text style={styles.buttonText}>INCOMING REQUESTS</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Wallet')}
      >
        <Text style={styles.buttonText}>WALLET</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>LOGOUT</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  providerControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    width: '80%',
    justifyContent: 'space-between'
  },
  label: {
    fontSize: 16,
    fontWeight: '600'
  },
  button: {
    width: '80%',
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  providerButton: {
    backgroundColor: '#8e44ad',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#ff6b6b',
    marginTop: 30,
  }
});
