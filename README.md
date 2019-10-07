# UI Common

This project is for common components and styles to be used in applications developed for The Seam.

## Getting Started

Development is mainly done in Storybook for this project. You can add demos to the default app if they don't work well in a story scenario.

Start storybook:

```sh
$ npm run storybook
```

## Usage

### npm install

```sh
$ npm i @theseam/ui-common
```

### npm link

#### In this project

```sh
$ npm run build:ui-common # For development you can use build-w:ui-common for watch mode.
$ cd dist/ui-common
# $ npm i # May be needed if linking in a new project, which may not have the dependencies in its own node_modules, since `npm link @theseam/ui-common` doesn't install dependencies like `npm i @theseam/ui-common`
$ npm link
```

#### In other project

```sh
$ npm link @theseam/ui-common
```

angular.json

> This change shouldn't be needed when the build process is more refined. The libraries icons include font files as a path that the sass compiler isn't finding through npm link.
> If not using npm link, change "node_modules/@theseam/ui-common/node_modules/@marklb/ngx-datatable/release/assets/icons.css" to "node_modules/@marklb/ngx-datatable/release/assets/icons.css"

```json
{
  ...,
  "projects": {
    "app": {
      "architect": {
        "build": {
          ...,
          "options": {
            ...,
            "styles": [
              ...,
              "node_modules/@theseam/ui-common/node_modules/@marklb/ngx-datatable/release/assets/icons.css"
            ],
            "es5BrowserSupport": true,
            "preserveSymlinks": true
          }
        },
        "test": {
          "options": {
            "styles": {
              ...,
              "node_modules/@theseam/ui-common/node_modules/@marklb/ngx-datatable/release/assets/icons.css"
            }
          }
        }
      }
    }
  }
}
```

tsconfig.json

> The compiler options are for importing js libraries that don't have valid ES module exports.

```json
{
  "compilerOptions": {
    ...,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
  },
  "paths": {
    // These paths may not be needed, but sometimes the way the build tools reference modules will confuse the type checking by including the path in the `.d.ts` files, causing the same named objects to not be the same.
    "@angular/*": ["node_modules/@angular/*"],
    "rxjs/*": ["node_modules/rxjs/*"],
    "rxjs": ["node_modules/rxjs"],
    "@ng-select/*": ["node_modules/@ng-select/*"],
  }
}

```

polyfils.ts

> This is needed for a library that checks if a property is defined on the global object.

```ts
...
 // Add global to window, assigning the value of window itself.
(window as any).global = window
```

#### Styles

The files used for the styles aren't very important, but the two separate files are.

styles/styles.scss

> This is the global stylesheet. There will not be any component scoping added, so the rules will be applied to any matching elements like normal.

```scss
@import '~@theseam/ui-common/styles/theme';
...
```

styles/_utilities.scss

> This is the file that should be careful about its imports. There should not be any css rules in this file or any files imported by this file. It should only have compile time only code, such as variables, functions, and mixins.
> If you need access to variables in a component's stylesheet, then import this file.
> The reason this file should not have any rules is, because each component's stylesheet is compiled independently scoped to that component and any rules in an imported file will be copied for each component that imports that file whether is is used or not.

```scss
@import '~@theseam/ui-common/styles/utilities';
...
```

## Publishing

Run the following commands to publish a new package version to the repository.

> There isn't a publish script yet, so the version in `projects/ui-common/package.json` has to be manually incremented first.

```sh
$ npm run build:ui-common
$ cd dist/ui-common
$ npm publish
```
