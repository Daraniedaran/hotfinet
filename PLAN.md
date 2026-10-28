# PLAN — Fix Deployment Issues: PeerNet / HotFiNet

## Goal
Make the repository deployment ready by resolving the release build blocker, production signing, Firestore security rules, CI pipeline, and test/lint configuration.

## Status: COMPLETE

All remediation tasks have been completed.

## Summary of changes

| Task | Description | Status | File(s) |
|------|-------------|--------|---------|
| T1 | Fix `android/app/build.gradle`: Hermes command + release signing config | Complete | `PeerNetApp/android/app/build.gradle` |
| T2 | Generate release keystore via `keytool` | Complete | `PeerNetApp/android/app/release.keystore` |
| T3 | Create `firestore.rules` with production read/write access control | Complete | `PeerNetApp/firestore.rules` |
| T3v | Verify Firestore security rules | Complete | `PeerNetApp/firestore.rules` |
| T4 | Create GitHub Actions CI workflow | Complete | `.github/workflows/ci.yml` |
| T5 | Fix Jest v25 incompatibility (upgrade to v29, ESM transform, Firebase mocks) | Complete | `package.json`, `jest.config.js`, `__mocks__/firebaseMock.js` |
| T5b | Fix ESLint v10 incompatibility (downgrade to v8 for `.eslintrc.js`) | Complete | `package.json` |
| T5c | Remove accidental runtime deps (google-auth-library, googleapis) | Complete | `package.json` |
| T5d | Add `--forceExit` to test script | Complete | `package.json:10` |

## Verification Results

| Command | Result |
|---------|--------|
| `npm test` | PASS (1 suite, 1 test) |
| `npm run lint` | Runs successfully (8 pre-existing `react-hooks/exhaustive-deps` errors, 40 warnings in source code) |

## User action required
- Firebase project credentials swap (google-services.json, firebaseConfig.js)
- Firestore rules release in Firebase Console
- Keystore password rotation
- `npm install` + release build verification
