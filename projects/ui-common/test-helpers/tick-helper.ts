import { tick } from '@angular/core/testing'

/**
 * Helps advance tests to specific elapsed times.
 *
 * # When to use
 *
 * If a test needs to do something at 100 ticks, but expected values should
 * also be tested at multiple ticks before 100 ticks, then the previous tick
 * sum needs to be counted. If the elapsed can be easily counted by just
 * skimming the code you should just use `tick()`.
 *
 * The following example is simple enough that `tick()` is probably better, but
 * it shows how it is used.
 *
 * ## Example without
 *
 * ```ts
 * const thing = new Thing()
 * thing.dieAfterTicks(100)
 *
 * tick(25)
 * expect(thing.isAlive).toBe(true)
 *
 * tick(25)
 * expect(thing.isAlive).toBe(true)
 *
 * tick(25)
 * expect(thing.isAlive).toBe(true)
 *
 * tick(25)
 * expect(thing.isAlive).toBe(false)
 * ```
 *
 * ## Example with
 *
 * ```ts
 * const t = new TickHelper()
 * const thing = new Thing()
 * thing.dieAfterTicks(100)
 *
 * t.tickTo(25)
 * expect(thing.isAlive).toBe(true)
 *
 * t.tickTo(50)
 * expect(thing.isAlive).toBe(true)
 *
 * t.tickTo(75)
 * expect(thing.isAlive).toBe(true)
 *
 * t.tickTo(100)
 * expect(thing.isAlive).toBe(false)
 * ```
 */
export class TickHelper {

  private _startTime = Date.now()

  /**
   * Returns the number of ticks that have elapsed since this class was
   * initialized.
   */
  public get ticksElapsed() { return Date.now() - this._startTime }

  /**
   * Calls `tick()` for the remaining number of ticks to reach elapsed ticks.
   *
   * ```
   * const t = new TickHelper()
   * tick(3)
   * t.tickTo(10) // Equivalent to `tick(7)` in this case to reach 10 ticks.
   * ```
   */
  public tickTo(ticks: number) { tick(ticks - this.ticksElapsed) }

}
