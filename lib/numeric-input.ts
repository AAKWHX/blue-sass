/** Decimal-safe stepping for bounded quantity controls. Invalid values stay invalid. */
export function stepNumber(value: number, direction: -1 | 1, step = 1, min = 0, max = Number.MAX_SAFE_INTEGER) {
  if (![value, step, min, max].every(Number.isFinite) || step <= 0 || min > max) throw new Error("INVALID_NUMBER_RANGE");
  function decimals(number: number) {
    const [mantissa, exponent = "0"] = String(number).split("e");
    return Math.max(0, (mantissa.split(".")[1]?.length ?? 0) - Number(exponent));
  }
  const precision = Math.min(10, Math.max(decimals(step), decimals(value)));
  return Math.min(max, Math.max(min, Number((value + direction * step).toFixed(precision))));
}
