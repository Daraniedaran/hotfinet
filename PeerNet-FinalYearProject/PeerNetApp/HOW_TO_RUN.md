# CRITICAL: MISSING CONFIGURATION

You are missing the `google-services.json` file in:
`c:\RN\PeerNet-FinalYearProject\PeerNetApp\android\app\`

Without this file, the app **WILL CRASH** immediately.

## Step 1: Fix Configuration
1. Go to your Firebase Console.
2. Download `google-services.json`.
3. Move it to `c:\RN\PeerNet-FinalYearProject\PeerNetApp\android\app\`.

## Step 2: Run the App
After fixing step 1, run these commands in `PeerNetApp/`:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start bundler:
   ```bash
   npx react-native start
   ```

3. Launch on Android:
   ```bash
   npx react-native run-android
   ```
