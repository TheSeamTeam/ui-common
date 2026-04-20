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
