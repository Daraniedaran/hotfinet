import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from '@react-native-firebase/firestore';

const db = () => getFirestore();

export const getCoinBalance = async (uid) => {
  const snap = await getDoc(doc(db(), 'users', uid));
  return snap.data()?.coins || 0;
};

export const getTransactionHistory = async (uid) => {
  const q = query(
    collection(db(), 'users', uid, 'transactions'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/** 200 MB = 100 coins */
export const calculateCoinsForMB = (mb) => Math.ceil((mb / 200) * 100);

export const calculateMBFromCoins = (coins) => Math.floor((coins / 100) * 200);

/** 1 coin = ₹0.10 */
export const coinsToINR = (coins) => (coins * 0.1).toFixed(2);

export const inrToCoins = (inr) => Math.floor(inr * 10);