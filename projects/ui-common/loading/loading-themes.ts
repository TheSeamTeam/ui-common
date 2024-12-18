import { ngxLoadingAnimationTypes, NgxLoadingConfig } from 'ngx-loading'

export const defaultThemeConfig: NgxLoadingConfig = {
  animationType: ngxLoadingAnimationTypes.threeBounce,
  backdropBackgroundColour: 'rgba(0,0,0,0.3)',
  backdropBorderRadius: '0px',
  primaryColour: '#ffffff',
  secondaryColour: '#ffffff',
  tertiaryColour: '#ffffff'
}

export const primaryThemeConfig: NgxLoadingConfig = {
  animationType: ngxLoadingAnimationTypes.threeBounce,
  backdropBackgroundColour: 'rgba(250,250,250,0.2)',
  backdropBorderRadius: '0px',
  primaryColour: 'rgba(53,126,189,0.7)',
  secondaryColour: 'rgba(53,126,189,0.7)',
  tertiaryColour: 'rgba(53,126,189,0.7)'
}
