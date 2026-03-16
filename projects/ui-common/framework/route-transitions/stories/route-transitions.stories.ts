import { Component } from '@angular/core'
import {
  RouterLink,
  RouterOutlet,
  provideRouter,
  withViewTransitions,
  Routes,
} from '@angular/router'
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular'

import { seamRouteTransition } from '../seam-route-transition'
import { SeamRouteShellComponent } from '../seam-route-shell.component'

// --- Story page components ---

@Component({
  selector: 'story-home',
  template: `
    <div style="padding: 24px;">
      <h2>Home</h2>
      <p>Route: /</p>
      <nav style="display: flex; gap: 8px; margin-top: 16px;">
        <a routerLink="/claims" style="color: #0066cc;">Claims (sibling)</a>
        <a routerLink="/purchase-orders" style="color: #0066cc;"
          >Purchase Orders (sibling)</a
        >
      </nav>
    </div>
  `,
  imports: [RouterLink],
  standalone: true,
})
class StoryHomeComponent {}

@Component({
  selector: 'story-claims-list',
  template: `
    <div style="padding: 24px; background: #e3f2fd; min-height: 200px;">
      <h2>Claims List</h2>
      <p>Route: /claims</p>
      <nav style="display: flex; gap: 8px; margin-top: 16px;">
        <a routerLink="/" style="color: #0066cc;">Home (sibling)</a>
        <a routerLink="/claims/123" style="color: #0066cc;"
          >Claim 123 (deeper)</a
        >
        <a routerLink="/purchase-orders" style="color: #0066cc;"
          >Purchase Orders (sibling)</a
        >
      </nav>
    </div>
  `,
  imports: [RouterLink],
  standalone: true,
})
class StoryClaimsListComponent {}

@Component({
  selector: 'story-claim-detail',
  template: `
    <div style="padding: 24px; background: #bbdefb; min-height: 200px;">
      <h2>Claim Detail</h2>
      <p>Route: /claims/123</p>
      <nav style="display: flex; gap: 8px; margin-top: 16px;">
        <a routerLink="/claims" style="color: #0066cc;"
          >Claims List (shallower)</a
        >
        <a routerLink="/claims/123/edit" style="color: #0066cc;"
          >Edit (deeper)</a
        >
        <a routerLink="/purchase-orders/456" style="color: #0066cc;"
          >PO 456 (cross-branch)</a
        >
      </nav>
    </div>
  `,
  imports: [RouterLink],
  standalone: true,
})
class StoryClaimDetailComponent {}

@Component({
  selector: 'story-claim-edit',
  template: `
    <div style="padding: 24px; background: #90caf9; min-height: 200px;">
      <h2>Claim Edit</h2>
      <p>Route: /claims/123/edit</p>
      <nav style="display: flex; gap: 8px; margin-top: 16px;">
        <a routerLink="/claims/123" style="color: #0066cc;"
          >Claim Detail (shallower)</a
        >
        <a routerLink="/claims" style="color: #0066cc;"
          >Claims List (shallower)</a
        >
      </nav>
    </div>
  `,
  imports: [RouterLink],
  standalone: true,
})
class StoryClaimEditComponent {}

@Component({
  selector: 'story-po-list',
  template: `
    <div style="padding: 24px; background: #e8f5e9; min-height: 200px;">
      <h2>Purchase Orders</h2>
      <p>Route: /purchase-orders</p>
      <nav style="display: flex; gap: 8px; margin-top: 16px;">
        <a routerLink="/" style="color: #0066cc;">Home (sibling)</a>
        <a routerLink="/claims" style="color: #0066cc;">Claims (sibling)</a>
        <a routerLink="/purchase-orders/456" style="color: #0066cc;"
          >PO 456 (deeper)</a
        >
      </nav>
    </div>
  `,
  imports: [RouterLink],
  standalone: true,
})
class StoryPOListComponent {}

@Component({
  selector: 'story-po-detail',
  template: `
    <div style="padding: 24px; background: #c8e6c9; min-height: 200px;">
      <h2>Purchase Order Detail</h2>
      <p>Route: /purchase-orders/456</p>
      <nav style="display: flex; gap: 8px; margin-top: 16px;">
        <a routerLink="/purchase-orders" style="color: #0066cc;"
          >PO List (shallower)</a
        >
        <a routerLink="/claims/123" style="color: #0066cc;"
          >Claim 123 (cross-branch)</a
        >
      </nav>
    </div>
  `,
  imports: [RouterLink],
  standalone: true,
})
class StoryPODetailComponent {}

// --- Story wrapper ---

@Component({
  selector: 'story-wrapper',
  template: `
    <div
      style="border: 1px solid #ccc; border-radius: 4px; overflow: hidden; height: 400px;"
    >
      <div
        style="padding: 8px 16px; background: #f5f5f5; border-bottom: 1px solid #ccc; font-size: 12px; color: #666;"
      >
        Route Transition Demo — click links to see directional transitions
      </div>
      <div
        style="position: relative; overflow: hidden; height: calc(100% - 37px);"
      >
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  imports: [RouterOutlet],
  standalone: true,
})
class StoryWrapperComponent {}

// --- Routes ---

const storyRoutes: Routes = [
  {
    path: '',
    component: StoryWrapperComponent,
    children: [
      { path: '', component: StoryHomeComponent, pathMatch: 'full' },
      {
        path: 'claims',
        component: SeamRouteShellComponent,
        children: [
          { path: '', component: StoryClaimsListComponent, pathMatch: 'full' },
          {
            path: ':id',
            component: SeamRouteShellComponent,
            children: [
              {
                path: '',
                component: StoryClaimDetailComponent,
                pathMatch: 'full',
              },
              { path: 'edit', component: StoryClaimEditComponent },
            ],
          },
        ],
      },
      {
        path: 'purchase-orders',
        component: SeamRouteShellComponent,
        children: [
          { path: '', component: StoryPOListComponent, pathMatch: 'full' },
          { path: ':id', component: StoryPODetailComponent },
        ],
      },
    ],
  },
]

// --- Story definition ---

const meta: Meta<StoryWrapperComponent> = {
  title: 'Framework/Route Transitions',
  component: StoryWrapperComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideRouter(
          storyRoutes,
          withViewTransitions({
            onViewTransitionCreated: seamRouteTransition(),
          }),
        ),
      ],
    }),
  ],
}

export default meta
type Story = StoryObj<StoryWrapperComponent>

export const Demo: Story = {}
