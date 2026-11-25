# Mobil'Efrei: the EFREI semester abroad guide

Mobil'Efrei gathers everything about each EFREI semester-abroad destination (ING1): budget, best places, student life, culture and language, typical schedule and school resources.
Signed-in students post feedback, the community likes it, and the most useful tips rise to the top. The guide keeps improving every semester.

**Advanced Web Programming Project 2026**: dynamic web application with user authentication.

---

## Stack

| Layer | Technology |
|---|---|
| Front end | Vue 3 (Options API), Vue Router, Vite, HTML5, CSS3, Three.js (3D globe), GSAP (animations), Leaflet (maps) |
| Back end | Node.js, Express.js |
| Database | MySQL with the Sequelize ORM (migrations and seeders via sequelize-cli) |
| Security | bcrypt (bcryptjs), express-session (httpOnly cookie), parameterised queries, email verification code, password reset by code |
| External APIs | OpenStreetMap tiles (map), Nominatim (address → coordinates), TikTok oEmbed + embed player (videos) |

## Quick start (from the project root)
```bash
npm run setup        # creates backend/.env and installs everything
                     # -> open backend/.env and fill in DB_PASSWORD and ADMIN2_PASSWORD
npm run db:setup     # creates the database, the tables and the starter data
npm run dev          # starts the API (port 3000) AND the website: http://localhost:5173
```
After pulling new changes: `npm run setup` then `npm run db:reset`.

## Setup (step by step)

### Requirements
- Node.js 18 or newer
- A running MySQL server (MAMP, XAMPP, WAMP or a native MySQL install)

### 1. Back end
```bash
cd backend
npm install
cp .env.example .env        # then fill in DB_USER, DB_PASSWORD, SESSION_SECRET, ADMIN2_PASSWORD…
npm run db:create           # creates the "mobilefrei" database
npm run db:migrate          # creates the tables
npm run db:seed             # adds the 2 admin accounts + the 3 destinations and their tips
npm run dev                 # API on http://localhost:3000/api
```

### 2. Front end (in a second terminal)
```bash
cd frontend
npm install
npm run dev                 # website on http://localhost:5173
```

Vite forwards `/api` calls to port 3000, so there is no CORS to configure.

### Accounts
- **Admin 1**: `admin` / the value of `ADMIN_PASSWORD` in `.env` (default `Admin1234`)
- **Admin 2**: `laboiserie` (`lahouari.guetarni@efrei.net`) / the value of `ADMIN2_PASSWORD` in `.env`.
  On a database that already exists, create it with: `npx sequelize-cli db:seed --seed 20261124000001-second-admin.js`
- **Student**: sign up on the home page with an `@efrei.net` address (the only domain accepted, front end and back end)

Admin accounts never need an email code.

### Email codes: verification and forgotten password (important for the demo)
Two features send a **6-digit code** by email:
- **Sign up** (or sign in with an account that is not verified yet): the site asks for the code to confirm the EFREI address.
- **Forgot password?** (link under the password on the Sign in form): enter your email, receive a code, then choose a new password.

By default no real email is sent: the email is **printed in the terminal where the back end runs** (`npm run dev`):
```
┌─ 📧 Email to firstname.lastname@efrei.net
│  Mobil'Efrei – Reset your password
│  Your password reset code is 482913. It is valid for 10 minutes. …
└──────────────────────────────
```
Copy the code into the form. A code is valid for 10 minutes, allows 5 attempts and only its bcrypt hash is stored (in the session).
To send real emails, fill in `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` in `.env` (e.g. Gmail with an app password).
The "forgot password" answer is always the same, so nobody can find out which emails have an account.

To reset the database: `npm run db:reset`

---

## Architecture (MVC)

