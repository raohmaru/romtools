# When working with data:
- Always use SQL.js
- Validate input with Zod schemas before database operations
- Include proper error handling for database operations
- Use transactions for operations that must succeed together
- Add indexes for frequently queried fields
- Consider cascade delete behavior when defining relationships

# When creating models:
- Create Zod schemas for validation
- Create DTOs for API responses
- Follow naming conventions (PascalCase for types, camelCase for fields)
- Include required fields (id)
- Use proper TypeScript types, avoid `any`
- Handle null/undefined cases explicitly
- Convert dates to ISO strings for JSON serialization
- Document complex relationships
- Use type guards for runtime type checking
