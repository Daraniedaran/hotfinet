# Install Android Command-Line Tools (without Android Studio)
# Run as Administrator if you need to set Machine-level environment variables

$ErrorActionPreference = "Stop"

# --- Configuration ---
$androidRoot = "C:\Android"
$cmdlineToolsDir = Join-Path $androidRoot "cmdline-tools"
$latestDir = Join-Path $cmdlineToolsDir "latest"
$zipUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
$zipPath = Join-Path $env:TEMP "android-commandlinetools.zip"

# SDK components to install (matches your build.gradle: compileSdk 36, buildTools 36.0.0)
$sdkPackages = @(
    "platform-tools",
    "platforms;android-36",
    "build-tools;36.0.0",
    "emulator"
)

Write-Host "=== Android Command-Line Tools Installer ===" -ForegroundColor Cyan
Write-Host "Install location: $androidRoot" -ForegroundColor Cyan

# --- 1. Create directories ---
Write-Host "`n[1/6] Creating directories..." -ForegroundColor Yellow
if (-Not (Test-Path $androidRoot)) { New-Item -ItemType Directory -Path $androidRoot -Force | Out-Null }
if (-Not (Test-Path $cmdlineToolsDir)) { New-Item -ItemType Directory -Path $cmdlineToolsDir -Force | Out-Null }

# --- 2. Download command-line tools ---
Write-Host "`n[2/6] Downloading Android command-line tools..." -ForegroundColor Yellow
if (-Not (Test-Path $zipPath)) {
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath
    Write-Host "Downloaded to $zipPath" -ForegroundColor Green
} else {
    Write-Host "Zip already exists, skipping download." -ForegroundColor Gray
}

# --- 3. Extract ---
Write-Host "`n[3/6] Extracting..." -ForegroundColor Yellow
Expand-Archive -Path $zipPath -DestinationPath $cmdlineToolsDir -Force

# The zip extracts contents into cmdline-tools/, but we need cmdline-tools/latest/
# Move contents into 'latest' subdirectory if not already there
$cmdlineToolsContents = Get-ChildItem -Path $cmdlineToolsDir -Exclude "latest"
if ($cmdlineToolsContents) {
    if (-Not (Test-Path $latestDir)) { New-Item -ItemType Directory -Path $latestDir -Force | Out-Null }
    Move-Item -Path $cmdlineToolsContents.FullName -Destination $latestDir -Force
}

# Verify sdkmanager exists
$sdkManager = Join-Path $latestDir "bin\sdkmanager.bat"
if (-Not (Test-Path $sdkManager)) {
    Write-Error "sdkmanager.bat not found at $sdkManager. Extraction may have failed."
}

Write-Host "Extraction complete." -ForegroundColor Green

# --- 4. Accept licenses ---
Write-Host "`n[4/6] Accepting SDK licenses..." -ForegroundColor Yellow
& $sdkManager --licenses

# --- 5. Install SDK packages ---
Write-Host "`n[5/6] Installing SDK packages: $($sdkPackages -join ', ')..." -ForegroundColor Yellow
$packageString = $sdkPackages -join " "
& $sdkManager $packageString

# --- 6. Set environment variables ---
Write-Host "`n[6/6] Setting environment variables..." -ForegroundColor Yellow

# ANDROID_HOME at User level
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidRoot, "User")

# Append to PATH at User level
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
$newPaths = @(
    "$cmdlineToolsDir\latest\bin",
    "$androidRoot\platform-tools"
)
$pathExists = $false
foreach ($p in $newPaths) {
    if ($currentPath -notlike "*$p*") {
        $currentPath = "$currentPath;$p"
        $pathExists = $true
    }
}
if ($pathExists) {
    [Environment]::SetEnvironmentVariable("Path", $currentPath, "User")
    Write-Host "PATH updated." -ForegroundColor Green
} else {
    Write-Host "PATH already contains required paths." -ForegroundColor Gray
}

# --- 7. Create local.properties for your project ---
$projectDir = "D:\Project\hotfinet\PeerNet-FinalYearProject\PeerNetApp\android"
$localProperties = Join-Path $projectDir "local.properties"
if (Test-Path $projectDir) {
    "sdk.dir=$androidRoot" | Out-File -FilePath $localProperties -Encoding utf8
    Write-Host "Created $localProperties" -ForegroundColor Green
}

Write-Host "`n=== Installation Complete ===" -ForegroundColor Cyan
Write-Host "ANDROID_HOME = $androidRoot" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. RESTART your terminal/PowerShell so PATH changes take effect."
Write-Host "  2. Run: sdkmanager --list-installed  (to verify)"
Write-Host "  3. In your project: npm start  (Terminal 1)"
Write-Host "  4. In your project: npx react-native run-android --mode=release  (Terminal 2)"
Write-Host "`nNote: You still need an Android emulator or physical device to install/run the APK." -ForegroundColor Yellow
