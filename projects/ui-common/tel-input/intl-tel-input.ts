import intlTelInput from 'intl-tel-input'

//
// NOTE: These types are mainly for providing types to 'intl-tel-input', because
// the only published types I could find were incomplete. Some types are
// missing, because they were not necessary for this library. I don't indend
// this to be a perfect types for 'intl-tel-input', so as long as they are
// compatible they may be slightly altered or extended to fit this library
// better.
//

/**
 * Partial types for intl-tel-input-utils
 */
// tslint:disable-next-line: no-namespace
export namespace intlTelInputUtils {

  export interface CountryData {
    name: string
    iso2: string
    dialCode: string
    areaCodes: string[] | null
    priority: number
  }

  export enum numberFormat {
    E164 = 0,
    INTERNATIONAL = 1,
    NATIONAL = 2,
    RFC3966 = 3
  }

  export enum numberType {
    FIXED_LINE = 0,
    MOBILE = 1,
    FIXED_LINE_OR_MOBILE = 2,
    TOLL_FREE = 3,
    PREMIUM_RATE = 4,
    SHARED_COST = 5,
    VOIP = 6,
    PERSONAL_NUMBER = 7,
    PAGER = 8,
    UAN = 9,
    VOICEMAIL = 10,
    UNKNOWN = -1
  }

  export enum validationError {
    IS_POSSIBLE = 0,
    INVALID_COUNTRY_CODE = 1,
    TOO_SHORT = 2,
    TOO_LONG = 3,
    NOT_A_NUMBER = 4
  }

  export type placeholderNumberType =
    | 'FIXED_LINE_OR_MOBILE'
    | 'FIXED_LINE'
    | 'MOBILE'
    | 'PAGER'
    | 'PERSONAL_NUMBER'
    | 'PREMIUM_RATE'
    | 'SHARED_COST'
    | 'TOLL_FREE'
    | 'UAN'
    | 'UNKNOWN'
    | 'VOICEMAIL'
    | 'VOIP'

}

// NOTE: If one of the functions return -99, then it is most likely from a
// problem in 'google-libphonenumber' that 'intl-tel-input' swallowed in int
// wrapper.
//
// NOTE: The following functions do not exist until util script has loaded.
export interface IntlTelInputUtilsScript {
  numberFormat: intlTelInputUtils.numberFormat
  numberType: intlTelInputUtils.numberType
  validationError: intlTelInputUtils.validationError

  /**
   * Format the given number to the given format.
   */
  formatNumber(number: string, countryCode: string, format: intlTelInputUtils.numberFormat): string

  /**
   * Get an example number for the given country code.
   */
  getExampleNumber(countryCode: string, national: boolean, numberType: intlTelInputUtils.numberType): string

  /**
   * Get the extension from the given number.
   */
  getExtension(number: string, countryCode: string): string

  /**
   * Get the type of the given number e.g. fixed-line/mobile.
   */
  getNumberType(number: string, countryCode: string): intlTelInputUtils.numberType

  /**
   * Get more info if the validation has failed e.g. too long/too short.
   */
  getValidationError(number: string, countryCode: string): intlTelInputUtils.validationError

  /**
   * Check if given number is valid.
   */
  isValidNumber(number: string, countryCode: string): boolean
}

/**
 * Partial types for intl-tel-input
 */
// tslint:disable-next-line: no-namespace
export namespace IntlTelInput {
  export interface Static {
    /**
     * Default options for all instances
     */
    defaults: Options

    /**
     * Get all of the plugin's country data - either to re-use elsewhere
     * e.g. to populate a country dropdown.
     */
    getCountryData(): intlTelInputUtils.CountryData[]

    /**
     * Load the utils.js script (included in the lib directory) to enable
     * formatting/validation etc.
     */
    loadUtils(path: string, utilsScriptDeferred?: boolean): Promise<void> /* | null | void */
  }

  export interface Plugin {
    promise: Promise<void>

