# AI Smart Complaint System
### AI స్మార్ట్ ఫిర్యాదు వ్యవస్థ

A bilingual (English / Telugu) citizen complaint portal built with React + Vite + Tailwind CSS v4.
Citizens report civic issues with a photo, an on-device "AI" step auto-detects the issue type and
routes it to the right department, and complaints can be tracked by ID or mobile number. Includes
an admin dashboard, SOS emergency dialer, and a notifications feed.

## 1. Install & run

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build       # production build -> dist/
npm run preview      # preview the production build locally
```

Requires Node.js 18+.

## 2. How to use the app (matches the flow you described)

1. **Home** — top action bar has Report Issue / Track Complaint / SOS. Below it: live stats,
   the department grid (Water, Municipal, Health, Roads & Transport, Electricity), and a
   horizontally-scrolling strip of recent complaints.
2. **Login / Register** — enter any 10-digit mobile number to sign in (demo auth, no real backend).
   Use `9876543210` to sign in as the seeded demo user and see sample complaints already on file.
3. **Report Issue** is a 4-step wizard:
   - **Step 1 – Capture Image**: "Camera" opens the device camera (`capture="environment"`),
     "Gallery" opens the file picker.
   - **Step 2 – AI Analysis**: the photo is analyzed in-browser (see `src/utils/aiClassifier.js`)
     and a department is auto-selected with a confidence score.
   - **Step 3 – Details**: description, address, landmark, and **mobile number (mandatory)**
     to verify the complaint.
   - **Step 4 – Review & Submit**: final check, then "Submit Complaint" writes it to local storage
     and shows the success screen with the generated Complaint ID (e.g. `ASC202600125`).
4. **Track Complaint** — search "By Complaint ID" or "By Mobile Number"; tap a result to see full
   tracking history (Submitted → Assigned → In Progress → Resolved).
5. **SOS** — tap any emergency number (Police 112, Ambulance 108, Fire 101, Women Helpline 181,
   Disaster Management 1078, Child Helpline 1098) to open your phone dialer pre-filled with that number.
6. **Notifications**, **Profile** (with the language toggle), and **Admin Dashboard** (`/admin`,
   accessible without login for demo purposes) round out the flow, with a pie chart of
   department-wise complaints and a line chart of the monthly trend.

The language toggle (`EN` / `తె`) in the header switches every screen instantly; the choice is
remembered in local storage.

## 3. How the "AI" actually works

There's no real computer-vision model wired in — building/training one is a separate, much bigger
project. Instead, `classifyComplaintImage()` in `src/utils/aiClassifier.js`:

1. Draws the uploaded photo onto a small in-memory canvas and reads its pixel data.
2. Hashes the average colour/brightness into a deterministic number (the *same* photo always gives
   the *same* result — it isn't random every time).
3. Maps that number to one of 8 issue types (Road Damage, Water Leakage, Garbage Dump, Street Light
   Issue, Power Outage, Health Hazard, Sewage Overflow, Illegal Parking) and looks up the owning
   department in `src/data/departments.js`.
4. Produces a confidence score in the 84–98% range.

**To swap in a real model later**, replace the body of `classifyComplaintImage()` with a call to
an actual vision API (e.g. an image-understanding model, or Google Vision) — the rest of the app
(department routing, the wizard, the review screen) doesn't need to change, since they all just
consume the `{ issueType, department, confidence }` shape that function returns.

## 4. Where the data lives

Everything is stored in the browser's `localStorage` under the `asc_*` keys (`asc_user`,
`asc_complaints`, `asc_notifications`, `asc_lang`) via `src/context/AppContext.jsx` — there is no
server. This is intentional for a self-contained demo/prototype; see section 6 for how to add a
real backend.

## 5. Project structure

```
src/
  context/          LanguageContext (EN/TE) and AppContext (auth, complaints, notifications)
  data/              translations.js, departments.js, seed.js (demo data)
  utils/             aiClassifier.js (mock AI)
  components/        Header, StatusBadge, DepartmentIcon, StepIndicator
  pages/             Home, Login, Register, Dashboard, ReportIssue, ComplaintSuccess,
                     Track, ComplaintDetail, PublicComplaints, SOS, Notifications,
                     Profile, AdminDashboard
```

## 6. Turning this into a production system — suggested next steps

- **Backend**: add a real API (Node/Express, Django, or Firebase) with endpoints for
  auth (OTP-based mobile login), complaint CRUD, and file/image upload to storage (S3, etc).
  Swap the `localStorage` calls in `AppContext.jsx` for `fetch`/`axios` calls to that API.
- **Real AI classification**: send the captured image to a vision model and return
  `{ issueType, confidence }` from the server instead of the client-side heuristic.
- **SMS/WhatsApp notifications**: hook up Twilio or the WhatsApp Business API when a
  complaint status changes.
- **Maps**: replace the "Use Current Location" button with the browser Geolocation API
  plus a real map (Google Maps / Leaflet) for pin-drop location selection.
- **Admin auth & roles**: gate `/admin` behind a real login and role check (officer vs. super-admin)
  instead of leaving it open.
- **Deployment**: `npm run build` produces a static `dist/` folder deployable to Vercel,
  Netlify, or any static host; the backend would be deployed separately.
