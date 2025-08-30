/**
 * Converts a string or an array of strings to an array of strings.
 *
 * @param value - The input value to transform.
 * @returns An array of strings.
 */
export function arrayifyString(value: string | string[]): string[] {
  return typeof value === 'string' ? [value] : value;
}

/**
 * Converts a record of string or string arrays to a record of string arrays.
 *
 * @param obj - The input object to transform.
 * @returns A new object with all string values converted to arrays of strings.
 */
export function arrayifyStringRecords(obj: Record<string, string | string[]>): Record<string, string[]> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, arrayifyString(v)]));
}
