# A-BullCity-Z

A list of spots to check out in the Bull City, from A-Z.

## Overview

A webapp that displays Google Maps with preselected locations filtered by first
letter -- perfect for doing bar crawls from A-Z. Users navigate to routes like
`/a` or `/b` to view locations starting with that letter. Each page shows an
interactive map with markers and a sidebar list of locations.

## Architecture

The application follows a simple flow:

1. **User Navigation**: Users visit letter-specific routes (e.g., `/a`, `/b`)
2. **Data Fetching**: Server components fetch locations from Supabase filtered by the first letter
3. **Map Display**: Locations are rendered on an interactive Google Map with markers
4. **Sidebar**: A sidebar displays a list of locations that can interact with map markers

The system integrates:

- **Next.js** for routing and server-side rendering
- **Supabase** for location data storage
- **Google Maps JavaScript API** for map rendering and geocoding

## Local Development Setup

### Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project at [database.new](https://database.new).

3. Link your project and push migrations:

   ```bash
   npx supabase link --project-ref [YOUR_PROJECT_REF]
   npx supabase db push
   ```

   Find your project ref in the Supabase dashboard URL: `https://supabase.com/dashboard/project/[PROJECT_REF]`

4. Copy the environment variables file:

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your Supabase credentials from [your project's API settings](https://supabase.com/dashboard/project/_?showConnect=true):

   ```env
   NEXT_PUBLIC_SUPABASE_URL=[YOUR_SUPABASE_PROJECT_URL]
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[YOUR_SUPABASE_PUBLISHABLE_KEY]
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=[YOUR_GOOGLE_MAPS_API_KEY]
   ```

5. Run the development server:

   ```bash
   npm run dev
   ```

   Open [localhost:3000](http://localhost:3000/) in your browser.

### Optional: Node.js Version Management

This project uses [Volta](https://volta.sh/) to manage Node.js and npm versions:

```bash
curl https://get.volta.sh | bash
```

### Template

Created from the template at <https://demo-nextjs-with-supabase.vercel.app>
