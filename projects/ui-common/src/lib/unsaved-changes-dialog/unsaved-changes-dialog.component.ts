import { Component, OnInit } from '@angular/core'

// TODO: Decide if this component should be implemented or just use the native
//  browser dialog for in-app routing also.

@Component({
  selector: 'seam-unsaved-changes-dialog',
  template: `
    <p>
      unsaved-changes-dialog works!
    </p>
  `,
  styles: []
})
export class UnsavedChangesDialogComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
