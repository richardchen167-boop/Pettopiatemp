# Pet Paradise - Implementation Guide

## Overview
Pet Paradise is a virtual pet simulation game built with React, TypeScript, Vite, and Supabase. This guide will help you port the application to a new Supabase account and get it running.

---

## Prerequisites
- Node.js 18+ installed
- A new Supabase account/project
- Git (to clone the repository)

---

## Step 1: Create New Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Create a new project
3. Wait for the project to finish provisioning (2-3 minutes)
4. Navigate to **Settings** → **API** and copy:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` public key

---

## Step 2: Set Up Environment Variables

Create a `.env` file in the project root with your new Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**IMPORTANT**: Replace the values with YOUR new Supabase project credentials.

---

## Step 3: Clone Repository and Install Dependencies

```bash
# Clone the repository from GitHub
git clone [YOUR_GITHUB_REPO_URL]
cd [project-directory]

# Install dependencies
npm install
```

---

## Step 4: Database Setup

### Option A: Use Consolidated Migrations File (Easiest)

1. Go to your Supabase Dashboard → **SQL Editor**
2. Open the `consolidated_migrations.sql` file included in your 5-file transfer
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click **Run**

This will create all tables, policies, and database objects in one go.

### Option B: Run Individual Migrations (If preferred)

If you have the full `supabase/migrations/` folder from GitHub:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run all migrations
supabase db push
```

---

## Step 5: Configure Authentication

1. Go to **Authentication** → **Providers** in Supabase Dashboard
2. Enable **Email** provider (should be enabled by default)
3. Go to **Authentication** → **URL Configuration**
4. Set **Site URL** to: `http://localhost:5173` (for development)
5. **Disable email confirmation**:
   - Go to **Authentication** → **Email Templates**
   - Click on **Confirm signup** template
   - Toggle off "Enable email confirmations" if needed

---

## Step 6: Seed Initial Data (Optional but Recommended)

Run this SQL in the SQL Editor to add shop items:

```sql
-- Add shop items for hats
INSERT INTO shop_items (name, type, emoji, price) VALUES
('Top Hat', 'hat', '🎩', 100),
('Crown', 'hat', '👑', 500),
('Party Hat', 'hat', '🎉', 50),
('Cowboy Hat', 'hat', '🤠', 150),
('Chef Hat', 'hat', '👨‍🍳', 75),
('Wizard Hat', 'hat', '🧙', 200),
('Santa Hat', 'hat', '🎅', 100),
('Bow', 'hat', '🎀', 80);

-- Add shop items for eyewear
INSERT INTO shop_items (name, type, emoji, price) VALUES
('Sunglasses', 'eyewear', '😎', 50),
('Reading Glasses', 'eyewear', '🤓', 60),
('3D Glasses', 'eyewear', '🥽', 40),
('Heart Glasses', 'eyewear', '😍', 70);

-- Add shop items for toys
INSERT INTO shop_items (name, type, emoji, price) VALUES
('Ball', 'toy', '⚽', 30),
('Bone', 'toy', '🦴', 25),
('Frisbee', 'toy', '🥏', 35),
('Teddy Bear', 'toy', '🧸', 50),
('Yarn', 'toy', '🧶', 20);

-- Add furniture and decor
INSERT INTO shop_items (name, type, emoji, price) VALUES
('Couch', 'furniture', '🛋️', 200),
('Bed', 'furniture', '🛏️', 150),
('Table', 'furniture', '🪑', 100),
('Plant', 'decor', '🪴', 50),
('Painting', 'decor', '🖼️', 75),
('Rug', 'decor', '🧺', 60);
```

---

## Step 7: Run the Application

