# System Architecture

This document describes the system architecture for the ROM Name Finder application.

## Architecture Overview

The application follows a client architecture where the frontend is a React application that communicates with a SQLite database through SQL.js.
There is no server, everything is implemented in the frontend

```
┌─────────────────────┐
│   React Frontend    │
│   (TypeScript)      │
├─────────────────────┤
│   SQLite Database   │
│   (File-based)      │
└─────────────────────┘
```

## Component Architecture

### Frontend (React + TypeScript + Vite)

- **UI Components**: Reusable UI components using CSS Modules for styling
- **Feature Components**: 
  - SearchForm: Form with textarea, select, and search button
  - SearchResults: Component to display search results
- **State Management**: Zustand for global state management
- **Form Handling**: React Hook Form for form validation
- **Validation**: Zod for schema validation
- **Services**: Game search service that interacts with SQL.js

### Data Layer

- **Database**: File-based SQLite database using SQL.js

### Project Structure

```
project-root/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # Reusable UI components
│   │   │   └── features/    # Feature-specific components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── stores/          # Zustand stores
│   │   ├── services/        # API client services
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── contexts/        # React contexts
│   ├── public/              # Static assets
│   │   └── db/              # SQLite database files
│   └── index.html           # Entry point
├── db/                      # SQL.js script files
├── docs/                    # Project documentation
└── tests/                   # Test files
```

## Key Technical Decisions

1. **Frontend Framework**: React with TypeScript for type safety and component-based architecture
2. **Build Tool**: Vite for fast development and optimized production builds
3. **State Management**: Zustand for simple and efficient global state management
4. **Database**: SQLite for local file-based storage with good performance using SQL.js (sql-wasm.js)
7. **Styling**: CSS Modules for scoped styling
8. **Testing**: Vitest for unit testing
9. **Form Handling**: React Hook Form for efficient form management
10. **Validation**: Zod for schema validation

## Data Flow

1. User interacts with SearchForm component
2. Form data is validated using Zod schemas
3. Search request is sent to gameSearchService
4. gameSearchService uses SQLite database
6. Results are returned to the frontend
7. SearchResults component displays the results

## Design Patterns

- **Component-Based Architecture**: Reusable and composable React components
- **Separation of Concerns**: Clear separation between UI, business logic, and data access
- **State Management**: Centralized state management with Zustand
- **Repository Pattern**: SQL.js acts as a repository for database operations
- **Service Layer**: gameSearchService encapsulates business logic
