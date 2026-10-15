# Guide

Step-by-step tours that highlight parts of the page, built on
[driver.js](https://driverjs.com). Apps use `TheSeamGuideService` and never
import driver.js themselves.

## Setup

1. Install driver.js. It is an optional peer dependency, so only apps that use
   guides need it:

   ```sh
   npm install driver.js@^1.8.0
   ```

2. Provide the guide once, in the app's root providers:

   ```ts
   import { provideTheSeamGuide } from '@theseam/ui-common/guide'

   providers: [provideTheSeamGuide()]
   ```

3. Add driver.js's stylesheet to `angular.json` `styles`, ahead of the
   stylesheet that imports the guide theme:

   ```json
   "styles": [
     "node_modules/driver.js/dist/driver.css",
     "src/styles.scss"
   ]
   ```

   ```scss
   // In src/styles.scss. Set any $seam-guide-* variables first.
   @import 'node_modules/@theseam/ui-common/guide/guide-theme.scss';
   ```

   <details>
   <summary>Why the theme does not import driver.css itself</summary>

   Sass leaves an `@import` of a `.css` file as a plain CSS `@import`. A
   browser ignores one that is not at the top of a stylesheet, so an import
   inside a theme block such as `html[app-name='...'] { ... }` would never
   load.

   </details>

## Starting a guide

```ts
const ref = inject(TheSeamGuideService).start({
  steps: [
    { popover: { title: 'Welcome', description: 'A quick tour.' } },
    { element: 'save-button', popover: { description: 'Saves your work.' } },
  ],
})
inject(DestroyRef).onDestroy(() => ref.close())
```

The caller owns the ref. A guide is not closed when the component that started
it is destroyed, so tie it to that component's `DestroyRef`.

## Targets

A step's `element` is one of:

- **A registered name.** Put `seamGuideTarget="save-button"` on the element.
  The guide waits up to `targetTimeout` for it to appear, and notices when it
  goes away and comes back during the step.
- **A CSS selector.** Used when no name matches. Also waited for, but a
  selector target that goes away during its step is not noticed. Prefer a
  name for anything that is created or destroyed while the guide runs.
- **An `Element` or `ElementRef`.** Used as is.

`seamGuideTarget` cannot go on a component's own host. To make the host a
target, call `registerGuideTargetHost` from the component's constructor. The
name is any string, as with `seamGuideTarget`:

```ts
constructor() {
  registerGuideTargetHost('custom-target-name')
}
```

A step then targets it with `element: 'custom-target-name'`.

Before a step shows, the guide waits for any animation moving its target to
finish, such as the dialog containing it opening, so the highlight lands where
the target ends up. While the step shows, the highlight follows the target
when it changes size.

## Steps

- `beforeStep` runs before a step shows. The step waits for a returned
  Promise, or for an Observable's first value or completion.
- `afterStep` runs when the guide leaves a step it showed: moving to another
  step, finishing, or closing for any reason. Undo what `beforeStep` set up
  here. When the guide is closing, it is not waited for.
- `onMissingTarget` and `onTargetLost` choose what happens when a target never
  appears, or goes away: `'skip'`, `'elementless'` (a centered popover), or
  `'end'`.

Both hooks are given the guide's ref, the step, and its index. `afterStep`
also gets `closeReason`: why the guide closed, or `null` when it is moving to
another step. A hook that should only act on one of those can check it.

`beforeStep` also gets two things that last as long as the step:

- `exit$` emits once when the guide is done with the step: it moves on, skips
  the step, or closes. Use it to stop what `beforeStep` started.
- `advanceWhenTarget(target, 'appears' | 'disappears')` moves to the next step
  the first time `target` appears or goes away. This is how a step waits for
  the user to do something:

  ```ts
  {
    element: 'import-button',
    popover: { description: 'Choose a file to import.' },
    // Clicking the button opens a dialog registered as 'import-dialog'.
    beforeStep: ({ advanceWhenTarget }) =>
      advanceWhenTarget('import-dialog', 'appears'),
  }
  ```

### Buttons, labels, and progress

These popover options can be set on a step, on the guide's `popover`, or for
the whole app through `provideTheSeamGuide({ popover })`. The nearest one wins.

| Option               | Default                    |
| -------------------- | -------------------------- |
| `showButtons`        | Next, Previous, and Close  |
| `nextButtonText`     | `Next`                     |
| `previousButtonText` | `Previous`                 |
| `doneButtonText`     | `Done`, on the last step   |
| `showProgress`       | `false`                    |
| `progressText`       | `{{current}} of {{total}}` |

Close shows only while the guide is `dismissible`. A step that leaves Next out
of `showButtons` waits for the user to do something: the Right arrow key stops
advancing too, so the step has to move on itself, with `advanceWhenTarget` or
`ref.next()`.

Progress counts every step in the guide, so a skipped step leaves a gap. For
anything else, content templates and components get `index` and `total`.

## Keyboard

Right and Left move between steps, and Escape closes a dismissible guide. The
guide leaves a key alone when it is typed in a field (or another element that
uses those keys, such as a listbox), or in a dialog opened after the guide
started. Escape there goes to that element or dialog.

An Escape the guide does act on is not passed on, so it closes the guide and
not the modal the guide is shown over.

## Known limitations

- **A dialog opened during a step is covered by the guide.** driver.js's
  overlay sits above CDK overlays, so a dialog opened from a highlighted
  control (a delete confirmation, say) cannot be clicked until the guide
  closes or moves on. Either make the dialog the next step's target, so it is
  highlighted, or close the guide before opening it.
- **A console error about a passive event listener.** Clicking inside the
  popover can log "Unable to preventDefault inside passive event listener
  invocation". Zone.js shares one native listener per target, event type, and
  capture flag. CDK (`mousedown`) and Google Maps (`pointerdown`) register
  theirs first as passive, so driver.js's `preventDefault()` is refused. It is
  harmless: the click still works.
- **Only one guide runs at a time.** Starting another supersedes a dismissible
  guide and throws `TheSeamGuideBusyError` for one that is not.
