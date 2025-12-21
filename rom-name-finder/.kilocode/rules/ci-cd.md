# CI/CD Pipeline

This document describes the Continuous Integration and Continuous Deployment pipeline using GitHub Actions.

## Pipeline Overview

```
┌─────────────┐
│   Push/PR   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Lint      │ ◄─── Fast feedback
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Build     │ ◄─── TypeScript compilation
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Test      │ ◄─── Unit + Integration tests
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Deploy    │ ◄─── Staging/Production
└─────────────┘
```

# When working with CI/CD

- Ensure all tests pass before pushing
- Fix linting errors locally before committing
- Follow branch naming conventions
  - Feature Branches: `feature/description` or `feature/issue-number-description`
  - Release Branches: `release/v1.2.0`
  - Hotfix Branches: `hotfix/description`
  - Bug Fixes Branches: `fix/description` or `fix/issue-number-description`
  - Docs Branches: `docs/description`
- Don't skip CI checks
- Update CI/CD config when adding new test types
- Consider deployment implications when changing infrastructure
- Test database migrations in staging first
- Keep deployment scripts idempotent
- Document any manual deployment steps
- Verify environment variables are set correctly

