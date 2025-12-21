#  When writing tests

- Follow the testing pyramid (more unit tests, fewer E2E tests)
- Use Vitest + React Testing Library for component tests
- Use MSW for API mocking in integration tests
- Write tests that test behavior, not implementation details
- Use descriptive test names that explain what is being tested
- Mock external dependencies (APIs, services, hooks)
- Test error cases and edge cases
- Keep tests isolated and independent
- Use AAA pattern (Arrange-Act-Assert)
- Maintain test coverage above 70%
- Write tests before fixing bugs (regression tests)
- Test accessibility
- Run automated accessibility tests (axe, Lighthouse)
- Test with screen readers (NVDA/VoiceOver)