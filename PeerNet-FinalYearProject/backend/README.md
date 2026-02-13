# PeerNet Backend

## Architecture: Serverless (Firebase)
PeerNet uses a **Serverless Architecture** powered by **Google Firebase**. 
There is no separate Node.js/Express server to run. All backend logic is handled directly through the Firebase SDKs integrated into the mobile application.

## Key Services
The backend logic is encapsulated in the mobile app source code under `PeerNetApp/src/services/`:

1.  **Authentication**: Handled by Firebase Authentication.
    - Code: `src/services/AuthService.js`
    - Logic: Registers users and manages sessions.

2.  **Database**: Handled by Cloud Firestore.
    - Code: `src/services/FirestoreService.js`
    - Logic: Stores User profiles, Location data, and Internet Requests.

3.  **Geolocation**: Handled by Native Device Services + Firestore.
    - Code: `src/services/LocationService.js`

## Setup
To configure the backend, you must:
1.  Create a project in the [Firebase Console](https://console.firebase.google.com/).
2.  Download `google-services.json` and place it in `PeerNetApp/android/app/`.
3.  Ensure `firebaseConfig.js` in the app root is updated with your specific keys (handled in recent updates).

## Future Extension
If complex business logic (e.g., payment processing, scheduled jobs) is needed in the future, this directory can be used to host **Firebase Cloud Functions**.
