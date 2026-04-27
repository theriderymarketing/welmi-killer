# Dev build on iPhone (free Apple ID, sideload)

Two ways to install on a physical device for development:

---

## A. Local Xcode (fastest, requires Mac)

**Prereqs:**
- Mac with **Xcode 16+** installed (`xcode-select --install` then open Xcode once to accept license)
- iPhone running iOS 17+ unlocked, USB-C cable
- A free Apple ID signed into Xcode (`Xcode → Settings → Accounts → +`)

**Steps:**

```bash
cd ~/welmi-killer
npm install
npx expo prebuild --platform ios     # generates ios/ folder
open ios/welmikiller.xcworkspace      # opens Xcode
```

In Xcode:
1. Select the `welmikiller` target → **Signing & Capabilities** tab
2. **Team**: choose your Personal Team (free Apple ID)
3. **Bundle Identifier**: change to `fr.kevinmonin.welmikiller.YOURTAG` (must be unique per device — append your initials or random suffix; Apple disallows reusing IDs across teams)
4. Connect iPhone, select it as run target (top-left dropdown)
5. ⌘R to build & run

**First install on iPhone:**
- iOS will refuse the app the first time. Go to **Settings → General → VPN & Device Management** → trust your developer certificate.
- Re-run from Xcode → it installs.

**Limitations of free signing:**
- Cert expires every **7 days** — re-run from Xcode or use AltStore/SideStore renew
- Max **3 apps** signed simultaneously
- No HealthKit, no push, no background fetch

---

## B. Via AltStore / SideStore (no Xcode needed after first build)

**Prereqs:**
- IPA file (build via EAS or Xcode Archive)
- AltStore or SideStore installed on iPhone
  - **AltStore**: needs AltServer running on your Mac/PC
  - **SideStore**: standalone via WireGuard tunnel — *recommended for autonomy*

**Steps:**

1. Trigger a build:
   ```bash
   git tag v0.1.0
   git push --tags          # CI runs eas build, uploads IPA to GitHub Releases
   ```
   Or local IPA via Xcode: `Product → Archive → Distribute App → Ad Hoc / Development`.

2. On iPhone, open AltStore/SideStore.
3. **Sources → + → Add Source**:
   ```
   https://theriderymarketing.github.io/welmi-killer-data/altstore/apps.json
   ```
4. **Browse → Welmi Killer → Get**.
5. Sign with your free Apple ID (in-app prompt).
6. App installs.

**Renewal:**
- AltStore/SideStore auto-renew the cert every 7 days as long as the AltServer (Mac/PC) is running on the same network.
- SideStore renews via a WireGuard tunnel directly on the phone — no Mac required.

---

## C. Sanity check the proxy

Before the first scan, hit the proxy to wake the Codespace (cold start = 60–90s):

```bash
curl https://welmi-proxy.welmi.workers.dev/health
```

Then in the app: tap **Scan**, take a photo of any food. First call may take ~90s, subsequent calls ~3s.

If you see `welmi_500` errors, the Codespace is asleep — `curl /health` once or wait 60s and retry.

---

## Quick troubleshoot

| Symptom | Fix |
|---|---|
| Xcode: "No signing certificate" | Settings → Accounts → Manage Certificates → + Apple Development |
| App opens, blank screen | Check Metro logs: `npx expo start --dev-client` |
| OAuth redirect doesn't come back | Verify `app.json` scheme + provider redirect URI exact match |
| AltStore says "App not signed" | Free cert expired — open AltStore, refresh apps |
| `welmi_502` | Cold start. `curl /health` and retry in 30s. |
