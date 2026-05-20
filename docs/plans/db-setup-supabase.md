# Database Connection Setup for Supabase and Postgres

This plan configures the project to support database connections from both local Postgres and remote providers like Supabase. It implements a robust dual-URL setup: one for the application runtime (supporting connection pooling) and one for database migrations/schema pushes (requiring a direct connection).

## Objective
Enable the application to connect to Supabase or standard Postgres, handling SSL requirements and connection pooling correctly.

## Key Files & Context
- `src/lib/db/index.ts`: The main database client initialization.
- `drizzle.config.ts`: Configuration for Drizzle Kit (migrations and schema pushes).
- `.env.example`: Template for environment variables.

## Implementation Steps

### 1. Update Database Client Initialization
Modify `src/lib/db/index.ts` to:
- Dynamically enable SSL for non-local database hosts.
- Ensure the `pg` Pool is configured for remote connectivity.

### 2. Configure Drizzle Kit for Direct Connections
Update `drizzle.config.ts` to use `DIRECT_URL` if available. This is crucial for Supabase users who use a connection pooler (like Supavisor on port 6543) for their application but need a session-based connection (port 5432) for schema migrations.

### 3. Update Environment Variable Templates
Update `.env.example` to include `DIRECT_URL` and provide specific examples for Supabase connection strings.

## Verification & Testing
1. **Local Test**: Verify the app still connects to local Postgres (if available) without SSL issues.
2. **Supabase Test**: Update local `.env` with the provided Supabase credentials and run `npm run db:test` (if applicable) or `npx drizzle-kit push`.
3. **Connectivity Check**: Ensure the application can query data from the remote database.

## Migration for User
The user will need to update their `.env` file:
- Set `DATABASE_URL` to the connection pooler URL (port 6543).
- Set `DIRECT_URL` to the session/direct connection URL (port 5432).
- Add `sslmode=require` if required by the provider.
