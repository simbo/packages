import { describe, expect, it } from 'vitest';

import { injectBetweenHtmlComments } from './inject-between-html-comments.js';

describe('injectBetweenHtmlComments', () => {
  it('keeps replacement tokens in injected content literal', () => {
    const content = '<!-- INJECT -->old<!-- /INJECT -->';
    expect(injectBetweenHtmlComments(content, '$& $$ $1', { inline: true })).toBe(
      '<!-- INJECT -->$& $$ $1<!-- /INJECT -->',
    );
  });

  it('should inject content between HTML comments', () => {
    const content = '<!-- INJECT -->\n<!-- /INJECT -->';
    const inject = 'INJECTED';

    const result = injectBetweenHtmlComments(content, inject);

    expect(result).toBe('<!-- INJECT -->\n\nINJECTED\n\n<!-- /INJECT -->');
  });

  it('should inject content inline if option is set', () => {
    const content = '<!-- INJECT --><!-- /INJECT -->';
    const inject = 'INJECTED';

    const result = injectBetweenHtmlComments(content, inject, { inline: true });

    expect(result).toBe('<!-- INJECT -->INJECTED<!-- /INJECT -->');
  });

  it('should use a custom comment text name if option is set', () => {
    const content = '<!-- INJECT:example --><!-- /INJECT:example -->';
    const inject = 'INJECTED';

    const result = injectBetweenHtmlComments(content, inject, { name: 'example' });

    expect(result).toBe('<!-- INJECT:example -->\n\nINJECTED\n\n<!-- /INJECT:example -->');
  });

  it('should use a custom string comment text if option is set', () => {
    const content = '<!-- CUSTOM --><!-- /CUSTOM -->';
    const inject = 'INJECTED';

    const result = injectBetweenHtmlComments(content, inject, { text: 'CUSTOM' });

    expect(result).toBe('<!-- CUSTOM -->\n\nINJECTED\n\n<!-- /CUSTOM -->');
  });

  it('should use a custom generated comment text if option is set', () => {
    const content = '<!-- CUSTOM:example --><!-- /CUSTOM:example -->';
    const inject = 'INJECTED';

    const result = injectBetweenHtmlComments(content, inject, {
      name: 'example',
      text: name => `CUSTOM:${String(name)}`,
    });

    expect(result).toBe('<!-- CUSTOM:example -->\n\nINJECTED\n\n<!-- /CUSTOM:example -->');
  });

  it('should trim the custom comment text name', () => {
    const content = '<!-- INJECT:example --><!-- /INJECT:example -->';
    const inject = 'INJECTED';

    const result = injectBetweenHtmlComments(content, inject, { name: ' example ' });

    expect(result).toBe('<!-- INJECT:example -->\n\nINJECTED\n\n<!-- /INJECT:example -->');
  });

  it('should trim the resulting comment text', () => {
    const content = '<!-- CUSTOM --><!-- /CUSTOM -->';
    const inject = 'INJECTED';

    const result = injectBetweenHtmlComments(content, inject, { text: () => ' CUSTOM ' });

    expect(result).toBe('<!-- CUSTOM -->\n\nINJECTED\n\n<!-- /CUSTOM -->');
  });

  it('should support regex control characters in the comment text', () => {
    const content = '<!-- [$] --><!-- /[$] -->';
    const inject = 'INJECTED';

    const result = injectBetweenHtmlComments(content, inject, { text: '[$]' });

    expect(result).toBe('<!-- [$] -->\n\nINJECTED\n\n<!-- /[$] -->');
  });

  it('should support all kinds of special characters in the comment text', () => {
    const content = '<!-- 👉 Ω ௹ --><!-- /👉 Ω ௹ -->';
    const inject = 'INJECTED';

    const result = injectBetweenHtmlComments(content, inject, { text: () => '👉 Ω ௹' });

    expect(result).toBe('<!-- 👉 Ω ௹ -->\n\nINJECTED\n\n<!-- /👉 Ω ௹ -->');
  });

  it('should throw if content is not a string', () => {
    const content = undefined as unknown as string;
    const inject = 'INJECTED';

    expect(() => injectBetweenHtmlComments(content, inject)).toThrowError(
      `Content must be a non-empty string: 'undefined'`,
    );
  });

  it('should throw if content is empty', () => {
    const content = '';
    const inject = 'INJECTED';

    expect(() => injectBetweenHtmlComments(content, inject)).toThrowError(`Content must be a non-empty string: ''`);
  });

  it('should throw if injection content is not a string', () => {
    const content = '<!-- INJECT --><!-- /INJECT -->';
    const inject = 123 as unknown as string;

    expect(() => injectBetweenHtmlComments(content, inject)).toThrowError(
      `Injection content must be a string: 'number'`,
    );
  });

  it('should throw if the comment is not found', () => {
    const content = 'Foo!';
    const inject = 'INJECTED';

    expect(() => injectBetweenHtmlComments(content, inject)).toThrowError(
      `Injection comment not found in content: '<!-- INJECT -->…<!-- /INJECT -->'`,
    );
  });

  it('should throw if the given name is not a string', () => {
    const content = '<!-- INJECT:example --><!-- /INJECT:example -->';
    const inject = 'INJECTED';

    expect(() => injectBetweenHtmlComments(content, inject, { name: 123 as unknown as string })).toThrowError(
      `Comment name must be a string: '123'`,
    );
  });

  it('should throw if the given name is empty', () => {
    const content = '<!-- INJECT:example --><!-- /INJECT:example -->';
    const inject = 'INJECTED';

    expect(() => injectBetweenHtmlComments(content, inject, { name: '' })).toThrowError(
      `Comment name must not be empty`,
    );
  });

  it('should throw if the text option is not a string or function', () => {
    const content = '<!-- INJECT:example --><!-- /INJECT:example -->';
    const inject = 'INJECTED';

    expect(() => injectBetweenHtmlComments(content, inject, { text: 123 as unknown as string })).toThrowError(
      `Text option must be a string or a function: '123'`,
    );
  });

  it('should throw if the resulting comment text is empty', () => {
    const content = '<!-- INJECT:example --><!-- /INJECT:example -->';
    const inject = 'INJECTED';

    expect(() => injectBetweenHtmlComments(content, inject, { text: () => '' })).toThrowError(
      `Comment text must be a non-empty string: ''`,
    );
  });
});
