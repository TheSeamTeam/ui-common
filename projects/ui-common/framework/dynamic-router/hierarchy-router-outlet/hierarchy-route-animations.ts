import {
  animate,
  animateChild,
  group,
  keyframes,
  query,
  style,
  transition,
  trigger,
} from '@angular/animations'


export const fader =
  trigger('routeAnimations', [
    transition('* <=> *', [
      // Set a default  style for enter and leave
      query(':enter, :leave', [
        style({
          position: 'absolute',
          left: 0,
          width: '100%',
          opacity: 0,
          transform: 'scale(0) translateY(100%)',
        }),
      ], { optional: true }),
      // Animate the new page in
      query(':enter', [
        animate('600ms ease', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
      ], { optional: true })
    ]),
  ])


// function slideTo(direction) {
//   return [
//     query(':enter, :leave', [
//       style({
//         position: 'absolute',
//         top: 0,
//         [direction]: 0,
//         width: '100%'
//       })
//     ], { optional: true }),
//     query(':enter', [
//       style({ [direction]: '-100%'})
//     ], { optional: true }),
//     group([
//       query(':leave', [
//         animate('1000ms ease', style({ [direction]: '100%'}))
//       ], { optional: true }),
//       query(':enter', [
//         animate('1000ms ease', style({ [direction]: '0%'}))
//       ], { optional: true })
//     ]),
//     // Normalize the page style... Might not be necessary

//     // Required only if you have child animations on the page
//     query(':leave', animateChild(), { optional: true }),
//     query(':enter', animateChild(), { optional: true }),
//   ]
// }

// TODO: Refactor the slider animation, because AOT or ng-packagr, I haven't
// looked into what exactly is preventing it, doesn't allow the function call.
// export const slider =
//   trigger('routeAnimations', [
//     transition('* => isLeft', slideTo('left') ),
//     transition('* => isRight', slideTo('right') ),
//     transition('isRight => *', slideTo('left') ),
//     transition('isLeft => *', slideTo('right') )
//   ])

// export const contentLeave =
//   trigger('contentLeave', [
//     transition(':leave', [

//     ])
//   ])

export const slider =
  trigger('routeAnimations', [
    transition('* => isLeft', [
      query('.router-container :enter, .router-container :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%'
        })
      ], { optional: true }),
      query('.router-container :enter', [
        style({ left: '-100%'})
      ], { optional: true }),
      query('.hierarchy-router-outlet--content', [
        style({ left: '0%', position: 'absolute' })
      ], { optional: true }),
      group([
        query('.router-container :leave', [
          animate('1000ms ease', style({ left: '100%'}))
        ], { optional: true }),
        query('.router-container :enter', [
          animate('1000ms ease', style({ left: '0%'}))
        ], { optional: true }),
        query('.hierarchy-router-outlet--content', [
          animate('1000ms ease', style({ left: '-100%'}))
        ], { optional: true }),
      ]),
      // Normalize the page style... Might not be necessary

      // Required only if you have child animations on the page
      query('.router-container :leave', animateChild(), { optional: true }),
      query('.router-container :enter', animateChild(), { optional: true }),
    ]),
    transition('* => isRight', [
      query('.router-container :enter, .router-container :leave', [
        style({
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100%'
        })
      ], { optional: true }),
      query('.router-container :enter', [
        style({ right: '-100%'})
      ], { optional: true }),
      query('.hierarchy-router-outlet--content', [
        style({ left: '0%', position: 'absolute' })
      ], { optional: true }),
      group([
        query('.router-container :leave', [
          animate('1000ms ease', style({ right: '100%'}))
        ], { optional: true }),
        query('.router-container :enter', [
          animate('1000ms ease', style({ right: '0%'}))
        ], { optional: true }),
        query('.hierarchy-router-outlet--content', [
          animate('1000ms ease', style({ left: '-100%'}))
        ], { optional: true }),
      ]),
      // Normalize the page style... Might not be necessary

      // Required only if you have child animations on the page
      query('.router-container :leave', animateChild(), { optional: true }),
      query('.router-container :enter', animateChild(), { optional: true }),
    ]),
    transition('isRight => *', [
      query('.router-container :enter, .router-container :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%'
        })
      ], { optional: true }),
      query('.router-container :enter', [
        style({ left: '-100%'})
      ], { optional: true }),
      query('.hierarchy-router-outlet--content', [
        style({ left: '0%', position: 'absolute' })
      ], { optional: true }),
      group([
        query('.router-container :leave', [
          animate('1000ms ease', style({ left: '100%'}))
        ], { optional: true }),
        query('.router-container :enter', [
          animate('1000ms ease', style({ left: '0%'}))
        ], { optional: true }),
        query('.hierarchy-router-outlet--content', [
          animate('1000ms ease', style({ left: '-100%'}))
        ], { optional: true }),
      ]),
      // Normalize the page style... Might not be necessary

      // Required only if you have child animations on the page
      query('.router-container :leave', animateChild(), { optional: true }),
      query('.router-container :enter', animateChild(), { optional: true }),
    ]),
    transition('isLeft => *', [
      query('.router-container :enter, .router-container :leave', [
        style({
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100%'
        })
      ], { optional: true }),
      query('.router-container :enter', [
        style({ right: '-100%'})
      ], { optional: true }),
      group([
        query('.router-container :leave', [
          animate('1000ms ease', style({ right: '100%'}))
        ], { optional: true }),
        query('.router-container :enter', [
          animate('1000ms ease', style({ right: '0%'}))
        ], { optional: true })
      ]),
      // Normalize the page style... Might not be necessary

      // Required only if you have child animations on the page
      query('.router-container :leave', animateChild(), { optional: true }),
      query('.router-container :enter', animateChild(), { optional: true }),
    ])
  ])


