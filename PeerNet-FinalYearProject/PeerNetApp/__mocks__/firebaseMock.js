const mockAuth = {
  currentUser: null,
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(() => jest.fn()),
};

const mockFirestore = {
  collection: jest.fn(() => mockFirestore),
  doc: jest.fn(() => mockFirestore),
  getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
  addDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
};

const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
  setRNConfiguration: jest.fn(),
  requestAuthorization: jest.fn(),
};

const mockCamera = jest.fn(() => null);
const mockCameraType = { BACK: 'back', FRONT: 'front' };

module.exports = {
  getAuth: jest.fn(() => mockAuth),
  onAuthStateChanged: jest.fn(() => jest.fn()),
  getFirestore: jest.fn(() => mockFirestore),
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  auth: mockAuth,
  firestore: mockFirestore,
  Geolocation: mockGeolocation,
  default: mockGeolocation,
  Camera: mockCamera,
  CameraType: mockCameraType,
};
