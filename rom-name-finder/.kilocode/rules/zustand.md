# When implementing state management with Zustand

- Use Zustand for global state management
- Create stores using `create()` function
- Define TypeScript interfaces for store state
- Use selectors to prevent unnecessary re-renders
- Keep actions focused and pure
- Handle async operations with try/catch and loading states
- Use persist middleware for user preferences
- Use devtools middleware in development
- Split large stores into slices for better organization
- Write tests for store actions and state updates
- Use selectors for computed/derived values
- Avoid storing UI state in Zustand (use useState for local UI state)
- Keep stores focused on domain logic, not presentation logic

## Best Practices

1. **Store Organization**: One store per domain (posts, users, auth, etc.)
2. **Selectors**: Use selectors to prevent unnecessary re-renders
3. **Actions**: Keep actions pure and focused
4. **TypeScript**: Define interfaces for store state
5. **Middleware**: Use persist for user preferences, devtools for development
6. **Slicing**: Split large stores into smaller slices
7. **Async Actions**: Handle loading and error states in async actions
8. **Immutability**: Zustand handles immutability, but be careful with nested updates