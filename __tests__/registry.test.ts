import React from 'react';
import { register, resetRegistry, resolve } from '../src/core/registry';
import type { ExperienceModule } from '../src/core/types';

const version = {
  parseConfig: (raw: unknown) => raw,
  Component: () => React.createElement(React.Fragment),
};

const module: ExperienceModule = {
  id: 'tarot',
  versions: { v1: version, v2: version },
  defaultVersion: 'v1',
};

beforeEach(() => resetRegistry());

test('resolves an exact version before the default', () => {
  register(module);

  expect(resolve('tarot', 'v2')).toEqual({
    kind: 'found',
    impl: version,
    resolvedVersion: 'v2',
    usedDefault: false,
  });
});

test('uses the module default for an unknown requested version', () => {
  register(module);

  expect(resolve('tarot', 'v9')).toEqual({
    kind: 'found',
    impl: version,
    resolvedVersion: 'v1',
    usedDefault: true,
  });
});

test('returns safe resolution results for unknown modules and versions', () => {
  register({ id: 'empty', versions: {} });

  expect(resolve('missing', 'v1')).toEqual({ kind: 'unknown-experience' });
  expect(resolve('empty', 'v9')).toEqual({
    kind: 'unsupported-version',
    requested: 'v9',
  });
});

test('rejects duplicate registrations', () => {
  register(module);

  expect(() => register(module)).toThrow('Duplicate experience: tarot');
});