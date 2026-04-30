# Testing

## Commits

Every commit must leave the test suite green. In TDD workflows, failing tests must not be committed on their own — commit tests and implementation together once all tests pass.

## Philosophy

- Focus on testing the most important functionality
- Prefer tests that maximize confidence while minimizing maintenance; often integration tests offer that balance
- Tests should tell a clear story of desired functionality. Readability is key
- Duplication is more tolerable in tests than production code, but still reduce it when possible without hurting readability
- Create `setup` functions for common test initialization patterns
- Mock console output in tests to keep output clean while still allowing assertions on logged content
- Match assertion style to test intent, e.g., use `toEqual` when the full shape is the point, `toMatchObject` when only a subset is relevant

## Queries

- Prefer `getByRole` over `getByLabelText` / `getByText` — it reflects how users and assistive technologies interact with the page ([Testing Library query priority](https://testing-library.com/docs/queries/about/#priority))

## Structure

- Group tests by functionality in separate files, in `__tests__/` directories parallel to the source
- Group tests within the `describe` block of the function they're testing
