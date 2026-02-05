# JobFinder MVP

A minimal web app for job seekers to find opportunities and book interviews with employers. Built to match the SRS (Software Requirements Specification) for the Applied Software Engineering project.

## Stack

- **Backend:** Node.js, Express (MVC), Mongoose
- **Database:** MongoDB
- **Frontend:** EJS templates, plain HTML/CSS/JS

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **MongoDB**  
   Ensure MongoDB is running locally (e.g. `mongod`), or set `MONGODB_URI` in `.env`.

3. **Environment (optional)**  
   Copy `.env.example` to `.env` and adjust:
   - `PORT` (default 3000)
   - `MONGODB_URI` (default `mongodb://localhost:27017/jobfinder`)
   - `SESSION_SECRET` (change in production)

4. **Run**
   ```bash
   npm start
   ```
   Open http://localhost:3000

## Features (MVP)

- **Auth:** Register as Job Seeker or Employer, login, logout, session, hashed passwords
- **Profiles:** Job seekers (name, location, skills, experience); Employers (company name, description)
- **Jobs:** Employers post/edit/delete jobs; Job seekers browse and search/filter
- **Interviews:** Job seekers request interviews (preferred date/time/message); Employers approve/decline and set confirmed time; Both can cancel

## Routes (summary)

| Route | Who | Description |
|-------|-----|-------------|
| `/` | All | Landing or redirect to dashboard |
| `/login`, `/register` | Guest | Auth |
| `/jobs` | Job seeker | Browse & search jobs |
| `/jobs/:id` | Logged in | Job detail; seeker can “Request interview” |
| `/jobs/my`, `/jobs/new`, `/jobs/:id/edit` | Employer | My jobs, create, edit, delete |
| `/interviews` | Logged in | My interviews (list) |
| `/interviews/request/:jobId` | Job seeker | Request interview form |
| `/profiles/edit` | Logged in | Edit own profile |

## Project structure

```
├── config/db.js
├── controllers/   (auth, profile, job, interview)
├── middleware/auth.js
├── models/        (User, Job, Interview)
├── routes/
├── views/         (EJS: auth, jobs, profiles, interviews, partials)
├── public/css/
├── server.js
└── package.json
```
