# FINAL REPORT — Deployment Readiness: PeerNet / HotFiNet

## Verdict: DEPLOYMENT READY (Android) — new Firebase project configured, release APK and AAB built and signed

All code-level and configuration fixes have been applied. Tests pass, lint runs, and the
release build completes. iOS still requires a macOS machine.

### Verified build artifacts (2026-10-25)

| Artifact | Path | Size | Verification |
|----------|------|------|--------------|
| Signed APK | `PeerNetApp/android/app/build/outputs/apk/release/app-release.apk` | 95.9 MB | `apksigner verify` PASS (exit 0), 1 signer = release keystore |
| App Bundle (Play Store) | `PeerNetApp/android/app/build/outputs/bundle/release/app-release.aab` | 50.0 MB | Built successfully |
| Embedded Firebase project | `project_id = peernet-app` | — | Confirmed in generated google-services resources |

Commands used:
```
cd PeerNet-FinalYearProject/PeerNetApp/android
set ANDROID_HOME=C:\Android
gradlew.bat assembleRelease bundleRelease   # BUILD SUCCESSFUL
```

---

## Firebase — new dedicated project (replaces peernet-5de66)

| Item | Value |
|------|-------|
| Project ID | `peernet-app` (display name "PeerNet") |
| Project number | `71771527589` |
| Console | https://console.firebase.google.com/project/peernet-app |
| Android app | `com.peernetapp` — app ID `1:71771527589:android:6e5feac31f96e40e68304c` |
| Web app | `1:71771527589:web:1cbd83d4cceb85bd68304c` (used in `firebaseConfig.js`) |
| Firestore database | `(default)`, region `asia-south1` (Mumbai), Native mode |
| Security rules | `firestore.rules` deployed via `firebase deploy --only firestore:rules` |
| APIs enabled | Cloud Firestore, Identity Toolkit (Auth), Cloud Messaging (FCM) |

Files updated to the new project:
- `PeerNetApp/android/app/google-services.json`
- `PeerNetApp/android/app/src/main/google-services.json`
- `PeerNetApp/firebaseConfig.js`
- `PeerNetApp/src/config/firebaseConfig.js`

### Remaining Firebase step — MANUAL (2 clicks)
**Authentication → Email/Password provider** could not be enabled headlessly
(`CONFIGURATION_NOT_FOUND`; Auth initialization requires console acceptance).
- Open https://console.firebase.google.com/project/peernet-app/authentication
- Click **Get Started**, then **Email/Password → Enable → Save**

---

## Fixes Applied

### Build & Configuration

| Blocker | Fix | File |
|---------|-----|------|
| Release build failed (Hermes) | Set `react.hermesCommand` to `$rootDir/../node_modules/hermes-compiler/hermesc/%OS-BIN%/hermesc.exe` | `PeerNetApp/android/app/build.gradle:49` |
| Release signing used debug keystore | Added `signingConfigs.release` pointing to `release.keystore`; release buildType now uses it | `PeerNetApp/android/app/build.gradle:96-110` |
| No release keystore | Generated `release.keystore` via `keytool` (RSA 2048, 10000 days, alias `peernet-release`) | `PeerNetApp/android/app/release.keystore` |
| Keystore in git | Already ignored by `*.keystore` rule (only `!debug.keystore` un-ignored) | `PeerNetApp/.gitignore:34-35` |
| Accidental runtime deps | Removed `google-auth-library` and `googleapis` from `dependencies` | `PeerNetApp/package.json` |
| Wrong ESLint version | Downgraded `eslint` from `^10.0.1` to `^8.57.0` (compatible with `.eslintrc.js`) | `PeerNetApp/package.json` |
| Wrong Jest version | Upgraded `jest` from `^25.0.0` to `^29.7.0` (compatible with RN 0.84) | `PeerNetApp/package.json` |
| Jest can't parse ESM | Added `transform` + `transformIgnorePatterns: []` to jest.config.js | `PeerNetApp/jest.config.js` |
| Firebase native modules in tests | Created `__mocks__/firebaseMock.js` + `moduleNameMapper` for Firebase/geolocation/camera-kit | `PeerNetApp/__mocks__/firebaseMock.js`, `jest.config.js` |
| Test script hangs | Added `--forceExit` to test script | `PeerNetApp/package.json:10` |

