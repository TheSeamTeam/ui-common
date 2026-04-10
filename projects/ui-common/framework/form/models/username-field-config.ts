export interface TheSeamUsernameFieldConfig {
  minLength: number
  pattern: RegExp
}

export const DEFAULT_USERNAME_FIELD_CONFIG: TheSeamUsernameFieldConfig = {
  minLength: 8,
  pattern: /^[a-zA-Z0-9\-._@+]+$/,
}
