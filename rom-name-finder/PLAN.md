# SQLite Search Web Application - Implementation Plan

This document outlines the step-by-step implementation plan for a search application that searches in a local SQLite database using Prisma. All the implementation is done in the frontend (there is no backend).
Please only implement one feature at a time, stop the implementation after the feature and update the PLAN.md file.
All tasks follow the best practices documented in the `.kilocode/rules/` folder.

## Project Overview

**Application**: Web SQLite Search
**Stack**: TypeScript, React, Vite, Prisma, SQLite, CSS Modules, Vitest
**Features**:
- UI to search in a local SQLite database using Prisma
- The SQLite databases are stored in files
- The user can select which SQLite database to use
- The user can input search terms
- The search is performed using Prisma ORM with the @prisma/adapter-better-sqlite3 driver adapter
- Prints the matches
**User flow**:
1. User is presented with a form that contains:
  - Textarea field
  - Select
  - Button
2. The user inputs search terms in the textarea field
3. The user selects which database to use from the select
4. The user presses the Search button
5. Search matches are shown below the form
**Documentation**:
  docs/
  ├── adr/                # Architecture Decision Records
  ├── .kilocode/          # Kilo Code configuration
  │   ├── memory-bank/    # Memory bank files
  │   └── rules/          # Project rules and guidelines
  ├── GLOSSARY.md         # Project terminology
  └── README.md           # Documentation overview
  CHANGELOG.md            # Project changelog (in root)
  PLAN.md                 # Implementation plan (in root)

--- 

## Phase 1: Project Setup & Foundation

### Task 1.1: Initialize Project Structure
**Status**: ⬜ Pending

- [ ] Create project root directory structure following React and Prisma best practices
  ```
  project-root/
  ├── frontend/
  ├── prisma/
  ├── docs/
  └── db/
  ```
- [ ] Initialize frontend with Vite + React + TypeScript + Vitest
  - Configure EditorConfig, ESLint and Prettier
  - Add .gitignore with default for React projects
  - Set up path aliases (`@/components`, `@/hooks`, etc.)
  - Set up `package.json` with TypeScript dependencies
  - Configure `tsconfig.json` with strict mode
- [ ] Set up initial `README.md` files

---

### Task 1.2: Configure Prisma with SQLite using the better-sqlite3 driver
**Status**: ⬜ Pending

- [ ] Install Prisma CLI: `npm install -D prisma`
- [ ] Install Prisma Client: `npm install @prisma/client dotenv`
- [ ] Install better-sqlite3 driver: `npm install @prisma/adapter-better-sqlite3`
- [ ] Initialize and configure Prisma: `npx prisma init`
- [ ] Configure `prisma/schema.prisma`:
  - Set provider to `sqlite`
- Create `prisma.config.ts` in the root of the project:
```ts
import 'dotenv/config'
import { defineConfig, env } from "prisma/config";
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: 'file:./db/dev.db',
  },
});
```
- [ ] Create initial schema with Game model (basic fields only)
  ```prisma
  model Game {
    id    Int     @id @default(autoincrement())
    rom   String
    name  String
  }
  ```
- [ ] Run first migration: `npx prisma migrate dev --name init`
- [ ] Generate Prisma Client: `npx prisma generate`

---

### Task 1.3: Set Up Development Environment
**Status**: ⬜ Pending

- [ ] Set up environment variables:
  - Frontend: `VITE_API_URL`, `VITE_APP_NAME`
- [ ] Configure VS Code workspace settings
- [ ] Set up npm scripts:
  - `dev`: Start development servers
  - `build`: Build for production
  - `test`: Run tests
  - `lint`: Run linters

---

## Phase 2: Database Schema & Models

### Task 2.1: Design Database Schema
**Status**: ⬜ Pending  

- [ ] Design Game model:
  ```prisma
  model Game {
    id    Int     @id @default(autoincrement())
    rom   String
    name  String
  }
  ```

---

### Task 2.2: Create Database Migrations
**Status**: ⬜ Pending  

