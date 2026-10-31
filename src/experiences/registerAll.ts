import { register } from '../core/registry';
import { consultationModule } from './consultation';
import { gemstoneModule } from './gemstone';
import { tarotModule } from './tarot';

let registered = false;

export function registerAll(): void {
  if (registered) {
    return;
  }
  register(tarotModule);
  register(gemstoneModule);
  register(consultationModule);
  registered = true;
}