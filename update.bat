@echo off
title Buff Life — Update & Build
color 0D
echo.
echo  ██████╗ ██╗   ██╗███████╗███████╗    ██╗     ██╗███████╗███████╗
echo  ██╔══██╗██║   ██║██╔════╝██╔════╝    ██║     ██║██╔════╝██╔════╝
echo  ██████╔╝██║   ██║█████╗  █████╗      ██║     ██║█████╗  █████╗
echo  ██╔══██╗██║   ██║██╔══╝  ██╔══╝      ██║     ██║██╔══╝  ██╔══╝
echo  ██████╔╝╚██████╔╝██║     ██║         ███████╗██║██║     ███████╗
echo  ╚═════╝  ╚═════╝ ╚═╝     ╚═╝         ╚══════╝╚═╝╚═╝     ╚══════╝
echo.
echo  Auto-Update ^& APK Build
echo  ════════════════════════════════════════
echo.

:: ── KONFIGURATION ────────────────────────────────────────────────
:: Passe diese Pfade an dein System an!
set REPO_URL=https://github.com/DEINNAME/DEINREPO.git
set PROJECT_DIR=%~dp0
set WWW_DIR=%PROJECT_DIR%www
set ANDROID_DIR=%PROJECT_DIR%android
set APK_OUT=%ANDROID_DIR%\app\build\outputs\apk\debug\app-debug.apk
set APK_DEST=%PROJECT_DIR%Buff-Life-Latest.apk
:: ─────────────────────────────────────────────────────────────────

:: Prüfe ob git installiert ist
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo  [FEHLER] Git nicht gefunden!
    echo  Bitte installieren: https://git-scm.com
    pause & exit /b 1
)

:: Prüfe ob Node installiert ist
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [FEHLER] Node.js nicht gefunden!
    echo  Bitte installieren: https://nodejs.org
    pause & exit /b 1
)

:: ── SCHRITT 1: GitHub pullen ─────────────────────────────────────
echo  [1/4] Hole neueste Version von GitHub...
echo.
if exist "%WWW_DIR%\.git" (
    cd /d "%WWW_DIR%"
    git pull
) else (
    echo  www/ Ordner wird mit GitHub verknüpft...
    if not exist "%WWW_DIR%" mkdir "%WWW_DIR%"
    cd /d "%WWW_DIR%"
    git init
    git remote add origin %REPO_URL%
    git pull origin main
)
if %errorlevel% neq 0 (
    echo.
    echo  [FEHLER] Git pull fehlgeschlagen!
    echo  Prüfe die REPO_URL in dieser Datei.
    pause & exit /b 1
)
echo.
echo  ✓ Code aktuell

:: ── SCHRITT 2: Capacitor sync ────────────────────────────────────
echo.
echo  [2/4] Capacitor sync...
echo.
cd /d "%PROJECT_DIR%"
call npx cap sync
if %errorlevel% neq 0 (
    echo.
    echo  [FEHLER] cap sync fehlgeschlagen!
    echo  Versuche: npm install
    pause & exit /b 1
)
echo.
echo  ✓ Capacitor synchronisiert

:: ── SCHRITT 3: APK bauen ─────────────────────────────────────────
echo.
echo  [3/4] APK wird gebaut (kann 1-2 Min dauern)...
echo.
cd /d "%ANDROID_DIR%"
call .\gradlew assembleDebug --quiet
if %errorlevel% neq 0 (
    echo.
    echo  [FEHLER] Build fehlgeschlagen!
    echo  Öffne Android Studio für Details: npx cap open android
    pause & exit /b 1
)
echo.
echo  ✓ APK gebaut

:: ── SCHRITT 4: APK kopieren ──────────────────────────────────────
echo.
echo  [4/4] APK wird bereitgestellt...
echo.
if exist "%APK_OUT%" (
    copy /Y "%APK_OUT%" "%APK_DEST%" >nul
    echo  ✓ APK gespeichert als: Buff-Life-Latest.apk
    echo.
    echo  ════════════════════════════════════════
    echo  ✅ FERTIG! Buff Life wurde aktualisiert.
    echo  ════════════════════════════════════════
    echo.
    echo  APK: %APK_DEST%
    echo.
    echo  Jetzt auf Handy installieren:
    echo  → Per USB:    adb install "%APK_DEST%"
    echo  → Per Hand:   Datei auf Handy kopieren und öffnen
    echo.
    :: APK-Ordner öffnen
    explorer /select,"%APK_DEST%"
) else (
    echo  [FEHLER] APK nicht gefunden unter:
    echo  %APK_OUT%
    pause & exit /b 1
)

pause
