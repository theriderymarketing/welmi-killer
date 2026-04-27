# OAuth setup — Strava, COROS, Oura

These three steps are **manual web actions** — they cannot be automated, since each provider needs you to log in and approve an app on their portal. Total time: ~10 min.

For all three, the **Authorization Callback / Redirect URI** is:

```
welmikiller://oauth/<provider>
```

Replace `<provider>` with `strava`, `coros`, or `oura`.

---

## 1. Strava

1. Go to **https://www.strava.com/settings/api**
2. Click **Create & Manage Your App** (you'll need any phone number for verification).
3. Fill the form:
   - **Application Name**: `Welmi Killer`
   - **Category**: `Health and Fitness`
   - **Club**: leave blank
   - **Website**: `https://github.com/theriderymarketing/welmi-killer`
   - **Application Description**: `Personal calorie tracking with workout-aware adjustments.`
   - **Authorization Callback Domain**: `welmikiller`  *(Strava asks only the domain — `welmikiller://oauth/strava` is what the app will use)*
4. Upload an icon (any 124×124 PNG).
5. **Save** — you'll get:
   - **Client ID** (numeric)
   - **Client Secret** (long string — keep private)
6. Paste into `~/welmi-killer/.env`:

   ```
   EXPO_PUBLIC_STRAVA_CLIENT_ID=12345
   STRAVA_CLIENT_SECRET=abcdef0123456789...
   ```

> **Bonus**: Strava's official Garmin sync + Apple Watch sync (via Healthfit / RunGap) means most of your users will see Garmin & AW workouts appear automatically through this single connector.

---

## 2. COROS

1. Go to **https://opena.coros.com/**
2. Sign up with the same email as your COROS account.
3. Click **Create Application**:
   - **App Name**: `Welmi Killer`
   - **Description**: `Personal nutrition tracker integrating COROS workouts.`
   - **Redirect URI**: `welmikiller://oauth/coros`
   - **Webhook URL** (optional): leave blank for V1
4. Submit. **Approval takes 3–7 days** — COROS reviews each app manually.
5. Once approved, you'll get **Client ID** and **Client Secret**.
6. Paste into `.env`:

   ```
   EXPO_PUBLIC_COROS_CLIENT_ID=...
   COROS_CLIENT_SECRET=...
   ```

> Until COROS approves, the connector will fail. Strava will still see COROS workouts if you've enabled COROS → Strava sync in the COROS app.

---

## 3. Oura

1. Go to **https://cloud.ouraring.com/oauth/applications**
2. Sign in with your Oura account.
3. Click **New Application**:
   - **Application Name**: `Welmi Killer`
   - **Application Type**: `Personal` (instant approval)
   - **Redirect URIs**: `welmikiller://oauth/oura`
   - **Scopes**: tick `email`, `personal`, `daily`, `heartrate`, `workout`, `session`
4. Save. You'll see **Client ID** and **Client Secret**.
5. Paste into `.env`:

   ```
   EXPO_PUBLIC_OURA_CLIENT_ID=...
   OURA_CLIENT_SECRET=...
   ```

> Personal apps on Oura are limited to **the developer's own account** — perfect for a free, single-user setup. If you ever distribute to other Oura users, you'll need to upgrade to a Sandbox/Production tier (still free).

---

## Test the flow

After pasting credentials:

```bash
cd ~/welmi-killer
npx expo run:ios   # or `npm start` for dev client
```

In-app: **Profile → Connections → tap a provider** → browser opens → approve → returns to app → "Connected ✓".

If the redirect doesn't return to the app:
- Check `app.json` → `expo.scheme === 'welmikiller'`
- For Strava: confirm callback domain is exactly `welmikiller` (no slash, no path)
- iOS sometimes caches scheme registrations — uninstall and reinstall the dev build.

---

## Security notes

- `EXPO_PUBLIC_*` variables are bundled into the app — visible to anyone who reverses the IPA. Use them **only** for clientId values, which OAuth providers consider semi-public.
- `*_CLIENT_SECRET` (without `EXPO_PUBLIC_` prefix) are **never** bundled by Expo's env loader. They're only used during the token exchange step. For OAuth providers that allow public clients (PKCE), prefer that flow and skip the secret entirely.
- Strava and COROS require the secret because they don't support PKCE — accept that the secret will live in the bundle, and rotate it if leaked.
