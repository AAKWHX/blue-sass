export function assertSameOrigin(request: Request, requireOrigin = true) {
  const origin = request.headers.get("origin");
  if (requireOrigin && !origin) {
    throw new Error("UNTRUSTED_ORIGIN");
  }
  if (origin) {
    const requestUrl = new URL(request.url);
    // Next's self-hosted request URL may use its internal localhost hostname.
    // Host is the browser's actual authority; never trust x-forwarded-host here.
    const host = request.headers.get("host");
    let hostOrigin: string | undefined;
    if (host) {
      try {
        const authority = new URL(`${requestUrl.protocol}//${host}`);
        if (authority.host === host && !authority.username && !authority.password && authority.pathname === "/" && !authority.search && !authority.hash) hostOrigin = authority.origin;
      } catch { /* Malformed authorities do not grant an origin exception. */ }
    }
    if (origin !== (host ? hostOrigin : requestUrl.origin)) throw new Error("UNTRUSTED_ORIGIN");
  }
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") {
    throw new Error("UNTRUSTED_ORIGIN");
  }
}
