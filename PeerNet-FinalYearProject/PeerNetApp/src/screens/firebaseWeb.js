import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';

// @react-native-firebase auto-initializes from google-services.json (Android)
// and GoogleService-Info.plist (iOS). No manual initializeApp call needed.
const auth = getAuth();
const firestore = getFirestore();

export { auth, firestore };
