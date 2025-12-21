# SQLite Search Web Application

React application with a basic UI with which an user can search in a local SQLite database using Prisma ORM, and the results are rendered in the page.

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
  ├── adr/                 # Architecture Decision Records  
  ├── GLOSSARY.md          # Project terminology  
  └── README.md            # Documentation overview  
  ../CHANGELOG.md          # Project changelog
  ../PLAN.md               # Implementation plan