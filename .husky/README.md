# Git Hooks Setup

This project uses [husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/lint-staged/lint-staged) to enforce code quality standards before commits.

## What Happens on Commit

When you run `git commit`, the following happens automatically:

1. **Prettier formats** staged files (`.ts`, `.js`, `.mjs`, `.html`)
2. **ESLint lints and auto-fixes** staged files
3. If any unfixable errors remain, the commit is **blocked** with error messages

## Benefits

- ✅ Only runs on **staged files** (fast)
- ✅ Works for **all developers** regardless of IDE
- ✅ Prevents style/lint issues from entering the codebase
- ✅ Auto-fixes most issues automatically

## Bypassing the Hook (Emergency Use Only)

If you absolutely must commit despite linting errors:

```bash
git commit --no-verify -m "your message"
```

⚠️ **Use sparingly** - this should only be used in emergencies when you need to push quickly and will fix the issues in a follow-up commit.

## Configuration

- **Hook configuration**: `.husky/pre-commit`
- **Lint-staged configuration**: `lint-staged` section in `package.json`
- **ESLint rules**: `eslint.config.mjs`
- **Prettier rules**: `.prettierrc`

## For New Contributors

When you first clone the repo and run `npm install`, husky will automatically set up the git hooks thanks to the `prepare` script in `package.json`.
