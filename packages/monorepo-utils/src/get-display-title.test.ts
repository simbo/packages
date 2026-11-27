import { describe, expect, it } from 'vitest';

import { getDisplayTitle } from './get-display-title.js';

describe('getDisplayTitle', () => {
  it('should keep a plain title', () => {
    expect(getDisplayTitle('Clirk - The CLI Clerk')).toBe('Clirk - The CLI Clerk');
  });

  it('should remove HTML images and keep the text around them', () => {
    expect(getDisplayTitle('<img alt="" src="graphics/readme/title-symbol.svg" height="24"> Simbo’s Brand')).toBe(
      'Simbo’s Brand',
    );
  });

  it('should remove other HTML tags and keep their text', () => {
    expect(getDisplayTitle('The <code>pack</code> <b>Tool</b>')).toBe('The pack Tool');
  });

  it('should leave no tag that forms from the rest of another', () => {
    expect(getDisplayTitle('<<img>img src="x"> Title')).toBe('Title');
  });

  it('should remove Markdown images, inline and by reference', () => {
    expect(getDisplayTitle('![Logo](logo.svg) Title ![Badge][badge]')).toBe('Title');
  });

  it('should reduce links to their text', () => {
    expect(getDisplayTitle('[Simbo](https://simbo.de/) and [Packages][packages]')).toBe('Simbo and Packages');
  });

  it('should reduce emphasis, strong emphasis, strikethrough, and inline code to their text', () => {
    expect(getDisplayTitle('**Bold** *italic* ***both*** __strong__ _em_ ~~gone~~ `code`')).toBe(
      'Bold italic both strong em gone code',
    );
  });

  it('should reduce nested formatting to its text', () => {
    expect(getDisplayTitle('**[Linked](https://example.com/) _Title_**')).toBe('Linked Title');
  });

  it('should keep underscores inside words', () => {
    expect(getDisplayTitle('snake_case_name and __init__')).toBe('snake_case_name and init');
  });

  it('should keep escaped characters as text', () => {
    expect(getDisplayTitle(String.raw`\*Not\* \_emphasis\_ \<tag\> \# one`)).toBe('*Not* _emphasis_ <tag> # one');
  });

  it('should remove a closing sequence of hashes but keep hashes inside the title', () => {
    expect(getDisplayTitle('C# Tools ##')).toBe('C# Tools');
  });

  it('should keep emoji and collapse whitespace', () => {
    expect(getDisplayTitle('  📦   Simbo’s\tPackages  ')).toBe('📦 Simbo’s Packages');
  });

  it('should return an empty title for a heading of images only', () => {
    expect(getDisplayTitle('<img src="logo.svg"> ![Badge](badge.svg)')).toBe('');
  });
});
