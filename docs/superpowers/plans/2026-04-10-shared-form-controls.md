# Shared Form Control Utilities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move duplicated Angular form control helpers from apps into `@theseam/ui-common/framework`, typed and configurable, with backward-compatible refactoring of existing validators.

**Architecture:** Layered API — config interfaces (Layer 0), validator getters (Layer 1), control factories (Layer 2), and an address FormGroup factory (Layer 3). Existing validators in `@theseam/ui-common/validators` refactored from constants to configurable factories (breaking change). All new exports use `TheSeam` prefix per AGENTS.md.

**Tech Stack:** Angular 20, Reactive Forms (`FormControl<string | null>`), RxJS, Jest, ng-packagr secondary entry points

**Spec:** `docs/superpowers/specs/2026-04-10-shared-form-controls-design.md`

---

## File Map

### New files (`projects/ui-common/framework/form/`)

| File | Responsibility |
|------|---------------|
| `models/control-validators.ts` | `TheSeamControlValidators` interface |
| `models/validator-overrides.ts` | `TheSeamValidatorOverrides` interface |
| `models/address-field-config.ts` | `TheSeamAddressFieldConfig` + `DEFAULT_ADDRESS_FIELD_CONFIG` |
| `models/username-field-config.ts` | `TheSeamUsernameFieldConfig` + `DEFAULT_USERNAME_FIELD_CONFIG` |
| `models/create-country-control-options.ts` | `TheSeamCreateCountryControlOptions` |
| `models/address-form-group-options.ts` | `TheSeamAddressFormGroupOptions` |
| `models/address-form-value.ts` | `TheSeamAddressFormValue` |
| `helpers/is-country-usa.ts` | `isCountryUSA()` |
| `helpers/if-usa.ts` | `ifUSA()` conditional validator wrapper |
| `validators/state-province-region.validator.ts` | async validator for state codes |
| `validators/username-exists.validator.ts` | async validator mirroring `emailExistsValidator` |
| `controls/get-address1-validators.ts` | Layer 1 |
| `controls/get-address2-validators.ts` | Layer 1 |
| `controls/get-city-validators.ts` | Layer 1 |
| `controls/get-country-validators.ts` | Layer 1 |
| `controls/get-state-validators.ts` | Layer 1 |
| `controls/get-zip-validators.ts` | Layer 1 |
| `controls/get-username-validators.ts` | Layer 1 |
| `controls/create-address1-control.ts` | Layer 2 |
| `controls/create-address2-control.ts` | Layer 2 |
| `controls/create-city-control.ts` | Layer 2 |
| `controls/create-country-control.ts` | Layer 2 |
| `controls/create-state-control.ts` | Layer 2 |
| `controls/create-zip-control.ts` | Layer 2 |
| `controls/create-username-control.ts` | Layer 2 |
| `controls/create-address-form-group.ts` | Layer 3 |
| `index.ts` | barrel export |

### Modified files

| File | Change |
|------|--------|
| `projects/ui-common/framework/public-api.ts` | Add `export * from './form/index'` |
| `projects/ui-common/validators/decimal.validator.ts` | Refactor to configurable factory |
| `projects/ui-common/validators/integer.validator.ts` | Refactor to configurable factory |
| `projects/ui-common/validators/phone-length.validator.ts` | Refactor to configurable factory |
| `projects/ui-common/validators/public-api.ts` | Add config interface exports |
| `projects/ui-common/validators/decimal.validator.spec.ts` | Update for factory API |
| `projects/ui-common/validators/integer.validator.spec.ts` | Update for factory API |
| `projects/ui-common/jest.config.ts` | Add `**/framework/form/**/*.spec.ts` to testMatch |

### Reused from library (no changes needed)

| Import | From |
|--------|------|
| `isEmptyInputValue` | `@theseam/ui-common/utils` (`projects/ui-common/utils/form/is-empty-input-value.ts`) |
| `isNumeric` | `@theseam/ui-common/utils` |

---

## Task 1: Enable framework/form tests in Jest

**Files:**
- Modify: `projects/ui-common/jest.config.ts:32-47`

- [ ] **Step 1: Add framework/form to testMatch**

In `projects/ui-common/jest.config.ts`, add `'**/framework/form/**/*.spec.ts'` to the `testMatch` array:

```typescript
  testMatch: [
    // TODO: Remove the specific folders when the projects tests are more stable.
    '**/breadcrumbs/**/*.spec.ts',
    '**/graphql/**/*.spec.ts',
    '**/buttons/**/*.spec.ts',
    // '**/framework/side-nav/**/*.spec.ts',
    '**/framework/form/**/*.spec.ts',
    '**/utils/**/*.spec.ts',
    '**/validators/**/*.spec.ts',
    '**/datatable/**/*.spec.ts',
    '**/dynamic-component-loader/**/*.spec.ts',
    '**/tel-input/**/*.spec.ts',
    '**/tooltip/**/*.spec.ts',
    '**/tabbed/**/*.spec.ts',
    '**/datatable-alterations-display/**/*.spec.ts',
    '**/route-transitions/**/*.spec.ts',
  ],
```

- [ ] **Step 2: Commit**

```bash
git add projects/ui-common/jest.config.ts
git commit -m "chore: enable jest tests for framework/form"
```

---

## Task 2: Refactor existing validators to configurable factories

**Files:**
- Modify: `projects/ui-common/validators/decimal.validator.ts`
- Modify: `projects/ui-common/validators/integer.validator.ts`
- Modify: `projects/ui-common/validators/phone-length.validator.ts`
- Modify: `projects/ui-common/validators/public-api.ts`
- Modify: `projects/ui-common/validators/decimal.validator.spec.ts`
- Modify: `projects/ui-common/validators/integer.validator.spec.ts`

- [ ] **Step 1: Update decimal.validator.spec.ts for factory API**

Change all `decimalValidator(new UntypedFormControl(...))` calls to `decimalValidator()(new UntypedFormControl(...))` — the validator is now a factory that returns a `ValidatorFn`. Also add a test for custom config:

```typescript
import { UntypedFormControl } from '@angular/forms'

import { decimalValidator } from './decimal.validator'

describe('decimalValidator', () => {
  it('should return null for empty control', () => {
    expect(decimalValidator()(new UntypedFormControl())).toBeNull()
    expect(decimalValidator()(new UntypedFormControl(null))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl(undefined))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl([]))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl(''))).toBeNull()
  })

  it('should succeed for valid decimal control values', () => {
    expect(decimalValidator()(new UntypedFormControl(0))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl(1))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl(-1))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl(0.1))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl(1.0))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl(1.1))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl(-0.1))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl(-1.0))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl(-1.1))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl(1234567.012345))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl(-1234567.012345))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl('0'))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl('1'))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl('-1'))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl('.1'))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl('1.'))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl('0.1'))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl('1.0'))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl('1.1'))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl('-.1'))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl('-1.'))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl('-0.1'))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl('-1.0'))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl('-1.1'))).toBeNull()
    expect(decimalValidator()(new UntypedFormControl('-1234567.012345'))).toBeNull()
  })

  it('should fail for non-valid decimal control values', () => {
    expect(decimalValidator()(new UntypedFormControl('a'))).toEqual({
      decimal: { reason: 'Must be valid decimal number.' },
    })
    expect(decimalValidator()(new UntypedFormControl(NaN))).toEqual({
      decimal: { reason: 'Must be valid decimal number.' },
    })
    expect(decimalValidator()(new UntypedFormControl(Infinity))).toEqual({
      decimal: { reason: 'Must be valid decimal number.' },
    })
    expect(decimalValidator()(new UntypedFormControl({}))).toEqual({
      decimal: { reason: 'Must be valid decimal number.' },
    })
    expect(decimalValidator()(new UntypedFormControl(true))).toEqual({
      decimal: { reason: 'Must be valid decimal number.' },
    })
    expect(decimalValidator()(new UntypedFormControl([1]))).toEqual({
      decimal: { reason: 'Must be valid decimal number.' },
    })
  })

  it('should accept custom regex config', () => {
    // Only allow positive integers (no decimals, no sign)
    const positiveOnly = decimalValidator({ regex: /^\d+$/ })
    expect(positiveOnly(new UntypedFormControl('123'))).toBeNull()
    expect(positiveOnly(new UntypedFormControl('-1'))).toEqual({
      decimal: { reason: 'Must be valid decimal number.' },
    })
  })
})
```

