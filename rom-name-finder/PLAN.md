# SQLite Search Web Application - Implementation Plan

This document outlines the step-by-step implementation plan for a search application that searches in a local SQLite database. All the implementation is done in the frontend (there is no backend).
Please only implement one feature at a time, stop the implementation after the feature and update the PLAN.md file.
All tasks follow the best practices documented in the `.kilocode/rules/` folder.

## Project Overview

**Application**: Web SQLite Search
**Stack**: TypeScript, React, Vite, SQLite, CSS Modules, Vitest
**Features**:
- UI to search in a local SQLite database
- The SQLite databases are stored in files
- The user can select which SQLite database to use
- The user can input search terms
- The search is performed using SQL.js as web worker
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
**Status**: ✅ Completed

- [x] Create project root directory structure following React best practices
  ```
  project-root/
  ├── frontend/
  ├── db/
  └── docs/
  ```
- [x] Initialize frontend with Vite + React + TypeScript + Vitest
  - Configure EditorConfig, ESLint and Prettier
  - Add .gitignore with default for React projects
  - Set up path aliases (`@/components`, `@/hooks`, etc.)
  - Set up `package.json` with TypeScript dependencies
  - Configure `tsconfig.json` with strict mode
- [x] Set up initial `README.md` files

---

### Task 1.2: Configure SQLite Database
**Status**: ✅ Completed

- [x] Install SQL.js: `npm install -D sql.js`
- [x] Initialize SQLite
  - Create file `db/init.ts`
  - Import `sql-wasm.js` and `dotenv/config`
  - Create a database using `sql-wasm.js`
  - Create a table with the following schema:
    ```sql
    DROP TABLE IF EXISTS games;
    CREATE TABLE games (
      id INTEGER PRIMARY KEY,
      rom TEXT NOT NULL,
      name TEXT NOT NULL
    );
    ```
  - Write the database into the file defined in the environmental variable `DATABASE_URL`
- [x] Execute `npx tsx ./db/init.ts`
  - Verify that the file defined in the environmental variable `DATABASE_URL` in the `.env` file exist
  
---

### Task 1.3: Set Up Development Environment
**Status**: ✅ Completed

- [x] Set up environment variables:
  - Frontend: `VITE_API_URL`, `VITE_APP_NAME`
- [x] Configure VS Code workspace settings
- [x] Set up npm scripts:
  - `dev`: Start development servers
  - `build`: Build for production
  - `test`: Run tests
  - `lint`: Run linters

---

## Phase 2: Database Schema & Models

### Task 2.1: Seed Database With Data
**Status**: ✅ Completed

- [x] Create file `db/seed.ts`
- [x] Import `sql.js` and `dotenv/config`
- [x] Load the database defined in the environmental variable `DATABASE_URL` using `sql-wasm.js`
- [x] Fill the table `games` with 10 entries of MAME arcade ROMS data
- [x] Write the database into the file defined in the environmental variable `DATABASE_URL`
- [x] Execute `npx tsx ./db/seed.ts`

### Task 2.2: Validate Data
**Status**: ✅ Completed

- [x] Create file `db/validate.ts`
- [x] Import `sql.js` and `dotenv/config`
- [x] Load the database defined in the environmental variable `DATABASE_URL` using `sql-wasm.js`
- [x] Run a query to show the first 10 results
- [x] Print the results into the terminal
- [x] Execute `npx tsx ./db/validate.ts`

---

## Phase 3: Frontend - Setup & Core Components

### Task 3.1: Set Up Frontend Architecture
**Status**: ✅ Completed  

- [x] Install dependencies:
  - `zustand` for state management
  - `zod` for schema validation
  - `react-hook-form` for forms
- [x] Set up folder structure:
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
- [x] Configure path aliases in `vite.config.ts`

---

### Task 3.2: Create UI Component Library
**Status**: ✅ Completed  

- [x] Create base UI components:
  - `Headline` - Headline component with level property
  - `Textarea` - Multi-line input
  - `Button` - Variants: primary, secondary
  - `Select` - Dropdown select
  - `LoadingSpinner` - Loading indicator
  - `ErrorMessage` - Error display component
- [x] Use CSS Modules for styling
- [x] Ensure all components:
  - Are accessible (ARIA labels, keyboard navigation)
  - Follow design system tokens
  - Have TypeScript types
  - Are tested

---

## Phase 4: Frontend Implementation

### Task 4.1: Implement Search App
**Status**: ✅ Completed  

