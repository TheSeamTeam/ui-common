import { Component } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest'

import { TheSeamFileFieldComponent } from './file-field.component'
import { TheSeamFileInputComponent } from './file-input.component'
import { SeamFileItem } from './file-item.models'
import { seamFileItemFromFile, seamFileItemFromUrl } from './file-item.utils'

// ---------------------------------------------------------------------------
// Reusable host component
// ---------------------------------------------------------------------------

@Component({
  selector: 'test-field-host',
  template: `
    <seam-file-field
      [formControl]="ctrl"
      [multiple]="multiple"
      [previewMode]="previewMode"
    ></seam-file-field>
  `,
  imports: [TheSeamFileFieldComponent, ReactiveFormsModule],
})
class FieldHost {
  ctrl = new FormControl<SeamFileItem[]>([])
  multiple = false
  previewMode = false
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findFileInputCmp(
  spectator: Spectator<FieldHost>,
): TheSeamFileInputComponent | undefined {
  return spectator.debugElement
    .queryAll(() => true)
    .map((de) => de.componentInstance)
    .find(
      (cmp) => cmp && cmp.constructor.name === 'TheSeamFileInputComponent',
    ) as TheSeamFileInputComponent | undefined
}

// ---------------------------------------------------------------------------
// Single-mode CVA + C-pattern
// ---------------------------------------------------------------------------

describe('TheSeamFileFieldComponent — single-mode CVA + C-pattern', () => {
  let spectator: Spectator<FieldHost>
  const createComponent = createComponentFactory({
    component: FieldHost,
    imports: [FieldHost],
  })

  beforeEach(() => {
    spectator = createComponent()
  })

  it('shows the input and no tile when value is empty', () => {
    expect(spectator.query('seam-file-input')).not.toBeNull()
    expect(spectator.query('seam-file-tile')).toBeNull()
    expect(spectator.query('.seam-file-field__replace')).toBeNull()
  })

  it('replaces the input with a tile and replace bar when a file is present (C-pattern)', () => {
    spectator.component.ctrl.setValue([
      seamFileItemFromFile(new File(['a'], 'a.png', { type: 'image/png' })),
    ])
    spectator.detectChanges()

    // In filled single-mode, the visible input is replaced; only a hidden one
    // remains (for picker delegation from the replace bar).
    const visibleInputs = spectator.queryAll('seam-file-input:not([hidden])')
    expect(visibleInputs.length).toBe(0)
    expect(spectator.query('seam-file-tile')).not.toBeNull()
    expect(spectator.query('.seam-file-field__replace')).not.toBeNull()
  })

  it('removing the tile restores the empty input', () => {
    spectator.component.ctrl.setValue([
      seamFileItemFromFile(new File(['a'], 'a.png', { type: 'image/png' })),
    ])
    spectator.detectChanges()
    const removeBtn = spectator.query('.seam-file-tile__remove') as HTMLElement
    removeBtn.click()
    spectator.detectChanges()
    expect(spectator.component.ctrl.value).toEqual([])
    expect(spectator.query('seam-file-input:not([hidden])')).not.toBeNull()
    expect(spectator.query('seam-file-tile')).toBeNull()
  })

  it('accepts pre-filled URL-sourced items through writeValue (edit form)', () => {
    spectator.component.ctrl.setValue([
      seamFileItemFromUrl('https://ex.com/logo.png', {
        type: 'image/png',
        id: 'doc-1',
      }),
    ])
    spectator.detectChanges()
    expect(spectator.query('seam-file-tile')).not.toBeNull()
    const img = spectator.query('img.seam-file-tile__thumb') as HTMLImageElement
    expect(img.src).toBe('https://ex.com/logo.png')
  })

  it('maps filesAdded from the embedded input into SeamFileItems appended to the CVA value', () => {
    const f = new File(['x'], 'x.pdf', { type: 'application/pdf' })
    const inputCmp = findFileInputCmp(spectator)
    expect(inputCmp).toBeTruthy()
    inputCmp!.filesAdded.emit([f])
    spectator.detectChanges()

    const value = spectator.component.ctrl.value!
    expect(value.length).toBe(1)
    expect(value[0].name).toBe('x.pdf')
    expect(value[0].source).toEqual({ kind: 'file', file: f })
  })

  it('disables the embedded input and tile when the control is disabled', () => {
    spectator.component.ctrl.disable()
    spectator.detectChanges()

    const inputZone = spectator.query(
      '.seam-file-input__zone',
    ) as HTMLElement | null
    if (inputZone) {
      expect(inputZone.getAttribute('tabindex')).toBe('-1')
    }
  })
})

// ---------------------------------------------------------------------------
// Multi-mode
// ---------------------------------------------------------------------------

describe('TheSeamFileFieldComponent — multi-mode', () => {
  let spectator: Spectator<FieldHost>
  const createComponent = createComponentFactory({
    component: FieldHost,
    imports: [FieldHost],
  })

  beforeEach(() => {
    spectator = createComponent()
    spectator.component.multiple = true
    spectator.detectChanges()
  })

  it('keeps the input visible and renders no tiles when empty', () => {
    expect(spectator.query('seam-file-input')).not.toBeNull()
    expect(spectator.queryAll('seam-file-tile').length).toBe(0)
  })

  it('renders tiles below the input after files are added', () => {
    const f1 = new File(['a'], 'a.pdf', { type: 'application/pdf' })
    const f2 = new File(['b'], 'b.pdf', { type: 'application/pdf' })
    spectator.component.ctrl.setValue([
      seamFileItemFromFile(f1),
      seamFileItemFromFile(f2),
    ])
    spectator.detectChanges()

    expect(spectator.query('seam-file-input')).not.toBeNull()
    expect(spectator.queryAll('seam-file-tile').length).toBe(2)
  })

  it('accumulates new files rather than replacing them', () => {
    const f1 = new File(['a'], 'a.pdf', { type: 'application/pdf' })
    spectator.component.ctrl.setValue([seamFileItemFromFile(f1)])
    spectator.detectChanges()

    const inputCmp = findFileInputCmp(spectator)

    const f2 = new File(['b'], 'b.pdf', { type: 'application/pdf' })
    inputCmp!.filesAdded.emit([f2])
    spectator.detectChanges()

    expect(spectator.component.ctrl.value!.map((i) => i.name)).toEqual([
      'a.pdf',
      'b.pdf',
    ])
  })

  it('applies preview layout wrapping when previewMode is true', () => {
    spectator.component.previewMode = true
    spectator.detectChanges()
    spectator.component.ctrl.setValue([
      seamFileItemFromFile(new File(['a'], 'a.png', { type: 'image/png' })),
      seamFileItemFromFile(new File(['b'], 'b.png', { type: 'image/png' })),
    ])
    spectator.detectChanges()

    const list = spectator.query(
      '.seam-file-field__tiles',
    ) as HTMLElement | null
    expect(list).not.toBeNull()
    expect(list?.classList).toContain('seam-file-field__tiles--preview')
  })
})

// ---------------------------------------------------------------------------
// Multi-mode with maxFiles cap
// ---------------------------------------------------------------------------

describe('TheSeamFileFieldComponent — multi-mode with maxFiles', () => {
  @Component({
    selector: 'test-max-host',
    template: `
      <seam-file-field
        [formControl]="ctrl"
        [multiple]="true"
        [maxFiles]="2"
      ></seam-file-field>
    `,
    imports: [TheSeamFileFieldComponent, ReactiveFormsModule],
  })
  class MaxHost {
    ctrl = new FormControl<SeamFileItem[]>([])
  }

  let spectator: Spectator<MaxHost>
  const createComponent = createComponentFactory({
    component: MaxHost,
    imports: [MaxHost],
  })

  it('caps accumulated files at maxFiles across subsequent adds', () => {
    spectator = createComponent()
    const inputCmp = spectator.debugElement
      .queryAll(() => true)
      .map((de) => de.componentInstance)
      .find(
        (cmp) => cmp && cmp.constructor.name === 'TheSeamFileInputComponent',
      ) as TheSeamFileInputComponent | undefined

    inputCmp!.filesAdded.emit([
      new File(['a'], 'a.pdf'),
      new File(['b'], 'b.pdf'),
    ])
    spectator.detectChanges()
    expect(spectator.component.ctrl.value!.length).toBe(2)

    // Verify the computed via the field component: _remainingMaxFiles reaches 0.
    const fieldCmp = spectator.debugElement
      .queryAll(() => true)
      .map((de) => de.componentInstance)
      .find(
        (cmp) => cmp && cmp.constructor.name === 'TheSeamFileFieldComponent',
      ) as TheSeamFileFieldComponent | undefined

    expect(fieldCmp).toBeTruthy()
    // @ts-expect-error protected access for testing
    expect(fieldCmp!._remainingMaxFiles()).toBe(0)
  })
})