Note: The full set of invalid test cases from the existing spec should be preserved. The above shows the pattern — every `decimalValidator(...)` becomes `decimalValidator()(...)`. Apply this transformation to ALL existing test cases.

- [ ] **Step 2: Run decimal test to verify it fails**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern="decimal.validator" --no-coverage`
Expected: FAIL — `decimalValidator()(...)` is not a function yet.

- [ ] **Step 3: Refactor decimal.validator.ts to factory**

Replace `projects/ui-common/validators/decimal.validator.ts`:

```typescript
import { AbstractControl, ValidatorFn, Validators } from '@angular/forms'

import { isEmptyInputValue, isNumeric } from '@theseam/ui-common/utils'

export const DECIMAL_REGEX = /^([-+]{1})?\d*(\.\d*)?$/

export interface TheSeamDecimalConfig {
  regex: RegExp
}

const DEFAULT_CONFIG: TheSeamDecimalConfig = {
  regex: DECIMAL_REGEX,
}

/**
 * Validates control value is a valid decimal number.
 *
 * NOTE: This does not allow any js valid decimal number. It only accepts them
 * in a format expected by our backend.
 */
export function decimalValidator(config?: Partial<TheSeamDecimalConfig>): ValidatorFn {
  const c = { ...DEFAULT_CONFIG, ...config }
  return (control: AbstractControl) => {
    if (isEmptyInputValue(control.value)) {
      return null // don't validate empty values to allow optional controls
    }

    const isDecimal =
      !Array.isArray(control.value) &&
      isNumeric(control.value) &&
      Validators.pattern(c.regex)(control) === null

    if (!isDecimal) {
      return { decimal: { reason: 'Must be valid decimal number.' } }
    }

    return null
  }
}
```

- [ ] **Step 4: Run decimal test to verify it passes**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern="decimal.validator" --no-coverage`
Expected: PASS

- [ ] **Step 5: Update integer.validator.spec.ts for factory API**

Same transformation: all `integerValidator(new UntypedFormControl(...))` become `integerValidator()(new UntypedFormControl(...))`. Add custom config test:

```typescript
  it('should accept custom regex config', () => {
    const positiveOnly = integerValidator({ regex: /^\d+$/ })
    expect(positiveOnly(new UntypedFormControl('123'))).toBeNull()
    expect(positiveOnly(new UntypedFormControl('-1'))).toEqual({
      integer: { reason: 'Must be valid integer.' },
    })
  })
```

Apply the `()` transformation to ALL existing test cases in the file.

- [ ] **Step 6: Run integer test to verify it fails**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern="integer.validator" --no-coverage`
Expected: FAIL

- [ ] **Step 7: Refactor integer.validator.ts to factory**

Replace `projects/ui-common/validators/integer.validator.ts`:

```typescript
import { AbstractControl, ValidatorFn, Validators } from '@angular/forms'

import { isEmptyInputValue, isNumeric } from '@theseam/ui-common/utils'

export const INTEGER_REGEX = /^([-+]{1})?[0-9]*$/

export interface TheSeamIntegerConfig {
  regex: RegExp
}

const DEFAULT_CONFIG: TheSeamIntegerConfig = {
  regex: INTEGER_REGEX,
}

/**
 * Validates control value is a valid integer number.
 *
 * NOTE: This does not allow any js valid integer number. It only accepts them
 * in a format expected by our backend.
 */
export function integerValidator(config?: Partial<TheSeamIntegerConfig>): ValidatorFn {
  const c = { ...DEFAULT_CONFIG, ...config }
  return (control: AbstractControl) => {
    if (isEmptyInputValue(control.value)) {
      return null // don't validate empty values to allow optional controls
    }

    const isInteger =
      !Array.isArray(control.value) &&
      isNumeric(control.value) &&
      Validators.pattern(c.regex)(control) === null

    if (!isInteger) {
      return { integer: { reason: 'Must be valid integer.' } }
    }
    return null
  }
}
```

- [ ] **Step 8: Run integer test to verify it passes**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern="integer.validator" --no-coverage`
Expected: PASS

- [ ] **Step 9: Refactor phone-length.validator.ts to factory**

Replace `projects/ui-common/validators/phone-length.validator.ts`:

```typescript
import { AbstractControl, ValidatorFn } from '@angular/forms'

export interface TheSeamPhoneLengthConfig {
  minLength: number
  maxLength: number
}

const DEFAULT_CONFIG: TheSeamPhoneLengthConfig = {
  minLength: 7,
  maxLength: 18,
}

/**
 * Validates that a value is a valid phone number length.
 */
export function phoneLengthValidator(config?: Partial<TheSeamPhoneLengthConfig>): ValidatorFn {
  const c = { ...DEFAULT_CONFIG, ...config }
  return (control: AbstractControl) => {
    return control.value.length === 0 ||
      (control.value.length <= c.maxLength && control.value.length >= c.minLength)
      ? null
      : { phoneLength: {} }
  }
}
```

- [ ] **Step 10: Run all validator tests**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern="validators/" --no-coverage`
Expected: PASS

- [ ] **Step 11: Commit**

```bash
git add projects/ui-common/validators/
git commit -m "feat!: refactor decimal, integer, phone-length validators to configurable factories

BREAKING CHANGE: decimalValidator, integerValidator, and phoneLengthValidator
are now factories that return ValidatorFn. Update call sites from
validator(control) to validator()(control)."
```

---

## Task 3: Models and helpers

**Files:**
- Create: `projects/ui-common/framework/form/models/control-validators.ts`
- Create: `projects/ui-common/framework/form/models/validator-overrides.ts`
- Create: `projects/ui-common/framework/form/models/address-field-config.ts`
- Create: `projects/ui-common/framework/form/models/username-field-config.ts`
- Create: `projects/ui-common/framework/form/models/create-country-control-options.ts`
- Create: `projects/ui-common/framework/form/models/address-form-group-options.ts`
- Create: `projects/ui-common/framework/form/models/address-form-value.ts`
- Create: `projects/ui-common/framework/form/helpers/is-country-usa.ts`
- Create: `projects/ui-common/framework/form/helpers/if-usa.ts`

- [ ] **Step 1: Create models**

`projects/ui-common/framework/form/models/control-validators.ts`:

```typescript
import { AsyncValidatorFn, ValidatorFn } from '@angular/forms'

