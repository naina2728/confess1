# Supabase Setup Instructions

## 1. Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Replace the placeholder values with your actual Supabase project URL and anonymous key.

## 2. Database Schema

The database schema has been updated in the `db.sql` file. This includes:

- `confessions` table for storing confession data (now includes `author` field)
- `confession_likes` table for tracking likes
- Row Level Security (RLS) policies
- Triggers for automatic like count updates
- Indexes for performance
- Migration script to add `author` column to existing tables

**IMPORTANT**: If you already have an existing `confessions` table, the migration script in `db.sql` will automatically add the `author` column and populate existing rows with random actor names.

## 3. Features Integrated

✅ **Database Integration**
- Confessions are now stored in Supabase instead of localStorage
- Real-time data persistence across sessions
- Proper error handling and loading states

✅ **Anonymous Posting**
- All confessions are anonymous by default
- Random Hollywood actor pseudonyms are generated and stored in database
- No user identification required
- Actor names are persistent per confession

✅ **Like System Ready**
- Database schema supports likes/hearts
- Functions created for adding/removing likes
- Like counts displayed in the UI

## 4. Next Steps

To enable the like functionality, you can extend the UI to include clickable heart buttons that call the `likeConfession` and `unlikeConfession` functions from `lib/confessions.ts`.

## 5. Running the App

```bash
pnpm install
pnpm dev
```

Make sure your `.env.local` file is configured with the correct Supabase credentials before running the app.
