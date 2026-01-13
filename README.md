# A-BullCity-Z

A list of spots to check out in the Bull City.

## Overview

A webapp that displays Google Maps with curated locations around Durham, NC (the Bull City). The application shows an interactive map with markers for all locations and a sidebar list for easy browsing.

## Architecture

The application follows a simple flow:

1. **Data Fetching**: Server components fetch all locations from Supabase
2. **Map Display**: Locations are rendered on an interactive Google Map with markers
3. **Sidebar**: A sidebar displays a list of locations that can interact with map markers

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

   Use `npx supabase` (not just `supabase`) to run Supabase CLI commands in this project.

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

## Contributing

### Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.
