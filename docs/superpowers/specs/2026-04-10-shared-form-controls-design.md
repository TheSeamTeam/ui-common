# Shared Form Control Utilities — Design Spec

## Goal

Move duplicated Angular Reactive Forms helper functions from individual apps into `@theseam/ui-common` so all apps share consistent form control creation, validation, and address-form wiring. Make validation constants configurable to prevent apps from forking the library code when they need different values.

## Context

- Source code lives in `TheSeam.Sustainability.Cotton.App/src/app/utils/forms/controls/` (and sibling `helpers/`, `validators/`, `models/` directories).
- Target library: `@theseam/ui-common` — Angular 20, ng-packagr secondary entry points.
- Existing generic validators (`decimalValidator`, `integerValidator`, `phoneLengthValidator`) already live in `projects/ui-common/validators/` but are non-configurable constants. These will be refactored to configurable factories (breaking change, intentional).
- `emailExistsValidator` in `projects/ui-common/validators/` is the reference pattern for async existence-check validators — it accepts `(value: string) => Promise<boolean> | Observable<boolean> | boolean`.

## Location

New code goes in `projects/ui-common/framework/form/`, exported via `framework/public-api.ts`. This keeps it separate from `schema-form` (which may eventually consume these, but does not currently).

## File Structure

```
projects/ui-common/framework/form/
  index.ts                                    # barrel export for the form subdirectory
  models/
    control-validators.ts                     # TheSeamControlValidators interface
    address-field-config.ts                   # TheSeamAddressFieldConfig interface + DEFAULT_ADDRESS_FIELD_CONFIG
    username-field-config.ts                  # TheSeamUsernameFieldConfig interface + DEFAULT_USERNAME_FIELD_CONFIG
    create-country-control-options.ts         # TheSeamCreateCountryControlOptions interface
    address-form-group-options.ts             # TheSeamAddressFormGroupOptions interface
    address-form-value.ts                     # TheSeamAddressFormValue interface
  helpers/
    is-country-usa.ts                         # isCountryUSA(control): boolean
    if-usa.ts                                 # ifUSA(fn, countryControlOrPath?): ValidatorFn
  validators/
    state-province-region.validator.ts        # stateProvinceRegionValidator (async, checks country sibling)
    username-exists.validator.ts              # usernameExistsValidator (async, mirrors emailExistsValidator pattern)
  controls/
    get-address1-validators.ts
    get-address2-validators.ts
    get-city-validators.ts
    get-country-validators.ts
    get-state-validators.ts
    get-zip-validators.ts
    get-username-validators.ts
    create-address1-control.ts
    create-address2-control.ts
    create-city-control.ts
    create-country-control.ts
    create-state-control.ts
    create-zip-control.ts
    create-username-control.ts
    create-address-form-group.ts
```

## Layered API

### Layer 0 — Config Interfaces + Defaults

```typescript
export interface TheSeamAddressFieldConfig {
  address1MaxLength: number       // default 50
  address2MaxLength: number       // default 50
  cityMaxLength: number           // default 50
  stateMaxLength: number          // default 200
  countryMaxLength: number        // default 10
  zipcodePattern: RegExp          // default /^\d{5}(?:[-\s]\d{4})?$/
}

export const DEFAULT_ADDRESS_FIELD_CONFIG: TheSeamAddressFieldConfig = {
  address1MaxLength: 50,
  address2MaxLength: 50,
  cityMaxLength: 50,
  stateMaxLength: 200,
  countryMaxLength: 10,
  zipcodePattern: /^\d{5}(?:[-\s]\d{4})?$/,
}

export interface TheSeamUsernameFieldConfig {
  minLength: number               // default 8
  pattern: RegExp                 // default /^[a-zA-Z0-9\-._@+]+$/
}

export const DEFAULT_USERNAME_FIELD_CONFIG: TheSeamUsernameFieldConfig = {
  minLength: 8,
  pattern: /^[a-zA-Z0-9\-._@+]+$/,
}
```

### Layer 1 — Validator Getters (composable)

Each returns `TheSeamControlValidators` (`{ validators: ValidatorFn[], asyncValidators: AsyncValidatorFn[] }`).

```typescript
export function getAddress1Validators(config?: Partial<TheSeamAddressFieldConfig>): TheSeamControlValidators
export function getAddress2Validators(config?: Partial<TheSeamAddressFieldConfig>): TheSeamControlValidators
export function getCityValidators(config?: Partial<TheSeamAddressFieldConfig>): TheSeamControlValidators
export function getCountryValidators(config?: Partial<TheSeamAddressFieldConfig>, options?: TheSeamCreateCountryControlOptions): TheSeamControlValidators
export function getStateValidators(stateCodes: Observable<string[]>, stateControl?: AbstractControl, requiredOutsideUSA?: boolean): TheSeamControlValidators
export function getZipValidators(countryControl?: AbstractControl): TheSeamControlValidators
export function getUsernameValidators(userExists: TheSeamUserExistsFn, config?: Partial<TheSeamUsernameFieldConfig>): TheSeamControlValidators
```

Apps that need to add custom validators call these, spread the result, and append:

```typescript
const v = getAddress1Validators()
const ctrl = new FormControl('', [...v.validators, myCustomValidator], v.asyncValidators)
```

### Layer 2 — Control Factories (convenience)

