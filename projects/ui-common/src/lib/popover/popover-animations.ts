import { animate, animation, group, query, style } from '@angular/animations'

export const popoverSlideIn = animation([
  query(':self', [
    style({
      opacity: 0,
      transform: 'translateY(-70%)'
    }),
    group([
      animate('170ms linear', style({ opacity: 1 })),
      animate('220ms ease', style({ transform: 'translateY(0)' })),
    ])
  ])
])

export const popoverSlideOut = animation([
  query(':self', [
    style({
      opacity: 1,
      transform: 'translateY(0)'
    }),
    group([
      animate('170ms linear', style({ opacity: 0 })),
      animate('220ms ease', style({ transform: 'translateY(-70%)' })),
    ])
  ])
])

export const popoverExpandIn = animation([
  style({
    opacity: 0,
    transform: 'scale(0.8)'
  }),
  group([
    animate('100ms linear', style({ opacity: 1 })),
    animate('120ms ease', style({ transform: 'scale(1)' })),
  ])
])

export const popoverExpandOut = animation([
  style({
    opacity: 1,
    transform: 'scale(1)'
  }),
  group([
    animate('100ms linear', style({ opacity: 0 })),
    animate('120ms ease', style({ transform: 'scale(0.8)' })),
  ])
])
