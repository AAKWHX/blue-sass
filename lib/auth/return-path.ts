/** Only return to the local estimator; never accept external redirect targets. */
export function quoteReturnPath(value: unknown, locale: string) {
  const fallback = `/${locale}/portal`;
  if (typeof value !== "string" || value.includes("\\")) return fallback;
  try {
    const url = new URL(value, "https://local.invalid");
    if (url.origin !== "https://local.invalid") return fallback;
    const projectPrefix = `/${locale}/portal/projects/`;
    if (url.pathname.startsWith(projectPrefix) && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(url.pathname.slice(projectPrefix.length))) return url.pathname;
    if (url.pathname !== `/${locale}/quote`) return fallback;
    const query = new URLSearchParams();
    for (const key of ["type", "service", "template", "kind"]) {
      const entry = url.searchParams.get(key);
      if (entry && /^[a-z0-9-]{1,40}$/.test(entry)) query.set(key, entry);
    }
    return `${url.pathname}?${query}`;
  } catch { return fallback; }
}
