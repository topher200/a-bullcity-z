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

### Prerequisites

This project uses [Volta](https://volta.sh/) to manage Node.js and npm versions. Install Volta:

```bash
curl https://get.volta.sh | bash
```

Once installed, Volta will automatically use the correct Node.js and npm versions defined in `package.json`.

### Quick Start

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment variables file:

   ```bash
   cp .env.example .env.local
   ```

3. Create a Supabase project at [database.new](https://database.new) and update `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=[YOUR_SUPABASE_PROJECT_URL]
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[YOUR_SUPABASE_PUBLISHABLE_KEY]
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=[YOUR_GOOGLE_MAPS_API_KEY]
   ```

   > [!NOTE]
   > Find these values in your [Supabase project's API settings](https://supabase.com/dashboard/project/_?showConnect=true).

4. Run the development server:

   ```bash
   npm run dev
   ```

   Open [localhost:3000](http://localhost:3000/) in your browser.

### Template

Created from the template at <https://demo-nextjs-with-supabase.vercel.app>
