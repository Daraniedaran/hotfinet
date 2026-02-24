import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from '@react-native-firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';

const WELCOME_COINS = 500;

export const registerUser = async (name, email, password) => {
  const auth = getAuth();
  const db = getFirestore();

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;

  await setDoc(doc(db, 'users', uid), {
    name: name.trim(),
    email,
    coins: WELCOME_COINS,
    isAvailable: false,
    location: null,
    hotspotSSID: '',
    hotspotPassword: '',
    totalMBShared: 0,
    totalMBConsumed: 0,
    totalSessionsAsProvider: 0,
    totalSessionsAsRequester: 0,
    fcmToken: null,
    createdAt: serverTimestamp(),
  });

  await addDoc(collection(db, 'users', uid, 'transactions'), {
    type: 'bonus',
    coins: WELCOME_COINS,
    description: '🎁 Welcome Bonus',
    createdAt: serverTimestamp(),
  });

  return userCredential.user;
};

export const loginUser = async (email, password) => {
  const auth = getAuth();
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logoutUser = async () => {
  await signOut(getAuth());
};

export const sendPasswordReset = async (email) => {
  await sendPasswordResetEmail(getAuth(), email);
};