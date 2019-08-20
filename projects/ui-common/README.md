# UI Common

## Getting Started

### npm link

#### In this project

```sh
$ npm run build:ui-common
$ cd dist/ui-common
$ npm i
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
    "@angular/*": ["node_modules/@angular/*"]
  }
}

```

polyfils.ts

> This is needed for a library that checks if a property is defined on the global object.

```ts
 // Add global to window, assigning the value of window itself.
(window as any).global = window
```

#### Styles

The files used for the styles aren't very important, but the two separate files are.

styles/styles.scss

> This is the global stylesheet. There will not be any component scoping added, so the rules will be applied to any matching elements like normal.

```scss
@import '~@theseam/ui-common/styles/theme';
```

styles/_utilities.scss

> This is the file that should be careful about its imports. There should not be any css rules in this file or any files imported by this file. It should only have compile time only code, such as variables, functions, and mixins.
> If you need access to variables in a component's stylesheet, then import this file.
> The reason this file should not have any rules is, because each component's stylesheet is compiled independently scoped to that component and any rules in a imported file will be copied for each component that imports that file whether is is used or not.

```scss
@import '~@theseam/ui-common/styles/utilities';
```