```
backend/src
├── config/config.js        Database connection (read from .env)
├── models/                 M: Sequelize models + relationships (index.js)
├── migrations/             Table creation (versioned)
├── seeders/                Initial data
├── controllers/            C: business logic (auth, destinations, tips, comments, urgent alerts, videos)
├── services/tiktokPreview.js  Calls the TikTok oEmbed API (video thumbnails), with a 1-hour cache
├── services/mailer.js      Sends the codes by email (SMTP) or prints them in the terminal
├── routes/index.js         URL → middlewares → controller
├── middlewares/            requireAuth / requireAdmin, error handling
├── validators/             Server-side input validation
├── app.js                  Express setup (JSON, sessions, routes)
└── server.js               Start-up

frontend/src                V: the Vue interface
├── main.js                 Vue instance + global v-reveal directive
├── router/                 Routes + navigation guard (protected pages)
├── store/auth.js           Global state of the signed-in user
├── api/client.js           HTTP calls (fetch, async/await)
├── views/                  Pages (Landing = sign in / sign up, Explore = 3D globe, Destinations, Destination, Admin, 404)
└── components/             Reusable .vue components (AuthPanel, Globe3D, TipTabs, TipMap, TikTokVideos, UrgentAlerts, CommentSection…)
```

### Database

```
users (id, email UNIQUE, username UNIQUE, password_hash, role, email_verified_at)
destinations (id, slug UNIQUE, country, city, university, flag, summary, language, currency, monthly_budget, image_url)
tips (id, destination_id → destinations, category, title, content, link, address, latitude, longitude)
urgent_alerts (id, destination_id → destinations, title, details, alert_date, active)
videos (id, destination_id → destinations, title, url)
comments (id, user_id → users, destination_id → destinations, content)
likes (id, user_id → users, comment_id → comments)  UNIQUE(user_id, comment_id)
```
Relationships: a destination has many tips, comments, urgent alerts and videos (1-N). A user writes many comments (1-N). Likes are a many-to-many relationship between `users` and `comments`.
The full SQL schema is in `backend/schema.sql`.

### API

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | public | Sign up |
| POST | `/api/auth/verify-email` | public (pending session) | Check the 6-digit code |
| POST | `/api/auth/forgot-password` | public | Send a password reset code |
| POST | `/api/auth/reset-password` | public (pending session) | Code + new password |
| POST | `/api/auth/login` | public | Sign in (email or username) |
| POST | `/api/auth/logout` | public | Sign out |
| GET | `/api/auth/me` | public | Current user |
| GET | `/api/destinations` | signed in | List |
| GET | `/api/destinations/:slug` | signed in | Details and tips |
| POST / PUT / DELETE | `/api/destinations[/:id]` | admin | Destinations CRUD |
| GET | `/api/tips` | signed in | List of tips |
| POST / PUT / DELETE | `/api/tips[/:id]` | admin | Tips CRUD |
| GET / POST | `/api/destinations/:id/comments` | signed in | Read / post (sorted by likes) |
| PUT / DELETE | `/api/comments/:id` | author (or admin for DELETE) | Edit / delete |
| POST / DELETE | `/api/comments/:id/like` | signed in | Like / unlike |
| GET | `/api/destinations/:id/urgent-alerts` | signed in | Active alerts of a destination |
| GET / POST | `/api/urgent-alerts` | admin | All alerts / publish an alert (older alerts are kept) |
| PUT | `/api/urgent-alerts/:id` | admin | Activate / deactivate, edit |
| GET | `/api/destinations/:id/videos` | signed in | TikTok videos with their preview (thumbnail, caption, author) |
| GET / POST | `/api/videos` | admin | All videos / add a TikTok link |
| DELETE | `/api/videos/:id` | admin | Delete a video |

---

## Where to find each grading criterion

