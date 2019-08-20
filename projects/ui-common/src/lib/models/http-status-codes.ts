/**
 * Most of the status code packages seemed to be incomplete, so instead of
 * importing a possibly incomplete package for the few status codes we currently
 * would need, just add them to them as necessary.
 */

/** Http Status Codes Enum */
export enum HttpStatus {
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  RequestTimeout = 408,
  UnprocessableEntity = 422,
  InternalServerError = 500,
  NotImplemented = 501,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 502
}
