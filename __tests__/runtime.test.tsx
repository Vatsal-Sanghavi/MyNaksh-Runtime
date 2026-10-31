import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ExperienceRuntime } from '../src/core/ExperienceRuntime';
import { registerAll } from '../src/experiences/registerAll';

beforeAll(() => registerAll());

test('invalid experience config is contained to its own runtime', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <ExperienceRuntime
        definition={{
          experience: 'tarot',
          version: 'v1',
          entryPoint: 'test-invalid-tarot',
          enabled: true,
          config: { deck: 'Classic', maxCards: 'abc' },
        }}
      />,
    );
    await Promise.resolve();
  });

  const text = renderer?.root
    .findAllByType('Text' as never)
    .map(node => String(node.props.children))
    .join(' ');

  expect(text).toContain('Tarot maxCards must be a whole number');
  expect(text).toContain('Retry');
});