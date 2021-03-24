// Redefining this, instead of importing from cdk, because the way the interface
// is exported in the cdk causes problems with cli build in some situations.

/** Interface that can be used to generically type a class. */
export type ComponentType<T> = new (...args: any[]) => T
