# Coding Conventions

- **Comments**: Only when explaining something non-obvious. Explain WHY, not WHAT (applies to tests too)
- **Simplicity**: Prefer simple solutions over clever ones. Readability is paramount.
- **Colocation**: Place code, including types, as close to where it's relevant as possible
- **Scope**: Only make changes required for the goal. Small commits are preferred
- **Functional style**: Prefer functional patterns (map, filter, reduce) over imperative loops where it improves readability

## TypeScript

- Prefer arrow functions over `function` syntax
- Top-level module functions must declare return types (both exported and non-exported). Exception: nested functions like callbacks
- Default to `type`, use `interface` only for object inheritance or specific interface features
- Use a destructured parameter object when a function has 4 or more parameters

## API Surface

- Keep modules' API surfaces minimal
- Internal helpers, types, and constants should be unexported
- Every export should have at least one consumer outside the file
