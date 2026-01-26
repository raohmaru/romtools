# MAME ROM Name Finder

<img src="https://raohmaru.github.io/romtools/img/arcade.svg" width="80" alt="Arcade cabinet">

A web application for searching MAME ROM names in local SQLite databases using SQL.js as a web worker. Designed for retro gaming enthusiasts to quickly find MAME ROM names in their collections.

## Project Overview

**MAME ROM Name Finder** is a frontend-only web application that allows users to search for ROM files across multiple SQLite database files containing MAME arcade ROM information. The application provides a simple interface to input search terms and select which ROM set database to search in.

## Project Structure

```
rom-name-finder/
├── frontend/              # React frontend application
│   ├── src/               # Source code
│   │   ├── components/    # React components (UI + features)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # Business logic (game search service)
│   │   ├── stores/        # Zustand state management
│   │   ├── types/         # TypeScript type definitions
│   │   ├── utils/         # Utility functions
│   │   └── workers/       # Web workers (SQLite operations)
│   ├── public/            # Static assets
│   │   ├── db/            # SQLite database files (ROM sets)
│   │   ├── img/           # Images
│   │   └── wasm/          # WebAssembly files (sql-wasm.js)
│   └── package.json       # Frontend dependencies
├── db/                    # Database management scripts
│   ├── init.ts            # Database initialization
│   ├── seed.ts            # Database seeding
│   ├── validate.ts        # Data validation
│   ├── shared.ts          # Shared types/constants
│   ├── romset-converter/  # ROM set CSV to SQLite converter
│   └── romsets/           # Source CSV files for ROM sets
├── docs/                  # Documentation
│   ├── adr/               # Architecture Decision Records
│   ├── PLAN.md            # Implementation plan
│   ├── README.md          # Documentation overview
│   └── GLOSSARY.md        # Project terminology
└── CHANGELOG.md           # Project changelog
```

## Getting Started

### Prerequisites

- Node.js (v22 or later)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rom-name-finder
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend
   npm install
   ```

3. **Build the database**
   ```bash
   npm run db
   ```

4. **Run the development server**
   ```bash
   cd frontend
   npm run dev
   ```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run db
cd frontend
npm run build
```

The production build will be in the `frontend/dist` directory.

## Development Workflow

### Key Commands

```bash
cd frontend

# Start development server
npm run dev

# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Lint files
npm run lint

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Development Guidelines

- Follow TypeScript strict mode
- Use SQL.js for all database operations (no raw SQL)
- Implement proper error handling at all layers
- Write tests for all business logic
- Ensure WCAG 2.1 AA accessibility compliance
- Use Zustand for state management
- Validate all inputs with Zod
- Use semantic HTML and ARIA attributes
- Implement proper loading and error states

## Testing Instructions

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test how components and services work together
- **Accessibility Tests**: Test compliance with WCAG 2.1 AA standards

All tests are located alongside the source files in `*.test.tsx` or `*.test.ts` files.

## Features

- **Search ROM Names**: Search for ROM files by name
- **Multiple ROM Sets**: Support for various MAME ROM sets (2003+, 2010, 2015, 2016, 0.268, 0.277)
- **Real-time Search**: Search results are displayed as you type
- **SQLite Web Worker**: Database operations run in a web worker for non-blocking UI
- **Dark Mode**: Support for dark and light themes
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: WCAG 2.1 AA compliant

## Technologies

- **React 18 + TypeScript**: UI framework and type system
- **Vite**: Build tool and dev server
- **SQL.js**: SQLite database in the browser using WebAssembly
- **Zustand**: State management
- **React Hook Form**: Form handling
- **CSS Modules**: Scoped CSS styling
- **Vitest**: Testing framework
- **React Testing Library**: Component testing

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit your changes: `git commit -m "feat: add your feature"`
7. Create a pull request

## License

MIT License.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and release notes.
