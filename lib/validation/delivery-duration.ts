export function westernDigits(value: string) {
  return value.replace(/[٠-٩]/g, char => String(char.charCodeAt(0) - 0x660)).replace(/[۰-۹]/g, char => String(char.charCodeAt(0) - 0x6f0));
}
export function durationValue(value: string, minimum: number, maximum = 730) {
  const normalized = westernDigits(value).trim();
  if (!/^\d{1,3}$/.test(normalized)) return null;
  const days = Number(normalized);
  return days >= minimum && days <= maximum ? days : null;
}
