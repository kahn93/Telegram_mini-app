export const MAX_ENERGY = 5000;
export const ENERGY_REGEN_PER_SEC = 2; // 2 energy per second (0.5 sec per energy)

export function getInitialEnergy(): number {
  return MAX_ENERGY;
}