Each returns a typed `FormControl<string | null>`.

```typescript
export function createAddress1Control(formState?: string | null, config?: Partial<TheSeamAddressFieldConfig>): FormControl<string | null>
export function createCountryControl(formState?: string | null, options?: TheSeamCreateCountryControlOptions): FormControl<string | null>
export function createStateControl(formState?: string | null, stateCodes: Observable<string[]>, requiredOutsideUSA?: boolean): FormControl<string | null>
export function createZipControl(formState?: string | null): FormControl<string | null>
export function createUsernameControl(formState?: string | null, userExists: TheSeamUserExistsFn, config?: Partial<TheSeamUsernameFieldConfig>): FormControl<string | null>
// ... etc.
```

### Layer 3 — Address FormGroup Factory

```typescript
export interface TheSeamAddressFormValue {
  address1: string | null
  address2: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
}

export interface TheSeamAddressFormGroupOptions {
  config?: Partial<TheSeamAddressFieldConfig>
  stateCodes: Observable<string[]>
  countryRequiredOutsideUSA?: boolean  // default true
  defaultCountry?: string              // default 'USA'
  destroyRef?: DestroyRef
}
```

- If `destroyRef` provided: subscription auto-cleaned via `takeUntilDestroyed(destroyRef)`, returns the `FormGroup` directly.
- If `destroyRef` omitted: returns `{ group: FormGroup, subscription: Subscription }` so caller can manage cleanup.

Return type:

```typescript
export type TheSeamAddressFormGroupResult<T extends TheSeamAddressFormGroupOptions> =
  T extends { destroyRef: DestroyRef }
    ? FormGroup<Record<keyof TheSeamAddressFormValue, FormControl<string | null>>>
    : {
        group: FormGroup<Record<keyof TheSeamAddressFormValue, FormControl<string | null>>>
        subscription: Subscription
      }
```

Internal behavior: wires up `countryControl.valueChanges` to dynamically update state and zip validators when country changes to/from `'USA'`, using `distinctUntilChanged()` and `auditTime(0)`.

### Country Control Options

```typescript
export interface TheSeamCreateCountryControlOptions {
  onlyAllowUsa?: boolean  // default false
}
```

When `onlyAllowUsa` is true, adds a validator that rejects non-USA values.

## Existing Validator Refactoring (Breaking)

The following validators in `projects/ui-common/validators/` change from constants to configurable factories:

### phoneLengthValidator

```typescript
// Before:
export function phoneLengthValidator(control: FormControl) { ... }

// After:
export interface TheSeamPhoneLengthConfig {
  minLength: number  // default 7
  maxLength: number  // default 18
}
export function phoneLengthValidator(config?: Partial<TheSeamPhoneLengthConfig>): ValidatorFn
```

### decimalValidator

```typescript
// Before:
export const decimalValidator: ValidatorFn = _decimalValidator()

// After:
export interface TheSeamDecimalConfig {
  regex: RegExp  // default /^([-+]{1})?\d*(\.\d*)?$/
}
export function decimalValidator(config?: Partial<TheSeamDecimalConfig>): ValidatorFn
```

### integerValidator

```typescript
// Before:
export const integerValidator: ValidatorFn = _integerValidator()

// After:
export interface TheSeamIntegerConfig {
  regex: RegExp  // default /^([-+]{1})?[0-9]*$/
}
export function integerValidator(config?: Partial<TheSeamIntegerConfig>): ValidatorFn
```

### Unchanged

- `taxIdValidator` — no config needed, stays as-is.
- `emailExistsValidator` — already well-designed, stays as-is.
- `maxFractionalDigitsValidator` / `minFractionalDigitsValidator` — already parameterized, not exported from public API.

## Helpers

### isCountryUSA

```typescript
export function isCountryUSA(control: AbstractControl): boolean
// Returns control.value === 'USA'
```

### ifUSA

```typescript
export function ifUSA(fn: ValidatorFn, countryControlOrPath?: AbstractControl | string | (string | number)[]): ValidatorFn
// Wraps a ValidatorFn to only apply when country is 'USA'.
// Defaults to looking for sibling control named 'country'.
```

## New Validators

### stateProvinceRegionValidator

Async validator. Checks value against provided `Observable<string[]>` of valid state codes. Only validates when country sibling control is `'USA'`.

### usernameExistsValidator

Mirrors `emailExistsValidator` pattern:

```typescript
export type TheSeamUserExistsFn = (userName: string) => Promise<boolean> | Observable<boolean> | boolean

export function usernameExistsValidator(userExists: TheSeamUserExistsFn): AsyncValidatorFn
```

## Imports / Dependencies

- `isEmptyInputValue` reused from `@theseam/ui-common/utils` (already exists, no duplication).
- All new exported types prefixed with `TheSeam` per AGENTS.md conventions.
- All controls typed as `FormControl<string | null>` (migrated from `UntypedFormControl`).

## Out of Scope

- `create-spinner-control.ts` — app-specific, stays in the app.
- `mapTitle` / `TITLE_OPTIONS` / `MONTH_OPTIONS` — app-specific select option data, not moving.
- Generic validators (currency, text, date, wysiwyg-length) — can be moved to `validators/` entry point later as a separate effort.
- Schema-form integration — may consume these later, not wired up now.
