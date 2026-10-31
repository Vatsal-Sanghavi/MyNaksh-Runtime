import type { ExperienceDefinition } from '../core/types';

type ConfigOptions = {
  gemstoneFails: boolean;
  invalidTarotConfig: boolean;
};

export async function fetchExperiences(
  options: ConfigOptions,
): Promise<ExperienceDefinition[]> {
  await new Promise<void>(resolve => setTimeout(resolve, 180));

  const tarotConfig = options.invalidTarotConfig
    ? { deck: 'Classic', maxCards: 'abc' }
    : { deck: 'Classic', maxCards: 3 };

  return [
    {
      experience: 'tarot',
      version: 'v1',
      entryPoint: 'home-tarot-v1',
      enabled: true,
      config: tarotConfig,
    },
    {
      experience: 'tarot',
      version: 'v2',
      entryPoint: 'home-tarot-v2',
      enabled: true,
      config: { deck: 'Classic', spreadSize: 3 },
    },
    {
      experience: 'tarot',
      version: 'v9',
      entryPoint: 'home-tarot-v9',
      enabled: true,
      config: { deck: 'Classic', maxCards: 2 },
    },
    {
      experience: 'gemstone',
      version: 'v1',
      entryPoint: 'home-gemstone',
      enabled: true,
      config: { recommendationMode: 'calm', simulateFailure: options.gemstoneFails },
    },
    {
      experience: 'consultation',
      version: 'v1',
      entryPoint: 'home-consultation',
      enabled: true,
      config: { mode: 'natal' },
    },
    {
      experience: 'gemstone',
      version: 'v1',
      entryPoint: 'disabled-gemstone',
      enabled: false,
      config: { recommendationMode: 'focus', simulateFailure: false },
    },
  ];
}