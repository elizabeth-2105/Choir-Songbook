# Choir Songbook

A simple site for your choir: a public page listing each week's songs (sheet
music PDFs + optional recordings), and a private admin page where you or
another director can upload new songs. Nobody else can upload — everyone else
just views and listens.

## What it's built with
- **Next.js** — the website itself
- **Supabase** (free tier) — stores the song list, the PDF files, the audio
  files, and handles your admin login. No server to manage.
- **Vercel** (free tier) — hosts the live site

## 1. Create your Supabase project
1. Go to https://supabase.com, sign up, and create a new project (pick any
   name/region, remember your database password).
2. Once it's ready, open **SQL Editor** in the left sidebar, click **New
   query**, paste in the entire contents of `supabase-schema.sql` from this
   folder, and click **Run**. This creates the song list table and the two
   storage buckets (`sheet-music`, `recordings`) with the right permissions.
3. Go to **Authentication -> Users** and click **Add user** to create your
   own admin login (your email + a password). This is the only account that
   will be able to upload songs. Add one user per director if more than one
   person should be able to upload.
4. Go to **Settings -> API** and copy two values: the **Project URL** and the
   **anon public** key. You'll need these next.

## 2. Configure the project
1. Copy `.env.example` to a new file named `.env.local`.
2. Paste in your Project URL and anon public key from the step above.

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

## 3. Run it locally
```
npm install
npm run dev
```
Visit http://localhost:3000 for the public song list, and
http://localhost:3000/admin to sign in and upload songs.

## 4. Put it online (free)
1. Push this folder to a new GitHub repository.
2. Go to https://vercel.com, sign up with GitHub, click **Add New -> Project**,
   and import the repository.
3. When it asks for environment variables, add the same two values from your
   `.env.local` (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Click **Deploy**. You'll get a free `your-project.vercel.app` URL right
   away — you can add a custom domain later in Vercel's project settings if
   you'd like.

## Using it week to week
- Go to `/admin`, sign in.
- Fill in the song title, pick the week (this groups songs together on the
  public page), attach the PDF, and optionally attach an audio recording.
- Click **Add song**. It appears on the public homepage immediately.
- To remove a song later, find it in the "Posted songs" list on the
  dashboard and click **Remove**.

## Notes
- File size limits: Supabase's free tier allows files up to 50MB each by
  default, which comfortably covers PDFs and MP3 recordings. If you need
  larger files, it's adjustable in Supabase Storage settings.
- Only accounts you create in Supabase Authentication can sign in to
  `/admin` — there's no public sign-up, so it stays upload-locked to
  directors.
