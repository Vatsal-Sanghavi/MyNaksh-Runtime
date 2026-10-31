export type RecommendationMode = 'calm' | 'focus';

let failureArmed = true;

export async function recommendGemstone(
  mode: RecommendationMode,
  shouldFail: boolean,
): Promise<string> {
  await Promise.resolve();
  if (!shouldFail) {
    failureArmed = true;
  } else if (failureArmed) {
    failureArmed = false;
    throw new Error('Gemstone recommendations are temporarily unavailable.');
  }
  return mode === 'calm' ? 'Moonstone' : 'Tiger’s eye';
}