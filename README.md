# Steno

A Next.js 16 + Supabase web app for teaching stenography, running dictation practice tests, and managing students.

## Features

- Student signup and login with Supabase Auth
- Student dashboard with accessible demo/paid tests
- Practice flow by WPM recording with transcript submission
- Automatic comparison that ignores spaces, case, and punctuation
- Attempt history with score, mistake list, and reference transcript
- Admin dashboard for:
  - adding student users
  - disabling users without deleting their data
  - toggling paid access manually
  - creating demo or paid tests
  - attaching Google Drive audio links and canonical transcripts

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Supabase Auth + Postgres + Row Level Security

## Environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or legacy anon key)
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL`

## Supabase setup

1. Create a Supabase project.
2. Run the SQL migration in `supabase/migrations/202604070001_initial.sql` inside the Supabase SQL editor.
3. Create the one admin auth user manually in Supabase Auth using the same email as `ADMIN_EMAIL`.
4. Start the app and log in with that admin account.

### Important admin note

This v1 app treats the account matching `ADMIN_EMAIL` as the admin. Create that account manually before handing the app to others, and do not allow that email to be used as a student signup.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
```

## Database model

The migration creates these main tables:

- `profiles`
- `tests`
- `recordings`
- `attempts`

It also enables Row Level Security so that:

- students can only see their own profile and attempts
- students only see tests/recordings they are allowed to access
- paid tests only appear for paid users
- disabled users are blocked from protected data

## Transcript scoring

The app normalizes both the submitted transcript and the reference transcript by:

- converting to lowercase
- removing punctuation
- collapsing whitespace

It then compares the normalized word sequence and stores:

- accuracy percentage
- matched word count
- reference/submitted word counts
- mistake details for substitutions, missing words, and extra words

## Notes

- Admin-created users are created with a password you provide in the dashboard.
- Disabling a user only flips `profiles.is_active`; it does not delete attempts or profile data.
- Google Drive links are stored as provided, and common Drive file links are converted to a direct audio URL for playback when possible.
