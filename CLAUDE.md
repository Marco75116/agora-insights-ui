# Project Directives

## Design Philosophy

**PROFESSIONAL. CLEAN. SOBER.**

- No unnecessary animations
- Focus on data clarity and usability
- Institutional-grade interface
- Performance-first approach

## Branch Naming

Use format: `type/brief-description`

Example: `feat/add-login-page`, `fix/header-overflow`

## Commit Convention

Use conventional commit format: `type: brief description`

Types (for both branches and commits):

- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation changes
- `refactor`: code refactoring
- `test`: adding tests
- `chore`: maintenance tasks

## Import Paths

Always use `@/` alias. Never use relative paths like `../../`.

## UI Components

Use shadcn/ui for all UI components. Add new components with `bunx shadcn@latest add <component>`.

Follow the shadcn/ui pattern:

- Use CVA (class-variance-authority) for variants
- Use `cn()` utility from `@/lib/utils` for class merging
- Include `className` prop for customization
- Server Components by default, add `"use client"` only when needed

## Styling

- Tailwind utility classes only (no inline styles, no new CSS files)
- Use CSS variables from `globals.css` for colors
- Prettier auto-sorts Tailwind classes

## File Organization

- `/components/ui/` - shadcn/ui base components
- `/components/[feature]/` - feature-specific components (analytics/, layout/, shared/)
- `/hooks/` - custom React hooks
- `/types/` - TypeScript type definitions
- `/lib/` - utility functions
- `/lib/helpers/` - helper functions (formatting, date utilities, validation)
- `/lib/services/` - service layer for external APIs and data sources
- `/constants/` - application constants

## File Naming

- Components: PascalCase (`Button.tsx`)
- Services: camelCase.service.ts (`clickhouse.service.ts`)
- Utilities: camelCase.ts (`formatters.ts`)
- Types: PascalCase.ts (`Pool.ts`)

## Package Manager

Use Bun only. Never use npm or yarn.

- Install: `bun add <package>`
- Dev install: `bun add -d <package>`
- Run scripts: `bun run <script>`

## Commands

- `bun run dev` - start development server
- `bun run build` - production build
- `bun run lint` - run ESLint
- `bun run test` - run tests

## Code Quality

- No `any` type - use `unknown` or proper types
- No `console.log` in production code
- Prefer `const` over `let`
- No comments - code should be self-explanatory
- Factorize into smaller components or functions to keep codebase clean and maintainable

## Dependencies

Ask before installing new dependencies.

## React Patterns

- Server Components by default (App Router)
- Add `"use client"` only for hooks/interactivity
- Prefer explicit props typing over `React.FC`

## Accessibility

- Always include `alt` on images
- Use semantic HTML (`button`, `nav`, `main`, etc.)
- Ensure keyboard navigation works

## Security

- Never hardcode secrets or API keys
- Validate user inputs
- All queries to external services must use environment variables

## Data Fetching

- Use TanStack React Query for client-side caching and state
- Server Components for read operations when possible
- Always use parameterized queries for database calls
- Type all API/query responses with TypeScript interfaces
- Handle loading, error, and empty states

## Performance

- Use dynamic imports for large components (code splitting)
- Use `React.memo` for expensive renders
- Implement skeleton screens for loading states

## Charts & Data Visualization

- Responsive design - adapt to viewport size
- Clear configuration - labeled axes, legends
- Loading states - skeleton screens during fetch
- Data formatting - proper decimals and units
- Consistent color scheme throughout

## Error Handling

- User-friendly error messages
- Graceful degradation
- Wrap async operations in try-catch
- Implement error boundaries for component failures
