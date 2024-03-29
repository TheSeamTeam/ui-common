export const TEL_INPUT_ASSETS_PATH = 'assets/vendor/intl-tel-input'

export const TEL_INPUT_STYLES = `
  .iti { width: 100%; }

  .iti__flag {background-image: url("${TEL_INPUT_ASSETS_PATH}/img/flags.png");}

  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .iti__flag {background-image: url("${TEL_INPUT_ASSETS_PATH}/img/flags@2x.png");}
  }

  .iti__country-list {
    /* There is a bug that is causing the 'z-index: 2' from ng-select to conflict with this dropdown container. */
    z-index: 3;
  }
`

export const TEL_INPUT_STYLESHEET_PATH = `${TEL_INPUT_ASSETS_PATH}/css/intlTelInput.min.css`

export const TEL_INPUT_UTILS_PATH = `${TEL_INPUT_ASSETS_PATH}/js/utils.js`
