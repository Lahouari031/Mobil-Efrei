# Mobil'Efrei: the EFREI semester abroad guide

Mobil'Efrei gathers everything about each EFREI semester-abroad destination (ING1): budget, best places, student life, culture and language, typical schedule and school resources.
Signed-in students post feedback, the community likes it, and the most useful tips rise to the top. The guide keeps improving every semester.

**Advanced Web Programming Project 2026**: dynamic web application with user authentication.

---

## Stack

| Layer | Technology |
|---|---|
| Front end | Vue 3 (Options API), Vue Router, Vite, HTML5, CSS3, Three.js (3D globe), GSAP (animations) |
| Back end | Node.js, Express.js |
| Database | MySQL with the Sequelize ORM (migrations and seeders via sequelize-cli) |
| Security | bcrypt, express-session (httpOnly cookie), parameterised queries |

## Setup

### Requirements
- Node.js 18 or newer
- A running MySQL server (MAMP, XAMPP, WAMP or a native MySQL install)

### 1. Back end
```bash
cd backend
npm install
cp .env.example .env        # then fill in DB_USER, DB_PASSWORD, SESSION_SECRET…
npm run db:create           # creates the "mobilefrei" database
npm run db:migrate          # creates the tables
npm run db:seed             # adds the admin account + the 3 destinations and their tips
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
- **Admin**: `admin` / the value of `ADMIN_PASSWORD` in `.env` (default `Admin1234`)
- **Student**: sign up on the home page with an `@efrei.net` or `@efrei.fr` address

To reset the database: `npm run db:reset`

---

## Architecture (MVC)

```
backend/src
├── config/config.js        Database connection (read from .env)
├── models/                 M: Sequelize models + relationships (index.js)
├── migrations/             Table creation (versioned)
├── seeders/                Initial data
├── controllers/            C: business logic (auth, destinations, tips, comments)
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
├── views/                  Pages (Landing = sign in / sign up, Destinations, Destination, Admin, 404)
└── components/             Reusable .vue components (AuthPanel, Globe3D, TipTabs, CommentSection…)
```

### Database

```
users (id, email UNIQUE, username UNIQUE, password_hash, role)
destinations (id, slug UNIQUE, country, city, university, flag, summary, language, currency, monthly_budget, image_url)
tips (id, destination_id → destinations, category, title, content, link)
comments (id, user_id → users, destination_id → destinations, content)
likes (id, user_id → users, comment_id → comments)  UNIQUE(user_id, comment_id)
```
Relationships: a destination has many tips and many comments (1-N). A user writes many comments (1-N). Likes are a many-to-many relationship between `users` and `comments`.
The full SQL schema is in `backend/schema.sql`.

### API

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | public | Sign up |
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

---

## Where to find each grading criterion

| Criterion | Where to show it |
|---|---|
| DOM manipulation | `v-reveal` directive (`main.js`): `classList.add` + `IntersectionObserver` |
| CSS specificity and inheritance | `assets/style.css`: ID (`#app`), class, tag and attribute selectors (`a[target="_blank"]`, `button[disabled]`, `input[type="password"]`), variables inherited from `:root`, font inherited by `input` |
| JS event handling (callbacks) | `ScrollTopButton.vue` (`addEventListener('scroll', callback)`), `Globe3D.vue` (mousemove, resize) |
| Vue instance and directives | `main.js` (`createApp`), `v-if`, `v-for`, `v-model`, `v-show`, `v-bind` (`:class`, `:style`) |
| Components and communication | props and `$emit` between `CommentSection` and `CommentItem`, and between `AdminView` and `TipForm` |
| Forms and table | `AuthPanel` (live validation, password strength meter), `TipForm` and the `AdminView` table |
| Express and CRUD | `routes/index.js`, `controllers/*` (full CRUD on tips, destinations and comments) |
| Asynchronous programming | `async/await` everywhere, `Promise.all` (`AdminView`), callback wrapped in a Promise (`regenerateSession`) |
| MySQL and Sequelize | `models/`, `migrations/`, SQL sub-query counting likes (`commentController`) |
| bcrypt | `authController.js`: `bcrypt.hash` (12 rounds) and `bcrypt.compare` |
| Sessions | `app.js` (httpOnly and sameSite cookie), `req.session.regenerate` on sign-in, `destroy` on sign-out |
| Protected routes | `middlewares/auth.js` on the API side, `router.beforeEach` on the front-end side |
| SQL injection | Sequelize generates parameterised queries. Tested with `admin' OR '1'='1`: sign-in is refused |
