// coinsPerTapLogic.ts
export function getCoinsPerTap(coinCount: number): number {
  return 1 + Math.floor(coinCount / 10000) * 2;
}