- [x] Create React application with the following:
  - [x] Create `src/components/features/SearchForm.tsx`:
    - Form with
      - textarea field - to input search fields
      - select - to select the SQLite database file
      - search button - to submit the form
    - Actions: sends the query to the Search Service
  - [x] Create `src/components/features/SearchResults.tsx`:
    - Display search results
  - Use CSS Modules for styling
  - Use `react-hook-form` for form handling
  - Validate with Zod schema
  - Show loading state during submission
- [x] Implement form validation:
  - Search term required
  - Show inline error messages
- [x] Add accessibility:
  - Proper labels
  - ARIA attributes
  - Keyboard navigation
- [x] Write component tests

---

## Phase 5: Frontend - Search Features

### Task 5.1: Search Store
**Status**: ✅ Completed  

- [x] Create `src/stores/searchStore.ts` with Zustand:
  - State: `searchTerm`, `results`, `db`
  - Actions: `search`, `setDB`
- [x] Use selectors to prevent unnecessary re-renders
- [x] Write tests for stores

---

### Task 5.2: Create Search Service
**Status**: ✅ Completed  

- [x] Create `src/services/gameSearchService.ts`:
  - `findMany` - Search by name
- [x] Use SQL.js for all database operations
  - Load the database selected by the user using `sql-wasm.js`
  - Use as web worker
    ```ts
    const worker = new Worker('/db/worker.sql-wasm.js');
    worker.onmessage = () => {
      worker.onmessage = event => {
        console.log(event.data); // The result of the query
      };

      worker.postMessage({
        id: 2,
        action: 'exec',
        sql: 'SELECT age,name FROM test WHERE id=$id',
        params: { '$id': 1 }
      });
    };

    worker.onerror = e => console.log('Worker error: ', e);
    worker.postMessage({
      id: 1,
      action: 'open',
      buffer: buf, // An ArrayBuffer representing an SQLite Database file
    });
    ```
- [x] Handle errors appropriately
- [x] Add TypeScript types for all methods

---

## Phase 6: Testing

### Task 6.1: Frontend Component Tests
**Status**: ✅ Completed  

- [x] Write tests for UI components:
  - Button, Textarea, Select, etc.
- [x] Write tests for feature components:
  - SearchForm, SearchResults
- [x] Test user interactions
- [x] Test accessibility

---

### Task 6.2: Frontend Store Tests
**Status**: ✅ Completed  

- [x] Write tests for Zustand stores:
  - searchStore tests
- [x] Test state updates
- [x] Test async actions
- [x] Test error handling

---

## Phase 7: Polish & Optimization

### Task 7.1: Error Handling
**Status**: ✅ Completed  

- [x] Implement global error boundary
- [x] Improve error messages:
  - User-friendly messages
  - Actionable error messages
- [x] Add loading states everywhere
- [x] Add optimistic updates where appropriate

---

### Task 7.2: Accessibility Audit
**Status**: ✅ Completed  

- [x] Run accessibility audit:
  - Use axe DevTools
  - Test keyboard navigation
- [x] Fix accessibility issues:
  - Add missing ARIA labels
  - Fix color contrast
  - Ensure keyboard navigation works
  - Add skip links
- [x] Document accessibility features

---

### Task 7.3: Performance Optimization
**Status**: ✅ Completed
**Last Updated**: 25/01/2026

- [x] Optimize React components:
  - Use React.memo where appropriate
  - Use useMemo/useCallback for expensive operations
  - Code splitting
- [x] Optimize API calls:
  - Add request debouncing
  - Cache responses where appropriate
- [x] Optimize bundle size:
  - Analyze bundle
  - Remove unused dependencies
  - Tree shaking

---

### Task 7.4: UI/UX Improvements
**Status**: ✅ Completed  

- [x] Add animations/transitions:
  - List item animations
- [x] Improve empty states:
  - Better messaging
  - Helpful illustrations
  - Call-to-action buttons
- [x] Improve mobile responsiveness
- [x] Add dark mode

---

## Phase 8: CI/CD & Deployment

### Task 8.1: Set Up CI/CD Pipeline
**Status**: ✅ Completed  

- [x] Create GitHub Actions workflow:
  - `.github/workflows/ci.yml`
- [x] Configure pipeline stages:
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

- [ ] Review security:
  - Input validation
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
- Use sql-wasm.js for all database operations (no raw SQL)
- Implement proper error handling at all layers
- Write tests for all business logic
- Ensure WCAG 2.1 AA accessibility compliance
- Use Zustand for state management
- Validate all inputs with Zod
- Use semantic HTML and ARIA attributes
- Implement proper loading and error states
- There is no backend, everything is handled by the frontend
