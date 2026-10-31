import type { ExperienceModule, ExperienceVersionImpl } from './types';

const modules = new Map<string, ExperienceModule>();

export type Resolution =
  | {
      kind: 'found';
      impl: ExperienceVersionImpl;
      resolvedVersion: string;
      usedDefault: boolean;
    }
  | { kind: 'unknown-experience' }
  | { kind: 'unsupported-version'; requested: string };

export function register(module: ExperienceModule): void {
  if (modules.has(module.id)) {
    throw new Error(`Duplicate experience: ${module.id}`);
  }
  modules.set(module.id, module);
}

export function resolve(id: string, version: string): Resolution {
  const module = modules.get(id);
  if (!module) {
    return { kind: 'unknown-experience' };
  }

  const exact = module.versions[version];
  if (exact) {
    return { kind: 'found', impl: exact, resolvedVersion: version, usedDefault: false };
  }

  const fallback = module.defaultVersion
    ? module.versions[module.defaultVersion]
    : undefined;
  if (fallback && module.defaultVersion) {
    return {
      kind: 'found',
      impl: fallback,
      resolvedVersion: module.defaultVersion,
      usedDefault: true,
    };
  }

  return { kind: 'unsupported-version', requested: version };
}

export function resetRegistry(): void {
  modules.clear();
}