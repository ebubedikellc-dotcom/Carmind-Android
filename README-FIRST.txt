CarMind v19.2 INSTALL-SAFE

Why this exists:
Google Play Protect hard-blocked the sideloaded v19.1 APK because it declared an Accessibility Service,
which is treated as a sensitive Android-control capability.

This version removes that one Accessibility Service declaration so the APK is much less likely to be
hard-blocked during sideload installation.

Preserved:
- repaired v18.1 base
- quiet hands-free listening
- wake name
- customer name/profile
- Car Name
- home/work
- natural commands
- volume
- Spotify / YouTube Music / YouTube
- Bluetooth / Wi-Fi intentions
- flashlight
- app launching
- navigation / weather / journey context
- contacts / calls / messages
- parking / trips / maintenance
- one-box training
- owner/global knowledge
- pricing / trial / payment
- Legacy Free / Owner Free
- floating microphone

Removed from this sideload-safe build:
- Accessibility-based screen tapping/scrolling/typing/home/back/recents automation.

For that deeper Android-control mode, use a properly distributed/approved build later rather than forcing
a sideloaded APK through Play Protect.
