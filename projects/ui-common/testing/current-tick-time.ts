
/**
 * When using `fakeAsync` this can access the internal currentTickTime of the
 * fake zone's scheduler.
 *
 * NOTE: Do **NOT** rely on this in tests. It is accesses private properties
 * that could break or change at any time, which could cause it to not have the
 * same meaning and be inaccurate in a future version.
 *
 * NOTE: This is accessing private properties, so I don't recommend relying on
 * this in tests. I find it useful to sometimes set this on a global property
 * that I can observe in the debugger's watch variables.
 */
export function currentTickTime(documentWindow: any = window): number {
  return documentWindow.Zone.current._properties.FakeAsyncTestZoneSpec._scheduler._currentTickTime
}
