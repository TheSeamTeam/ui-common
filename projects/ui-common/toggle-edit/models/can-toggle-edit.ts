export interface TheSeamCanToggleEdit {
  isEditing(): boolean

  toggleEditing(isEditing?: boolean): void

  startEditing(): void

  stopEditing(): void

  keydownEvent(event: KeyboardEvent): void
}
