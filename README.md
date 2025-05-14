# Into The Wild - Adventure Platform

## 1. Overview

Welcome to **Into The Wild**! This platform appears to be designed for organizing and participating in treks and outdoor adventures. It includes features for event management, user registration, expense tracking, packing list coordination, and potentially more.

*(User: Please expand this section with a more detailed project vision, its primary goals, and the target audience.)*

## 2. Core Features & Workflows

This application seems to support several key functionalities:

*   **User Authentication & Profiles:**
    *   User signup (trekker, admin, micro-community partner) and login.
    *   Profile management (bio, avatar, contact details, etc.).
    *   Indemnity acceptance.
*   **Trek Event Management:**
    *   Creating, viewing, updating, and managing trek events.
    *   Details likely include name, description, category, difficulty, dates, location, cost/pricing, capacity, etc.
    *   *(User: Describe the workflow for creating/managing a trek event.)*
*   **Trek Discovery & Registration:**
    *   Users can browse and search for available treks.
    *   Workflow for users to register for a trek, including payment status and pickup location selection.
    *   *(User: Detail the trek discovery and registration process from a user's perspective.)*
*   **Packing List Management:**
    *   Generating and viewing packing lists for specific treks.
    *   Distinguishing between mandatory and optional items.
    *   *(User: Explain how packing lists are created, assigned, and used.)*
*   **Expense Tracking & Splitting:**
    *   Tracking expenses related to a trek.
    *   Functionality for splitting expenses among participants.
    *   Managing expense categories and potentially receipts.
    *   *(User: Describe the expense submission and splitting workflow.)*
*   **Travel Coordination:**
    *   Features to help coordinate travel for trek participants (e.g., carpooling, pickup points).
    *   *(User: Detail how travel coordination is handled.)*
*   **Admin Panel & User Verification:**
    *   Dedicated interface for administrators.
    *   Managing users, potentially verifying micro-community partners.
    *   Overseeing trek events and other platform aspects.
    *   *(User: Outline the key admin functionalities and the user verification process.)*
*   **Comments & Ratings (Potentially):**
    *   Users might be able to comment on treks or rate them.
    *   *(User: If this feature exists, describe how it works.)*

*(User: Add or remove features based on the actual scope of your application. Provide more detailed descriptions for each workflow.)*

## 3. Tech Stack

*   **Frontend:** Next.js (React Framework)
*   **Backend & Database:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
*   **Styling:** Tailwind CSS
*   **Language:** TypeScript
*   **Package Management:** npm / bun (based on `package-lock.json` / `bun.lockb`)
*   **Local Development:** Docker, Supabase CLI, Deno (for Edge Functions)

*(User: Verify and update this list as necessary.)*

## 4. Prerequisites for Development

*   Node.js (LTS version recommended)
*   npm (usually comes with Node.js) or bun
*   Docker Desktop (running)
*   Supabase CLI (Install/Update: `npm install supabase --global`)
*   Deno (Install/Update: `irm https://deno.land/install.ps1 | iex` on PowerShell, then restart terminal)

## 5. Local Development Setup

1.  **Clone the Repository:**
    ```bash
    git clone <your-repository-url>
    cd into-the-wild
    ```

2.  **Install Frontend Dependencies:**
    ```bash
    npm install
    # OR if using bun
    # bun install
    ```

3.  **Initialize Supabase Locally:**
    *   Ensure your Supabase project is linked (if you haven't done this already from a previous setup):
        ```bash
        supabase login
        supabase link --project-ref <your-project-ref>
        # Follow prompts to enter database password if needed.
        ```
    *   Start the local Supabase services:
        ```bash
        supabase start
        ```
    *   This will pull necessary Docker images and set up your local database, auth, storage, etc.
    *   API URL, anon key, and other local Supabase details will be printed to the console. You'll need these for your frontend `.env` file.

4.  **Set up Environment Variables:**
    *   Create a `.env.local` file in the root of your project (if it doesn't exist).
    *   Add the Supabase URL and anon key provided by `supabase start`:
        ```env
        NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 # Or your local Supabase URL
        NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-local-supabase-anon-key>
        # Add any other required environment variables
        ```

5.  **Run Database Migrations:**
    *   The local database schema should be set up automatically by `supabase start` based on your `supabase/migrations` folder.
    *   If you encounter issues or need to reset, use `supabase db reset` (after stopping Supabase and potentially clearing Docker volumes if reset fails).

6.  **Deploy Edge Functions Locally:**
    ```bash
    supabase functions deploy --no-verify-jwt
    ```
    *   Ensure Deno is installed and in your PATH.
    *   An `supabase/functions/import_map.json` is used to manage Deno dependencies.

7.  **Run the Development Server (Frontend):**
    ```bash
    npm run dev
    # OR if using bun
    # bun run dev
    ```
    Your Next.js application should now be running, typically on `http://localhost:3000`.

## 6. Database Migrations

*   Migrations are located in the `supabase/migrations` directory.
*   The primary schema definition appears to be `supabase/migrations/20250505155501_squashed_schema.sql`.
*   **Creating New Migrations:**
    *   For schema changes, it's best to make changes to your local database (e.g., via Supabase Studio or `psql`) and then diff:
        ```bash
        supabase db diff -f <migration_name>
        ```
    *   Or, create an empty migration file and write SQL manually:
        ```bash
        supabase migration new <migration_name>
        ```
*   **Applying Migrations:** Migrations are applied automatically when you run `supabase start` or can be applied with `supabase db reset` (for a clean setup).

## 7. Edge Functions

*   Edge Functions are located in the `supabase/functions` directory.
*   Each function is a separate Deno module.
*   **`signup-automation`:**
    *   **Purpose:** Automates user onboarding tasks upon new user signup.
    *   **Trigger:** Intended to be used with a Supabase Auth hook (e.g., `on_auth_user_created`).
    *   **Actions:**
        *   Updates `public.users` table with `user_type`, `partner_id`, indemnity status, verification status, etc.
        *   Updates `auth.users.app_metadata` with `user_type` and `partner_id` for JWT claims.
    *   **Dependencies:** Uses `@supabase/supabase-js` and `std/http/server.ts` via `supabase/functions/import_map.json`.
    *   **Environment Variables (expected by the function, provided by Supabase runtime):**
        *   `SUPABASE_URL`
        *   `SUPABASE_SERVICE_ROLE_KEY`
*   **Deploying Locally:** `supabase functions deploy --no-verify-jwt`
*   **Import Maps:** A shared `supabase/functions/import_map.json` is used. Consider per-function import maps for more complex projects.

## 8. Available Scripts

*(User: List key scripts from your `package.json` here, e.g., `npm run dev`, `npm run build`, `npm run test`, `npm run lint` etc., and briefly describe what they do.)*

*   `npm run dev`: Starts the Next.js development server.
*   `npm run build`: Builds the Next.js application for production.
*   `npm run start`: Starts a Next.js production server.
*   ...

## 9. Contributing

*(User: Add guidelines for contributing to the project if applicable. This might include coding standards, branch naming conventions, pull request processes, etc.)*

## 10. License

*(User: Specify the license for your project, e.g., MIT, Apache 2.0. If you don't have one, consider adding one.)*
This project is licensed under the [NAME OF LICENSE] License - see the LICENSE.md file for details.
