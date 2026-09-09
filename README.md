# Carmind AI Main App + Android Build

Mobile-first Carmind smart-car application with registration, customizable
assistant name, Nigerian-English voice understanding, spoken replies, navigation,
internal audio/video playback, multilingual support, training, trial/payment UI,
and connection to the private Carmind control server. This repository contains
both **Carmind Car** and **Carmind Mobile** plus automated APK build workflows from this one repository.

The Android layer supplies native speech recognition and text-to-speech,
foreground hands-free listening, paired-phone contacts/calling and music, phone-hotspot internet sharing,
permitted WhatsApp notification actions, device media volume, file importing
and Android-approved Wi-Fi/Bluetooth panels. The polished Carmind
interface is compiled and bundled into the APK so the core interface can open
without downloading the website.

## Build the installable Android APK

The easiest path is CodeMagic. Upload the **contents** of this project to the
root of a GitHub repository. CodeMagic will detect `codemagic.yaml`; choose
**Carmind AI - Installable Debug APK** and download `app-debug.apk` for the car
screen plus `phone-debug.apk` (Carmind Mobile) for the normal Android phone from the build artifacts.

GitHub Actions is also configured in `.github/workflows/android-apk.yml`.
See `ANDROID_BUILD_README.md` for the exact steps and Android limitations.

## Web deployment

1. Upload every file in this package to one GitHub repository.
2. Set `VITE_CONTROL_SERVER_URL` to the HTTPS address of the separately deployed
   Carmind control server.
3. Run `npm ci` and `npm run build`.
4. Publish the generated `dist` folder using your chosen static host.

Do not place API keys or payment secrets in this repository. Add them through
the server control panel at `https://your-server.example/control`.

## Browser limitation

Chrome requires one genuine user tap to grant microphone/media permission.
After **Start Carmind** is pressed once, the included Web Audio engine supports
hands-free commands while the page remains open. Unrestricted background wake
listening and system Wi-Fi/Bluetooth control require the native Android build.
