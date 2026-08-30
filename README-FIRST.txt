CarMind v22.2 SDK-FIX

This package fixes the Codemagic failure:
ZipException: Error on ZipFile unknown archive
while preparing Android SDK Build-Tools 34.0.0.

Fix:
- removes any explicit Build-Tools 34 pin
- uses compileSdk 35 / targetSdk 35
- clears any corrupted Build-Tools 34 partial install/cache before Gradle runs
- preserves the v22.1 Treatment diagnostics and app code

Build workflow:
CarMind v22.2 SDK-FIX Treatment Diagnostics - Debug APK
