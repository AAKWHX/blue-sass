/** Only return to the local estimator; never accept external redirect targets. */
export function quoteReturnPath(value: unknown, locale: string) {
  const fallback = `/${locale}/portal`;
  if (typeof value !== "string" || value.includes("\\")) return fallback;
  try {
    const url = new URL(value, "https://local.invalid");
    if (url.origin !== "https://local.invalid") return fallback;
    const safePages = new Set([`/${locale}/portal`, `/${locale}/portal/profile`, `/${locale}/staff/invite`, `/${locale}/admin`]);
    if (safePages.has(url.pathname)) return url.pathname;
    const projectPrefix = `/${locale}/portal/projects/`;
    if (url.pathname.startsWith(projectPrefix) && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}(?:\/(?:payment|edit))?$/.test(url.pathname.slice(projectPrefix.length))) return url.pathname;
    if (url.pathname !== `/${locale}/quote`) return fallback;
    if (url.searchParams.get("service")?.startsWith("subscription-")) return fallback;
    const query = new URLSearchParams();
    for (const key of ["type", "service", "kind"]) {
      const entry = url.searchParams.get(key);
      if (entry && /^[a-z0-9-]{1,40}$/.test(entry)) query.set(key, entry);
    }
    for(const key of ["features","modules"]){const entry=url.searchParams.get(key);if(entry&&/^[a-z0-9,-]{1,300}$/.test(entry))query.set(key,entry);}
    const count=url.searchParams.get("languages");if(count&&/^(?:[1-9]|1[0-5])$/.test(count))query.set("languages",count);
    return `${url.pathname}?${query}`;
  } catch { return fallback; }
}
