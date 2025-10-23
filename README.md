# Desi Bass Edits website

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/arjuns-projects-5a2cd717/v0-desi-bass-edits-website)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/GnAC9PlanqL)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/arjuns-projects-5a2cd717/v0-desi-bass-edits-website](https://vercel.com/arjuns-projects-5a2cd717/v0-desi-bass-edits-website)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/GnAC9PlanqL](https://v0.app/chat/projects/GnAC9PlanqL)**

## Database Setup

This application uses Supabase for database persistence. Follow these steps to set up the database:

### Prerequisites
- Supabase project created
- Environment variables configured:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Database Initialization
Run the following SQL scripts in the Supabase SQL editor in order:

1. **Create Tables**: Run `scripts/supabase/001_create_tables.sql` to create the required tables (emails, packs, orders) with proper RLS policies.

2. **Seed Packs Data**: Run `scripts/supabase/002_seed_packs.sql` to initialize the packs table with all 5 volumes. This script is idempotent and safe to run multiple times.

3. **Create Atomic Stock Function**: Run `scripts/supabase/003_atomic_stock_update.sql` to create the PostgreSQL function for atomic stock updates, which handles concurrent requests safely.

### Script Order
Execute the scripts in this exact order:
1. `001_create_tables.sql`
2. `002_seed_packs.sql`
3. `003_atomic_stock_update.sql`

The seed script will populate the packs table with all 5 volumes (vol-1 through vol-5) with their respective titles, price of ₹499, and initial stock of 996 units each.

## Pack Downloads Setup

After users complete a purchase, they can access their downloads from the `/downloads` page.

### Pack Files Storage

Pack files (ZIP archives) can be stored in two ways:

#### Option 1: Static Files (Simpler)
1. Place ZIP files in `public/packs/` directory
2. Name them according to pack IDs: `vol-1.zip`, `vol-2.zip`, etc.
3. Files will be served directly from the public directory
4. **Note**: Large files may impact deployment size and Git repository

#### Option 2: Supabase Storage (Recommended for Production)
1. Create a storage bucket named `packs` in your Supabase project
2. Upload ZIP files with the same naming convention
3. Update `app/api/downloads/route.ts` to generate signed URLs:
   ```typescript
   const { data } = await supabase.storage
     .from('packs')
     .createSignedUrl(`${packId}.zip`, 3600) // 1 hour expiry
   ```
4. Signed URLs provide time-limited, secure access

### Order Flow

1. User completes Razorpay payment
2. Payment success handler calls `/api/orders` to store order records
3. Each pack in the cart gets its own row in the `orders` table
4. User can access downloads at `/downloads` by entering their email
5. Downloads API queries orders by email and returns unique packs

### Environment Variables

In addition to Supabase variables, you need:
- `RAZORPAY_KEY_ID` - Your Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Your Razorpay key secret

### Testing Downloads

To test the downloads flow:
1. Complete a test purchase using Razorpay test mode
2. Go to `/downloads` and enter the email used for purchase
3. Verify that purchased packs appear with download links
4. Ensure ZIP files are accessible and download correctly

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
