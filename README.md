# Avishkar Kapadnis: Portfolio

React (Vite) frontend, Express API, MongoDB database.

## What you need
- Node.js 18 or newer
- MongoDB: either installed locally, or a free MongoDB Atlas cluster

## Run it (development)
1. From this folder: `npm run install:all`
2. Copy `server/.env.example` to `server/.env`
   - set `MONGODB_URI` (local default is already filled in)
   - set `ADMIN_TOKEN` to a long random string (this is your /admin password)
3. Load the certificates, projects and experience into MongoDB: `npm run seed`
4. Start everything: `npm run dev`
5. Open http://localhost:5173

If MongoDB is not reachable, the server says so in the terminal and serves the same content read-only from `server/data/`. The site still works, the contact form saves to `server/data/messages.jsonl`, and /admin stays off.

## Run it as one server (production)
1. `npm run build` (builds the React app into `client/dist`)
2. `npm start`
3. Open http://localhost:5050. Express serves the API and the built site together.

## Where things are
- `client/src/profile.js`: hero text, about, skills, links
- `server/data/*.json`: certificates, projects, experience (loaded into MongoDB by `npm run seed`)
- `server/public/achievements/`: certificate images (full size and thumbnails, WebP)
- `client/public/avatar.jpg`: put your photo here. Until then the site shows your initials.
- `server/src/routes/`: the API (public.js and admin.js)

## Adding certificates later
Open http://localhost:5173/admin (or /admin on your live site), enter your ADMIN_TOKEN, and use the form. Images are resized to WebP automatically. You can also feature, unfeature and delete entries there, and read messages from the contact form.

Re-running `npm run seed` updates the seeded entries (matched by slug) and leaves anything you added from /admin alone.

## API
- GET /api/health
- GET /api/certificates (optional ?category=ctf|cybersecurity|hackathons|web-tech|workshops, ?featured=true)
- GET /api/projects
- GET /api/experience
- POST /api/contact (rate limited, honeypot field, server-side validation)
- /api/admin/* (needs the x-admin-token header)

## Honest labels
Every certificate carries a badge (Participant, Completed, Qualified, Internship, 3rd Place and so on). Keep it accurate when you add new ones.
