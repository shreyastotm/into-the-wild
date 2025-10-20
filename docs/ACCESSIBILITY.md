# Accessibility Guidelines

## Color Usage
- Always use theme tokens from `index.css`
- Never hardcode colors
- Test in both light and dark modes

## Component Patterns

### Input Components
- Use semantic tokens: `border-input`, `bg-background`, `text-foreground`
- Dark mode: `dark:border-border`, `dark:bg-card`, `dark:text-foreground`
- Focus states: `focus:ring-primary/20` (light) and `dark:focus:ring-primary/30` (dark)
- Placeholder: `placeholder:text-muted-foreground`

### Select Components
- Trigger: Use same patterns as Input components
- Content: `bg-popover`, `text-popover-foreground` with dark mode variants
- Items: `focus:bg-accent`, `dark:focus:bg-accent` for better contrast

### Dialog Components
- Content: `bg-background`, `text-foreground` with dark mode variants
- Proper contrast for headers and footers

### Card Components
- Background: `bg-card`, `text-card-foreground`
- Borders: `border-border` with dark mode support

### Badge Components
- Enhanced variants with dark mode support:
  - `easy`: `dark:bg-green-900/30 dark:text-green-300 dark:border-green-700`
  - `moderate`: `dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700`
  - `hard`: `dark:bg-red-900/30 dark:text-red-300 dark:border-red-700`
  - `full`: `dark:bg-gray-700 dark:text-gray-300`

### Table Components
- Headers: `text-muted-foreground` with dark mode support
- Rows: `hover:bg-muted/50 dark:hover:bg-muted/30`
- Borders: `border-border`

### Page Patterns

#### Admin Pages
- Replace hardcoded backgrounds: `bg-gray-50` → `bg-muted/30 dark:bg-muted/20`
- Replace hardcoded text: `text-gray-600` → `text-muted-foreground`
- Replace hardcoded borders: `border-gray-200` → `border-border`

#### Loading States
- Skeleton loaders: `bg-muted` instead of `bg-gray-200`
- Links: `text-muted-foreground hover:text-foreground`

## WCAG 2.1 AA Compliance
- Normal text: contrast ratio ≥ 4.5:1
- Large text (18pt+): contrast ratio ≥ 3:1
- UI components: contrast ratio ≥ 3:1

## Testing Checklist

### Automated Testing
- Run Lighthouse accessibility audits in Chrome DevTools
- Use axe DevTools extension in browser

### Manual Testing
- Toggle dark mode - all text readable (contrast ratio ≥ 4.5:1)
- Forms: inputs, selects, textareas visible in both modes
- Dialogs: header, footer, content properly contrasted
- Tables: headers and cells readable
- Buttons: all states (default, hover, focus, disabled) visible
- Dropdowns: trigger and content properly themed
- Error messages: high visibility in both modes

### Browser Testing Matrix
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## Best Practices
1. Always use theme tokens from CSS variables
2. Test changes in both light and dark modes
3. Ensure focus states are clearly visible for keyboard navigation
4. Use semantic HTML elements
5. Provide meaningful ARIA labels where needed
6. Test with screen readers when possible

## Implementation Notes
- All components now use semantic color tokens
- Dark mode variables enhanced for better contrast
- Consistent patterns across admin and public pages
- Maintained backward compatibility with existing functionality