- [ ] Write Prisma schema in `prisma/schema.prisma`
- [ ] Create migration: `npx prisma migrate dev --name add_game_model`
- [ ] Review generated SQL migration file
- [ ] Test migration rollback (if needed)
- [ ] Seed database with test data:
  - Create `prisma/seed.ts`
  - Add test games
  - Run: `npx prisma db seed`

---

### Task 2.3: Generate TypeScript Types
**Status**: ⬜ Pending  

- [ ] Run `npx prisma generate` to create Prisma Client types
- [ ] Create DTO types for API:
  - `GameDTO`
- [ ] Create Zod schemas for validation (see Task 3.1)

---

## Phase 3: Frontend - Setup & Core Components

### Task 3.1: Set Up Frontend Architecture
**Status**: ⬜ Pending  

- [ ] Install dependencies:
  - `zustand` for state management
  - `zod` for schema validation
  - `react-hook-form` for forms
- [ ] Set up folder structure:
  ```
  src/
  ├── components/
  │   ├── ui/          # Reusable UI components
  │   └── features/    # Feature-specific components
  ├── hooks/
  ├── stores/          # Zustand stores
  ├── services/        # API client services
  ├── types/
  ├── utils/
  └── contexts/
  ```
- [ ] Configure path aliases in `vite.config.ts`

---

### Task 3.2: Create UI Component Library
**Status**: ⬜ Pending  

- [ ] Create base UI components:
  - `Headline` - Headline component with level property
  - `Textarea` - Multi-line input
  - `Button` - Variants: primary, secondary
  - `Select` - Dropdown select
  - `LoadingSpinner` - Loading indicator
  - `ErrorMessage` - Error display component
- [ ] Use CSS Modules for styling
- [ ] Ensure all components:
  - Are accessible (ARIA labels, keyboard navigation)
  - Follow design system tokens
  - Have TypeScript types
  - Are tested

---

## Phase 4: Frontend Implementation

### Task 4.1: Implement Search App
**Status**: ⬜ Pending  

- [ ] Create React application with the following:
  - [ ] Create `src/components/features/SearchForm.tsx`:
    - Form with
      - textarea field - to input search fields
      - select - to select the SQLite database file
      - search button - to submit the form
    - Actions: sends the query to the Search Service
  - [ ] Create `src/components/features/SearchResults.tsx`:
    - Display search results
  - Use CSS Modules for styling
  - Use `react-hook-form` for form handling
  - Validate with Zod schema
  - Show loading state during submission
- [ ] Implement form validation:
  - Search term required
  - Show inline error messages
- [ ] Add accessibility:
  - Proper labels
  - ARIA attributes
  - Keyboard navigation
- [ ] Write component tests

---

## Phase 5: Frontend - Search Features

### Task 5.1: Search Store
**Status**: ⬜ Pending  

- [ ] Create `src/stores/searchStore.ts` with Zustand:
  - State: `searchTerm`, `results`, `db`
  - Actions: `search`, `setDB`
- [ ] Use selectors to prevent unnecessary re-renders
- [ ] Write tests for stores

---

### Task 5.2: Create Search Service
**Status**: ⬜ Pending  

- [ ] Create `src/services/gameSearchService.ts`:
  - `findMany` - Search by name
- [ ] Use Prisma Client for all database operations
- [ ] Instantiate Prisma Client using the driver @prisma/adapter-better-sqlite3
```ts
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from './generated/prisma';

const adapter = new PrismaBetterSqlite3({
  url: "file:./db/dev.db"
})
const prisma = new PrismaClient({ adapter })
```
- [ ] Handle errors appropriately
- [ ] Add TypeScript types for all methods

---

## Phase 6: Testing

### Task 6.1: Frontend Component Tests
**Status**: ⬜ Pending  

- [ ] Write tests for UI components:
  - Button, Textarea, Select, etc.
- [ ] Write tests for feature components:
  - SearchForm, SearchResults
- [ ] Test user interactions
- [ ] Test accessibility

---

### Task 6.2: Frontend Store Tests
**Status**: ⬜ Pending  

- [ ] Write tests for Zustand stores:
  - searchStore tests
- [ ] Test state updates
- [ ] Test async actions
- [ ] Test error handling

