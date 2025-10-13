# Commands

- **All tests**: `pnpm test:run` (don't use `pnpm test`!)
- **Single test**: `pnpm test:run <pattern>` (e.g., `pnpm test:run App.test`)
- **Type check**: `pnpm check-types`
- **Lint/format**: `pnpm check` (or `pnpm check:fix` to auto-fix)
- **Definition of done**: Run `pnpm test:run`, `pnpm check-types`, `pnpm check` before considering changes complete

# Code style

- **No comments** unless explaining something non-obvious. Explain WHY, not WHAT (applies to tests too)
- **Simplicity and readability** are paramount. Prefer simple solutions over clever ones
- **Imports**: Biome auto-organizes imports (enabled in `biome.json`)
- **Types**: Use TypeScript types everywhere. Prefer `type` over `interface`. No inferrable types
- **Naming**: Use descriptive names. Components are PascalCase, functions/variables are camelCase
- **Error handling**: Use async/await with try-catch when appropriate
- **React**: Let components grow naturally before extracting. Avoid `useMemo`/`useCallback` unless necessary for correctness
- **Change batch size**: ONLY make changes required for the goal. Small commits are preferred

# Testing

- Follow existing test style. Look at `src/__tests__/` for examples
- Prefer integration tests over unit tests (high confidence, low complexity)
- Group tests by functionality in separate files
- Use Testing Library [query priorities](https://testing-library.com/docs/queries/about/#priority)
- Tests should tell a clear story of desired functionality. Readability is key
- More duplication is tolerated in tests than in production code

# Meta

If you have a good reason to deviate from these guidelines, ask before proceeding