| Criterion | Where to show it |
|---|---|
| DOM manipulation | `v-reveal` directive (`main.js`): `classList.add` + `IntersectionObserver` |
| CSS specificity and inheritance | `assets/style.css`: ID (`#app`), class, tag and attribute selectors (`a[target="_blank"]`, `button[disabled]`, `input[type="password"]`), variables inherited from `:root`, font inherited by `input` |
| JS event handling (callbacks) | `ScrollTopButton.vue` (`addEventListener('scroll', callback)`), `Globe3D.vue` (pointer, resize), `NavBar.vue` (click outside / Escape closes the menu) |
| Vue instance and directives | `main.js` (`createApp`), `v-if`, `v-for`, `v-model`, `v-show`, `v-bind` (`:class`, `:style`) |
| Components and communication | props and `$emit` between `CommentSection` and `CommentItem`, and between `AdminView` and `TipForm` |
| Forms and table | `AuthPanel` (required fields marked with *, live validation, password strength meter, forgot password), `TipForm` and the `AdminView` table |
| Navigation | `NavBar.vue`: hamburger menu (3 lines → cross), `aria-expanded`, closes on page change |
| Express and CRUD | `routes/index.js`, `controllers/*` (full CRUD on tips, destinations and comments) |
| Asynchronous programming | `async/await` everywhere, `Promise.all` (`AdminView`), callback wrapped in a Promise (`regenerateSession`) |
| MySQL and Sequelize | `models/`, `migrations/`, SQL sub-query counting likes (`commentController`) |
| bcrypt | `authController.js`: `bcrypt.hash` (12 rounds) and `bcrypt.compare` (bcryptjs: same algorithm, pure JavaScript, nothing to compile on Windows) |
| Sessions | `app.js` (httpOnly and sameSite cookie), `req.session.regenerate` on sign-in, `destroy` on sign-out |
| Protected routes | `middlewares/auth.js` on the API side, `router.beforeEach` on the front-end side |
| SQL injection | Sequelize generates parameterised queries. Tested with `admin' OR '1'='1`: sign-in is refused |
| External APIs | `TipMap.vue` (Leaflet + OpenStreetMap tiles), `TipForm.vue` (Nominatim geocoding, "Locate" button), `services/tiktokPreview.js` (TikTok oEmbed) and `TikTokVideos.vue` (TikTok embed player) |

## Destination page
- **Tabs** (Budget, Best places, Student life, Culture & language, Typical schedule, EFREI resources): the tips, managed in the admin area.
- **Map** (bottom of the *Best places* tab): every tip with coordinates is a pin on an OpenStreetMap map (click → tip + directions). In the admin form, type an address and click **Locate** to fill the latitude / longitude automatically.
- **Videos** (end of the page, just above the comments): grid of TikTok previews; clicking one plays it in a player on the page (no redirection). Admins add the links in the admin area.
- **Urgent alerts** (top right): published by an admin for one destination, kept in history, and only shown while they are active.

---

## Common problems (Windows)

| Message | Fix |
|---|---|
| `npm : Impossible de charger le fichier … npm.ps1` / `running scripts is disabled` | In PowerShell, once: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` (answer `O`/`Y`) |
| `npm warn install-scripts … esbuild` | `cd frontend`, `npm install-scripts approve esbuild`, `npm rebuild esbuild`, `cd ..` |
| `mysql` is not recognised | Normal: the project does not need this command. Check that the MySQL **service** runs: `Get-Service *mysql*` → `MySQL84 Running` |
| `Get-Service *mysql*` shows nothing | MySQL is not installed: https://dev.mysql.com/downloads/mysql/8.4.html → Windows MSI Installer → Typical → MySQL Configurator (port 3306, choose a root password) |
| MySQL Configurator asks for an old root password | Old data from a previous install: close it, in an **administrator** PowerShell run `Rename-Item "C:\ProgramData\MySQL" "MySQL_old"`, then open MySQL Configurator again |
| `[api] ❌ Unable to connect … ECONNREFUSED` | MySQL is stopped or `DB_PORT` is wrong (3306 on Windows, 8889 with MAMP) |
| `[api] ❌ Unable to connect … Access denied` | `DB_PASSWORD` in `backend/.env` is not the MySQL root password |
| `[api] ❌ Unable to connect … Unknown database` | Run `npm run db:setup` |
| "Something went wrong." on the website | The API is not running: read the `[api]` lines in the terminal |
| Cannot sign in with the admin account | `npm run db:reset` recreates both admins with the passwords of `backend/.env` |

To look at the data: MySQL Workbench (https://dev.mysql.com/downloads/workbench/) → Local instance → schema `mobilefrei`.

