import { boolean, select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { faShare } from '@fortawesome/free-solid-svg-icons'

import { IconComponent } from '../icon/icon.component'
import { IconNotificationComponent } from './icon-notification.component'

storiesOf('Components|Icon/Notification', module)
  .addDecorator(withKnobs)

  .add('Url', () => ({
    moduleMetadata: {
      declarations: [
        IconComponent,
        IconNotificationComponent
      ],
      imports: [
        BrowserAnimationsModule,
        FontAwesomeModule
      ]
    },
    props: {
      icon: 'assets/images/icons8-cotton-filled-48.png',
      icon2: 'assets/images/landdb-14d6a0.PNG',
      notificationIconClass: 'text-danger',
      hasNotif: boolean('Has Notification', true)
    },
    template: `
      <div class="p-5">
        <seam-icon [icon]="icon">
          <seam-icon-notification *ngIf="hasNotif" [iconClass]="notificationIconClass"></seam-icon-notification>
        </seam-icon>
      </div>
      <div class="p-5">
        <seam-icon [icon]="icon2">
          <seam-icon-notification *ngIf="hasNotif" [iconClass]="notificationIconClass"></seam-icon-notification>
        </seam-icon>
      </div>`
  }))

  .add('Url(styled-square)', () => ({
    moduleMetadata: {
      declarations: [
        IconComponent,
        IconNotificationComponent
      ],
      imports: [
        BrowserAnimationsModule,
        FontAwesomeModule
      ]
    },
    props: {
      icon: 'assets/images/icons8-cotton-filled-48.png',
      icon2: 'assets/images/landdb-14d6a0.PNG',
      notificationIconClass: 'text-danger',
      hasNotif: boolean('Has Notification', true)
    },
    template: `
      <div class="p-5">
        <seam-icon [icon]="icon" iconType="styled-square">
          <seam-icon-notification *ngIf="hasNotif" [iconClass]="notificationIconClass"></seam-icon-notification>
        </seam-icon>
      </div>
      <div class="p-5">
        <seam-icon [icon]="icon2" iconType="styled-square">
          <seam-icon-notification *ngIf="hasNotif" [iconClass]="notificationIconClass"></seam-icon-notification>
        </seam-icon>
      </div>`
  }))

  .add('Url(image-fill)', () => ({
    moduleMetadata: {
      declarations: [
        IconComponent,
        IconNotificationComponent
      ],
      imports: [
        BrowserAnimationsModule,
        FontAwesomeModule
      ]
    },
    props: {
      icon: 'assets/images/icons8-cotton-filled-48.png',
      icon2: 'assets/images/landdb-14d6a0.PNG',
      notificationIconClass: 'text-danger',
      hasNotif: boolean('Has Notification', true)
    },
    template: `
      <div class="p-5">
        <div class="alert alert-warning">Only partially implemented so far for images. The image will shrink but not grow currently.</div>

        <div class="border mb-2" style="height: 200px; width: 200px;">
          <seam-icon [icon]="icon" iconType="image-fill">
            <seam-icon-notification *ngIf="hasNotif" [iconClass]="notificationIconClass"></seam-icon-notification>
          </seam-icon>
        </div>

        <div class="border" style="height: 200px; width: 200px;">
          <seam-icon [icon]="icon2" iconType="image-fill">
            <seam-icon-notification *ngIf="hasNotif" [iconClass]="notificationIconClass"></seam-icon-notification>
          </seam-icon>
        </div>
      </div>`
  }))

  .add('FontAwesome', () => ({
    moduleMetadata: {
      declarations: [
        IconComponent,
        IconNotificationComponent
      ],
      imports: [
        BrowserAnimationsModule,
        FontAwesomeModule
      ]
    },
    props: {
      icon: faShare,
      notificationIconClass: 'text-danger',
      hasNotif: boolean('Has Notification', true)
    },
    template: `
      <div class="p-5">
        <seam-icon [icon]="icon">
          <seam-icon-notification *ngIf="hasNotif" [iconClass]="notificationIconClass"></seam-icon-notification>
        </seam-icon>
      </div>`
  }))

  .add('FontAwesome(styled-square)', () => ({
    moduleMetadata: {
      declarations: [
        IconComponent,
        IconNotificationComponent
      ],
      imports: [
        BrowserAnimationsModule,
        FontAwesomeModule
      ]
    },
    props: {
      icon: faShare,
      notificationIconClass: 'text-danger',
      hasNotif: boolean('Has Notification', true)
    },
    template: `
      <div class="p-5">
        <seam-icon [icon]="icon" iconType="styled-square">
          <seam-icon-notification *ngIf="hasNotif" [iconClass]="notificationIconClass"></seam-icon-notification>
        </seam-icon>
      </div>`
  }))

  .add('FontAwesome(image-fill)', () => ({
    moduleMetadata: {
      declarations: [
        IconComponent,
        IconNotificationComponent
      ],
      imports: [
        BrowserAnimationsModule,
        FontAwesomeModule
      ]
    },
    props: {
      icon: faShare,
      notificationIconClass: 'text-danger',
      hasNotif: boolean('Has Notification', true)
    },
    template: `
      <div class="p-5">
        <div class="border" style="height: 200px; width: 200px;">
          <seam-icon [icon]="icon" iconType="image-fill">
            <seam-icon-notification *ngIf="hasNotif" [iconClass]="notificationIconClass"></seam-icon-notification>
          </seam-icon>
        </div>
      </div>`
  }))
