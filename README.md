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
cd server/src
cp .env.example .env      # then fill in the values (see "Integrations" below)
cd ..
npm install
npm run seed:admin        # creates your owner admin account from .env
npm run seed:demo         # catalog: medicines (Rx + OTC essentials), coupons, FAQs
npm run seed:test         # full test data: doctors, patients, appointments, orders, reviews, complaints
npm run seed:wellness     # wellness catalogs: foods, workout templates (14 sports), tips
npm run dev               # http://localhost:5000
```

You need a MongoDB instance running — either local (`mongod`) or a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster; put its connection string
in `MONGO_URI`.

**Fastest way to log in while testing:** on the login page, tap "Testing
locally? Use test credentials instead" and sign in with an email + password
from the table `seed:test` prints at the end of the run (all seeded accounts
share one password). This skips WhatsApp entirely. Phone numbers work there
too if you prefer them.

Normal WhatsApp OTP login also works without any WhatsApp account configured
— the OTP is printed to the server console (`[dev] WhatsApp not configured
-- OTP for +91... is: 123456`) instead of being sent; copy it into the login
screen. `ENABLE_TEST_LOGIN=false` in `.env` disables the credentials shortcut
before a real deployment.

`seed:test` also creates two **unapproved** doctors (Dr. Das, MBBS and Dr.
Sanjeev Jain, MD) sitting in "pending review", specifically so you can log in
as admin and test the approve/reject/request-changes actions on real
applications instead of everything arriving pre-approved.

### 2. Frontend

```bash
cd client
cp .env.example .env      # then fill in VITE_GOOGLE_CLIENT_ID etc.
npm install
npm run dev                # http://localhost:5173
```

The Vite dev server proxies `/api` and `/socket.io` to `http://localhost:5000`,
so just run both `npm run dev` commands side by side.

## Phase 2 — OTC essentials store

On top of the original prescription-only ordering flow, patients can now buy
everyday health essentials (vitamins, first aid, personal/baby/skin care,
devices) **without a prescription**, through a proper cart:

- **Store** (`/patient/store`) — search, category filters, sort, wishlist
- **Cart** (`/patient/cart`) — quantities, live pricing, coupon codes
- **Checkout** (`/patient/checkout`) — address + COD/online payment, no
  prescription required (items still require one are blocked from the cart)
- **Wishlist** (`/patient/wishlist`)
- Admin: **Store Catalog** and **Coupons** pages in the ops console for
  managing inventory and discount codes

Prescription-only medicines are unaffected — they're still ordered from a
signed e-prescription via the existing `OrderMedicines` flow. The two flows
share the same `Medicine` catalog and `Order` collection (`orderSource` field
distinguishes them) but are otherwise independent, so the original compliance
guarantee (no Rx drug without a valid prescription) still holds.

New API surface: `GET/POST /api/store/medicines`, `/api/store/cart`,
`/api/store/wishlist`, `/api/store/coupons/check`, `POST /api/orders/checkout-cart`,
plus `/api/admin/medicines` and `/api/admin/coupons` for catalog/coupon management.

## Phase 3 — Notifications, diagnostics, payouts & family care

- **Notifications** — an in-app bell (top nav) covers booking confirmations,
  cancellations, e-prescription ready, order/lab status changes, doctor
  application decisions, and complaint responses. A background job (checked
  every 60s) sends a reminder ~15 minutes before each confirmed appointment.
  Email/SMS "sending" falls back to a console log in dev, same pattern as the
  WhatsApp OTP stub — set `SMTP_*`/`TWILIO_SMS_NUMBER` env vars to wire in a
  real provider later.
- **Lab tests & diagnostics** (`/patient/lab-tests`) — a second store-like
  vertical: browse/search a real diagnostics catalog, bundle multiple tests
  into one home-collection visit, pick a date/time slot, and track status
  from booked → sample collected → processing → report ready. Admin gets a
  **Lab Test Catalog** and **Lab Bookings** console for managing both sides.
- **Doctor earnings & payouts** (`/doctor/earnings`) — doctors see total/weekly/
  monthly earnings, a fee trend chart, and payout history. Admins generate
  payouts for a date range from **Doctor Payouts**, then mark them
  processing/paid with a transaction reference.
