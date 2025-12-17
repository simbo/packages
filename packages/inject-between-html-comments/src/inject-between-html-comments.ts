import escapeStringRegexp from 'escape-string-regexp';

import type { Options, TextOption } from './inject-between-html-comments.types.js';

/**
 * The default base string for an injection comment text.
 */
const BASE_TEXT = 'INJECT';

/**
 * Injects content between two html comments in a the given string content.
 *
 * All occurrences of HTML comments matching the respective comment text will be
 * processed.
 *
 * @param content - The original content to modify.
 * @param inject - The content to inject between the comments.
 * @param options - The options for the injection.
 * @returns The updated content including the injected content.
 */
export function injectBetweenHtmlComments(content: string, inject: string, options: Options = {}): string {
  const { name, text: textOption, inline = false, trim = true } = options;

  if (typeof content !== 'string' || content.length === 0) {
    throw new TypeError(`Content must be a non-empty string: '${String(content as unknown)}'`);
  }
  if (typeof inject !== 'string') {
    throw new TypeError(`Injection content must be a string: '${String(inject as unknown)}'`);
  }

  if (trim) {
    inject = inject.trim();
  }

  const text = getCommentText(textOption, name);
  const escapedText = escapeStringRegexp(text);

  const opening = `<!-- ${text} -->`;
  const closing = `<!-- /${text} -->`;
  const glue = inline ? '' : '\n\n';

  const regex = (flags = ''): RegExp =>
    new RegExp(String.raw`<!--\s*${escapedText}\s*-->[\s\S]*?<!--\s*/${escapedText}\s*-->`, `m${flags}`);

  const injectedContent = `${opening}${glue}${inject}${glue}${closing}`;

  if (!regex().test(content)) {
    throw new Error(`Injection comment not found in content: '${opening}…${closing}'`);
  }

  const updatedContent = content.replaceAll(regex('g'), injectedContent);

  return updatedContent;
}

/**
 * Generates the text for the injection comment.
 *
 * @param textOption - The injection comment text or function to generate the text.
 * @param name - The optional name partial the injection comment text.
 * @returns The text for the injection comment.
 */
function getCommentText(textOption?: TextOption, name?: string): string {
  let text: string | undefined;

  if (name !== undefined) {
    if (typeof name !== 'string') {
      throw new TypeError(`Comment name must be a string: '${String(name)}'`);
    }
    name = name.trim();
    if (name.length === 0) {
      throw new TypeError(`Comment name must not be empty`);
    }
  }

  if (textOption === undefined) {
    text = name ? `${BASE_TEXT}:${name}` : BASE_TEXT;
  } else {
    if (typeof textOption === 'string') {
      text = textOption.trim();
    } else if (typeof textOption === 'function') {
      text = textOption(name).trim();
    } else {
      throw new TypeError(`Text option must be a string or a function: '${String(textOption)}'`);
    }
  }

  if (typeof text !== 'string' || text.length === 0) {
    throw new TypeError(`Comment text must be a non-empty string: '${String(text as unknown)}'`);
  }

  return text;
}
