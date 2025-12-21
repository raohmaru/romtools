# Database: SQLite

- **Version**: SQLite 3+
- **Client**: SQL.js using a web worker with sql-wasm.js
- **Connection**: Managed via SQL.js

# When working with the database

- Always use SQL.js
- Every table has an `id` primary key (autoincrement() by default)
- Create migrations for all schema changes
- Implement proper error handling
- Use transactions for related operations
- Add indexes for frequently queried fields
- Use pagination for large result sets
- Avoid N+1 queries with proper includes
- Never expose database credentials
- Use environment variables for connection strings
- Test migrations before applying to production

