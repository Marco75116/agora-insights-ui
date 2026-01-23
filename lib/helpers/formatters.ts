export function formatTokenAmount(
  amount: string,
  decimals: number = 18,
  displayDecimals: number = 2
): string {
  if (!amount || amount === "0") return "0.00";

  const value = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const integerPart = value / divisor;
  const fractionalPart = value % divisor;

  const fractionalStr = fractionalPart.toString().padStart(decimals, "0");
  const displayFractional = fractionalStr.slice(0, displayDecimals);

  return `${formatNumber(Number(integerPart))}.${displayFractional}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

export function parseTokenAmount(amount: string, decimals: number = 18): number {
  if (!amount || amount === "0") return 0;
  const value = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  return Number(value / divisor);
}
