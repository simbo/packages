import { describe, expect, it } from 'vitest';

import { mockContextWithoutMessages } from '../../tests/mocks.js';

import { generateVersionMessage } from './generate-version-message.js';

describe('generateVersionMessage', () => {
  it('returns the name and version string', () => {
    const context = mockContextWithoutMessages();
    const result = generateVersionMessage(context);

    expect(result).toBe(`test-cli v0.1.0`);
  });
});
