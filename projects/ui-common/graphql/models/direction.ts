export class GQLDirection {
  constructor(public readonly direction: string) { }
  public static readonly ASC = new GQLDirection('ASC')
  public static readonly DESC = new GQLDirection('DESC')
}
