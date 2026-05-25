export function isPriceWarEnabled(): boolean {
  const flag = process.env.ENABLE_PRICEWAR ?? "true";
  return flag !== "false" && flag !== "0";
}

export function isPriceWarE2eEnabled(): boolean {
  return process.env.PRICEWAR_E2E_ENABLED === "1";
}