---

## Phase 7: Polish & Optimization

### Task 7.1: Error Handling
**Status**: ⬜ Pending  

- [ ] Implement global error boundary
- [ ] Improve error messages:
  - User-friendly messages
  - Actionable error messages
- [ ] Add loading states everywhere
- [ ] Add optimistic updates where appropriate

---

### Task 7.2: Accessibility Audit
**Status**: ⬜ Pending  

- [ ] Run accessibility audit:
  - Use axe DevTools
  - Test keyboard navigation
- [ ] Fix accessibility issues:
  - Add missing ARIA labels
  - Fix color contrast
  - Ensure keyboard navigation works
  - Add skip links
- [ ] Document accessibility features

---

### Task 7.3: Performance Optimization
**Status**: ⬜ Pending  

- [ ] Optimize React components:
  - Use React.memo where appropriate
  - Use useMemo/useCallback for expensive operations
  - Code splitting
- [ ] Optimize API calls:
  - Add request debouncing
  - Cache responses where appropriate
- [ ] Optimize bundle size:
  - Analyze bundle
  - Remove unused dependencies
  - Tree shaking

---

### Task 7.4: UI/UX Improvements
**Status**: ⬜ Pending  

- [ ] Add animations/transitions:
  - List item animations
- [ ] Improve empty states:
  - Better messaging
  - Helpful illustrations
  - Call-to-action buttons
- [ ] Improve mobile responsiveness
- [ ] Add dark mode

---

## Phase 8: CI/CD & Deployment

### Task 8.1: Set Up CI/CD Pipeline
**Status**: ⬜ Pending  

- [ ] Create GitHub Actions workflow:
  - `.github/workflows/ci.yml`
- [ ] Configure pipeline stages:
  - Lint (ESLint, Prettier, TypeScript)
  - Build (frontend)
  - Test (unit and integration tests)
  - Coverage report

---

## Phase 9: Documentation

### Task 9.1: Developer Documentation
**Status**: ⬜ Pending  

- [ ] Update README.md:
  - Project overview
  - Setup instructions
  - Development workflow
  - Testing instructions
  - Deployment instructions
- [ ] Document architecture decisions (ADRs)
  - Check documents in ./docs/adr/ for more details
- [ ] Document code structure
- [ ] Add code comments where needed

---

## Phase 10: Final Testing & Launch

### Task 10.1: End-to-End Testing
**Status**: ⬜ Pending  

- [ ] Write E2E tests with Playwright:
  - Search flow
  - Change database
- [ ] Test critical user journeys
- [ ] Run tests in CI/CD

---

### Task 10.2: Security Audit
**Status**: ⬜ Pending  

**Estimated Time**: 2 hours

- [ ] Review security:
  - Input validation
  - SQL injection prevention (Prisma handles this)
  - XSS prevention
- [ ] Run security scanning tools
- [ ] Fix security issues

---

### Task 10.3: Pre-Launch Checklist
**Status**: ⬜ Pending  

- [ ] Final testing:
  - All features working
  - No critical bugs
  - Performance acceptable
  - Accessibility compliant
- [ ] Documentation complete
- [ ] CI/CD pipeline working
- [ ] Backup strategy in place
- [ ] Rollback plan documented

---

## Notes

- **Status Tracking**: Use checkboxes to track progress
- **Dependencies**: Some tasks depend on others
- **Testing**: Write tests alongside implementation, not after
- **Documentation**: Update documentation as you build, not at the end
- **Kilo Rules**: Follow the rules documented in the `.kilocode/rules/` folder.
- **Changelog**: Update CHANGELOG.md after each completed task
- **Project Status**: Update `.kilocode/rules/context.md` document with the current status of the project as you go

## Best Practices Reminders

- Follow TypeScript strict mode
- Use Prisma for all database operations (no raw SQL)
- Implement proper error handling at all layers
- Write tests for all business logic
- Ensure WCAG 2.1 AA accessibility compliance
- Use Zustand for state management
- Validate all inputs with Zod
- Use semantic HTML and ARIA attributes
- Implement proper loading and error states
- There is no backend, everything is handled by the frontend