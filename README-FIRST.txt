CarMind v14 CHECKED (14.0.1)

Use this package instead of the earlier v14 Android package.

Additional checks/fixes:
- microphone loop does NOT start before payment/trial/owner/legacy access is confirmed
- speech recognizer has backoff after errors instead of rapid restart loops
- duplicate recognizer restarts are blocked
- recognizer stops itself if access becomes inactive
- "open <app>" uses Android launcher activities for better app discovery
- all v13/v14 features remain, including Owner Free, Legacy Free, volume commands,
  training sync, payments, parking, trips, weather, navigation and floating mic

Upload the same five root files to GitHub.
Codemagic workflow:
CarMind v14 CHECKED Legacy-Free - Debug APK
