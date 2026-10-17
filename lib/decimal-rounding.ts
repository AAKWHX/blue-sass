/** Round a product of nonnegative decimal numbers, without binary float ties. */
export function roundedProduct(a: number, b: number, decimalShift = 0): number {
  if (![a, b].every(value => Number.isFinite(value) && value >= 0)) throw new Error("INVALID_DECIMAL");
  function parts(value: number): [bigint, number] {
    const [mantissa, exponent = "0"] = String(value).toLowerCase().split("e");
    const [whole, fraction = ""] = mantissa.split(".");
    return [BigInt(whole + fraction), Number(exponent) - fraction.length];
  }
  const [left, le] = parts(a); const [right, re] = parts(b);
  const exponent = le + re + decimalShift; const product = left * right;
  if (exponent >= 0) return Number(product * BigInt(10) ** BigInt(exponent));
  const divisor = BigInt(10) ** BigInt(-exponent);
  return Number((product * BigInt(2) + divisor) / (divisor * BigInt(2)));
}
