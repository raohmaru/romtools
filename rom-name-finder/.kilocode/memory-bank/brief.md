# ROM Name Finder

React application that helps users find MAME ROM names for arcade video games by searching in a local SQLite database using Prisma ORM. All functionality is implemented in the frontend with no backend server.

## Project Overview

**Application**: ROM Name Finder
**Stack**: TypeScript, React, Vite, Prisma, SQLite, CSS Modules, Vitest
**Features**:
- UI to search for arcade game names in a local SQLite database using Prisma
- SQLite databases stored as local files
- User can select which SQLite database file to use
- Input multiple arcade game names (one per line)
- Search performed using Prisma ORM with @prisma/adapter-better-sqlite3 adapter
- Displays matching MAME ROM names
**User flow**:
1. User is presented with a form containing:
   - Textarea field for arcade game names (one per line)
   - Select dropdown to choose database file
   - Search button
2. User enters arcade game names in the textarea
3. User selects the database file from the dropdown
4. User clicks the Search button
5. Matching MAME ROM names are displayed below the form
**Documentation**:
   docs/
   ├── adr/                 # Architecture Decision Records
   ├── GLOSSARY.md          # Project terminology
   └── README.md            # Documentation overview
   ../CHANGELOG.md          # Project changelog
   ../PLAN.md               # Implementation plan