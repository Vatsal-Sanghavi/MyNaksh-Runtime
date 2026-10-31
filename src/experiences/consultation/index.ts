import type { ExperienceModule } from '../../core/types';
import { consultationV1 } from './v1';

export const consultationModule: ExperienceModule = {
  id: 'consultation',
  versions: { v1: consultationV1 },
  defaultVersion: 'v1',
};