```bash
# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

---

## Step 8: Create Your First Account

1. Open the app in your browser
2. Click **Sign Up**
3. Enter an email and password
4. You'll be logged in automatically (email confirmation is disabled)
5. Adopt your first pet!

---

## Key Features & Database Tables

### Core Tables
- **pets** - Main pet data (stats, accessories, events)
- **shop_items** - Items available in the shop
- **pet_inventory** - Pets owned by users
- **accessory_inventory** - Accessories owned by users
- **house_inventory** - Furniture and decor items
- **user_settings** - User profiles, bio, username, trade settings
- **trade_requests** - Trading system between users
- **user_activity** - Online status tracking
- **user_sessions** - Login session tracking
- **chat_messages** - Global chat functionality
- **admin_users** - Admin permission system
- **banned_users** - User ban system
- **user_followers** - Follow/follower relationships

### Pet Stats System
Each pet has 5 main stats (0-100):
- **Hunger** - Decreases over time, feed to increase
- **Happiness** - Play and activities increase this
- **Cleanliness** - Decreases over time, clean to restore
- **Energy** - Used for activities, decreases over time
- **Thirst** - Decreases over time, give water to restore

### Activities
- **Pet Salon** (💅) - Increases cleanliness and happiness
- **Playground** (🎪) - Free play, increases happiness
- **Pet School** (🎓) - Learn tricks, earn XP
- **Pet Bakery** (🧁) - Special treats, increases hunger and happiness
- **Dance Class** (💃) - Learn dance moves, increases happiness
- **Sports Center** (⚽) - Exercise, increases happiness

Each activity has a cooldown period and costs coins (except playground).

### Leveling System
- Pets gain XP from activities and interactions
- Leveling up rewards coins
- Level formula: `100 * level` XP needed for next level

### Shop System
- Buy hats, eyewear, toys, furniture, and decor
- Items are stored in inventories
- Accessories can be equipped on pets
- Furniture/decor placed in house

### Admin System
- First user to use admin function becomes super admin
- Super admins can grant/revoke admin to others
- Admins can ban/unban users
- Admin panel in upper right (visible to admins only)

---

## Granting Admin Access

To make yourself an admin:

1. Log in to your Supabase Dashboard
2. Go to **SQL Editor**
3. Run this query (replace with your user ID):

```sql
SELECT grant_admin_access('YOUR_USER_ID_HERE');
```

To find your user ID:
```sql
SELECT id, email FROM auth.users;
```

---

## Environment Configuration for Production

When deploying to production:

1. Update `.env` or hosting platform environment variables:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-production-anon-key
   ```

2. Update Supabase Auth URL Configuration:
   - Add your production URL to **Site URL**
   - Add production URL to **Redirect URLs**

3. Build for production:
   ```bash
   npm run build
   ```

4. Deploy the `dist/` folder to your hosting provider

---

## Troubleshooting

### "Missing Supabase credentials" error
- Check that `.env` file exists in project root
- Verify environment variables are correctly named with `VITE_` prefix
- Restart the dev server after changing `.env`

### Auth not working
- Verify email provider is enabled in Supabase Dashboard
- Check that email confirmation is disabled
- Ensure Site URL is set correctly

### Database errors
- Verify all migrations ran successfully
- Check Supabase logs in Dashboard → Logs
- Ensure RLS policies are created (they should be in migrations)

### "Permission denied" errors
- Check that Row Level Security policies exist
- Verify user is authenticated
- Check browser console for specific error messages

---

## Important Notes

### Row Level Security (RLS)
All tables have RLS enabled. Key policies:
- Users can view all pets but only edit their own
- Users can only modify their own inventories
- Chat messages are public but require authentication
- Admin tables are restricted to admin users only

### Pet Types Available
The app supports 53+ pet types including: cat, dog, fox, bird, rabbit, bear, panda, koala, hamster, mouse, pig, frog, monkey, lion, tiger, cow, turkey, dragon, shark, seal, crocodile, flamingo, duck, turtle, butterfly, elephant, giraffe, dinosaur, crab, lobster, shrimp, squid, octopus, pufferfish, eagle, owl, bat, bee, unicorn, boar, dolphin, whale, leopard, swan, parrot, badger, rat, squirrel, hedgehog, rhino, water buffalo, kangaroo, camel, dromedary, ox, horse, ram, deer, goat, sheep.

### Breed Variants
Many pets have breed variants (e.g., "tabby cat", "golden retriever"). These are stored in the `breed` field.

---

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password)
- **Icons**: Lucide React

---

## Support & Further Development

### Adding New Pet Types
Edit `src/lib/supabase.ts` and add to the Pet type union, then add to the shop_items table.

### Adding New Activities
Edit the `ACTIVITIES` constant in `src/lib/supabase.ts` and update the Activity type.

### Modifying Shop Items
All shop items are in the `shop_items` table. Add new items via SQL or create an admin interface.

---

## Quick Start Checklist

- [ ] Create new Supabase project
- [ ] Copy Project URL and anon key
- [ ] Create `.env` file with credentials
- [ ] Clone repository from GitHub
- [ ] Run `npm install`
- [ ] Run consolidated migrations SQL in Supabase Dashboard
- [ ] Seed shop items (optional)
- [ ] Run `npm run dev`
- [ ] Create account and adopt first pet
- [ ] Grant yourself admin access (optional)

---

## File Structure Reference

```
project/
├── src/
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and config
│   │   ├── supabase.ts   # Supabase client & types
│   │   └── sounds.ts     # Sound effects
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── supabase/
│   └── migrations/       # Database migrations
├── .env                  # Environment variables (create this)
├── package.json          # Dependencies
└── vite.config.ts        # Vite configuration
```

---

**You're all set! Enjoy managing your Pet Paradise!** 🐾
