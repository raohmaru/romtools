# ADR-003: Prisma as ORM

## Status

Accepted

**Date**: 2025-12-18

## Context

We need to choose an ORM (Object-Relational Mapping) tool for the SQLite Search Web Application to interact with the database. The application requires a robust solution for database operations with TypeScript integration.

Key considerations:
- TypeScript support and type safety
- Ease of use and learning curve
- Performance characteristics
- Migration and schema management
- Integration with SQLite
- Community support and documentation
- Developer productivity

## Decision

We will use Prisma as the ORM for database operations in the SQLite Search Web Application.

Prisma was chosen because:
- Excellent TypeScript integration with generated type-safe client
- Declarative schema definition with intuitive syntax
- Built-in migration system for database schema management
- Strong ecosystem and active community
- Good performance with query optimization
- First-class support for SQLite
- Excellent developer experience with tooling and autocompletion

## Consequences

### Positive
- Type-safe database queries that catch errors at compile time
- Declarative schema definition that's easy to understand and maintain
- Automated migration generation and management
- Excellent developer experience with IDE integration
- Reduced boilerplate code for common database operations
- Built-in query optimization and performance features

### Negative
- Additional build step required for client generation
- Learning curve for Prisma-specific concepts and syntax
- Dependency on Prisma CLI for development workflow
- Potential vendor lock-in with Prisma-specific features

### Neutral
- Need to run `npx prisma generate` when schema changes
- Migration files need to be committed to version control
- Dependency on @prisma/client package

## Alternatives Considered

- **TypeORM**:
  - Pros: Decorator-based approach, active community
  - Cons: Decorator-based approach can be verbose, less intuitive query API
  - Why rejected: Prisma offers better TypeScript integration and more intuitive API

- **Sequelize**:
  - Pros: Mature library with extensive features
  - Cons: Less TypeScript-friendly, more complex configuration
  - Why rejected: Prisma provides better developer experience and type safety

- **Direct SQLite queries**:
  - Pros: Maximum performance, full control
  - Cons: No type safety, more error-prone, harder to maintain
  - Why rejected: Lack of type safety and maintainability concerns

## Implementation Notes

- Configure Prisma with SQLite provider
- Use Prisma schema to define database models
- Generate Prisma Client for type-safe database operations
- Implement migrations for schema changes
- Use Prisma's query builder for complex queries

## References

- Prisma Documentation: https://www.prisma.io/docs/
- Project PLAN.md
- ADR-001: TypeScript as Primary Language

## Notes

This decision aligns with our goal of building a type-safe, maintainable application and leverages Prisma's excellent TypeScript integration.

## For AI Agents

When implementing code related to this ADR:
- Use Prisma Client for all database operations
- Never use raw SQL queries
- Define models in prisma/schema.prisma
- Run `npx prisma generate` after schema changes
- Use migrations for schema updates
- Leverage Prisma's type safety features