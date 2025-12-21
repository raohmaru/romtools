This document outlines accessibility standards and guidelines following WCAG 2.1 Level AA.

## Standards

- **WCAG Level**: AA (minimum), AAA (where possible)
- **Compliance**: Required for all features

## Accessibility Principles

### Perceivable

- **Text Alternatives**: All images have alt text
- **Captions**: Videos have captions
- **Color**: Don't rely on color alone to convey information
- **Contrast**: Minimum 4.5:1 for text, 3:1 for UI components

### Operable

- **Keyboard Accessible**: All functionality available via keyboard
- **No Seizures**: No content flashes more than 3 times per second
- **Navigation**: Clear navigation and skip links
- **Focus Management**: Visible focus indicators

### Understandable

- **Readable**: Language is clear and simple
- **Predictable**: Consistent navigation and functionality
- **Input Assistance**: Clear error messages and help text

### Robust

- **Valid HTML**: Semantic HTML structure
- **ARIA**: Proper ARIA attributes where needed
- **Compatible**: Works with assistive technologies

# When implementing features

- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, etc.)
- Add `aria-label` to icon-only buttons
- Ensure all images have descriptive `alt` text
- Use `aria-describedby` to link form fields with error messages
- Implement keyboard navigation for all interactive elements
- Add visible focus indicators (2px outline)
- Use `role` attributes appropriately (`role="alert"`, `role="dialog"`)
- Ensure color contrast meets WCAG AA standards
- Use `aria-live` regions for dynamic content
- Provide skip links for main content
- Use `aria-required` for required form fields
- Run automated accessibility tests (axe, Lighthouse)

