# Nextronix Backend

Simple PHP + MySQL backend starter.

## Setup

1. Create the database tables by importing:

   ```sql
   backend/schema.sql
   ```

2. Update database credentials in:

   ```txt
   backend/config.php
   ```

3. Start PHP from the project root:

   ```bash
   php -S localhost:8000
   ```

4. Test the backend:

   ```txt
   http://localhost:8000/backend/health.php
   ```

Expected response:

```json
{
  "ok": true,
  "message": "Backend connected to MySQL."
}
```

