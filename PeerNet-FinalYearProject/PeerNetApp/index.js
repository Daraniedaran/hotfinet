/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// NOTE: @react-native-firebase auto-initialises from android/app/google-services.json
// Do NOT call firebase.initializeApp() here — it causes "No Firebase App '[DEFAULT]'" errors.

// Required by @react-native-firebase/messaging — handles FCM messages when the
// app is in the background or killed. Without this, messages may be dropped.
setBackgroundMessageHandler(getMessaging(), async (remoteMessage) => {
    // Background messages are displayed automatically by the OS via the
    // notification payload. No manual handling needed for data-only messages
    // in the current implementation (Firestore-backed notifications are used instead).
    console.log('[FCM Background]', remoteMessage?.notification?.title);
});

AppRegistry.registerComponent(appName, () => App);

