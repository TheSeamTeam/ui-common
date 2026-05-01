# AGENTS.md - TheSeam UI Common

## Project Overview

`@theseam/ui-common` is a shared Angular UI component library published via ng-packagr. It provides 50+ modular components, directives, services, and utilities used by TheSeam applications. The library is published to npm under the `@theseam/ui-common` scope.

**Key technologies:** Angular 20, ng-packagr, Jest, ESLint 9 (flat config), Prettier, Storybook 9, Bootstrap 4.6

## Project Structure

```text
projects/ui-common/          # Library source (ng-packagr)
  <module>/                  # Each module is a secondary entry point
    ng-package.json          # ng-packagr entry point config
    public-api.ts            # Explicit public exports for this module
    ...
  styles/                    # Global SCSS theme and utilities
  stories/                   # Shared story assets
  testing/                   # Test utilities, harnesses, mocks
  story-helpers/             # Generic Storybook-specific helpers and features
  public_api.ts              # Root entry point (intentionally empty)
  jest.config.ts             # Jest configuration
  setup-jest.ts              # Jest setup
dist/ui-common/              # Build output (generated)
.storybook/                  # Storybook configuration
.github/workflows/           # CI/CD (GitHub Actions)
schematics/                  # Angular schematics (e.g., CSF3 migration)
```

### Secondary Entry Points

Each module directory under `projects/ui-common/` with an `ng-package.json` is a secondary entry point. Consumers import from the module path:

```typescript
import { TheSeamButtonComponent } from '@theseam/ui-common/buttons'
import { DatatableComponent } from '@theseam/ui-common/datatable'
```

The root `public_api.ts` is **intentionally empty** - do not add exports to it. All exports go through module-level `public-api.ts` files.

## Naming Conventions

### Selectors

- **Component selectors:** `seam-` prefix, kebab-case (e.g., `seam-breadcrumbs`, `seam-datatable`)
- **Directive selectors:** `seam` prefix, camelCase (e.g., `seamButton`, `seamTooltip`)

Enforced by `@angular-eslint/component-selector` and `@angular-eslint/directive-selector` rules.

### Class and Type Naming

- All types exported via `public-api.ts` (i.e., anything consumed by apps depending on this package) **must** use the `TheSeam` prefix: `TheSeamButtonComponent`, `TheSeamDatatableModule`, `TheSeamFontLoaderService`.
- Internal types not exported to consumers do not strictly require the prefix, but should follow it when practical.
- **Do not prefix interface names with `I`.** Legacy interfaces with the `I` prefix exist and are being migrated away. TypeScript's type system makes the `I` prefix unnecessary since interface-like types can be declared multiple ways.

### Files

- Standard Angular naming: `component-name.component.ts`, `service-name.service.ts`, `directive-name.directive.ts`
- Stories: `component-name.stories.ts` (CSF 3 format)
- Tests: `component-name.component.spec.ts`

## Code Patterns

### Component Architecture

The codebase is migrating from NgModules to standalone components. Both patterns coexist:

- **NgModule-based** (older, still the majority): `standalone: false` with a containing NgModule
- **Standalone components** (preferred for new code): `standalone: true` with direct `imports`

NgModules still make sense in cases where a component expects to always import multiple directives or needs specific providers, but in general prefer standalone for new work.

### Dependency Injection

Use the `inject()` function for new code:

```typescript
private readonly _service = inject(MyService)
```

Constructor injection (`constructor(private service: MyService)`) exists in older code and is being migrated.

### Variable Naming Conventions

- Declare injected properties as `readonly` unless there is a specific reason not to, since there is rarely a reason to reassign them.
- Declare observable instance variables as `readonly` to prevent the reference from being overwritten, rather than designing pipes to handle reference changes.
- Prefix private variables with `_` (e.g., `private _count = 0`). This helps when inspecting objects in devtools or reading code without intellisense.
- In components, instance variables that are only non-`private` so the template can access them should also be prefixed with `_` to signal they are not intended for external use (Angular templates cannot access `private` members).

### Mixins (Core Behavior)

Located in `projects/ui-common/core/`. Composable behavior via TypeScript mixins:

- `mixinDisabled`, `mixinTheme`, `mixinSize`, `mixinTabIndex`, `mixinInitialized`, `mixinActive`

Used like:

```typescript
const _Base = mixinSize(mixinTheme(mixinDisabled(BaseClass), 'btn'), 'btn')
export class TheSeamButtonComponent extends _Base {}
```

### Custom Input Decorators

`@InputBoolean()` and `@InputNumber()` decorators in `core/input-decorators/` for input coercion.

### Change Detection

Use `ChangeDetectionStrategy.OnPush` consistently.

## Styling

### Global Styles (`projects/ui-common/styles/`)

Two-file pattern:

- **`theme.scss`** - Global stylesheet with CSS rules. Imported once at the app level.
- **`utilities.scss`** - Variables, functions, mixins only (no CSS output). Safe to import in any component SCSS without duplicating rules.

The `utilities.scss` file explicitly documents this constraint at the top.

Built on Bootstrap 4.6 with Seam-specific variables in `styles/_variables.scss`.

### Secondary Entry Point Styles

