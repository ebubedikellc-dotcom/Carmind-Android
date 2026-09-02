# Carmind Android hands-free calling contract

The web application calls the native bridge method:

```text
CarmindAndroid.callContact(contactName)
```

The Android implementation must:

1. Request `READ_CONTACTS` and `CALL_PHONE` at runtime with a clear explanation.
2. Search `ContactsContract.CommonDataKinds.Phone` for the spoken display name.
3. If one exact contact and number match, use `Intent.ACTION_CALL` with a `tel:` URI.
4. If several contacts or numbers match, ask a short spoken clarification.
5. If permission is refused, open the dialler with `Intent.ACTION_DIAL` instead of claiming that a call was placed.
6. Never call premium or emergency numbers from a fuzzy match.

Required manifest permissions:

```xml
<uses-permission android:name="android.permission.READ_CONTACTS" />
<uses-permission android:name="android.permission.CALL_PHONE" />
```
