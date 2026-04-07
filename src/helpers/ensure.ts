export function ensureExists<T>(
  value: T | undefined | null,
  msg = ''
): asserts value is T {
  if (value === undefined || value === null) {
    throw new Error(`Invalid nullish value (${value}): ${msg}`)
  }
}

export function ensure<T>(
  value: T,
  msg = ''
): asserts value is Exclude<T, null | undefined | false> {
  if (!value) {
    throw new Error(`ensure() invalid: (${value}): ${msg} ${new Error().stack}`)
  }
}

export function assertString(val: unknown, name = '(unnamed)'): string {
  if (typeof val !== 'string') {
    throw new Error(`No string ${name}`)
  }
  return val
}
