import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'HotFiNet Location Permission',
        message: 'HotFiNet needs your location to find nearby hotspot providers.',
        buttonPositive: 'Allow',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    // Step 1: Try fast network-based location (works indoors, no GPS needed)
    Geolocation.getCurrentPosition(
      pos => resolve(pos.coords),
      () => {
        // Step 2: Fallback to GPS if network location fails
        Geolocation.getCurrentPosition(
          pos => resolve(pos.coords),
          err => reject(err),
          { enableHighAccuracy: true, timeout: 30000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 }
    );
  });
};