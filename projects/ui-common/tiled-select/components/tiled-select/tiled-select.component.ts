import {
  animate,
  animation,
  query,
  stagger,
  style,
  transition,
  trigger,
  useAnimation,
} from '@angular/animations'
import { BooleanInput, coerceArray } from '@angular/cdk/coercion'
import { Platform } from '@angular/cdk/platform'
import {
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  Output,
  QueryList,
  Renderer2,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'

import { InputBoolean } from '@theseam/ui-common/core'

import { TheSeamTiledSelectTileOverlayDirective } from './../../directives/tiled-select-tile-overlay.directive'
import {
  TheSeamTiledSelectItem,
  TheSeamTiledSelectLayout,
} from '../../tiled-select.models'
import { TheSeamTiledSelectTileComponent } from '../tiled-select-tile/tiled-select-tile.component'
import { NgClass, NgFor } from '@angular/common'

export const slideEnterAnimation = animation([
  style({ opacity: 0, transform: 'translateX(-15px)' }),
  stagger(100, [
    animate('0.5s', style({ opacity: 1, transform: 'translateX(0)' })),
  ]),
])

export const TILED_SELECT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TheSeamTiledSelectComponent),
  multi: true,
}

@Component({
  selector: 'seam-tiled-select',
  templateUrl: './tiled-select.component.html',
  styleUrls: ['./tiled-select.component.scss'],
  providers: [TILED_SELECT_VALUE_ACCESSOR],
  host: {
    '[attr.data-testid]': '"tiled-select"',
  },
  animations: [
    trigger('tiles', [
      transition('* => *', [
        query(':enter', useAnimation(slideEnterAnimation), { optional: true }),
      ]),
    ]),
  ],
  imports: [NgFor, NgClass, TheSeamTiledSelectTileComponent],
})
export class TheSeamTiledSelectComponent implements ControlValueAccessor {
  static ngAcceptInputType_val: BooleanInput
  static ngAcceptInputType_disabled: BooleanInput
  static ngAcceptInputType_multiple: BooleanInput
  static ngAcceptInputType_selectionToggleable: BooleanInput
  static ngAcceptInputType_tileBackdrop: BooleanInput
  static ngAcceptInputType_showSelectedIcon: BooleanInput
  static ngAcceptInputType_animationsDisabled: BooleanInput

  private readonly _platform = inject(Platform)
  private readonly _cdr = inject(ChangeDetectorRef)
  private readonly _renderer = inject(Renderer2)
  private readonly _elementRef = inject(ElementRef)

  @Input() layout: TheSeamTiledSelectLayout = 'grid'
  @Input()
  get tiles() {
    return this._tiles
  }
  set tiles(value: TheSeamTiledSelectItem[]) {
    const _value = [...(value || [])]
    for (const v of _value) {
      if (v.value === undefined) {
        if (v.name === undefined) {
          throw new Error('If value is undefined then name must be defined.')
        }
        v.value = v.name
      }
    }

    const prev = this._tiles
    if (prev.length !== _value.length) {
      this.tilesAnimationState = !this.tilesAnimationState
    } else {
      for (const t of _value) {
        if (!prev.find((p) => p.name === t.name)) {
          this.tilesAnimationState = !this.tilesAnimationState
          break
        }
      }
    }

    this._tiles = _value
  }
  private _tiles: TheSeamTiledSelectItem[] = []

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('value') val: string | string[] | undefined

  @Input() @InputBoolean() disabled = false
  @Input() @InputBoolean() multiple = false
  @Input() @InputBoolean() selectionToggleable = true
  @Input() @InputBoolean() tileBackdrop = false
  @Input() @InputBoolean() showSelectedIcon = true
  @Input() @InputBoolean() animationsDisabled: boolean = this._platform.IOS

  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() readonly change = new EventEmitter<string | string[] | undefined>()

  tilesAnimationState = false

  onChange: any
  onTouched: any

  @ContentChildren(TheSeamTiledSelectTileOverlayDirective)
  public overlayTpls?: QueryList<TheSeamTiledSelectTileOverlayDirective>

  get value(): string | string[] | undefined {
    return this.val
  }

  set value(value: string | string[] | undefined) {
    this.val = this.multiple ? [...((value as string[]) || [])] : value || ''

    this._renderer.setProperty(
      this._elementRef.nativeElement,
      'value',
      this.val,
    )

    if (this.onChange) {
      this.onChange(this.val)
      this.change.emit(this.val)
      this._cdr.markForCheck()
    }
    if (this.onTouched) {
      this.onTouched()
    }
  }

  writeValue(value: any): void {
    this.value = value
  }

  registerOnChange(fn: any): void {
    this.onChange = fn
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

  onTileSelected(event: MouseEvent, tile: TheSeamTiledSelectItem) {
    this.toggleTileSelected(tile)
  }

  public isSelected(tile: TheSeamTiledSelectItem) {
    if (!this.multiple) {
      if (this.value === tile.value) {
        return true
      }
    } else {
      if (this.value) {
        for (const v of this.value) {
          if (v === tile.value) {
            return true
          }
        }
      }
    }

    return false
  }

  public toggleTileSelected(tile: TheSeamTiledSelectItem): void {
    if (!this.selectionToggleable && this.isSelected(tile)) {
      return
    }

    if (this.isSelected(tile)) {
      this.unselectTile(tile)
    } else {
      this.selectTile(tile)
    }
  }

  public selectTile(tile: TheSeamTiledSelectItem): void {
    if (this.multiple) {
      if (!this.isSelected(tile)) {
        const value: string[] = (this.value as string[]) || []
        this.value = [...coerceArray(value), tile.value]
      }
    } else {
      this.value = tile.value
    }
  }

  public unselectTile(tile: TheSeamTiledSelectItem): void {
    if (this.multiple) {
      const value: string[] = (this.value as string[]) || []
      this.value = value.filter((v) => v !== tile.value)
    } else {
      this.value = undefined
    }
  }

  public getSelectedTiles(): TheSeamTiledSelectItem[] {
    return this.tiles.filter((t) => this.isSelected(t))
  }

  getOverlayTpl(
    tile: TheSeamTiledSelectItem,
  ): TheSeamTiledSelectTileOverlayDirective | undefined {
    // console.log('overlayTpls', this.overlayTpls)
    return (this.overlayTpls || []).find((t) => t.record?.name === tile.name)
  }
}
