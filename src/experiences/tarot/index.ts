import type { ExperienceModule } from '../../core/types';
import { tarotV1 } from './v1';
import { tarotV2 } from './v2';

export const tarotModule: ExperienceModule = {
  id: 'tarot',
  versions: {
    v1: tarotV1,
    v2: tarotV2,
  },
  defaultVersion: 'v1',
};