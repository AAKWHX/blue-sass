/** Only return to the local estimator; never accept external redirect targets. */
export function quoteReturnPath(value: unknown, locale: string) {
  const fallback = `/${locale}/portal`;
  if (typeof value !== "string" || !value.startsWith(`/${locale}/quote`)) return fallback;
  try {
    const url = new URL(value, "https://local.invalid");
    if (url.origin !== "https://local.invalid" || url.pathname !== `/${locale}/quote`) return fallback;
    const query = new URLSearchParams();
    for (const key of ["type", "service"]) {
      const entry = url.searchParams.get(key);
      if (entry && /^[a-z]{1,20}$/.test(entry)) query.set(key, entry);
    }
    return `${url.pathname}?${query}`;
  } catch { return fallback; }
}
