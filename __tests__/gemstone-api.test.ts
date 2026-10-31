import { recommendGemstone } from '../src/experiences/gemstone/api';

test('a simulated API failure is isolated and retry can recover', async () => {
  await expect(recommendGemstone('calm', true)).rejects.toThrow(
    'Gemstone recommendations are temporarily unavailable.',
  );
  await expect(recommendGemstone('calm', true)).resolves.toBe('Moonstone');
});

test('turning off failure simulation rearms the next demo failure', async () => {
  await expect(recommendGemstone('calm', false)).resolves.toBe('Moonstone');
  await expect(recommendGemstone('focus', true)).rejects.toThrow(
    'Gemstone recommendations are temporarily unavailable.',
  );
});