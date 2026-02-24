/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// NOTE: @react-native-firebase auto-initialises from android/app/google-services.json
// Do NOT call firebase.initializeApp() here — it causes "No Firebase App '[DEFAULT]'" errors.

AppRegistry.registerComponent(appName, () => App);
