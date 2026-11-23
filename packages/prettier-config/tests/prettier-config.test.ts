import prettier from 'prettier';
import { describe, expect, it } from 'vitest';

import config from '../src/index.js';

describe('Prettier Config', () => {
  it('is accepted by Prettier and formats code correctly', async () => {
    const code = `const x=[1,2]`;
    const expected = `const x = [1, 2];\n`;
    const result = await prettier.format(code, { ...config, parser: 'babel' });

    expect(result).toBe(expected);
  });

  it.each(['jsx', 'tsx'])('sorts imports and formats JSX in .%s files', async extension => {
    const code = `import zebra from './zebra';
import alpha from './alpha';
export const element=<div>{alpha}{zebra}</div>;`;
    const expected = `import alpha from './alpha';
import zebra from './zebra';

export const element = (
  <div>
    {alpha}
    {zebra}
  </div>
);
`;
    const options = config.overrides?.[0]?.options;
    const result = await prettier.format(code, { ...config, ...options, filepath: `component.${extension}` });

    expect(result).toBe(expected);
  });
});
