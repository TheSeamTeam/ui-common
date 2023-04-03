# TelInput

## Getting Started

The external assets from `intl-tel-input` are not being bundled into the `@theseam/ui-common` assets now, so the following step is necessary.

### Make sure the flags files, utility scripts and styles are copied to the assets.

In `angular.json` add the following to the styles array for the projects using `@theseam/ui-common/tel-input`.

```json
{
  "glob": "**/*.min.css",
  "input": "node_modules/intl-tel-input/build/css",
  "output": "assets/vendor/intl-tel-input/css"
},
{
  "glob": "**/*.png",
  "input": "node_modules/intl-tel-input/build/img",
  "output": "assets/vendor/intl-tel-input/img"
},
{
  "glob": "**/utils.js",
  "input": "node_modules/intl-tel-input/build/js",
  "output": "assets/vendor/intl-tel-input/js"
}
```
