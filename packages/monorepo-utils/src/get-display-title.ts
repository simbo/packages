/**
 * The characters that Markdown allows to escape with a backslash.
 */
const ESCAPABLE = /\\([!"#$%&'()*+,./:;<=>?@[\\\]^_`{|}~-])/g;

/**
 * The first code point of the Unicode private use area, which holds escaped characters while formatting is removed.
 */
const PRIVATE_USE = 0xe0_00;

/**
 * Replaces a pattern until the text no longer changes, so no match can form from the rest of another.
 *
 * @param text - The text.
 * @param pattern - The pattern, with the global flag.
 * @param replace - Returns the replacement of a match from its capture groups.
 * @returns The text without any match.
 */
function replaceRepeatedly(text: string, pattern: RegExp, replace: (groups: string[]) => string): string {
  let result = text;
  let previous: string;
  do {
    previous = result;
    result = result.replaceAll(pattern, (_match: string, ...groups: unknown[]) =>
      replace(groups.filter((group): group is string => typeof group === 'string')),
    );
  } while (result !== previous);
  return result;
}

/**
 * Turns the text of a Markdown heading into a display title: images and HTML tags are removed, links and formatting
 * are reduced to their text, and whitespace is collapsed.
 *
 * @param heading - The text of the heading, without its leading `#`.
 * @returns The display title, empty when the heading holds no text.
 */
export function getDisplayTitle(heading: string): string {
  // Escaped characters are set aside, so they are not taken for formatting.
  let title = heading.replaceAll(ESCAPABLE, (_, char: string) =>
    String.fromCodePoint(PRIVATE_USE + (char.codePointAt(0) ?? 0)),
  );
  title = title
    // An optional closing sequence of `#`.
    .replace(/\s+#+\s*$/, '')
    // Images, inline and by reference.
    .replaceAll(/!\[[^\]]*\](?:\([^)]*\)|\[[^\]]*\])/g, '')
    // Links, inline and by reference, keep their text.
    .replaceAll(/\[([^\]]*)\](?:\([^)]*\)|\[[^\]]*\])/g, '$1')
    // Inline code keeps its text.
    .replaceAll(/`([^`]*)`/g, '$1');
  // HTML tags, such as `<img>` or `<code>`; the text between them stays.
  title = replaceRepeatedly(title, /<[^<>]*>/g, () => '');
  // Emphasis, strong emphasis, and strikethrough keep their text; `_` only at word boundaries.
  title = replaceRepeatedly(title, /(\*{1,3}|~~)(\S(?:.*?\S)?)\1/g, ([, text = '']) => text);
  title = replaceRepeatedly(
    title,
    /(^|[^\p{L}\p{N}_])(_{1,3})(\S(?:.*?\S)?)\2(?![\p{L}\p{N}_])/gu,
    ([before = '', , text = '']) => `${before}${text}`,
  );
  return title
    .replaceAll(/[\u{E000}-\u{E07F}]/gu, char =>
      String.fromCodePoint((char.codePointAt(0) ?? PRIVATE_USE) - PRIVATE_USE),
    )
    .replaceAll(/\s+/g, ' ')
    .trim();
}