- **Admin analytics** (hidden admin panel → **Analytics**) — revenue over
  time, revenue by source (appointments/orders/lab tests), appointment
  volume, and a top-doctors-by-earnings leaderboard, all via `recharts`.
- **Family & health vault** — patients can add dependents (`/patient/family`)
  and book a consult or lab test **on their behalf** via a "who is this for"
  picker on both booking flows. A **Health Vault** (`/patient/health-vault`)
  lets patients upload and store lab reports, vaccination cards, and other
  documents (PDF/JPG/PNG, 10MB max).

New models: `Notification`, `LabTest`, `LabTestBooking`, `Payout`,
`HealthRecord`; `PatientProfile.dependents[]` and `Appointment.bookingFor`
were added for family bookings. New API surface: `/api/notifications`,
`/api/lab-tests` (+ `/bookings`), `/api/health-records`,
`/api/doctors/me/earnings`, plus `/api/admin/lab-tests`, `/api/admin/lab-bookings`,
`/api/admin/payouts`, and `/api/admin/analytics`.

`npm run seed:test` now also seeds one dependent, two sample health records,
one lab booking, and one already-paid payout, so there's real Phase 3 data to
look at immediately — see the credentials table it prints for exactly which
account has what.

## Phase 5 — Wellness: diet, vitals & workout planner

A full fitness/nutrition module, in the same glassmorphism-styled visual
language (`/patient/wellness`):

- **Calculators** — BMI, BMR (Mifflin-St Jeor), TDEE, and body-fat % (U.S.
  Navy method from waist/neck/hip). Stateless — no login needed to try them.
- **Vitals & body metrics** (`/patient/wellness/vitals`) — save timestamped
  entries (weight, measurements, muscle mass) and see a weight trend chart.
  This is the "fat and muscle analysis" tracker.
- **Diet planner** (`/patient/wellness/diet-planner`) — generates a calorie
  + macro target from your goal and latest vitals, plus a sample day of
  meals pulled from a 40-item food database.
- **Calorie counter** (`/patient/wellness/calorie-counter`) — log meals
  against that same food database, with running daily totals against your
  diet plan's target.
- **Workout planner** (`/patient/wellness/workouts`) — a 14-template catalog
  across Boxing, MMA, Wrestling, Gymnastics, Running, Swimming,
  Weightlifting, Yoga, Football, Basketball, Cycling, CrossFit,
  Calisthenics, and Badminton. Adopt a template into your own plan and log
  completed sessions.
- **AI Physique & Diet Reviewer** (`/patient/wellness/ai-reviewer`) — upload
  or camera-capture up to 3 photos for instant feedback. **The verdict text
  is a clearly-labeled placeholder** — real photo storage and request
  history are fully functional today; swapping in a real vision model later
  is a matter of replacing `utils/aiReviewStub.js` with a real API call.
- **Tips & tricks** (`/patient/wellness/tips`) — a short feed of nutrition/
  workout/recovery/hydration/sleep/mindset tips.
- Admin manages the workout template, food, and tips catalogs from the
  hidden admin panel.

New models: `BodyMetric`, `DietPlan` + `MealLogEntry`, `FoodItem`,
`WorkoutTemplate` + `WorkoutPlan`, `WellnessTip`, `AiReviewRequest`. New API
surface under `/api/wellness/*`, plus `/api/admin/workout-templates`,
`/api/admin/foods`, `/api/admin/wellness-tips`. Seed with `npm run seed:wellness`
(40 foods, 14 workout templates, 10 tips).

## Recent fixes & hardening

A pass to fix real bugs found through local testing, harden security for a
real deployment, and give patients/doctors/admin a proper dashboard:

**Fixed**
- `server/.env.example` had gone missing after the `.env` location moved to
  `server/src/.env` — recreated it there, matching what `server.js` actually
  loads.
- `btn-outline` was used on 3 buttons (Home, Showcase, Doctor Dashboard) but
  was never defined in CSS — they rendered completely unstyled.
