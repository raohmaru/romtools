# ADR-004: React CSS Modules

## Status

Accepted

**Date**: 2025-12-18

## Context

We need to decide on a styling approach for React components in the SQLite Search Web Application. The choice involves balancing component isolation, maintainability, developer experience, and alignment with React best practices.

Key considerations:
- Component style isolation to prevent style conflicts
- Maintainability and scalability of styles as the application grows
- Developer experience and tooling support
- CSS performance and bundle size
- Team familiarity and learning curve
- Consistency with existing project decisions

## Decision

We will use CSS Modules as the primary styling approach for React components.

CSS Modules were chosen because:
- Provide scoped CSS by automatically generating unique class names
- Prevent style conflicts between components
- Maintain familiarity with standard CSS syntax
- Enable composition of styles through composes property
- Support theming and design system integration
- Align with the project's user experience guidelines which specify "Use CSS Modules in React for scoped styling for component modularity to ensure consistency"

## Consequences

### Positive
- Complete style isolation between components
- No global namespace pollution
- Reduced CSS specificity issues
- Better maintainability as application scales
- Clear ownership of styles per component
- Dead code elimination for unused styles
- Enhanced developer experience with IDE support

### Negative
- Learning curve for developers new to CSS Modules
- Slightly more complex build process
- Class names become less readable in browser dev tools due to hashing
- Potential for increased bundle size with many small CSS files

### Neutral
- Need to follow naming conventions for CSS classes
- Integration with existing CSS tooling and preprocessors
- Migration considerations if integrating with global CSS

## Alternatives Considered

- **Styled Components**:
  - Pros: Dynamic styling with props, component-based approach, automatic vendor prefixing
  - Cons: Runtime overhead, different syntax from standard CSS, larger bundle size
  - Why rejected: CSS Modules provide similar benefits with less runtime overhead and maintain familiar CSS syntax

- **Traditional CSS with BEM naming**:
  - Pros: Familiar to most developers, no build step required, human-readable class names
  - Cons: Manual namespace management, prone to conflicts, harder to maintain at scale
  - Why rejected: CSS Modules provide automatic scoping without manual naming conventions

- **CSS-in-JS (Emotion, etc.)**:
  - Pros: Dynamic styling, theming capabilities, colocation of styles with components
  - Cons: Runtime performance impact, increased bundle size, different mental model
  - Why rejected: CSS Modules offer better performance characteristics with similar benefits

## Implementation Notes

- Create one CSS module file per React component (ComponentName.module.css)
- Use camelCase for CSS class names in modules
- Leverage composes property for style reuse
- Follow consistent naming patterns for common UI elements
- Use global selectors sparingly and only when necessary
- Integrate with existing design system tokens where applicable

Example:
```css
/* ComponentName.module.css */
.container {
  padding: 1rem;
  border: 1px solid var(--border-color);
}

.title {
  composes: heading from './shared.module.css';
  color: var(--primary-color);
}
```

```jsx
// ComponentName.tsx
import styles from './ComponentName.module.css';

const ComponentName = () => (
  <div className={styles.container}>
    <h1 className={styles.title}>Hello World</h1>
  </div>
);
```

## References

- CSS Modules Documentation: https://github.com/css-modules/css-modules
- Project PLAN.md
- ADR-001: TypeScript as Primary Language
- ADR-002: React Functional Components with Hooks
- User Experience Guidelines (.kilocode/rules/user-experience.md)

## Notes

This decision supports our goal of building a maintainable, scalable React application with properly isolated component styles. It aligns with current industry best practices for CSS architecture in component-based applications.

## For AI Agents

When implementing code related to this ADR:
- Create CSS module files alongside React components
- Use descriptive class names in camelCase
- Leverage composes for style reuse
- Avoid global styles unless absolutely necessary
- Follow established patterns for component styling