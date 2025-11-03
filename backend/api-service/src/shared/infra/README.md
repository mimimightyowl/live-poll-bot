# Database Migrations

This folder contains database migration files for the api-service.

We use [node-pg-migrate](https://github.com/thundermiracle/node-pg-migrate) for managing database migrations.

## Migration Structure

Migrations are automatically generated as SQL files following the naming convention:

```
YYYYMMDDHHMMSS_description.sql
```

Example:

- `20241215120000_create-users-table.sql`
- `20241215130000_add-indexes-to-users.sql`

## Creating a New Migration

```bash
npm run migrate:create -- <migration-name>
```

Example:

```bash
npm run migrate:create -- create-users-table
```

This will create a new SQL migration file with `-- UP migration` and `-- DOWN migration` sections.

## Running Migrations

### Apply all pending migrations:

```bash
npm run migrate
```

### Rollback the last migration:

```bash
npm run migrate:down
```

### Rollback and re-apply the last migration:

```bash
npm run migrate:redo
```

## Migration Example

```sql
-- UP migration
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- DOWN migration
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_username;
DROP TABLE IF EXISTS users;
```

## Adding a New Migration

1. Run `npm run migrate:create -- <migration-name>` to create a new migration file
2. Write your SQL statements in the `-- UP migration` section
3. Write rollback SQL in the `-- DOWN migration` section
4. Test the migration on a development database
5. Commit the migration file to version control

## Migration Best Practices

- Keep migrations small and focused on a single change
- Always test migrations on development data first
- Include rollback instructions in comments for complex migrations
- Never modify existing migration files that have been deployed to production
- All migrations are automatically wrapped in transactions by node-pg-migrate
- Write pure SQL - you have full control over the syntax
- Always include both UP and DOWN sections for proper rollback capability

## Configuration

The migration configuration is stored in:

- `.migrations.json` - migrator settings (enables SQL mode with `sql-file: true`)
- `database.json` - database connection settings per environment

Environment variables are automatically loaded from `.env` file.

**Note**: Your project uses SQL migrations (not TypeScript). Delete the old `.ts` migration file if it exists.

## Seeding Development Data

The project includes seed data for development purposes located in `src/shared/infra/seeds/dev-seed.sql`.

### Loading Seed Data

To load the development seed data into your database:

```bash
npm run seed:dev
```

This will populate your database with:

- **3 users**: admin, alice, bob (all with `password_hash='dev_password'`)
- **4 polls**: Various example polls including one with votes
- **14 poll options**: Multiple options for each poll
- **3 votes**: Sample votes on the first poll

### Resetting Database

To completely reset your development database (rollback all migrations, re-apply them, and load seed data):

```bash
npm run db:reset:dev
```

This command will:

1. Rollback the last migration
2. Re-apply all migrations
3. Load the seed data

**⚠️ Warning**: This will delete all existing data in your development database.

### Seed Data Structure

The seed file creates the following data:

**Users:**

- `admin` (id: 1) - email: admin@example.com, telegram_id: 123456789
- `alice` (id: 2) - email: alice@example.com, telegram_id: 987654321
- `bob` (id: 3) - email: bob@example.com

**Polls:**

1. "What's your favorite programming language?" (created by admin, **has votes**)
   - Options: JavaScript, Python, TypeScript, Go
   - Votes: admin→TypeScript, alice→Python, bob→TypeScript
2. "Best time for team meeting?" (created by admin)
   - Options: 9:00 AM, 2:00 PM, 4:00 PM
3. "Preferred communication tool?" (created by alice)
   - Options: Slack, Discord, Telegram, Microsoft Teams
4. "Where should we go for team lunch?" (created by bob)
   - Options: Italian Restaurant, Sushi Bar, Food Court

### Modifying Seed Data

To modify the seed data:

1. Edit `src/shared/infra/seeds/dev-seed.sql`
2. Run `npm run seed:dev` to reload the data (it will clear existing data first)
3. Commit your changes if the seed data should be shared with the team
