// TODO: Make sure the `@angular/flex-layout` breakpoints and bootstrap
// breakpoints work the same.
//
// I like the more spread-out ranges in '@angular/flex-layout', but since our
// styles are mostly based on bootstrap it may be worth it to drop down closer
// to the bootstrap breakpoints.
//
// Another option is to create new aliases to blend a mix between them, if it
// doesn't add to much complexity.

/**
 * | breakpoint | mediaQuery                                              |
 * |------------|---------------------------------------------------------|
 * | xs         | 'screen and (max-width: 599px)'                         |
 * | sm         | 'screen and (min-width: 600px) and (max-width: 959px)'  |
 * | md         | 'screen and (min-width: 960px) and (max-width: 1279px)' |
 * | lg         | 'screen and (min-width: 1280px) and (max-width: 1919px)'|
 * | xl         | 'screen and (min-width: 1920px) and (max-width: 5000px)'|
 * |            |                                                         |
 * | lt-sm      | 'screen and (max-width: 599px)'                         |
 * | lt-md      | 'screen and (max-width: 959px)'                         |
 * | lt-lg      | 'screen and (max-width: 1279px)'                        |
 * | lt-xl      | 'screen and (max-width: 1919px)'                        |
 * |            |                                                         |
 * | gt-xs      | 'screen and (min-width: 600px)'                         |
 * | gt-sm      | 'screen and (min-width: 960px)'                         |
 * | gt-md      | 'screen and (min-width: 1280px)'                        |
 * | gt-lg      | 'screen and (min-width: 1920px)'                        |
 */
export type MediaQueryAliases =
  // Breakpoint      MediaQuery
    'xs' //         'screen and (max-width: 599px)'
  | 'sm' //         'screen and (min-width: 600px) and (max-width: 959px)'
  | 'md' //         'screen and (min-width: 960px) and (max-width: 1279px)'
  | 'lg' //         'screen and (min-width: 1280px) and (max-width: 1919px)'
  | 'xl' //         'screen and (min-width: 1920px) and (max-width: 5000px)'
  | 'lt-sm' //      'screen and (max-width: 599px)'
  | 'lt-md' //      'screen and (max-width: 959px)'
  | 'lt-lg' //      'screen and (max-width: 1279px)'
  | 'lt-xl' //      'screen and (max-width: 1919px)'
  | 'gt-xs' //      'screen and (min-width: 600px)'
  | 'gt-sm' //      'screen and (min-width: 960px)'
  | 'gt-md' //      'screen and (min-width: 1280px)'
  | 'gt-lg' //      'screen and (min-width: 1920px)'
