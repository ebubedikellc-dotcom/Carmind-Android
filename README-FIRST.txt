CARMIND ONE — FREE STACK + REMOTE DOCTOR

Upload/replace these 5 ROOT files in GitHub:
1. carmind-app-source.zip
2. codemagic.yaml
3. build.gradle.kts
4. settings.gradle.kts
5. gradle.properties

Then run Codemagic workflow: CarMind ONE - Free Stack + Remote Doctor

What changed:
- Vosk free offline speech engine added (downloads official ~40MB model on first successful setup).
- Android SpeechRecognizer remains only as fallback if Vosk model setup fails.
- Optional Shizuku advanced-control bridge added for Wi-Fi/Bluetooth/mobile-data/media controls where supported.
- Existing navigation, training, commerce/access and Remote Doctor retained.

No paid API key is required by Vosk or Shizuku itself. Shizuku needs user installation/approval for Advanced Control.

This package has been statically prepared and sanity-checked here. Codemagic compile and a real Android device test are still required before calling the behavior proven.
