/**
 * Format a count with the appropriate singular or plural word.
 *
 * String counts are converted with Number and truncated toward zero.
 * Invalid strings default to 0; numeric counts are used as provided.
 * Words are inserted literally, including dollar-sign replacement sequences.
 *
 * @param count - The count of items.
 * @param singularWord - The singular form of the word.
 * @param pluralWord - The plural form of the word. If not provided, defaults to
 * the singular form with an "s" appended.
 * @param template - The template string to format the output. Occurrences of
 * "%d" for the count and "%s" for the word are replaced once each.
 * Defaults to "%d %s".
 * @returns The rendered template string.
 */
export function plural(count: number | string, singularWord: string, pluralWord?: string, template = '%d %s'): string {
  if (typeof count === 'string') {
    count = Math.trunc(Number(count.trim()));
  }

  if (typeof count !== 'number' || Number.isNaN(count)) {
    count = 0;
  }

  pluralWord ??= `${singularWord}s`;

  const word = Math.abs(count) === 1 ? singularWord : pluralWord;

  return template.replace('%d', () => String(count)).replace('%s', () => word);
}