- Admin dashboard's quick-action links were hardcoded to the *default*
  admin route secret — if you set a custom `VITE_ADMIN_ROUTE_SECRET`, those
  buttons silently pointed at the wrong (default) path. Now relative, so
  they always resolve correctly.
- Unmatched URLs silently rendered the homepage instead of an actual 404 —
  now a real not-found page.
- Removed an orphaned, unrouted leftover page (`patient/DoctorProfile.jsx`,
  superseded by `DoctorProfileBook.jsx`) and a dead `#admin` anchor link.

**Security**
- The server now **refuses to boot in production** if JWT secrets or the
  admin access key are missing *or* still set to the bundled example
  values, and if `ENABLE_TEST_LOGIN` isn't explicitly `"false"` — previously
  these only logged a warning.
- Closed a real gap: the test-login endpoint's admin auto-bootstrap had no
  limit on when it could fire. It's now a genuine one-time bootstrap — it
  only works while zero admin accounts exist anywhere in the system.
- Every login path (OTP, Google, admin, test-login) now rejects
  suspended/deleted accounts *at login*, not just on later requests.
- Removed a hardcoded fallback admin key that activated silently if
  `ADMIN_ACCESS_KEY` was unset.

**Dashboards**
- New patient landing page at `/patient/dashboard` (patients now land here
  after login instead of straight into the doctor list) — hero banner,
  upcoming appointment strip, quick stats (active orders, lab bookings,
  wishlist, health vault), and promo cards cross-linking the doctor/store/
  lab-test flows.
- Doctor dashboard now shows a gradient hero with rating/specialization/fee,
  an inline earnings teaser, and clearer next-appointment/quick-action cards.
- Admin dashboard is now data-rich: the existing stat cards plus a 14-day
  revenue trend chart, revenue-by-source breakdown, and a top-doctors
  leaderboard, pulled from `/admin/analytics`.

## What's already wired up and works locally

- **Auth**: WhatsApp OTP login/signup and Google Sign-In, each producing a JWT
  access token (15 min, in memory) + httpOnly refresh cookie (30 days). Without
  WhatsApp credentials, OTPs are logged to the server console instead of sent
  (`[dev] WhatsApp not configured -- OTP for ...`), so you can test the whole flow before going live.
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

- **Palette (reskinned to dark glassmorphism)**: Slate-950 `#020617` canvas,
  translucent Slate-900 glass cards (`bg-card/65` + `backdrop-blur-2xl`),
  Clinical Emerald `#10b981` / Mint `#34d399` as primary, Rose `#f43f5e` as
  accent (urgent/CTA), plus telemetry status tokens (`status.pending` amber,
  `status.urgent` rose, `status.active` sky, `status.success` mint). The
  semantic token names (`ink`, `muted`, `surface`, `card`, `line`, `primary`,
  `accent`) are unchanged from before — only their values were remapped —
  so the whole patient/doctor app inherited the new look without a
  page-by-page rewrite. The **admin console intentionally stays a separate
  light theme** (it never used these semantic tokens); ping me if you'd
  like that reskinned too.
- **Type**: Fraunces (display/headlines), Inter (body/UI), IBM Plex Mono
  (order numbers, vitals, timestamps) — unchanged.
- **Glass utilities**: `.glass-panel`, `.glass-card`, `.glass-pill`,
  `.telemetry-chip`, `.status-dot` (pulsing status indicator) — used
  throughout Wellness, order tracking, and the consult room.
- **Signature element**: a pulse-line-into-checkmark SVG (`PulseDivider`)
  used as a section divider and loading motif throughout — it encodes the
  product's real arc (vitals in, confirmed outcome out) rather than being
  decorative.
- **Honesty note**: `TrackOrder`'s rider/route animation is a labeled
  **schematic simulation** (driven by real elapsed time since dispatch),
  not a live GPS feed — there's no maps API key or courier location
  integration wired in. The delivery OTP shown there, however, is real:
  generated server-side and stored on the order. Anything that would need
  a similar caveat (escrow payment splits, barcode/courier webhooks) should
  get the same real-data-with-honest-labeling treatment rather than being
  faked.

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
