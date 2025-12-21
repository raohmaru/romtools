# Glossary

This document defines key terms, concepts, and domain-specific language used throughout the project.

## Terms

### Architecture

- **ADR** - Architecture Decision Record: A document that captures an important architectural decision made along with its context and consequences.
- **API Layer** - The backend service layer that handles HTTP requests and responses, typically using Express.js routes and controllers.
- **Component** - A reusable React component that encapsulates UI logic and presentation.
- **Container Component** - A React component that handles data fetching and state management, passing data to presentational components.
- **Presentational Component** - A React component focused solely on rendering UI based on props, with no internal state or side effects.

### Development

- **Repository Pattern** - A design pattern that abstracts data access logic and provides a more object-oriented view of the persistence layer.
- **Hook** - A React Hook (useState, useEffect, useContext, etc.) that allows functional components to use state and lifecycle features.
- **Custom Hook** - A reusable function that encapsulates component logic and can be shared across components (e.g., `useAuth`, `useApi`).
- **Type Guard** - A TypeScript function that narrows the type of a variable within a conditional block.
- **DTO (Data Transfer Object)** - An object that carries data between processes, typically used for API request/response payloads.
- **Entity** - A domain model object that represents a database table.

### TypeScript

- **Type Definition** - A TypeScript interface or type alias that describes the shape of data.
- **Generic Type** - A type parameter that allows code to work with multiple types (e.g., `Array<T>`, `Promise<T>`).
- **Union Type** - A type that represents values that can be one of several types (e.g., `string | number`).
- **Discriminated Union** - A union type with a common property (discriminator) that allows TypeScript to narrow the type.
- **Type Assertion** - A way to tell TypeScript the type of a value when you know more than the compiler (use sparingly).

### React

- **JSX** - JavaScript XML, the syntax extension for React that allows writing HTML-like code in JavaScript.
- **Props** - Properties passed to React components, immutable data from parent to child.
- **State** - Mutable data managed within a component using `useState` hook.
- **Effect** - Side effects in React components handled by the `useEffect` hook.
- **Memoization** - Caching computed values using `useMemo` or `useCallback` to optimize performance.
- **Ref** - A reference to a DOM element or mutable value that persists across renders without causing re-renders.

### Backend

- **Controller** - A function that handles HTTP requests, validates input, calls services, and returns responses.
- **Service** - Business logic layer that contains domain-specific operations, called by controllers.
- **Middleware** - Functions that execute during the request-response cycle (e.g., authentication, logging, error handling).
- **Route Handler** - A function that handles a specific HTTP route (GET, POST, PUT, DELETE).

### Database

- **Query** - A database operation to retrieve data, typically using SQL.js.
- **Transaction** - A sequence of database operations that execute atomically (all succeed or all fail).

### Infrastructure

- **Infrastructure as Code (IaC)** - Managing and provisioning computing infrastructure through machine-readable definition files.
- **Container** - A Docker container that packages an application with its dependencies.
- **Environment Variable** - Configuration values stored outside the codebase (e.g., API keys, database URLs).

### Processes

- **CI/CD** - Continuous Integration/Continuous Deployment: Practices that automate the integration and deployment of code changes.
- **Build** - The process of compiling TypeScript to JavaScript and bundling assets for production.
- **Deploy** - The process of releasing code to a production or staging environment.

### Testing

- **Unit Test** - A test that verifies a single function or component in isolation.
- **Integration Test** - A test that verifies multiple components or systems working together.
- **Mock** - A fake implementation of a dependency used in testing.
- **Snapshot Test** - A test that captures the output of a component and compares it to a stored snapshot.

---

## How to Use This Glossary

When generating code or documentation:
- Use terms consistently as defined here
- Add new terms when introducing domain-specific concepts
- Cross-reference terms in documentation where appropriate
- Ensure TypeScript types align with domain terminology

