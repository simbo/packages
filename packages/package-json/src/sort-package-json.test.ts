import { describe, expect, it } from 'vitest';

import { sortPackageJson } from './sort-package-json.js';

describe('sortPackageJson()', () => {
  it('sorts top-level keys in the order of the @simbo packages', () => {
    const sorted = sortPackageJson({
      devDependencies: {},
      dependencies: {},
      peerDependencies: {},
      scripts: {},
      files: [],
      exports: {},
      type: 'module',
      engines: {},
      bugs: 'bugs',
      repository: 'repository',
      homepage: 'homepage',
      license: 'MIT',
      author: 'author',
      keywords: [],
      private: true,
      version: '1.0.0',
      description: 'description',
      name: 'pkg',
    });

    expect(Object.keys(sorted)).toEqual([
      'name',
      'description',
      'version',
      'private',
      'keywords',
      'author',
      'license',
      'homepage',
      'repository',
      'bugs',
      'engines',
      'type',
      'exports',
      'files',
      'scripts',
      'peerDependencies',
      'dependencies',
      'devDependencies',
    ]);
  });

  it('puts unlisted keys after the listed ones', () => {
    const sorted = sortPackageJson({ zzz: true, prettier: 'config', name: 'pkg' });

    expect(Object.keys(sorted)).toEqual(['name', 'prettier', 'zzz']);
  });

  it('sorts top-level keys in a given order', () => {
    const sorted = sortPackageJson({ name: 'pkg', version: '1.0.0', description: 'text' }, { sortOrder: ['version'] });

    expect(Object.keys(sorted)).toEqual(['version', 'name', 'description']);
  });

  it('groups scripts by colons with the main script first', () => {
    const sorted = sortPackageJson({
      scripts: {
        test: 't',
        'build-x': 'x',
        'build:prod': 'p',
        postbuild: 'po',
        'build:a': 'a',
        build: 'b',
        prebuild: 'pr',
        'build:a:z': 'z',
      },
    });

    expect(Object.keys(sorted.scripts ?? {})).toEqual([
      'prebuild',
      'build',
      'postbuild',
      'build:a',
      'build:a:z',
      'build:prod',
      'build-x',
      'test',
    ]);
  });

  it('sorts dependencies alphabetically', () => {
    const sorted = sortPackageJson({ dependencies: { nunjucks: '1', '@types/nunjucks': '1' } });

    expect(Object.keys(sorted.dependencies ?? {})).toEqual(['@types/nunjucks', 'nunjucks']);
  });

  it('does not change the given object', () => {
    const packageJson = { version: '1.0.0', name: 'pkg', scripts: { b: 'b', a: 'a' } };

    sortPackageJson(packageJson);

    expect(Object.keys(packageJson)).toEqual(['version', 'name', 'scripts']);
    expect(Object.keys(packageJson.scripts)).toEqual(['b', 'a']);
  });
});
