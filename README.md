# Carmind AI Main App

Mobile-first Carmind smart-car web application with registration, customizable
assistant name, Nigerian-English voice understanding, spoken replies, navigation,
internal audio/video playback, multilingual support, training, trial/payment UI,
and connection to the private Carmind control server.

Hands-free call intents are included. The website can open the Android dialler
for numbers saved in Settings; the native Android bridge contract for contact
search and direct calling is documented in `ANDROID_CALLING_INTEGRATION.md`.

## GitHub deployment

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
