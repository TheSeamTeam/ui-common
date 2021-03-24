import { animate, animation, group, query, style, useAnimation } from '@angular/animations'

export const menuDropdownPanelSlideIn = animation([
  style({
    opacity: 0,
    transform: 'translateY(-70%)'
  }),
  group([
    animate('170ms linear', style({ opacity: 1 })),
    animate('220ms ease', style({ transform: 'translateY(0)' })),
  ])
])

export const menuDropdownPanelSlideOut = animation([
  style({
    opacity: 1,
    transform: 'translateY(0)'
  }),
  group([
    animate('170ms linear', style({ opacity: 0 })),
    animate('220ms ease', style({ transform: 'translateY(-70%)' })),
  ])
])

export const menuDropdownPanelExpandIn = animation([
  style({
    opacity: 0,
    transform: 'scale(0.8)'
  }),
  group([
    animate('100ms linear', style({ opacity: 1 })),
    animate('120ms ease', style({ transform: 'scale(1)' })),
  ])
])

export const menuDropdownPanelExpandOut = animation([
  style({
    opacity: 1,
    transform: 'scale(1)'
  }),
  group([
    animate('100ms linear', style({ opacity: 0 })),
    animate('120ms ease', style({ transform: 'scale(0.8)' })),
  ])
])

export const menuDropdownPanelFadeIn = animation([
  style({ transform: 'translateY(-30px)', opacity: '0' }),
  animate('250ms', style({ transform: 'translateY(0)', opacity: '1' }))
])

export const menuDropdownPanelFadeOut = animation([
  style({ transform: 'translateY(0)', opacity: '1' }),
  animate('250ms', style({ transform: 'translateY(-30px)', opacity: '0' }))
])

export const menuDropdownPanelIn = animation([
  query('.seam-menu-container.seam-menu-anim--slide .dropdown-menu', useAnimation(menuDropdownPanelSlideIn), { optional: true }),
  query('.seam-menu-container.seam-menu-anim--fade .dropdown-menu', useAnimation(menuDropdownPanelFadeIn), { optional: true })
])

export const menuDropdownPanelOut = animation([
  query('.seam-menu-container.seam-menu-anim--slide .dropdown-menu', useAnimation(menuDropdownPanelSlideOut), { optional: true }),
  query('.seam-menu-container.seam-menu-anim--fade .dropdown-menu', useAnimation(menuDropdownPanelFadeOut), { optional: true })
])
