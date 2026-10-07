/** Only return to the local estimator; never accept external redirect targets. */
export function quoteReturnPath(value: unknown, locale: string) {
  const fallback = `/${locale}/portal`;
  if (typeof value !== "string" || value.includes("\\")) return fallback;
  try {
    const url = new URL(value, "https://local.invalid");
    if (url.origin !== "https://local.invalid") return fallback;
    const safePages = new Set([`/${locale}/portal`, `/${locale}/portal/profile`, `/${locale}/portal/tools`, `/${locale}/portal/listings`, `/${locale}/portal/purchases`, `/${locale}/hosting`, `/${locale}/audit`, `/${locale}/staff/invite`, `/${locale}/admin`]);
    if (safePages.has(url.pathname)) return url.pathname;
    if(url.pathname===`/${locale}/portal/listings/new`){const kind=url.searchParams.get("kind");return `${url.pathname}${["job","project","product"].includes(kind??"")?`?kind=${kind}`:""}`;}
    if(url.pathname.startsWith(`/${locale}/tools/`) && ["website-audit","seo-checker","security-checker","speed-test","qr-code-generator","invoice-generator","business-name-generator","ai-content-generator","privacy-scanner","message-checker","website-cost-calculator"].includes(url.pathname.split("/").at(-1)??""))return url.pathname;
    if(url.pathname.startsWith(`/${locale}/listings/`) && /^[a-f0-9-]{36}$/.test(url.pathname.split("/").at(-1)??""))return url.pathname;
    const hostingPrefix = `/${locale}/hosting/`;
    if (url.pathname.startsWith(hostingPrefix) && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(url.pathname.slice(hostingPrefix.length))) return url.pathname;
    const projectPrefix = `/${locale}/portal/projects/`;
    if (url.pathname.startsWith(projectPrefix) && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}(?:\/(?:payment|edit))?$/.test(url.pathname.slice(projectPrefix.length))) return url.pathname;
    if (url.pathname !== `/${locale}/quote`) return fallback;
    const query = new URLSearchParams();
    for (const key of ["type", "service", "template", "kind"]) {
      const entry = url.searchParams.get(key);
      if (entry && /^[a-z0-9-]{1,40}$/.test(entry)) query.set(key, entry);
    }
    for(const key of ["features","modules"]){const entry=url.searchParams.get(key);if(entry&&/^[a-z0-9,-]{1,300}$/.test(entry))query.set(key,entry);}
    const count=url.searchParams.get("languages");if(count&&/^(?:[1-9]|1[0-5])$/.test(count))query.set("languages",count);
    return `${url.pathname}?${query}`;
  } catch { return fallback; }
}
