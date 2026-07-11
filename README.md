# KapHealth

A telemedicine platform: patients book a video check-up, chat with the doctor live,
get an e-prescription, order the medicines on it, and track delivery. Doctors have
their own onboarding + review queue. There's a hidden, owner-only ops console for
managing doctor approvals, orders, complaints, and FAQs.

This is a **real, runnable full-stack codebase** — not a mockup — but three
integrations (WhatsApp, Google, Razorpay) need *your own* credentials before they
work end-to-end. Everything else runs locally out of the box.

```
kaphealth/
├── server/   # Node + Express + MongoDB API, Socket.IO signaling
└── client/   # React + Vite + Tailwind frontend
```

## Quick start

### 1. Backend

```bash
cd server
cp .env.example .env      # then fill in the values (see "Integrations" below)
npm install
npm run seed:admin        # creates your owner admin account from .env
node src/seed/seedDemoData.js   # optional: sample medicines + FAQs
npm run dev               # http://localhost:5000
```

You need a MongoDB instance running — either local (`mongod`) or a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster; put its connection string
in `MONGO_URI`.

### 2. Frontend

```bash
cd client
cp .env.example .env      # then fill in VITE_GOOGLE_CLIENT_ID etc.
npm install
npm run dev                # http://localhost:5173
```

The Vite dev server proxies `/api` and `/socket.io` to `http://localhost:5000`,
so just run both `npm run dev` commands side by side.

## What's already wired up and works locally

- **Auth**: WhatsApp OTP login/signup and Google Sign-In, each producing a JWT
  access token (15 min, in memory) + httpOnly refresh cookie (30 days). Without
  WhatsApp credentials, OTPs are logged to the server console instead of sent
  (`[whatsapp:STUB]`), so you can test the whole flow before going live.
- **Doctor onboarding**: vitals + registration + document upload form → admin
  approval queue → only approved doctors are bookable.
- **Patient booking → video + text chat → e-prescription**: Socket.IO relays
  WebRTC signaling (SDP/ICE) and a persisted text chat per appointment; the
  doctor's prescription form generates a real PDF (via `pdfkit`) on submit.
- **Order → track → review**: ordering against a prescription, COD or online
  payment, an admin-updatable status timeline, and post-delivery reviews.
- **Complaints & FAQs**: both patients and doctors can raise tickets; FAQs are
  audience-scoped (patient / doctor / both).
- **Hidden admin console**: see "Admin panel security" below.
- **Security basics**: helmet, CORS locked to `CLIENT_URL`, rate limiting
  (general + tight limits on OTP and admin login), Mongo/XSS sanitization,
  bcrypt-hashed OTPs and admin passwords, zod validation on every write route.

## Integrations that need your credentials

| Integration | Where | What to do |
|---|---|---|
| **WhatsApp OTP** | `server/.env` → `WHATSAPP_*` | Create a Meta developer app + WhatsApp Cloud API product, get a phone number ID + permanent access token, and get an OTP message template approved. [Docs](https://developers.facebook.com/docs/whatsapp/cloud-api) |
| **Google Sign-In** | `server/.env` → `GOOGLE_CLIENT_ID/SECRET`, `client/.env` → `VITE_GOOGLE_CLIENT_ID` | Create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com/apis/credentials), add `http://localhost:5173` as an authorized origin. |
| **Razorpay payments** | `server/.env` → `RAZORPAY_KEY_ID/SECRET` | Sign up at [Razorpay](https://razorpay.com), grab test-mode keys first. COD needs no gateway — it's handled entirely in-app. |
| **TURN server** | `server/.env` → `TURN_*` | STUN alone (already configured, free, Google's public server) is enough on the same network; for calls across strict NATs/firewalls in production, run [coturn](https://github.com/coturn/coturn) or use a provider like Twilio/Metered and drop the credentials in. |

Nothing else requires third-party signup — MongoDB, the PDF generator, and the
video/chat signaling all run entirely on your own server.

## Admin panel security

The "hidden, only-you" console lives at a route only you know:
`/{ADMIN_ROUTE_SECRET}/login` (default `kap-ops-9f2a1c` — **change this** in
both `server/.env` `ADMIN_PANEL_PATH_SECRET`-style constant and
`client/.env` `VITE_ADMIN_ROUTE_SECRET` before deploying). But the obscure URL
is *not* the actual security boundary — three independent checks stack on
every single admin API call:

1. A valid JWT for a `role: "admin"` user (`requireAuth` + `requireRole`).
2. A secret `x-admin-key` header matching `ADMIN_ACCESS_KEY` in `server/.env`
   (`requireAdminKey` in `server/src/middleware/adminGate.js`) — even a leaked
   admin JWT is useless without this.
3. There is **no public signup route for the admin role at all.** The only way
   to create one is `npm run seed:admin`, run by you, on your own machine/server.

For real production deployment, additionally put an IP allowlist in front of
`/api/admin/*` and the admin frontend route at your reverse proxy/load
balancer layer (nginx, Cloudflare, etc.) — the app-layer checks above are
defense in depth, not a substitute for network-level restriction.

## Design system

- **Palette**: deep clinical teal `#0F6E5B` (primary/trust), warm coral
  `#FF6B4A` (accent/CTAs — deliberately not the common AI-generated
  cream+terracotta pairing), soft green-tinted off-white `#F7F9F6`
  background, near-black green ink `#10241F` for text.
- **Type**: Fraunces (display/headlines), Inter (body/UI), IBM Plex Mono
  (order numbers, vitals, timestamps).
- **Signature element**: a pulse-line-into-checkmark SVG (`PulseDivider`)
  used as a section divider and loading motif throughout — it encodes the
  product's real arc (vitals in, confirmed outcome out) rather than being
  decorative.

## Data model overview

`User` (shared identity, role: patient/doctor/admin) →
`PatientProfile` / `DoctorProfile` (role-specific data, vitals live on both) →
`Appointment` (booking + video room + payment) →
`ChatMessage` (persisted in-call transcript) →
`Prescription` (issued by doctor, PDF generated) →
`Order` (placed against a prescription, COD or online) →
`Payment` (shared ledger for both appointment fees and orders) →
`Review` (doctor or order) / `Complaint` (patient or doctor) / `Faq`.

## Known gaps to close before real production launch

- Add automated tests (none included yet — this is a scaffold, not a
  finished product).
- Swap `xss-clean` (unmaintained) for a maintained sanitizer, or rely on
  React's default escaping + a strict CSP instead.
- Add doctor slot/availability computation from `DoctorProfile.availability`
  instead of the demo's fixed next-5-days generator in
  `DoctorProfileBook.jsx`.
- Add refund handling or your own reconciliation exports.
- Add HTTPS/production process management (PM2, Docker, etc.) and a proper
  CI pipeline.