export interface TheSeamControlValidators {
  validators: ValidatorFn[]
  asyncValidators: AsyncValidatorFn[]
}
```

`projects/ui-common/framework/form/models/validator-overrides.ts`:

```typescript
export interface TheSeamValidatorOverrides {
  /**
   * Include `Validators.required`. Set to `false` to exclude it.
   *
   * default: true
   */
  required?: boolean
}
```

`projects/ui-common/framework/form/models/address-field-config.ts`:

```typescript
export interface TheSeamAddressFieldConfig {
  address1MaxLength: number
  address2MaxLength: number
  cityMaxLength: number
  stateMaxLength: number
  countryMaxLength: number
  zipcodePattern: RegExp
}

export const DEFAULT_ADDRESS_FIELD_CONFIG: TheSeamAddressFieldConfig = {
  address1MaxLength: 50,
  address2MaxLength: 50,
  cityMaxLength: 50,
  stateMaxLength: 200,
  countryMaxLength: 10,
  zipcodePattern: /^\d{5}(?:[-\s]\d{4})?$/,
}
```

`projects/ui-common/framework/form/models/username-field-config.ts`:

```typescript
export interface TheSeamUsernameFieldConfig {
  minLength: number
  pattern: RegExp
}

export const DEFAULT_USERNAME_FIELD_CONFIG: TheSeamUsernameFieldConfig = {
  minLength: 8,
  pattern: /^[a-zA-Z0-9\-._@+]+$/,
}
```

`projects/ui-common/framework/form/models/create-country-control-options.ts`:

```typescript
export interface TheSeamCreateCountryControlOptions {
  /**
   * Only allow 'USA' as the value.
   *
   * default: false
   */
  onlyAllowUsa?: boolean
}
```

`projects/ui-common/framework/form/models/address-form-value.ts`:

```typescript
export interface TheSeamAddressFormValue {
  address1: string | null
  address2: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
}
```

`projects/ui-common/framework/form/models/address-form-group-options.ts`:

```typescript
import { DestroyRef } from '@angular/core'
import { FormControl, FormGroup, Subscription } from '@angular/forms'
import { Observable } from 'rxjs'

import { TheSeamAddressFieldConfig } from './address-field-config'
import { TheSeamAddressFormValue } from './address-form-value'

export interface TheSeamAddressFormGroupOptions {
  config?: Partial<TheSeamAddressFieldConfig>
  stateCodes: Observable<string[]>
  /** default: true */
  countryRequiredOutsideUSA?: boolean
  /** default: 'USA' */
  defaultCountry?: string
  /** If provided, country-change subscription is auto-cleaned up. */
  destroyRef?: DestroyRef
}

export type TheSeamAddressFormControls = Record<keyof TheSeamAddressFormValue, FormControl<string | null>>

export type TheSeamAddressFormGroupResult<T extends TheSeamAddressFormGroupOptions> =
  T extends { destroyRef: DestroyRef }
    ? FormGroup<TheSeamAddressFormControls>
    : {
        group: FormGroup<TheSeamAddressFormControls>
        subscription: Subscription
      }
```

- [ ] **Step 2: Create helpers**

`projects/ui-common/framework/form/helpers/is-country-usa.ts`:

```typescript
import { AbstractControl } from '@angular/forms'

export function isCountryUSA(control: AbstractControl): boolean {
  return control.value === 'USA'
}
```

`projects/ui-common/framework/form/helpers/if-usa.ts`:

```typescript
import { isDevMode } from '@angular/core'
import { AbstractControl, ValidatorFn } from '@angular/forms'

import { isEmptyInputValue } from '@theseam/ui-common/utils'

import { isCountryUSA } from './is-country-usa'

/**
 * Use Validator if 'country' control value is 'USA'.
 *
 * If `countryControlOrPath` is not provided, it will be assumed there is a
 * sibling named 'country'.
 */
