/**
 * Format a count with the appropriate singular or plural word.
 *
 * A count can be a number or a string that can be parsed to a number.
 *
 * If the parsed count is NaN, it defaults to 0.
 *
 * @param count - The count of items.
 * @param singularWord - The singular form of the word.
 * @param pluralWord - The plural form of the word. If not provided, defaults to
 * the singular form with an "s" appended.
 * @param template - The template string to format the output. Occurrences of
 * "%d" for the count and "%s" for the word will be replaced.
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
