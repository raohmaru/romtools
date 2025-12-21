# Architecture Decision Records (ADR)

This directory contains Architecture Decision Records (ADRs) that document important architectural decisions made throughout the project.

## What is an ADR?

An Architecture Decision Record is a document that captures:
- An important architectural decision
- The context and constraints that led to the decision
- The consequences of the decision

## Purpose

ADRs help:
- Document the "why" behind architectural choices
- Provide context for future developers and AI agents
- Track the evolution of the system architecture
- Avoid revisiting already-made decisions

## Template

See [template.md](./template.md) for the ADR template to use when creating new records.

## Index

<!-- Add links to ADRs as they are created -->
- [ADR-001: TypeScript as Primary Language](./adr-001-typescript.md)
- [ADR-002: React Functional Components with Hooks](./adr-002-react-hooks.md)
- [ADR-003: Prisma as ORM](./adr-003-prisma-orm.md)
- [ADR-004: React CSS Modules](./adr-004-react-css-modules.md)

## For AI Agents

When making architectural decisions:
1. Consider creating an ADR for significant decisions
2. Review existing ADRs for context on past decisions
3. Use the template to ensure consistency
4. Update this index when adding new ADRs

