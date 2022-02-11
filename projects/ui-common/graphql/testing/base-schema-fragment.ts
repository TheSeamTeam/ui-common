import { gql } from 'apollo-angular'

export const baseSchemaFragment = gql`
  input ComparableInt32OperationFilterInput {
    eq: Int
    neq: Int
    in: [Int!]
    nin: [Int!]
    gt: Int
    ngt: Int
    gte: Int
    ngte: Int
    lt: Int
    nlt: Int
    lte: Int
    nlte: Int
    objectContains: String
  }

  input StringOperationFilterInput {
    and: [StringOperationFilterInput!]
    or: [StringOperationFilterInput!]
    eq: String
    neq: String
    contains: String
    ncontains: String
    in: [String]
    nin: [String]
    startsWith: String
    nstartsWith: String
    endsWith: String
    nendsWith: String
    objectContains: String
  }

  input ComparableDateTimeOffsetOperationFilterInput {
    eq: DateTime
    neq: DateTime
    in: [DateTime!]
    nin: [DateTime!]
    gt: DateTime
    ngt: DateTime
    gte: DateTime
    ngte: DateTime
    lt: DateTime
    nlt: DateTime
    lte: DateTime
    nlte: DateTime
    objectContains: String
  }

  input BooleanOperationFilterInput {
    eq: Boolean
    neq: Boolean
    objectContains: String
  }

  input ComparableNullableOfDateTimeOffsetOperationFilterInput {
    eq: DateTime
    neq: DateTime
    in: [DateTime]
    nin: [DateTime]
    gt: DateTime
    ngt: DateTime
    gte: DateTime
    ngte: DateTime
    lt: DateTime
    nlt: DateTime
    lte: DateTime
    nlte: DateTime
    objectContains: String
  }


  enum SortEnumType {
    ASC
    DESC
  }


  """The \`DateTime\` scalar represents an ISO-8601 compliant date time type."""
  scalar DateTime

  scalar Uuid

  """The built-in \`Decimal\` scalar type."""
  scalar Decimal

  """
  The \`Long\` scalar type represents non-fractional signed whole 64-bit numeric values. Long can represent values between -(2^63) and 2^63 - 1.
  """
  scalar Long


  """Information about the offset pagination."""
  type CollectionSegmentInfo {
    """
    Indicates whether more items exist following the set defined by the clients arguments.
    """
    hasNextPage: Boolean!

    """
    Indicates whether more items exist prior the set defined by the clients arguments.
    """
    hasPreviousPage: Boolean!
  }
`
