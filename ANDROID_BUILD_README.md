# Carmind AI Android build

Version 2.0.0 keeps customer-led personal-pronunciation learning and adds the cost-controlled Carmind brain router. Known Android commands remain local and free. Unknown phrases go to the private Qwen server, and optional Grok is used only when Qwen is uncertain. Grok always speaks as the car. Owner-approved Grok suggestions become reusable Qwen lessons through the separate control panel.
was introduced. Whisper.cpp, its native module, model download and all build
references are removed from both applications. The cloud build downloads and
verifies the offline Vosk English model before bundling it. Voice recognition
works locally after installation without a paid speech API. Carmind restarts
and health-checks Vosk after returning to the app, after media playback and
after speech output so a stale microphone session is not reused.
It also retains Vosk's latest partial phrase until the driver finishes,
supports spoken corrections such as “When you hear Night Breathe, I mean Night
Bridge,” and keeps those personal corrections when Settings is saved.
The media scanner now denies unknown folders and chat-app storage by default.
Music is accepted only from Music or Songs folders; video is accepted only
from Movies, Music Videos or Videos folders. The interface and voice commands
separate the two libraries.
It queues the first welcome or answer until Android Text-to-Speech is fully
ready, falls back from Nigerian English to the requested British English voice,
and routes spoken replies through the media output used by car Bluetooth.
Before every answer it leaves the narrow Bluetooth call channel and returns to
the loud media/A2DP route, then rebuilds the Bluetooth microphone route after
speaking. The voice rate is set to a clear natural pace instead of slow speech.
If Android's TTS initialization callback stalls, Carmind now releases the
pending answer after 2.5 seconds, restores listening and invokes the browser
voice fallback. It can no longer remain permanently stuck in SPEAKING mode.

Both applications use the shared Carmind server at `https://carmindai.online`.
When local command matching is uncertain, the app sends only the recognised
text and context to `/api/ai/intent`. The private server's Qwen3 8B resolver
interprets the intended meaning; Carmind's own allowlist still validates and
executes every command. Qwen never controls Android directly.

This repository contains one Carmind interface and two native Android applications: **Carmind Car** for an Android car screen and **Carmind Mobile** for a normal Android phone. Carmind Mobile asks whether the vehicle has an Android screen. With a screen, the apps pair over Bluetooth and the phone hotspot supplies internet; without a screen, Carmind Mobile runs the full assistant and sends audio through the vehicle’s ordinary Bluetooth system.

## CodeMagic: build the test APK

1. Extract the delivery ZIP before uploading it. `codemagic.yaml` must be visible at the top level of the GitHub repository, beside `package.json` and the `android` folder.
2. Commit and push all files to the `main` branch.
3. In CodeMagic, press **Check for configuration file** or refresh the application.
4. Select **Carmind AI - Installable Debug APK**.
5. Start the build. Download both APKs from **Artifacts**: `app-debug.apk` (**Carmind Car**) and `phone-debug.apk` (**Carmind Mobile**).

The sideloadable Carmind Mobile debug APK intentionally excludes WhatsApp
notification-listener access because Play Protect can completely block an
unreviewed APK that declares this sensitive capability. Voice, media,
Bluetooth, hotspot, maps, contacts and calling tests remain available. Enable
WhatsApp notification integration only in the signed production distribution
after store review and explicit customer consent.

The debug APK is signed automatically with the Android debug certificate and can be installed for testing. It is not a Play Store release.

## GitHub Actions alternative

Open **Actions**, select **Build Carmind Android APK**, then choose **Run workflow**. The downloadable artifact is named `Carmind-AI-car-and-phone-APKs`.

## Release signing

The release workflow creates an unsigned Android App Bundle. Before Play Store publishing, create and securely store the owner's release keystore, add it to CodeMagic's Android code-signing identities, and connect that signing identity to the release workflow. Never commit the keystore or its passwords to GitHub.

## Android restrictions that remain visible to the driver

- Modern Android requires a user confirmation panel for Wi-Fi changes and Bluetooth pairing/connection.
- Contact calling requires Contacts and Phone permission.
- The two devices must first be paired in Android Bluetooth settings. Carmind then connects them locally using its private Bluetooth service.
- WhatsApp access is limited to new Android notifications the user explicitly permits. Full chat history is not accessible; voice reply works only when WhatsApp exposes a notification reply action.
- Voice recognition is local and does not require a paid speech API. Final quality still depends on the phone/car microphone, cabin noise and the car's Bluetooth microphone routing.
- Google routing, YouTube search, Spotify search, payment verification, and connected AI answers require their server-side API configuration and internet access.
- A true locked-car launcher/kiosk requires device-owner provisioning by the vehicle/tablet administrator; an ordinary APK cannot silently make itself device owner.
