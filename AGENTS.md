# General overview over the project

See [README](README.md).

# Used libraries and frameworks

See [`package.json`](package.json).

# Developer workflows

Consider [README](README.md) and details below.

## Testing

- Run `pnpm test:run` from the root of the projects to run the tests
- Don't use `pnpm test`!

## Checking the correctness of your changes

Run `pnpm test:run`, `pnpm check-types`, and `pnpm check`

# Code style

- Don't add comments unless you're doing something out of the ordinary that requires explanation. If you write a comment, explain WHY you're doing something, not WHAT you're doing.
  - Note: This also applies to tests!
- Simplicity and readability of the code are very important.

## React components

- It's fine to let a component grow to a certain extent, you don't always need to extract components. Before you extract a component, ask me.
- Don't apply optimizations like `useMemo` and `useCallback` for performance improvements, unless explicitly asked to. Only apply them without being asked if that's necessary for the correctness of the component.

# How to write tests in this project

- Take a look at the existing tests and follow the same style.
- Make sure to test the areas of the code most important to the functionality. We don't need full test coverage if the tests we have give us enough confidence.
- Consider the cost-benefit ratio of the tests and aim for tests that test a lot and give a lot of confidence with relatively little test complexity. For that reason, this project has lots of integration tests.
- Tests are grouped in files based on the functionality that they test.
- When writing tests using Testing Library, consider the [priority of queries](https://testing-library.com/docs/queries/about/#priority) from their docs.
- The tests should tell an easy to understand story of what the desired functionality is. Readability is key for tests.
- Within tests more duplication is tolerated than outside, although not an endless amount.

# Change batch size

- When asked to make changes to the code to reach a certain goal, ONLY make the changes required for that goal. Don't make improvements unrelated to that.
- We're aiming for small change batches that are easy to review and can be committed in the form of small commits.

# Explanations

Explain what you did in a clear and concise way.

# Updating `AGENTS.md`

If you have a good reason for acting against the `AGENTS.md` or think something is missing from it, suggest a change to the file but prompt me for approval first.

# Definition of done

- The change is covered by tests
- The change is the simplest solution for the problem
- The produced code and tests are easy to read
- Checks have been run (see [above](#checking-the-correctness-of-your-changes))
- You have explained the change to the user