Some modules have their own `styles/` directory (e.g., `breadcrumbs/styles/`, `framework/base-layout/styles/`). These are bundled as assets via `ng-package.json` so that consuming apps can import only the styles they need, keeping feature-specific styles co-located with their feature. See the `assets` array in `projects/ui-common/ng-package.json` for the full list.

## Commands

| Command                     | Purpose                                         |
| --------------------------- | ----------------------------------------------- |
| `npm run build:ui-common`   | Production build (ng-packagr)                   |
| `npm run build-w:ui-common` | Watch mode build (4GB memory)                   |
| `npm run test`              | Jest (watch mode)                               |
| `npm run test:ci`           | Jest single run, in-band                        |
| `npm run test-storybook`    | Storybook test runner (runs story `play` funcs) |
| `npm run lint`              | ESLint check                                    |
| `npm run lint:format`       | Prettier + ESLint auto-fix                      |
| `npm run storybook`         | Storybook dev server                            |
| `npm run build-storybook`   | Build static Storybook                          |

## Testing

### Testing Approach

- **`*.spec.ts` (Jest):** Used for general unit testing - TypeScript logic tests, and some rendering tests.
- **`*.stories.ts` (Storybook):** UI tests are written as `play` functions in stories. This allows stepping through interactions visually in Storybook or running them automated with the storybook test-runner (`npm run test-storybook`). Play functions support Jest `expect` assertions. **Note:** When running the storybook test-runner, assume Storybook is already running. The developer typically has it open during development and starting it can take several minutes. If the test-runner fails to connect, ask the user before attempting to start a new Storybook instance.

Available test utilities:

- **Spectator** (`@ngneat/spectator/jest`) - available for component tests
- **Testing Library** (`@testing-library/angular`) - available for user-interaction-focused tests
- **CDK Test Harnesses** - for complex component testing, work in both TestBed and Storybook

### Test Coverage

Tests are selectively enabled by directory in `jest.config.ts`. When the project switched from Jasmine to Jest, many `*.spec.ts` files had errors or empty tests. Rather than adding placeholders, directories are enabled as their tests are updated. Currently enabled: breadcrumbs, buttons, datatable, graphql, utils, validators, dynamic-component-loader, tel-input, tooltip, tabbed, datatable-alterations-display, route-transitions.

### Test Harnesses

Built on Angular CDK's `ComponentHarness`. Designed to work in both TestBed and Storybook environments (via `@marklb/storybook-harness`). Harnesses are exported for use by consuming apps to simplify testing of library components.

- **Feature-specific harnesses** belong in the feature's own `testing/` directory (e.g., `projects/ui-common/buttons/testing/` for button harnesses).
- **`projects/ui-common/testing/harnesses/`** is for harnesses that don't belong to a specific feature, such as harnesses for third-party dependencies that don't provide their own (e.g., harnesses for `@ng-select/ng-select`).

## Linting & Formatting

### ESLint

Flat config in `eslint.config.mjs`. Key active rules:

- `camelcase` (properties: never), `eqeqeq` (always, except null), `no-console` (warn)
- `guard-for-in`, `no-bitwise`, `no-eval`, `no-extend-native`, `no-param-reassign`
- `prefer-const`, `prefer-arrow-callback`, `no-var`
- `@typescript-eslint/no-shadow`, `@typescript-eslint/no-explicit-any` (off)
- Stylistic rules are mostly deferred to Prettier (commented out in config)

### Prettier

Config in `.prettierrc`: 2-space indent, no semicolons, single quotes, trailing commas, arrow parens always.

### Pre-commit

Husky + lint-staged runs `prettier --write` and `eslint --fix` on staged `.ts`, `.js`, `.mjs`, `.html` files.

## CI/CD

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow, branching strategy, and release process.

### GitHub Actions

**`ci.yml`** - Triggers on push to `master`/`develop` and PRs to `master`:

1. **lint** - ESLint
2. **test** - Jest (`test:ci`)
3. **build** - ng-packagr, uploads dist artifact
4. **publish-beta** - On `develop` push only. Publishes `{version}-beta.{run_number}` to npm with `@beta` tag
5. **release-please** - On `master` push only. Creates release PRs via conventional commits
6. **publish-latest** - When release-please creates a release. Publishes to npm with `@latest` tag
7. **deploy-docs** - On `master` push. Builds Storybook and deploys to GitHub Pages

**`pr-title.yml`** - Validates PR titles follow conventional commit format.

### Conventional Commits

Required for all PRs to `master`. Since PRs are squash-merged, the PR title becomes the commit message. Release-please uses them to determine version bumps:

- `feat:` -> minor, `fix:` -> patch, `feat!:` / `fix!:` -> major
- `chore:`, `docs:`, `ci:`, `refactor:`, `test:` -> no release

## Branching

| Branch    | Purpose                      | Publishes                    |
| --------- | ---------------------------- | ---------------------------- |
| `master`  | Production                   | `@latest` via release-please |
| `develop` | Integration / manual testing | `@beta` on every push        |

## Storybook

- CSF 3 format (no MDX)
- Compodoc integration for auto-generated docs
- Addons: docs, links, a11y, jest results
- Stories located alongside their components or in module `stories/` directories
- Development is mainly done in Storybook for this project

## Node Version

Specified in `.nvmrc`: **22.12.0**. CI uses `npm ci --legacy-peer-deps`.
