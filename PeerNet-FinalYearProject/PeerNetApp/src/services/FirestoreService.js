import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  addDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
  serverTimestamp,
  increment,
} from '@react-native-firebase/firestore';

const db = () => getFirestore();

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db(), 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const listenUserProfile = (uid, callback) => {
  return onSnapshot(doc(db(), 'users', uid), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
};

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db(), 'users', uid), data);
};

export const updateUserLocation = async (uid, latitude, longitude) => {
  await updateDoc(doc(db(), 'users', uid), {
    location: { latitude, longitude },
  });
};

export const toggleAvailability = async (uid, status) => {
  await updateDoc(doc(db(), 'users', uid), { isAvailable: status });
};

export const getAvailableProviders = async (currentUid) => {
  const q = query(collection(db(), 'users'), where('isAvailable', '==', true));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(u => u.id !== currentUid);
};

export const createRequest = async (requesterId, providerId, mb, coinsOffered) => {
  const batch = writeBatch(db());

  const requestRef = doc(collection(db(), 'requests'));
  batch.set(requestRef, {
    requesterId,
    providerId,
    mb,
    coinsOffered,
    status: 'pending',
    createdAt: serverTimestamp(),
  });

  const userRef = doc(db(), 'users', requesterId);
  batch.update(userRef, { coins: increment(-coinsOffered) });

  await batch.commit();
  return requestRef.id;
};

export const listenProviderRequests = (providerId, callback) => {
  const q = query(
    collection(db(), 'requests'),
    where('providerId', '==', providerId),
    where('status', '==', 'pending')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
};

export const getRequesterActiveRequest = (requesterId, callback) => {
  const q = query(
    collection(db(), 'requests'),
    where('requesterId', '==', requesterId),
    where('status', 'in', ['pending', 'accepted'])
  );
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data.length > 0 ? data[0] : null);
  });
};

export const acceptRequest = async (requestId) => {
  await updateDoc(doc(db(), 'requests', requestId), {
    status: 'accepted',
    acceptedAt: serverTimestamp(),
  });
};

export const ignoreRequest = async (requestId, requesterId, coinsOffered) => {
  const batch = writeBatch(db());
  batch.update(doc(db(), 'requests', requestId), { status: 'ignored' });
  batch.update(doc(db(), 'users', requesterId), { coins: increment(coinsOffered) });
  batch.set(doc(collection(db(), 'users', requesterId, 'transactions')), {
    type: 'refund',
    coins: coinsOffered,
    description: '↩️ Request cancelled – refund',
    createdAt: serverTimestamp(),
  });
  await batch.commit();
};

export const completeSession = async (requestId, requesterId, providerId, coinsToTransfer, mbUsed) => {
  const batch = writeBatch(db());

  batch.update(doc(db(), 'requests', requestId), {
    status: 'completed',
    completedAt: serverTimestamp(),
    mbUsed,
  });

  batch.update(doc(db(), 'users', providerId), {
    coins: increment(coinsToTransfer),
    totalMBShared: increment(mbUsed),
    totalSessionsAsProvider: increment(1),
  });

  batch.update(doc(db(), 'users', requesterId), {
    totalMBConsumed: increment(mbUsed),
    totalSessionsAsRequester: increment(1),
  });

  batch.set(doc(collection(db(), 'users', providerId, 'transactions')), {
    type: 'received',
    coins: coinsToTransfer,
    description: `📡 Shared ${mbUsed} MB – earned coins`,
    requestId,
    createdAt: serverTimestamp(),
  });

  batch.set(doc(collection(db(), 'users', requesterId, 'transactions')), {
    type: 'spent',
    coins: coinsToTransfer,
    description: `🌐 Used ${mbUsed} MB internet`,
    requestId,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
};

export const creditCoinsFromPurchase = async (uid, coins, amountINR) => {
  const batch = writeBatch(db());
  batch.update(doc(db(), 'users', uid), { coins: increment(coins) });
  batch.set(doc(collection(db(), 'users', uid, 'transactions')), {
    type: 'purchase',
    coins,
    description: `💳 Purchased ${coins} coins for ₹${amountINR}`,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
};