    /**
     * Remove the plugin from the input, and unbind any event listeners.
     */
    destroy(): void

    /**
     * Get the extension from the current number.
     * Requires the utilsScript option.
     * e.g. if the input value was "(702) 555-5555 ext. 1234", this would
     * return "1234".
     */
    getExtension(): string

    /**
     * Get the current number in the given format (defaults to E.164 standard).
     * The different formats are available in the enum
     * intlTelInputUtils.numberFormat - taken from here.
     * Requires the utilsScript option.
     * Note that even if nationalMode is enabled, this can still return a full
     * international number.
     * @param numberFormat the format in which the number will be returned.
     */
    getNumber(numberFormat?: intlTelInputUtils.numberFormat): string

    /**
     * Get the type (fixed-line/mobile/toll-free etc) of the current number.
     * Requires the utilsScript option.
     * Returns an integer, which you can match against the various options in the
     * global enum intlTelInputUtils.numberType.
     * Note that in the US there's no way to differentiate between fixed-line and
     * mobile numbers, so instead it will return FIXED_LINE_OR_MOBILE.
     */
    getNumberType(): intlTelInputUtils.numberType

    /**
     * Get the country data for the currently selected flag.
     */
    getSelectedCountryData(): intlTelInputUtils.CountryData

    /**
     * Get more information about a validation error.
     * Requires the utilsScript option.
     * Returns an integer, which you can match against the various options in the
     * global enum ValidationError
     */
    getValidationError(): intlTelInputUtils.validationError

    /**
     * Validate the current number. Expects an internationally formatted number
     * (unless nationalMode is enabled). If validation fails, you can use
     * getValidationError to get more information.
     * Requires the utilsScript option.
     * Also see getNumberType if you want to make sure the user enters a certain
     * type of number e.g. a mobile number.
     */
    isValidNumber(): boolean

    /**
     * Change the country selection (e.g. when the user is entering their address).
     * @param countryCode country code of the country to be set.
     */
    setCountry(countryCode: string): void

    /**
     * Insert a number, and update the selected flag accordingly.
     * Note that by default, if nationalMode is enabled it will try to use
     * national formatting.
     * @param aNumber number to be set.
     */
    setNumber(aNumber: string): void

    /**
     * Set the type of the placeholder number
     * @param type Placeholder number type to be set
     */
    setPlaceholderNumberType(type: intlTelInputUtils.placeholderNumberType): void
  }

  export interface Options {
    /**
     * Whether or not to allow the dropdown. If disabled, there is no dropdown
     * arrow, and the selected flag is not clickable. Also we display the
     * selected flag on the right instead because it is just a marker of state.
     * Default = true
     */
    allowDropdown?: boolean

    /**
     * If there is just a dial code in the input: remove it on blur or submit,
     * and re-add it on focus. This is to prevent just a dial code getting
     * submitted with the form. Requires nationalMode to be set to false.
     * Default = true
     */
    autoHideDialCode?: boolean

    /**
     * Set the input's placeholder to an example number for the selected country, and update it if the country changes.
     * You can specify the number type using the placeholderNumberType option.
     * By default it is set to "polite", which means it will only set the placeholder if the input doesn't already have one.
     * You can also set it to "aggressive", which will replace any existing placeholder, or "off".
     * Requires the utilsScript option.
     * Default = "polite"
     */
    autoPlaceholder?: 'off' | 'polite' | 'aggressive'

    /**
     * Change the placeholder generated by autoPlaceholder. Must return a string.
     * Default = null
     */
    customPlaceholder?: (selectedCountryPlaceholder: string, selectedCountryData: intlTelInputUtils.CountryData) => string

    /**
     * Expects a node e.g. document.body. Instead of putting the country dropdown next to the input,
     * append it to the specified node, and it will then be positioned absolutely next to the input using JavaScript.
     * This is useful when the input is inside a container with overflow: hidden.
     * Note that the absolute positioning can be broken by scrolling, so it will automatically close on the window scroll event.
     * Default = null
     */
    dropdownContainer?: Node

