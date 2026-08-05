import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
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

// ─── FCM Token ─────────────────────────────────────────────────────────────

export const saveFCMToken = async (uid, token) => {
  await setDoc(doc(db(), 'users', uid), { fcmToken: token }, { merge: true });
};

// ─── Internal notification helper ──────────────────────────────────────────
// Writes a notification document to users/{uid}/notifications.
// The target user's NotificationService listener will pick it up in real time.
const pushNotification = (batch, uid, title, body) => {
  const notifRef = doc(collection(db(), 'users', uid, 'notifications'));
  batch.set(notifRef, {
    title,
    body,
    read: false,
    createdAt: serverTimestamp(),
  });
};

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
  await setDoc(doc(db(), 'users', uid), {
    location: { latitude, longitude },
  }, { merge: true });
};

export const toggleAvailability = async (uid, status) => {
  await setDoc(doc(db(), 'users', uid), { isAvailable: status }, { merge: true });
};

export const getAvailableProviders = async (currentUid) => {
  const q = query(collection(db(), 'users'), where('isAvailable', '==', true));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(u => u.id !== currentUid);
};

export const createRequest = async (requesterId, providerId, mb, coinsOffered, requesterName = 'Someone') => {
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

  // Notify the provider
  pushNotification(
    batch,
    providerId,
    '📶 New Internet Request',
    `${requesterName} wants ${mb} MB for 🪙 ${coinsOffered} coins`,
  );

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

export const acceptRequest = async (requestId, requesterId, ssid = '', password = '') => {
  const batch = writeBatch(db());

  batch.update(doc(db(), 'requests', requestId), {
    status: 'accepted',
    acceptedAt: serverTimestamp(),
    hotspotSSID: ssid,
    hotspotPassword: password,
  });

  // Notify the requester
  if (requesterId) {
    pushNotification(
      batch,
      requesterId,
      '✅ Request Accepted!',
      'Your provider accepted. Connecting to hotspot automatically...',
    );
  }

  await batch.commit();
};

export const markRequestConnected = async (requestId, providerId, requesterId) => {
  const batch = writeBatch(db());

  batch.update(doc(db(), 'requests', requestId), {
    status: 'connected',
    connectedAt: serverTimestamp(),
  });

  // Notify the provider
  if (providerId) {
    pushNotification(
      batch,
      providerId,
      '🔗 Device Connected',
      'The receiver has successfully connected to your hotspot.',
    );
  }

  await batch.commit();
};

export const listenRequestStatus = (requestId, callback) => {
  return onSnapshot(doc(db(), 'requests', requestId), (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    }
  });
};

export const ignoreRequest = async (requestId, requesterId, coinsOffered) => {
  const batch = writeBatch(db());
  batch.update(doc(db(), 'requests', requestId), { status: 'ignored' });

  // Notify the requester
  pushNotification(
    batch,
    requesterId,
    '❌ Request Declined',
    'Your request was declined by the provider.',
  );

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
    coins: increment(-coinsToTransfer),
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

  // Notify the requester that the session is done
  pushNotification(
    batch,
    requesterId,
    '🏁 Session Complete',
    `You used ${mbUsed} MB of internet. Provider earned 🪙 ${coinsToTransfer} coins.`,
  );

  // Notify the provider of earnings
  pushNotification(
    batch,
    providerId,
    '💰 Coins Credited!',
    `Session ended. You earned 🪙 ${coinsToTransfer} coins for sharing ${mbUsed} MB.`,
  );

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