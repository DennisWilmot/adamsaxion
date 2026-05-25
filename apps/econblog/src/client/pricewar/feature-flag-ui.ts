/** Café Duel UI — A/B against flat MVP. Enable with NEXT_PUBLIC_PRICEWAR_CAFE_UI=true */
export function isCafeDuelUiEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_PRICEWAR_CAFE_UI ?? "false";
  return flag === "true" || flag === "1";
}
