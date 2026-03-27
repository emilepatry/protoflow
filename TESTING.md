# Testing

100% test coverage is the key to great vibe coding. Tests let you move fast, trust your instincts, and ship with confidence — without them, vibe coding is just yolo coding. With tests, it's a superpower.

## Framework

- **Vitest** 4.x with jsdom environment
- **@testing-library/react** for component tests
- **@testing-library/jest-dom** for DOM assertions
- **@testing-library/user-event** for interaction simulation

## Running Tests

```bash
npm test          # single run
npm run test:watch  # watch mode
```

## Test Layers

| Layer | Location | When |
|-------|----------|------|
| Unit | `test/*.test.ts` | Pure functions, utilities, data models |
| Component | `test/*.test.tsx` | React components with @testing-library |
| Integration | `test/*.test.ts` | Cross-module interactions (store + registry) |

## Conventions

- File naming: `test/{module}.test.ts` or `test/{module}.test.tsx`
- Regression tests: `test/{name}.regression-N.test.ts`
- Use `describe` blocks grouped by module
- Assert behavior, not implementation
- Mock external deps (localStorage, Yjs, PartyKit)