    /**
     * In the dropdown, display all countries except the ones you specify here.
     * Default = null
     */
    excludeCountries?: string[]

    /**
     * Format the input value (according to the nationalMode option) during initialisation, and on setNumber.
     * Requires the utilsScript option.
     * Default = true
     */
    formatOnDisplay?: boolean

    /**
     * When setting initialCountry to "auto", you must use this option to
     * specify a custom function that looks up the user's location,
     * and then calls the success callback with the relevant country code.
     * Also note that when instantiating the plugin, if the Promise object is defined,
     * one of those is returned under the promise instance property, so you can
     * do something like iti.promise.then(callback) to know when initialisation requests like this have completed.
     * Default = null
     */
    geoIpLookup?: (callback: (countryCode: string) => void) => void

    /**
     * Add a hidden input with the given name (or if your input name
     * contains square brackets then it will give the hidden input the same
     * name, replacing the contents of the brackets with the given name). On
     * submit, populate it with the full international number (using
     * getNumber). This is a quick way for people using non-ajax forms to
     * get the full international number, even when nationalMode is enabled.
     * Note: requires the input to be inside a form element, as this feature
     * works by listening for the submit event on the closest form element.
     * Also note that since this uses getNumber internally, it expects a
     * valid number, and so should only be used after validation. Default =
     * ""
     */
    hiddenInput?: string

    /**
     * Set the initial country selection by specifying it's country code.
     * You can also set it to "auto", which will lookup the user's country based
     * on their IP address (requires the geoIpLookup option).
     * Note that the "auto" option will not update the country selection if the
     * input already contains a number. If you leave initialCountry blank,
     * it will default to the first country in the list.
     */
    initialCountry?: string

    /**
     * Allows to translate the countries by its given iso code e.g.: { 'de': 'Deutschland' }
     * Default = {}
     */
    localizedCountries?: object

    /**
     * Allow users to enter national numbers (and not have to think about
     * international dial codes). Formatting, validation and placeholders still
     * work. Then you can use getNumber to extract a full international number.
     * This option now defaults to true, and it is recommended that you leave it
     * that way as it provides a better experience for the user.
     * Default = true
     */
    nationalMode?: boolean

    /**
     * In the dropdown, display only the countries you specify.
     * Default = undefined
     */
    onlyCountries?: string[]

    /**
     * Specify one of the keys from the global enum intlTelInputUtils.numberType
     * e.g. "FIXED_LINE" to set the number type to use for the placeholder.
     * Default = MOBILE
     */
    placeholderNumberType?: intlTelInputUtils.placeholderNumberType

    /**
     * Specify the countries to appear at the top of the list.
     * Default = ["us", "gb"]
     */
    preferredCountries?: string[]

    /**
     * Display the country dial code next to the selected flag so it's not part
     * of the typed number. Note that this will disable nationalMode because
     * technically we are dealing with international numbers, but with the
     * dial code separated.
     * Default = false
     */
    separateDialCode?: boolean

    /**
     * Enable formatting/validation etc. by specifying the URL of the
     * included utils.js script (or alternatively just point it to the file
     * on cdnjs.com). The script is fetched when the page has finished
     * loading (on the window load event) to prevent blocking (the script is
     * ~215KB). When instantiating the plugin, if the Promise object is
     * defined, one of those is returned under the promise instance
     * property, so you can do something like iti.promise.then(callback) to
     * know when initialisation requests like this have finished. Note that
     * if you're lazy loading the plugin script itself (intlTelInput.js)
     * this will not work and you will need to use the loadUtils method
     * instead. Example: "build/js/utils.js" Default = ""
     */
    utilsScript?: string
  }
}

/**
 * Initialise the plugin with optional options.
 * @param options options that can be provided during initialization.
 */
export function IntlTelInputFn(node: Element, options?: IntlTelInput.Options): IntlTelInput.Plugin {
  return (intlTelInput as any)(node, options)
}

export default IntlTelInputFn
