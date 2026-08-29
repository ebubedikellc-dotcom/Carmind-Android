# CarMind AI Native Android v3

This is the Codemagic-ready native Android client for `https://carmindai.online`.

## Included

- Live CarMind website inside a secured WebView
- JavaScript/native Android bridge
- Custom assistant name sync (Mercedes, Cynthia, Chidima, etc.)
- Android speech recognition
- Text-to-speech replies
- Foreground microphone listening service
- GPS/location updates sent to the website
- Road/area transition announcements
- Native route-instruction bridge so the backend/navigation layer can say exact instructions
- Google/installed navigation handoff
- Music/video search handoff
- Contact lookup, dialer and SMS handoff
- Car mode that keeps the CarMind screen awake while in use
- Startup receiver and Android-compliant restart behavior
- Codemagic build workflow that outputs an APK and SHA-256 checksum

## Important Android rule

On Android 14+, the OS does not allow a BOOT_COMPLETED receiver to directly start a microphone foreground service. CarMind handles this safely by showing a high-priority `CarMind AI is ready` notification after boot; one tap brings CarMind foreground and starts listening. On older compatible Android versions it attempts to restore the service automatically.

## About always-on wake listening

The included SpeechRecognizer loop gives us a functional first implementation, but Android officially states that SpeechRecognizer is not intended for indefinite continuous recognition. A production-grade low-power "Hello Mercedes" hotword system should use a dedicated on-device wake-word engine. This project is structured so that engine can replace the recognizer loop without changing the site/backend bridge.

## Route announcements

GPS/geocoder announcements can say road/area transitions such as "You just passed X; you are now on Y." Exact "next turn / next town" guidance needs route data. The site/backend can provide that immediately using the native action:

`route_instruction` with `{ "text": "In 500 meters, turn right..." }`

## Codemagic

The root `codemagic.yaml` installs Gradle 8.9, Android API 35 build tools, runs unit tests, builds the debug APK, and publishes the APK artifact.