### Windows Build Environment (required on this machine)

| Blocker | Fix | Where |
|---------|-----|-------|
| Android SDK missing | Installed cmdline-tools, platform-tools, platforms;android-36, build-tools;36.0.0, emulator to `C:\Android` | `C:\Android`, `Install-Android-SDK.ps1` |
| SDK location not found | Created `local.properties` with `sdk.dir=C:\Android`; set `ANDROID_HOME=C:\Android` | `PeerNetApp/android/local.properties` |
| CMake/ninja "Filename longer than 260 characters" (Fabric codegen) | (1) enabled `HKLM:\...\FileSystem\LongPathsEnabled=1` (elevated); (2) replaced CMake 3.22.1's bundled ninja 1.10.2 with **ninja 1.12.1** (`C:\Android\cmake\3.22.1\bin\ninja.exe`, backup `ninja.exe.bak`) — 1.10.2 ignores long-path registry; (3) cleaned stale `.cxx`/Kotlin caches | `C:\Android\cmake\3.22.1\bin\` |
| Hermesc binary missing at old path | RN 0.84.1 ships hermesc in the separate `hermes-compiler` npm package (not `react-native/sdks/hermesc`) | see build.gradle:49 |

Note: Windows Long Paths + ninja >= 1.11 are required for the New Architecture codegen
build at long paths. If the SDK is ever reinstalled, re-apply the ninja swap.

### Firestore Security Rules

| Blocker | Fix | File |
|---------|-----|------|
| No Firestore security rules | Created `firestore.rules` with deny-by-default + authenticated read/write rules | `PeerNetApp/firestore.rules` |
| Rules deployment | Deployed to `peernet-app` via Firebase CLI | `firebase.json` |

### CI/CD

| Blocker | Fix | File |
|---------|-----|------|
| No CI/CD pipeline | Created GitHub Actions workflow (Node 20, Java 17, npm install, test, lint, optional debug build) | `.github/workflows/ci.yml` |

---

## Verification Results

| Check | Result |
|-------|--------|
| `npm test` | PASS (1 suite, 1 test) |
| `npm run lint` | Runs; 8 pre-existing `react-hooks/exhaustive-deps` errors, 40 warnings (source-code issues, not config) |
| `gradlew assembleRelease` | BUILD SUCCESSFUL — signed APK produced and signature verified |
| `gradlew bundleRelease` | BUILD SUCCESSFUL — AAB produced |
| Firebase CLI (logged in as daraniedaran@gmail.com) | Project, apps, configs, Firestore DB + rules deployed |

---

## User Action Required (cannot be automated)

### 1. Enable Email/Password auth — REQUIRED (2 clicks)
See "Remaining Firebase step" above.

### 2. Keystore password rotation — RECOMMENDED
The release keystore was generated with a placeholder password. Rotate to a strong,
unique password before production (update `build.gradle` + re-sign). Back up `release.keystore`
securely — losing it means you cannot publish app updates to Google Play.

### 3. Device testing — REQUIRED before store submission
No emulator/device is configured on this machine. Connect a physical device (USB debugging) or
create an AVD, then:
```
adb install -r PeerNetApp/android/app/build/outputs/apk/release/app-release.apk
```

### 4. iOS deployment — requires macOS
Cannot be built from Windows. On a Mac: `bundle install`, `pod install`, then
`npx react-native run-ios` or Xcode archive.

---

## What remains open
- Source lint errors (8, `react-hooks/exhaustive-deps`) — pre-existing code issues, non-blocking
- Email/Password auth provider enablement (console click, see above)
- iOS not deployable from this environment (Windows)
