# Wheeltrix Feedback Collection System

A full, working feedback collection system: employee registration &amp; login,
a feedback submission form that generates a trackable "ticket", an employee
ticket-history view, and an admin dashboard with live stats and status
management.

**Tools used:** Node.js, Express, MongoDB (via Mongoose), JWT auth,
bcrypt password hashing — plain HTML/CSS/JS on the frontend (no build step).

---

## 1. What's inside

```
wheeltrix-feedback/
├── backend/
│   ├── server.js            # Express app entry point
│   ├── package.json
│   ├── .env.example         # copy to .env and fill in
│   ├── config/db.js         # MongoDB connection
│   ├── models/User.js       # employee accounts
│   ├── models/Feedback.js   # feedback tickets
│   ├── middleware/auth.js   # JWT auth guard
│   └── routes/
│       ├── auth.js          # register / login / me
│       └── feedback.js      # submit / list / stats
└── frontend/
    ├── index.html           # welcome / landing page
    ├── register.html        # employee registration
    ├── login.html           # login
    ├── feedback.html        # employee: submit + view my tickets
    ├── dashboard.html        # admin: all tickets + analytics
    ├── css/style.css
    └── js/api.js            # shared fetch/auth helper
```

## 2. Requirements

- Node.js 18+ and npm
- MongoDB running locally (MongoDB Compass can connect to
  `mongodb://localhost:27017` and create the database for you), or a
  MongoDB Atlas connection string

## 3. Setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set:

```
MONGO_URI=mongodb://127.0.0.1:27017/wheeltrix_feedback
JWT_SECRET=any_long_random_string
PORT=5000
```

If you're using **MongoDB Compass**: open Compass, connect to
`mongodb://localhost:27017`, and you can leave the database name as
`wheeltrix_feedback` — it's created automatically the first time data is
saved. You'll see two collections appear after you use the app: `users`
and `feedbacks`.

## 4. Run it

```bash
npm start
```

Then open **http://localhost:5000** in your browser. The backend also
serves the frontend, so this one URL is all you need — no separate
frontend server or CORS setup required.

## 5. Using the app

1. Go to the welcome page → click **Register**.
2. Fill in your name, employee ID, department, email and password.
   - The **first account ever created becomes an admin automatically**
     (easiest way to demo the admin dashboard). Register a second account
     afterwards for a normal employee view.
3. As an employee: submit feedback (pick a category, star rating, subject,
   details) → you instantly get a ticket number and can see it under
   **My tickets**.
4. As an admin: log in with the admin account → **Admin dashboard** shows
   totals, average rating, top department, and every ticket with a status
   dropdown (Open → In Review → Resolved → Closed).

## 6. Notes for your submission / demo

- Passwords are hashed with bcrypt before being stored — never saved in
  plain text.
- Auth uses signed JWTs (7-day expiry) stored in the browser's
  localStorage and sent as a Bearer token on every API call.
- Feedback tickets store a **snapshot** of the employee's details at
  submission time (name, ID, department, designation) so historical
  tickets stay accurate even if a profile changes later.
- The UI has no external image files — the illustrations are inline SVG,
  so the project has zero broken-image risk and stays lightweight.
- To reset all data, drop the `wheeltrix_feedback` database in Compass and
  restart the server.

## 7. Extending it further (optional ideas)

- Add real email notifications with `nodemailer` when a ticket's status
  changes (the schema already tracks `status` and `adminNote`).
- Add file/screenshot attachments to feedback (would need multer +
  storage).
- Add CSV export of tickets for the admin dashboard.
- Add pagination to the admin ticket table once volume grows.
