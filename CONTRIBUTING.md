# Contributing to @theseam/ui-common

## Branches

| Branch    | Purpose                      | Publishing                                    |
| --------- | ---------------------------- | --------------------------------------------- |
| `master`  | Production                   | Publishes `@latest` to npm via release-please |
| `develop` | Integration / manual testing | Auto-publishes `@beta` to npm on every push   |

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/) to automate versioning and changelogs. Every commit to `master` (via PR) must follow this format:

```
<type>: <description>

[optional body]

[optional footer]
```

### Types and version impact

| Type                                           | Version bump  | Example                                     |
| ---------------------------------------------- | ------------- | ------------------------------------------- |
| `feat:`                                        | Minor (1.1.0) | `feat: add date range filter to datatable`  |
| `fix:`                                         | Patch (1.0.2) | `fix: resolve tel input validation on blur` |
| `feat!:` or `BREAKING CHANGE:` footer          | Major (2.0.0) | `feat!: redesign widget configuration API`  |
| `chore:`, `docs:`, `ci:`, `refactor:`, `test:` | No release    | `docs: update storybook examples`           |

### PR titles

PR titles to `master` are validated against this format. Since we squash-merge, **the PR title becomes the commit message**, so make sure it follows the convention.

## Workflow

### Day-to-day development

1. Create a feature branch from `master`:

   ```
   git checkout master && git pull
   git checkout -b your-name/feature-description
   ```

2. Make changes, commit with conventional messages. Husky runs lint-staged (prettier + eslint) on each commit automatically.

3. Push to the org repo and open a PR to `master`:

   ```
   git push -u real your-name/feature-description
   ```

4. CI runs lint, tests, and build on the PR. Fix any failures.

5. Squash-merge the PR. Make sure the merge commit title follows the conventional commit format.

### How releases work

You don't manually bump versions or run `npm publish` anymore. Here's what happens automatically:

1. When conventional commits land on `master`, **release-please** creates (or updates) a Release PR that bumps the version and updates the changelog.

2. When you're ready to release, merge the Release PR. This triggers:
   - A GitHub Release with a git tag
   - `npm publish` to the `@latest` tag
   - Storybook deployment to GitHub Pages

### Beta releases

Push or merge to the `develop` branch. CI automatically:

- Runs lint, tests, and build
- Publishes to npm with a beta version (e.g., `1.1.0-beta.42`) under the `@beta` tag

Install in apps with: `npm install @theseam/ui-common@beta`

## CI Jobs

All jobs run on pushes to `master`/`develop` and PRs to `master`:

| Job                | What it does                                               |
| ------------------ | ---------------------------------------------------------- |
| **lint**           | `npm run lint`                                             |
| **test**           | `npm run test:ci` (Jest)                                   |
| **build**          | `npm run build:ui-common`                                  |
| **publish-beta**   | Publishes `@beta` (develop only)                           |
| **release-please** | Creates/updates Release PR (master only)                   |
| **publish-latest** | Publishes `@latest` on release (master only)               |
| **deploy-docs**    | Builds and deploys Storybook to GitHub Pages (master only) |

## Local Development

**Node version:** Use the version specified in `.nvmrc` (currently 22.12.0). Run `nvm use` if you use nvm.

**Install dependencies:**

```
npm ci --legacy-peer-deps
```

**Run tests:**

```
npm run test        # jest (watch mode)
npm run test:ci     # jest (CI mode, single run)
```

**Build the library:**

```
npm run build:ui-common
```

**Run Storybook:**

```
npm run storybook
```
