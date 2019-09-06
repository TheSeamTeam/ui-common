import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { ExampleLazyLoadedWidgetsModule } from './example-lazy-loaded-widgets/example-lazy-loaded-widgets.module'

import { AppComponent } from './app.component'

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ExampleLazyLoadedWidgetsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
