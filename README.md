# CustomValueMart — React + Firebase Authentication

Responsive React + Vite supermarket app with real Firebase authentication.

## Authentication included
- **Phone login:** Firebase SMS OTP using `signInWithPhoneNumber` + reCAPTCHA.
- **Email login:** Firebase passwordless email sign-in link using `sendSignInLinkToEmail` / `signInWithEmailLink`. Firebase's native web passwordless email method is a one-time sign-in link, not a 6-digit email code.
- Auth state persists through Firebase Auth.
- Logout uses Firebase `signOut`.

## 1. Create a Firebase project

Open the Firebase Console and create a project. Add a **Web app** and copy its configuration into `.env.local`.

## 2. Enable authentication

Firebase Console → Authentication → Sign-in method:

- Enable **Phone**.
- Enable **Email link (passwordless)**. Firebase may require the Email/Password provider to be enabled for email-link authentication.

For phone authentication, also configure the **SMS region policy** and add your production domain to **Authorized domains**. Firebase uses reCAPTCHA for web phone sign-in.

For local testing, use Firebase's fictional phone numbers/test codes in Authentication → Sign-in method → Phone numbers for testing rather than sending repeated real SMS messages.

## 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in all `VITE_FIREBASE_*` values from your Firebase Web app configuration.

## 4. Install and run

```bash
npm install
npm run dev
```

## 5. Production build

```bash
npm run build
npm run preview
```

## Important

Do not put Firebase Admin SDK credentials, service-account JSON, or private keys in this React app. Firebase Web configuration values are client-side configuration; authentication/security rules belong in Firebase Console and server-side code where applicable.

Product images currently use public Unsplash URLs. Replace them with your own CDN/storage URLs for production.

# firebase
# https://console.firebase.google.com/project/customvaluemart-a02de/authentication/providers


# credentials ::
# ================
# Phone number	Verification code	
# +91 5555 555 555	000000	
# +91 88843 44173	000000	
# +91 88888 88888	000000