export const transformer =
  trigger('routeAnimations', [
    transition('* => isLeft', transformTo({ x: -100, y: -100, rotate: -720 }) ),
    transition('* => isRight', transformTo({ x: 100, y: -100, rotate: 90 }) ),
    transition('isRight => *', transformTo({ x: -100, y: -100, rotate: 360 }) ),
    transition('isLeft => *', transformTo({ x: 100, y: -100, rotate: -360 }) )
])

function transformTo({x = 100, y = 0, rotate = 0}) {
  const optional = { optional: true }
  return [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ], optional),
    query(':enter', [
      style({ transform: `translate(${x}%, ${y}%) rotate(${rotate}deg)`})
    ], { optional: true }),
    group([
      query(':leave', [
        animate('600ms ease-out', style({ transform: `translate(${x}%, ${y}%) rotate(${rotate}deg)`}))
      ], optional),
      query(':enter', [
        animate('600ms ease-out', style({ transform: `translate(0, 0) rotate(0)`}))
      ], { optional: true })
    ]),
  ]
}


export const stepper =
  trigger('routeAnimations', [
    transition('* <=> *', [
      query(':enter, :leave', [
        style({
          position: 'absolute',
          left: 0,
          width: '100%',
        }),
      ], { optional: true }),
      group([
        query(':enter', [
          animate('2000ms ease', keyframes([
            style({ transform: 'scale(0) translateX(100%)', offset: 0 }),
            style({ transform: 'scale(0.5) translateX(25%)', offset: 0.3 }),
            style({ transform: 'scale(1) translateX(0%)', offset: 1 }),
          ])),
        ], { optional: true }),
        query(':leave', [
          animate('2000ms ease', keyframes([
            style({ transform: 'scale(1)', offset: 0 }),
            style({ transform: 'scale(0.5) translateX(-25%) rotate(0)', offset: 0.35 }),
            style({ opacity: 0, transform: 'translateX(-50%) rotate(-180deg) scale(6)', offset: 1 }),
          ])),
        ], { optional: true })
      ]),
    ])
  ])


export const sideToSide = trigger('routeAnimations', [
  transition('* => *', [
    style({
      position: 'fixed',
      width: '100%',
      transform: 'translateX(-100%)'
    }),
    animate('1000ms ease', style({ transform: 'translateX(0%)' }))
  ]),
  transition(':leave', [
    style({
      position: 'fixed',
      width: '100%',
      transform: 'translateX(0%)'
    }),
    animate('1000ms ease', style({ transform: 'translateX(-100%)' }))
  ])
])