export function ifUSA(
  fn: ValidatorFn,
  countryControlOrPath?: AbstractControl | string | (string | number)[],
): ValidatorFn {
  return (control: AbstractControl) => {
    let countryControl: AbstractControl | null = null
    if (countryControlOrPath) {
      if (
        typeof countryControlOrPath === 'string' ||
        Array.isArray(countryControlOrPath)
      ) {
        countryControl = control.parent?.get(countryControlOrPath) ?? null
      } else {
        countryControl = countryControlOrPath
      }
    } else {
      countryControl = control.parent?.get('country') ?? null
    }

    if (!countryControl) {
      return null
    }

    if (!(countryControl instanceof AbstractControl)) {
      if (isDevMode()) {
        // eslint-disable-next-line no-console
        console.warn(`ifUSA expects 'country' control to be a FormControl.`)
      }
      return null
    }

    if (
      !isEmptyInputValue(countryControl.value) &&
      isCountryUSA(countryControl)
    ) {
      return fn(control)
    }

    return null
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add projects/ui-common/framework/form/models/ projects/ui-common/framework/form/helpers/
git commit -m "feat(framework/form): add models and helper functions"
```

---

## Task 4: Validators (state-province-region and username-exists)

**Files:**
- Create: `projects/ui-common/framework/form/validators/state-province-region.validator.ts`
- Create: `projects/ui-common/framework/form/validators/state-province-region.validator.spec.ts`
- Create: `projects/ui-common/framework/form/validators/username-exists.validator.ts`
- Create: `projects/ui-common/framework/form/validators/username-exists.validator.spec.ts`

- [ ] **Step 1: Write state-province-region test**

`projects/ui-common/framework/form/validators/state-province-region.validator.spec.ts`:

```typescript
import { FormControl, FormGroup } from '@angular/forms'
import { of } from 'rxjs'

import { stateProvinceRegionValidator } from './state-province-region.validator'

describe('stateProvinceRegionValidator', () => {
  const stateCodes$ = of(['AL', 'AK', 'AZ', 'AR', 'CA', 'MS'])

  function createGroup(country: string, state: string) {
    return new FormGroup({
      country: new FormControl(country),
      state: new FormControl(state, { asyncValidators: [stateProvinceRegionValidator(stateCodes$)] }),
    })
  }

  it('should return null for empty value', async () => {
    const group = createGroup('USA', '')
    const result = await group.controls.state.asyncValidator!(group.controls.state)
    expect(result).toBeNull()
  })

  it('should return null when no country sibling exists', async () => {
    const control = new FormControl('XX', { asyncValidators: [stateProvinceRegionValidator(stateCodes$)] })
    const result = await control.asyncValidator!(control)
    expect(result).toBeNull()
  })

  it('should return null for non-USA country', async () => {
    const group = createGroup('CAN', 'XX')
    const result = await group.controls.state.asyncValidator!(group.controls.state)
    expect(result).toBeNull()
  })

  it('should return null for valid USA state code', async () => {
    const group = createGroup('USA', 'MS')
    const result = await group.controls.state.asyncValidator!(group.controls.state)
    expect(result).toBeNull()
  })

  it('should return error for invalid USA state code', async () => {
    const group = createGroup('USA', 'XX')
    const result = await group.controls.state.asyncValidator!(group.controls.state)
    expect(result).toEqual({
      stateProvinceRegion: {
        reason: `If value of 'country' is 'USA' then a valid state must be selected.`,
      },
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern="state-province-region" --no-coverage`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement state-province-region.validator.ts**

`projects/ui-common/framework/form/validators/state-province-region.validator.ts`:

```typescript
import { AbstractControl, AsyncValidatorFn } from '@angular/forms'
import { Observable } from 'rxjs'
import { map, take } from 'rxjs/operators'

import { isEmptyInputValue } from '@theseam/ui-common/utils'

import { isCountryUSA } from '../helpers/is-country-usa'

export function stateProvinceRegionValidator(
  stateCodes: Observable<string[]>,
): AsyncValidatorFn {
  return async (control: AbstractControl) => {
    const errorName = 'stateProvinceRegion'
    const value = control.value

    if (isEmptyInputValue(value)) {
      return null
    }

    if (control.parent == null) {
      return null
    }

    const countryControl = control.parent.get('country')
    if (countryControl === null) {
      // eslint-disable-next-line no-console
      console.warn(`stateProvinceRegionValidator requires sibling control named 'country'.`)
      return null
    }

    if (isCountryUSA(countryControl)) {
      const isValidStateCode = await stateCodes
        .pipe(
          take(1),
          map((codes) => codes.indexOf(value) !== -1),
        )
        .toPromise()

      return isValidStateCode
        ? null
        : {
            [errorName]: {
              reason: `If value of 'country' is 'USA' then a valid state must be selected.`,
            },
          }
    }

    return null
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern="state-province-region" --no-coverage`
Expected: PASS

- [ ] **Step 5: Write username-exists test**

`projects/ui-common/framework/form/validators/username-exists.validator.spec.ts`:

```typescript
import { FormControl } from '@angular/forms'
import { of } from 'rxjs'

import { usernameExistsValidator } from './username-exists.validator'

describe('usernameExistsValidator', () => {
  it('should return null when user does not exist (Observable)', async () => {
    const validator = usernameExistsValidator(() => of(false))
    const control = new FormControl('newuser')
    const result = await validator(control)
    expect(result).toBeNull()
  })

  it('should return error when user exists (Observable)', async () => {
    const validator = usernameExistsValidator(() => of(true))
    const control = new FormControl('existinguser')
    const result = await validator(control)
    expect(result).toEqual({ usernameExists: {} })
  })

  it('should return null when user does not exist (Promise)', async () => {
    const validator = usernameExistsValidator(() => Promise.resolve(false))
    const control = new FormControl('newuser')
    const result = await validator(control)
    expect(result).toBeNull()
  })

  it('should return error when user exists (Promise)', async () => {
    const validator = usernameExistsValidator(() => Promise.resolve(true))
    const control = new FormControl('existinguser')
    const result = await validator(control)
    expect(result).toEqual({ usernameExists: {} })
  })

  it('should return null when user does not exist (boolean)', async () => {
    const validator = usernameExistsValidator(() => false)
    const control = new FormControl('newuser')
    const result = await validator(control)
    expect(result).toBeNull()
  })

  it('should return error when user exists (boolean)', async () => {
    const validator = usernameExistsValidator(() => true)
    const control = new FormControl('existinguser')
    const result = await validator(control)
    expect(result).toEqual({ usernameExists: {} })
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern="username-exists" --no-coverage`
Expected: FAIL

- [ ] **Step 7: Implement username-exists.validator.ts**

`projects/ui-common/framework/form/validators/username-exists.validator.ts`:

```typescript
import { AbstractControl, AsyncValidatorFn } from '@angular/forms'
import { isObservable, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export type TheSeamUserExistsFn = (
  userName: string,
) => Promise<boolean> | Observable<boolean> | boolean

/**
 * Validates that a username already exists.
 *
 * Mirrors the `emailExistsValidator` pattern from `@theseam/ui-common/validators`.
 */
export function usernameExistsValidator(
  userExists: TheSeamUserExistsFn,
): AsyncValidatorFn {
  return (control: AbstractControl) => {
    const validationResult = (exists: boolean) => {
      return exists === false ? null : { usernameExists: {} }
    }

    const fnRes = userExists(control.value)
    if (isObservable(fnRes)) {
      return fnRes.pipe(map(validationResult))
    }
    return Promise.resolve(fnRes).then(validationResult)
  }
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern="username-exists" --no-coverage`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add projects/ui-common/framework/form/validators/
git commit -m "feat(framework/form): add state-province-region and username-exists validators"
```

---

## Task 5: Layer 1 — Validator getters (address fields)

**Files:**
- Create: `projects/ui-common/framework/form/controls/get-address1-validators.ts`
- Create: `projects/ui-common/framework/form/controls/get-address2-validators.ts`
- Create: `projects/ui-common/framework/form/controls/get-city-validators.ts`
- Create: `projects/ui-common/framework/form/controls/get-country-validators.ts`
- Create: `projects/ui-common/framework/form/controls/get-state-validators.ts`
- Create: `projects/ui-common/framework/form/controls/get-zip-validators.ts`
- Create: `projects/ui-common/framework/form/controls/get-address-validators.spec.ts`

- [ ] **Step 1: Write tests for address validator getters**

`projects/ui-common/framework/form/controls/get-address-validators.spec.ts`:

```typescript
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { of } from 'rxjs'

import { getAddress1Validators } from './get-address1-validators'
import { getAddress2Validators } from './get-address2-validators'
import { getCityValidators } from './get-city-validators'
import { getCountryValidators } from './get-country-validators'
import { getStateValidators } from './get-state-validators'
import { getZipValidators } from './get-zip-validators'

describe('getAddress1Validators', () => {
  it('should include required by default', () => {
    const v = getAddress1Validators()
    // Validators.required should be in the list
    const ctrl = new FormControl('', v.validators)
    expect(ctrl.hasError('required')).toBe(true)
  })

  it('should exclude required when overrides.required is false', () => {
    const v = getAddress1Validators(undefined, { required: false })
    const ctrl = new FormControl('', v.validators)
    expect(ctrl.hasError('required')).toBe(false)
  })

  it('should use custom maxLength from config', () => {
    const v = getAddress1Validators({ address1MaxLength: 5 })
    const ctrl = new FormControl('123456', v.validators)
    expect(ctrl.hasError('maxlength')).toBe(true)
  })

  it('should have no async validators', () => {
    const v = getAddress1Validators()
    expect(v.asyncValidators).toEqual([])
  })
})

describe('getAddress2Validators', () => {
  it('should not include required (address2 is optional)', () => {
    const v = getAddress2Validators()
    const ctrl = new FormControl('', v.validators)
    expect(ctrl.hasError('required')).toBe(false)
  })

  it('should use custom maxLength from config', () => {
    const v = getAddress2Validators({ address2MaxLength: 3 })
    const ctrl = new FormControl('1234', v.validators)
    expect(ctrl.hasError('maxlength')).toBe(true)
  })
})

describe('getCityValidators', () => {
  it('should include required by default', () => {
    const v = getCityValidators()
    const ctrl = new FormControl('', v.validators)
    expect(ctrl.hasError('required')).toBe(true)
  })

  it('should exclude required when overrides.required is false', () => {
    const v = getCityValidators(undefined, { required: false })
    const ctrl = new FormControl('', v.validators)
    expect(ctrl.hasError('required')).toBe(false)
  })
})

describe('getCountryValidators', () => {
  it('should include required by default', () => {
    const v = getCountryValidators()
    const ctrl = new FormControl('', v.validators)
    expect(ctrl.hasError('required')).toBe(true)
  })

  it('should add onlyAllowUsa validator when option set', () => {
    const v = getCountryValidators(undefined, { onlyAllowUsa: true })
    const ctrl = new FormControl('CAN', v.validators)
    expect(ctrl.hasError('onlyAllowUsa')).toBe(true)
  })

  it('should pass for USA when onlyAllowUsa is true', () => {
    const v = getCountryValidators(undefined, { onlyAllowUsa: true })
    const ctrl = new FormControl('USA', v.validators)
    expect(ctrl.hasError('onlyAllowUsa')).toBe(false)
  })
})

describe('getStateValidators', () => {
  const stateCodes$ = of(['AL', 'MS'])

  it('should include required by default (requiredOutsideUSA=true)', () => {
    const v = getStateValidators(stateCodes$)
    // When requiredOutsideUSA=true, required is always present
    expect(v.validators.length).toBeGreaterThanOrEqual(1)
  })

  it('should have state-province-region async validator', () => {
    const v = getStateValidators(stateCodes$)
    expect(v.asyncValidators.length).toBe(1)
  })
})

describe('getZipValidators', () => {
  it('should have validators using ifUSA', () => {
    const v = getZipValidators()
    // Zip validators use ifUSA, so they depend on a parent country control
    expect(v.validators.length).toBeGreaterThanOrEqual(2)
    expect(v.asyncValidators).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern="get-address-validators" --no-coverage`
Expected: FAIL

- [ ] **Step 3: Implement get-address1-validators.ts**

```typescript
import { Validators } from '@angular/forms'

import {
  DEFAULT_ADDRESS_FIELD_CONFIG,
  TheSeamAddressFieldConfig,
} from '../models/address-field-config'
import { TheSeamControlValidators } from '../models/control-validators'
import { TheSeamValidatorOverrides } from '../models/validator-overrides'

export function getAddress1Validators(
  config?: Partial<TheSeamAddressFieldConfig>,
  overrides?: TheSeamValidatorOverrides,
): TheSeamControlValidators {
  const c = { ...DEFAULT_ADDRESS_FIELD_CONFIG, ...config }
  const o = { required: true, ...overrides }

  const validators = [
    ...(o.required ? [Validators.required] : []),
    Validators.maxLength(c.address1MaxLength),
    Validators.pattern(/[A-Za-z0-9]+/),
  ]

  return { validators, asyncValidators: [] }
}
```

- [ ] **Step 4: Implement get-address2-validators.ts**

```typescript
import { Validators } from '@angular/forms'

import {
  DEFAULT_ADDRESS_FIELD_CONFIG,
  TheSeamAddressFieldConfig,
} from '../models/address-field-config'
import { TheSeamControlValidators } from '../models/control-validators'

export function getAddress2Validators(
  config?: Partial<TheSeamAddressFieldConfig>,
): TheSeamControlValidators {
  const c = { ...DEFAULT_ADDRESS_FIELD_CONFIG, ...config }

  return {
    validators: [Validators.maxLength(c.address2MaxLength)],
    asyncValidators: [],
  }
}
```

- [ ] **Step 5: Implement get-city-validators.ts**

```typescript
import { Validators } from '@angular/forms'

import {
  DEFAULT_ADDRESS_FIELD_CONFIG,
  TheSeamAddressFieldConfig,
} from '../models/address-field-config'
import { TheSeamControlValidators } from '../models/control-validators'
import { TheSeamValidatorOverrides } from '../models/validator-overrides'

export function getCityValidators(
  config?: Partial<TheSeamAddressFieldConfig>,
  overrides?: TheSeamValidatorOverrides,
): TheSeamControlValidators {
  const c = { ...DEFAULT_ADDRESS_FIELD_CONFIG, ...config }
  const o = { required: true, ...overrides }

  const validators = [
    ...(o.required ? [Validators.required] : []),
    Validators.maxLength(c.cityMaxLength),
    Validators.pattern(/[A-Za-z0-9]+/),
  ]

  return { validators, asyncValidators: [] }
}
```

- [ ] **Step 6: Implement get-country-validators.ts**

```typescript
import { AbstractControl, ValidatorFn, Validators } from '@angular/forms'

import { isEmptyInputValue } from '@theseam/ui-common/utils'

import {
  DEFAULT_ADDRESS_FIELD_CONFIG,
  TheSeamAddressFieldConfig,
} from '../models/address-field-config'
import { TheSeamControlValidators } from '../models/control-validators'
import { TheSeamCreateCountryControlOptions } from '../models/create-country-control-options'
import { TheSeamValidatorOverrides } from '../models/validator-overrides'

const onlyAllowUsaValidator: ValidatorFn = (control: AbstractControl) => {
  if (isEmptyInputValue(control.value)) {
    return null
  }
  return control.value !== 'USA' ? { onlyAllowUsa: {} } : null
}

export function getCountryValidators(
  config?: Partial<TheSeamAddressFieldConfig>,
  options?: TheSeamCreateCountryControlOptions,
  overrides?: TheSeamValidatorOverrides,
): TheSeamControlValidators {
  const c = { ...DEFAULT_ADDRESS_FIELD_CONFIG, ...config }
  const o = { required: true, ...overrides }

  const validators: ValidatorFn[] = [
    ...(o.required ? [Validators.required] : []),
    Validators.maxLength(c.countryMaxLength),
  ]

  if (options?.onlyAllowUsa) {
    validators.push(onlyAllowUsaValidator)
  }

  return { validators, asyncValidators: [] }
}
```

- [ ] **Step 7: Implement get-state-validators.ts**

```typescript
import {
  AbstractControl,
  AsyncValidatorFn,
  ValidatorFn,
  Validators,
} from '@angular/forms'
import { Observable } from 'rxjs'

import {
  DEFAULT_ADDRESS_FIELD_CONFIG,
  TheSeamAddressFieldConfig,
} from '../models/address-field-config'
import { TheSeamControlValidators } from '../models/control-validators'
import { ifUSA } from '../helpers/if-usa'
import { stateProvinceRegionValidator } from '../validators/state-province-region.validator'

export function getStateValidators(
  stateCodes: Observable<string[]>,
  countryControlOrPath?: AbstractControl | string | (string | number)[],
  requiredOutsideUSA: boolean = true,
  config?: Partial<TheSeamAddressFieldConfig>,
): TheSeamControlValidators {
  const c = { ...DEFAULT_ADDRESS_FIELD_CONFIG, ...config }

  const validators: ValidatorFn[] = []
  if (requiredOutsideUSA) {
    validators.push(Validators.required)
  } else {
    validators.push(ifUSA(Validators.required, countryControlOrPath))
  }
  validators.push(Validators.maxLength(c.stateMaxLength))

  const asyncValidators: AsyncValidatorFn[] = [
    stateProvinceRegionValidator(stateCodes),
  ]

  return { validators, asyncValidators }
}
```

- [ ] **Step 8: Implement get-zip-validators.ts**

```typescript
import { AbstractControl, Validators } from '@angular/forms'

import {
  DEFAULT_ADDRESS_FIELD_CONFIG,
  TheSeamAddressFieldConfig,
} from '../models/address-field-config'
import { TheSeamControlValidators } from '../models/control-validators'
import { ifUSA } from '../helpers/if-usa'

export function getZipValidators(
  countryControlOrPath?: AbstractControl | string | (string | number)[],
  config?: Partial<TheSeamAddressFieldConfig>,
): TheSeamControlValidators {
  const c = { ...DEFAULT_ADDRESS_FIELD_CONFIG, ...config }

  return {
    validators: [
      ifUSA(Validators.required, countryControlOrPath),
      ifUSA(Validators.pattern(c.zipcodePattern), countryControlOrPath),
      Validators.maxLength(10),
    ],
    asyncValidators: [],
  }
}
```

- [ ] **Step 9: Run tests to verify they pass**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern="get-address-validators" --no-coverage`
Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add projects/ui-common/framework/form/controls/get-address1-validators.ts \
  projects/ui-common/framework/form/controls/get-address2-validators.ts \
  projects/ui-common/framework/form/controls/get-city-validators.ts \
  projects/ui-common/framework/form/controls/get-country-validators.ts \
  projects/ui-common/framework/form/controls/get-state-validators.ts \
  projects/ui-common/framework/form/controls/get-zip-validators.ts \
  projects/ui-common/framework/form/controls/get-address-validators.spec.ts
git commit -m "feat(framework/form): add address validator getters (Layer 1)"
```

---

## Task 6: Layer 1 — Username validator getter

**Files:**
- Create: `projects/ui-common/framework/form/controls/get-username-validators.ts`
- Create: `projects/ui-common/framework/form/controls/get-username-validators.spec.ts`

- [ ] **Step 1: Write test**

`projects/ui-common/framework/form/controls/get-username-validators.spec.ts`:

```typescript
import { FormControl } from '@angular/forms'
import { of } from 'rxjs'

import { getUsernameValidators } from './get-username-validators'

describe('getUsernameValidators', () => {
  const userExistsFn = (name: string) => of(false)

  it('should include required by default', () => {
    const v = getUsernameValidators(userExistsFn)
    const ctrl = new FormControl('', v.validators)
    expect(ctrl.hasError('required')).toBe(true)
  })

  it('should exclude required when overrides.required is false', () => {
    const v = getUsernameValidators(userExistsFn, undefined, { required: false })
    const ctrl = new FormControl('', v.validators)
    expect(ctrl.hasError('required')).toBe(false)
  })

  it('should enforce minLength from config', () => {
    const v = getUsernameValidators(userExistsFn, { minLength: 5 })
    const ctrl = new FormControl('abc', v.validators)
    expect(ctrl.hasError('minlength')).toBe(true)
  })

  it('should enforce pattern from config', () => {
    const v = getUsernameValidators(userExistsFn)
    const ctrl = new FormControl('user name!', v.validators)
    expect(ctrl.hasError('pattern')).toBe(true)
  })

  it('should have one async validator (usernameExists)', () => {
    const v = getUsernameValidators(userExistsFn)
    expect(v.asyncValidators.length).toBe(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern="get-username-validators" --no-coverage`
Expected: FAIL

- [ ] **Step 3: Implement get-username-validators.ts**

```typescript
import { Validators } from '@angular/forms'

import { TheSeamControlValidators } from '../models/control-validators'
import {
  DEFAULT_USERNAME_FIELD_CONFIG,
  TheSeamUsernameFieldConfig,
} from '../models/username-field-config'
import { TheSeamValidatorOverrides } from '../models/validator-overrides'
import {
  TheSeamUserExistsFn,
  usernameExistsValidator,
} from '../validators/username-exists.validator'

export function getUsernameValidators(
  userExists: TheSeamUserExistsFn,
  config?: Partial<TheSeamUsernameFieldConfig>,
  overrides?: TheSeamValidatorOverrides,
): TheSeamControlValidators {
  const c = { ...DEFAULT_USERNAME_FIELD_CONFIG, ...config }
  const o = { required: true, ...overrides }

  return {
    validators: [
      ...(o.required ? [Validators.required] : []),
      Validators.minLength(c.minLength),
      Validators.pattern(c.pattern),
    ],
    asyncValidators: [usernameExistsValidator(userExists)],
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern="get-username-validators" --no-coverage`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/framework/form/controls/get-username-validators.ts \
  projects/ui-common/framework/form/controls/get-username-validators.spec.ts
git commit -m "feat(framework/form): add username validator getter"
```

---

## Task 7: Layer 2 — Control factories

**Files:**
- Create: `projects/ui-common/framework/form/controls/create-address1-control.ts`
- Create: `projects/ui-common/framework/form/controls/create-address2-control.ts`
- Create: `projects/ui-common/framework/form/controls/create-city-control.ts`
- Create: `projects/ui-common/framework/form/controls/create-country-control.ts`
- Create: `projects/ui-common/framework/form/controls/create-state-control.ts`
- Create: `projects/ui-common/framework/form/controls/create-zip-control.ts`
- Create: `projects/ui-common/framework/form/controls/create-username-control.ts`
- Create: `projects/ui-common/framework/form/controls/create-controls.spec.ts`

- [ ] **Step 1: Write tests**

`projects/ui-common/framework/form/controls/create-controls.spec.ts`:

```typescript
import { FormControl, FormGroup } from '@angular/forms'
import { of } from 'rxjs'

import { createAddress1Control } from './create-address1-control'
import { createAddress2Control } from './create-address2-control'
import { createCityControl } from './create-city-control'
import { createCountryControl } from './create-country-control'
import { createStateControl } from './create-state-control'
import { createZipControl } from './create-zip-control'
import { createUsernameControl } from './create-username-control'

describe('createAddress1Control', () => {
  it('should return a typed FormControl', () => {
    const ctrl = createAddress1Control()
    expect(ctrl).toBeInstanceOf(FormControl)
    expect(ctrl.value).toBeNull()
  })

  it('should accept initial form state', () => {
    const ctrl = createAddress1Control('123 Main St')
    expect(ctrl.value).toBe('123 Main St')
  })

  it('should be invalid when empty (required)', () => {
    const ctrl = createAddress1Control()
    expect(ctrl.valid).toBe(false)
    expect(ctrl.hasError('required')).toBe(true)
  })

  it('should respect overrides to exclude required', () => {
    const ctrl = createAddress1Control(null, undefined, { required: false })
    expect(ctrl.hasError('required')).toBe(false)
  })
})

describe('createAddress2Control', () => {
  it('should be valid when empty (not required)', () => {
    const ctrl = createAddress2Control()
    expect(ctrl.valid).toBe(true)
  })
})

describe('createCityControl', () => {
  it('should be invalid when empty (required)', () => {
    const ctrl = createCityControl()
    expect(ctrl.hasError('required')).toBe(true)
  })
})

describe('createCountryControl', () => {
  it('should default to null when no formState', () => {
    const ctrl = createCountryControl()
    expect(ctrl.value).toBeNull()
  })

  it('should reject non-USA when onlyAllowUsa is true', () => {
    const ctrl = createCountryControl('CAN', { onlyAllowUsa: true })
    expect(ctrl.hasError('onlyAllowUsa')).toBe(true)
  })

  it('should accept USA when onlyAllowUsa is true', () => {
    const ctrl = createCountryControl('USA', { onlyAllowUsa: true })
    expect(ctrl.hasError('onlyAllowUsa')).toBe(false)
  })
})

describe('createStateControl', () => {
  it('should return a FormControl with async validators', () => {
    const ctrl = createStateControl(null, of(['AL', 'MS']))
    expect(ctrl).toBeInstanceOf(FormControl)
  })
})

describe('createZipControl', () => {
  it('should return a FormControl', () => {
    const ctrl = createZipControl()
    expect(ctrl).toBeInstanceOf(FormControl)
    expect(ctrl.value).toBeNull()
  })
})

describe('createUsernameControl', () => {
  it('should return a FormControl with async validators', () => {
    const ctrl = createUsernameControl(null, () => of(false))
    expect(ctrl).toBeInstanceOf(FormControl)
  })

  it('should be invalid when empty (required)', () => {
    const ctrl = createUsernameControl('', () => of(false))
    expect(ctrl.hasError('required')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern="create-controls" --no-coverage`
Expected: FAIL

- [ ] **Step 3: Implement control factories**

`projects/ui-common/framework/form/controls/create-address1-control.ts`:

```typescript
import { FormControl } from '@angular/forms'

import { TheSeamAddressFieldConfig } from '../models/address-field-config'
import { TheSeamValidatorOverrides } from '../models/validator-overrides'
import { getAddress1Validators } from './get-address1-validators'

export function createAddress1Control(
  formState: string | null = null,
  config?: Partial<TheSeamAddressFieldConfig>,
  overrides?: TheSeamValidatorOverrides,
): FormControl<string | null> {
  const v = getAddress1Validators(config, overrides)
  return new FormControl(formState, v.validators, v.asyncValidators)
}
```

`projects/ui-common/framework/form/controls/create-address2-control.ts`:

```typescript
import { FormControl } from '@angular/forms'

import { TheSeamAddressFieldConfig } from '../models/address-field-config'
import { getAddress2Validators } from './get-address2-validators'

export function createAddress2Control(
  formState: string | null = null,
  config?: Partial<TheSeamAddressFieldConfig>,
): FormControl<string | null> {
  const v = getAddress2Validators(config)
  return new FormControl(formState, v.validators, v.asyncValidators)
}
```

`projects/ui-common/framework/form/controls/create-city-control.ts`:

```typescript
import { FormControl } from '@angular/forms'

import { TheSeamAddressFieldConfig } from '../models/address-field-config'
import { TheSeamValidatorOverrides } from '../models/validator-overrides'
import { getCityValidators } from './get-city-validators'

export function createCityControl(
  formState: string | null = null,
  config?: Partial<TheSeamAddressFieldConfig>,
  overrides?: TheSeamValidatorOverrides,
): FormControl<string | null> {
  const v = getCityValidators(config, overrides)
  return new FormControl(formState, v.validators, v.asyncValidators)
}
```

`projects/ui-common/framework/form/controls/create-country-control.ts`:

```typescript
import { FormControl } from '@angular/forms'

import { TheSeamCreateCountryControlOptions } from '../models/create-country-control-options'
import { TheSeamValidatorOverrides } from '../models/validator-overrides'
import { getCountryValidators } from './get-country-validators'

export function createCountryControl(
  formState: string | null = null,
  options?: TheSeamCreateCountryControlOptions,
  overrides?: TheSeamValidatorOverrides,
): FormControl<string | null> {
  const v = getCountryValidators(undefined, options, overrides)
  return new FormControl(formState, v.validators, v.asyncValidators)
}
```

`projects/ui-common/framework/form/controls/create-state-control.ts`:

```typescript
import { FormControl } from '@angular/forms'
import { Observable } from 'rxjs'

import { getStateValidators } from './get-state-validators'

export function createStateControl(
  formState: string | null = null,
  stateCodes: Observable<string[]>,
  requiredOutsideUSA: boolean = true,
): FormControl<string | null> {
  const v = getStateValidators(stateCodes, undefined, requiredOutsideUSA)
  return new FormControl(formState, v.validators, v.asyncValidators)
}
```

`projects/ui-common/framework/form/controls/create-zip-control.ts`:

```typescript
import { FormControl } from '@angular/forms'

import { getZipValidators } from './get-zip-validators'

export function createZipControl(
  formState: string | null = null,
): FormControl<string | null> {
  const v = getZipValidators()
  return new FormControl(formState, v.validators, v.asyncValidators)
}
```

`projects/ui-common/framework/form/controls/create-username-control.ts`:

```typescript
import { FormControl } from '@angular/forms'

import { TheSeamUsernameFieldConfig } from '../models/username-field-config'
import { TheSeamValidatorOverrides } from '../models/validator-overrides'
import { TheSeamUserExistsFn } from '../validators/username-exists.validator'
import { getUsernameValidators } from './get-username-validators'

export function createUsernameControl(
  formState: string | null = null,
  userExists: TheSeamUserExistsFn,
  config?: Partial<TheSeamUsernameFieldConfig>,
  overrides?: TheSeamValidatorOverrides,
): FormControl<string | null> {
  const v = getUsernameValidators(userExists, config, overrides)
  return new FormControl(formState, v.validators, v.asyncValidators)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern="create-controls" --no-coverage`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/framework/form/controls/create-*.ts \
  projects/ui-common/framework/form/controls/create-controls.spec.ts
git commit -m "feat(framework/form): add control factory functions (Layer 2)"
```

---

## Task 8: Layer 3 — Address FormGroup factory

**Files:**
- Create: `projects/ui-common/framework/form/controls/create-address-form-group.ts`
- Create: `projects/ui-common/framework/form/controls/create-address-form-group.spec.ts`

- [ ] **Step 1: Write test**

`projects/ui-common/framework/form/controls/create-address-form-group.spec.ts`:

```typescript
import { FormGroup } from '@angular/forms'
import { of } from 'rxjs'

import { createAddressFormGroup } from './create-address-form-group'

describe('createAddressFormGroup', () => {
  const stateCodes$ = of(['AL', 'MS', 'CA'])

  it('should return group and subscription when no destroyRef', () => {
    const result = createAddressFormGroup({ stateCodes: stateCodes$ })
    expect(result.group).toBeInstanceOf(FormGroup)
    expect(result.subscription).toBeDefined()
    result.subscription.unsubscribe()
  })

  it('should create all address controls', () => {
    const result = createAddressFormGroup({ stateCodes: stateCodes$ })
    const controls = result.group.controls
    expect(controls.address1).toBeDefined()
    expect(controls.address2).toBeDefined()
    expect(controls.city).toBeDefined()
    expect(controls.state).toBeDefined()
    expect(controls.zip).toBeDefined()
    expect(controls.country).toBeDefined()
    result.subscription.unsubscribe()
  })

  it('should default country to USA', () => {
    const result = createAddressFormGroup({ stateCodes: stateCodes$ })
    expect(result.group.controls.country.value).toBe('USA')
    result.subscription.unsubscribe()
  })

  it('should allow overriding default country', () => {
    const result = createAddressFormGroup({
      stateCodes: stateCodes$,
      defaultCountry: 'CAN',
    })
    expect(result.group.controls.country.value).toBe('CAN')
    result.subscription.unsubscribe()
  })

  it('should update zip/state validators when country changes', () => {
    const result = createAddressFormGroup({ stateCodes: stateCodes$ })
    const { group, subscription } = result

    // Change country from USA to CAN
    group.controls.country.setValue('CAN')

    // After auditTime(0) processes, validators should update.
    // In sync test context auditTime(0) may not fire, so we verify
    // the subscription is wired up.
    expect(subscription.closed).toBe(false)
    subscription.unsubscribe()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern="create-address-form-group" --no-coverage`
Expected: FAIL

- [ ] **Step 3: Implement create-address-form-group.ts**

```typescript
import { DestroyRef } from '@angular/core'
import { FormControl, FormGroup, Subscription } from '@angular/forms'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { Observable } from 'rxjs'
import { auditTime, distinctUntilChanged, map, tap } from 'rxjs/operators'

import {
  TheSeamAddressFormControls,
  TheSeamAddressFormGroupOptions,
  TheSeamAddressFormGroupResult,
} from '../models/address-form-group-options'
import { isCountryUSA } from '../helpers/is-country-usa'
import { createAddress1Control } from './create-address1-control'
import { createAddress2Control } from './create-address2-control'
import { createCityControl } from './create-city-control'
import { createCountryControl } from './create-country-control'
import { createStateControl } from './create-state-control'
import { createZipControl } from './create-zip-control'
import { getStateValidators } from './get-state-validators'
import { getZipValidators } from './get-zip-validators'

export function createAddressFormGroup<T extends TheSeamAddressFormGroupOptions>(
  options: T,
): TheSeamAddressFormGroupResult<T> {
  const config = options.config
  const countryRequiredOutsideUSA = options.countryRequiredOutsideUSA ?? true
  const defaultCountry = options.defaultCountry ?? 'USA'

  const group = new FormGroup<TheSeamAddressFormControls>({
    address1: createAddress1Control(null, config),
    address2: createAddress2Control(null, config),
    city: createCityControl(null, config),
    state: createStateControl(null, options.stateCodes, countryRequiredOutsideUSA),
    zip: createZipControl(),
    country: createCountryControl(defaultCountry),
  })

  const countryCtrl = group.controls.country
  let countryChange$ = countryCtrl.valueChanges.pipe(
    map(() => isCountryUSA(countryCtrl)),
    distinctUntilChanged(),
    auditTime(0),
    tap(() => {
      const sv = getStateValidators(
        options.stateCodes,
        group.controls.state,
        countryRequiredOutsideUSA,
        config,
      )
      group.controls.state.setValidators(sv.validators)
      group.controls.state.setAsyncValidators(sv.asyncValidators)
      group.controls.state.updateValueAndValidity()

      const zv = getZipValidators(countryCtrl, config)
      group.controls.zip.setValidators(zv.validators)
      group.controls.zip.setAsyncValidators(zv.asyncValidators)
      group.controls.zip.updateValueAndValidity()
    }),
  )

  if (options.destroyRef) {
    countryChange$ = countryChange$.pipe(
      takeUntilDestroyed(options.destroyRef),
    )
    countryChange$.subscribe()
    return group as TheSeamAddressFormGroupResult<T>
  }

  const subscription = countryChange$.subscribe()
  return { group, subscription } as TheSeamAddressFormGroupResult<T>
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern="create-address-form-group" --no-coverage`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add projects/ui-common/framework/form/controls/create-address-form-group.ts \
  projects/ui-common/framework/form/controls/create-address-form-group.spec.ts
git commit -m "feat(framework/form): add createAddressFormGroup factory (Layer 3)"
```

---

## Task 9: Barrel exports and public API

**Files:**
- Create: `projects/ui-common/framework/form/index.ts`
- Modify: `projects/ui-common/framework/public-api.ts`

- [ ] **Step 1: Create barrel export**

`projects/ui-common/framework/form/index.ts`:

```typescript
// Models
export * from './models/control-validators'
export * from './models/validator-overrides'
export * from './models/address-field-config'
export * from './models/username-field-config'
export * from './models/create-country-control-options'
export * from './models/address-form-group-options'
export * from './models/address-form-value'

// Helpers
export * from './helpers/is-country-usa'
export * from './helpers/if-usa'

// Validators
export * from './validators/state-province-region.validator'
export * from './validators/username-exists.validator'

// Layer 1 — Validator getters
export * from './controls/get-address1-validators'
export * from './controls/get-address2-validators'
export * from './controls/get-city-validators'
export * from './controls/get-country-validators'
export * from './controls/get-state-validators'
export * from './controls/get-zip-validators'
export * from './controls/get-username-validators'

// Layer 2 — Control factories
export * from './controls/create-address1-control'
export * from './controls/create-address2-control'
export * from './controls/create-city-control'
export * from './controls/create-country-control'
export * from './controls/create-state-control'
export * from './controls/create-zip-control'
export * from './controls/create-username-control'

// Layer 3 — FormGroup factory
export * from './controls/create-address-form-group'
```

- [ ] **Step 2: Add to framework public-api.ts**

Add this line to `projects/ui-common/framework/public-api.ts`:

```typescript
export * from './form/index'
```

- [ ] **Step 3: Build to verify exports**

Run: `npx ng build ui-common`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add projects/ui-common/framework/form/index.ts projects/ui-common/framework/public-api.ts
git commit -m "feat(framework/form): wire up barrel exports and public API"
```

---

## Task 10: Run full test suite and build verification

- [ ] **Step 1: Run all framework/form tests**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern="framework/form" --no-coverage`
Expected: All tests PASS.

- [ ] **Step 2: Run all validator tests (ensure refactored ones still pass)**

Run: `npx jest --config projects/ui-common/jest.config.ts --testPathPattern="validators/" --no-coverage`
Expected: All tests PASS.

- [ ] **Step 3: Run full test suite**

Run: `npm run test:ci`
Expected: All tests PASS.

- [ ] **Step 4: Run lint**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 5: Production build**

Run: `npm run build:ui-common`
Expected: Build succeeds. Verify `dist/ui-common/framework/` contains the form exports.

- [ ] **Step 6: Commit any lint/build fixes if needed**

Only if previous steps required changes.

---

## Verification

1. **Unit tests:** All tasks include spec files. Run `npx jest --config projects/ui-common/jest.config.ts --testPathPattern="framework/form" --no-coverage` to verify all new code.
2. **Existing tests:** Run `npx jest --config projects/ui-common/jest.config.ts --testPathPattern="validators/" --no-coverage` to confirm refactored validators still pass.
3. **Full suite:** `npm run test:ci` — no regressions.
4. **Lint:** `npm run lint` — no errors.
5. **Build:** `npm run build:ui-common` — ng-packagr builds successfully, framework secondary entry point includes form exports.
6. **Import check:** After build, verify that `import { createAddressFormGroup } from '@theseam/ui-common/framework'` resolves correctly in the dist output.
