# ROM Name Finder - Frontend

React + TypeScript + Vite frontend for ROM Name Finder application.

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Runs the app in development mode on `http://localhost:5173`

### Build

```bash
npm run build
```

Builds the app for production to the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

Previews the production build locally.

### Testing

```bash
# Run all tests and watches
npm run test

# Run tests with coverage
npm run test:coverage
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npm run typecheck
```

## Project Structure

```
frontend/src/
├── components/               # React components
│   ├── ui/                   # Reusable UI components (Button, Textarea, Select, etc.)
│   └── features/             # Feature-specific components
│       ├── SearchForm/       # Search form component
│       ├── SearchResults/    # Search results display
│       ├── Toolbar/          # Toolbar with theme toggle
│       └── ScrollToTop/      # Scroll to top button
├── services/                 # Business logic
│   └── gameSearchService.ts  # Game search service using SQL.js
├── stores/                   # State management with Zustand
│   └── searchStore.ts        # Search state management
├── hooks/                    # Custom React hooks
│   └── useDeviceDetails.ts   # Device details hook
├── types/                    # TypeScript type definitions
│   └── schemas.ts            # Zod validation schemas
├── utils/                    # Utility functions and constants
└── workers/                  # Web workers
    └── worker.sql-wasm.ts    # SQLite operations in web worker
```

## Technologies

- React 18
- TypeScript
- Vite
- SQL.js (SQLite)
- Zustand (State Management)
- React Hook Form
- Zod (Validation)
- CSS Modules

## License

MIT
