# PeerNet — How to Run

## ✅ Configuration Status
All configuration files are in place:
- `android/app/google-services.json` ✅
- Firebase Auth, Firestore — connected ✅
- New Architecture disabled (compatible with all native libs) ✅

---

## 🚀 Run the App

Open **two terminals** in `c:\RN\PeerNet-FinalYearProject\PeerNetApp`.

### Terminal 1 — Metro bundler
```powershell
npx react-native start
```

### Terminal 2 — Build & launch on Android
```powershell
npx react-native run-android
```

---

## 🔄 Clean Build (if you see Gradle errors)
```powershell
cd android
.\gradlew clean
cd ..
npx react-native run-android
```

---

## 📱 App Flow
1. **Splash** → shows for 2 seconds on first launch
2. **Login** → enter email + password
3. **Register** → if no account yet
4. **Home** → availability toggle, navigation to all features
5. **Wallet** → view and add balance
6. **Find Providers** → see available nearby providers
7. **Request Internet** → send a request to a provider
8. **Logout** → returns to Login screen
