import { DataboardBoard } from './databoard-board'
import { TheSeamDataboardListAccessor } from './databoard-list-accessor'

export interface BoardsAlterationState<TState = any> {
  readonly id: string
  readonly type: string
  readonly state: TState
}

/**
 * Alteration applied to a board or boards that can be persisted.
 *
 * Tracking if a board was altered by user or library code can be confusing.
 * This allows us to store a list of replayable alterations on boards. By
 * having a defined way to implement alterations, the databoard list should be easier
 * to support external features that want to provide an alteration.
 *
 * NOTE: Currently, to unapply an alteration you can create an alteration with
 * `persistent` set to false and the alteration will be removed after `apply()`
 * is called.
 */
export abstract class BoardsAlteration<TState = any> {
  /**
   * This should be unique to the alteration, but determinable. When an app is
   * reloaded and alterations are restored from a persistable storage this
   * should still be recognizable.
   */
  public abstract readonly id: string

  /**
   * The alteration type.
   *
   * This can be used to group alteraction from a common feature.
   */
  public abstract readonly type: string

  constructor(
    /**
     * Persistable state.
     *
     * Returned value should be JSON stringifyable.
     */
    public state: TState,
    /**
     * If false, the state will not be persisted to a persistent storage and
     * will be removed after applied.
     */
    public readonly persistent: boolean
  ) {
    this.state = state
  }

  /**
   * Apply alteration to board.
   */
  public abstract apply(boards: DataboardBoard[], datatable: TheSeamDataboardListAccessor): void

  public toJSON(): BoardsAlterationState<TState> {
    return {
      id: this.id,
      type: this.type,
      state: this.state
    }
  }
}
