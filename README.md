# GAPS Child Health Portal

The Ghana Association of Paediatric Surgeons (GAPS) website and member portal. The project contains a React/Vite frontend and an Express/PostgreSQL API.

## What the app does

- Shows public information, events, research, and news.
- Lets people apply for membership and sign in to the member portal.
- Provides members with a dashboard, profile, and member resources.
- Provides a separate administrator sign-in and dashboard for managing members, events, news, research, and contact messages.
- Highlights recent events and news near the top of the homepage for seven days after they are published.
- Adapts the navigation and page layouts to phone and tablet screen sizes.

Admin and member sign-in use the same API credentials, but separate portal screens. Each screen checks the account role before saving the session, so an admin account must use Admin Portal sign-in and a member account must use Member Portal sign-in.

## Project structure

- `src/` — React application, public pages, member/admin portals, and styles.
- `src/utils/imageUrl.js` — Converts API-relative image paths into browser-loadable URLs.
- `server/` — Express API, authentication, database access, and upload handling.
- `server/uploads/` — Uploaded images. This directory is created automatically by the API and is excluded from Git.

## Run locally

Requirements: Node.js, npm, and a PostgreSQL database configured for the API.

1. Install frontend dependencies from the repository root:

   ```sh
   npm install
   ```

2. Create `server/.env` with the database connection and API settings:

   ```dotenv
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   JWT_SECRET=replace_with_a_long_random_secret
   PORT=5000
   ```

   The database must have the tables and columns used by the API routes. `server/schema.sql` creates these tables in an empty database. Do not commit `.env` files or real credentials.

3. Install backend dependencies and start the API in one terminal:

   ```sh
   cd server
   npm install
   npm run dev
   ```

   The API listens on `http://localhost:5000` by default. Check `http://localhost:5000/api/health` to verify API and database connectivity.

4. In a second terminal, create a root `.env` file and start the frontend:

   ```dotenv
   VITE_API_URL=http://localhost:5000
   ```

   ```sh
   npm run dev
   ```

   Open the local URL printed by Vite. If Vite selects a different local port, the API allows localhost and `127.0.0.1` development origins on any port.

## Images and announcements

- Admin uploads accept JPG, PNG, WEBP, or GIF files up to 5 MB. Member profile photos accept JPG, PNG, or WEBP up to 5 MB.
- Uploaded files are stored on the API server in `server/uploads/` and served from `/uploads/...`. The API permits browsers on a different origin to display these images.
- Homepage announcements combine events and news published within the past seven days and order them newest first. Event age is based on its `created_at` timestamp; news age is based on `published_at`.
- For deployment, configure `VITE_API_URL` to the public API base URL and configure the API CORS origins for the deployed frontend. Persist `server/uploads/` on durable storage if uploaded images must survive server replacement or redeployment.

## Deploy to Render (free tier)

The repository includes a Render Blueprint in `render.yaml` for a static frontend, an API service, and PostgreSQL. To deploy:

1. Push this repository to a Git provider supported by Render; do not include `.env` files, credentials, or database dumps.
2. In Render, create a **Blueprint** from the repository and review the three free services before applying it. If a service name is already taken, change the names in `render.yaml` and update the matching API URL and `CORS_ORIGINS` values there.
3. Wait for the PostgreSQL database and services to finish provisioning. The API gets a generated `JWT_SECRET`; do not replace it with a public or checked-in value.
4. Before using the site, import the existing PostgreSQL database into the new Render database (see below). If starting with an empty database instead, set the Render external database URL in PowerShell and create the tables:

   ```powershell
   $env:RENDER_DATABASE_URL = "your-render-external-database-url"
   psql --dbname=$env:RENDER_DATABASE_URL --file=server/schema.sql
   Remove-Item Env:RENDER_DATABASE_URL
   ```
5. Open the generated static-site URL and check that the API health endpoint at `<API_URL>/api/health` reports a database connection.

### Existing data and free-tier limits

Creating the Render database does **not** copy records from the current database. To keep existing accounts, events, news, and research, export the old database and restore the dump to the new Render database before relying on the deployment. From PowerShell, with PostgreSQL client tools installed, set the old and Render **external** database URLs in your local session (do not paste real URLs into source files or commit them), then run:

```powershell
$env:OLD_DATABASE_URL = "your-old-database-url"
$env:RENDER_DATABASE_URL = "your-render-external-database-url"
pg_dump --format=custom --no-owner --file=gaps-backup.dump $env:OLD_DATABASE_URL
pg_restore --clean --if-exists --no-owner --dbname=$env:RENDER_DATABASE_URL gaps-backup.dump
Remove-Item Env:OLD_DATABASE_URL, Env:RENDER_DATABASE_URL
```

Run the restore only against the newly provisioned, empty Render database; `--clean` replaces objects with matching names. Keep the dump private and remove it after verifying the migration. This does not copy files in `server/uploads/`; those must be transferred separately, and local image files will still be temporary on the selected free plan.

Render free services can sleep when idle, and the free PostgreSQL database expires after its limited trial period (currently 30 days). Uploaded images use `/tmp/gaps-uploads` on the free API service and can disappear on a restart or redeploy. This setup is suitable for a temporary demonstration, **not** durable public use: long-term data and photo retention require moving to paid durable storage/database services and backing up the data before the free database expires.

## Validation

Run these commands from the repository root:

```sh
npm run lint
npm run build
```

The API source uses ES modules and can be syntax-checked with `node --check` on its JavaScript files.
