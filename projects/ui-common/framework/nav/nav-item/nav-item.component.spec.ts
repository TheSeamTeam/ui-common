// import { Component } from '@angular/core'
// import { fakeAsync } from '@angular/core/testing'
// import { HorizontalNavComponent } from '../horizontal-nav/horizontal-nav.component'

// import { createRoutingFactory, mockProvider, SpectatorRouting } from '@ngneat/spectator/jest'

// import { faAlignLeft } from '@fortawesome/free-solid-svg-icons'

// import { TheSeamNavModule } from '../nav.module'
// import { NavItemComponent } from './nav-item.component'

// @Component({ template: `` })
// class TestPlacholderComponent { }

// describe('NavItemComponent', () => {
//   let spectator: SpectatorRouting<NavItemComponent>
//   const createComponent = createRoutingFactory({
//     component: NavItemComponent,
//     imports: [
//       TheSeamNavModule
//     ],
//     providers: [
//       mockProvider(HorizontalNavComponent, {
//         // overlay: false
//       })
//     ],
//     stubsEnabled: false,
//     routes: [
//       {
//         path: '',
//         component: TestPlacholderComponent
//       },
//       {
//         path: 'foo',
//         component: TestPlacholderComponent,
//         children: [
//           {
//             path: 'bar',
//             component: TestPlacholderComponent,
//           }
//         ]
//       },
//     ],
//   })

//   describe('Basic', () => {

//     describe('not compact', () => {
//       it('should render with basic inputs', fakeAsync(() => {
//         spectator = createComponent({
//           props: {
//             expanded: false,
//             active: false,
//             hierLevel: 0,
//             compact: false,
//             itemType: 'basic',
//             icon: faAlignLeft,
//             label: 'Test',
//             // link: '/foo',
//             // badgeText: 'bar',
//             // badgeTheme: 'primary',
//             // badgeSrContent: 'foo',
//             // children: []
//           }
//         })

//         expect(spectator.queryAll('[nav-item-label]:not(.sr-only)').length).toBe(1)
//         expect(spectator.queryAll('.sr-only[nav-item-label]').length).toBe(0)
//       }))
//     })

//     describe('compact', () => {
//       it('should render with basic inputs', fakeAsync(() => {
//         spectator = createComponent({
//           props: {
//             expanded: false,
//             active: false,
//             hierLevel: 0,
//             compact: true,
//             itemType: 'basic',
//             icon: faAlignLeft,
//             label: 'Test',
//             // link: '/foo',
//             // badgeText: 'bar',
//             // badgeTheme: 'primary',
//             // badgeSrContent: 'foo',
//             // children: []
//           }
//         })

//         expect(spectator.queryAll('[nav-item-label]:not(.sr-only)').length).toBe(0)
//         expect(spectator.queryAll('.sr-only[nav-item-label]').length).toBe(1)
//       }))
//     })
//   })
// })
