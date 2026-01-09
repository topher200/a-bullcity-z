# A-BullCity-Z

A list of spots to check out in the Bull City, from A-Z.

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
