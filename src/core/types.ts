import type { ComponentType } from 'react';

export type ExperienceDefinition = {
  experience: string;
  version: string;
  entryPoint: string;
  enabled: boolean;
  config: unknown;
};

export type LifecycleStatus =
  | 'initializing'
  | 'loading'
  | 'ready'
  | 'completed'
  | 'failed';

export type ExperienceVersionImpl = {
  parseConfig: (raw: unknown) => unknown;
  Component: ComponentType<{ config: unknown }>;
};

export type ExperienceModule = {
  id: string;
  versions: Record<string, ExperienceVersionImpl>;
  defaultVersion?: string;
};

export type LifecycleApi = {
  loading: () => void;
  ready: () => void;
  complete: (result?: unknown) => void;
  fail: (error: unknown) => void;
};
