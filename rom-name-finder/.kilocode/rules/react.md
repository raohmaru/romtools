- Leverage TypeScript's type system to catch errors at compile time, avoid `any` types, use strict mode
- UI Components: Create reusable React components
- State Management: React Context API for global state, local state with hooks
- Build reusable, composable React components following single responsibility principle

---

# React coding rules and best practices

## 1. Architecture & State Management

* **Functional Focus & Composition:** Use functional components and hooks exclusively. Favor composition (via `children` or slots) over inheritance or deep prop drilling.
* **Localize & Minimize State:** Keep state as close as possible to its usage. Do not store values in state that can be derived from props or existing state; compute them during render (using `useMemo` for expensive tasks).
* **Immutability:** Treat state and props as immutable. Always use functional updates or spread operators to create new objects/arrays.
* **Single Responsibility:** Extract logic into custom hooks or sub-components when complexity grows. Keep presentational components free of side effects and business logic.

## 2. Performance & Rendering

* **Stable Keys:** Always use stable, unique identifiers for list `key` props. Never use array indices unless the list is strictly static and immutable.
* **Controlled Optimizations:** Use `React.memo`, `useMemo`, and `useCallback` to stabilize props and expensive computations. Avoid premature optimization; profile first unless the cost is obvious (e.g., passing inline functions to optimized children).
* **JSX Cleanliness:** Keep JSX declarative. Avoid inline business logic, anonymous functions, or complex object literals within the return statement if they trigger unnecessary re-renders.
* **Short-Circuiting Safety:** Avoid rendering "0" by using explicit boolean casting (e.g., `{!!items.length && <List />}`).

## 3. Hooks & Side Effects

* **Effect Integrity:** Use `useEffect` only for side effects (syncing with external systems). All variables used inside must be declared in the dependency array. Never suppress linter warnings without explicit justification.
* **Symmetric Cleanup:** Every `useEffect` that initiates a subscription, timer, or listener **must** return a cleanup function to prevent memory leaks.
* **Separation of Concerns:** Isolate data fetching into custom hooks. Keep effects small and focused on a single responsibility.
* **Predictable Rendering:** Ensure components are deterministic. Avoid hidden side effects or direct DOM manipulation (use `useRef` only as a last resort).

## 4. Robustness & Pattern Standards

* **Strict Typing:** Define clear, robust interfaces for all props and state using TypeScript. Avoid `any` or loose types.
* **State Handling:** Always handle loading, empty, and error states explicitly. Use **Error Boundaries** to catch runtime rendering failures.
* **Form Management:** Use controlled components for consistent form state. Do not mix controlled and uncontrolled inputs.
* **Feature-Based Structure:** Group components, hooks, and utilities by feature/domain rather than by technical type (e.g., `/features/auth/` instead of `/hooks/`).
* **Early Returns:** Use guard clauses for loading/error states to reduce JSX nesting and improve readability.
