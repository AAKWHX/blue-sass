export function assertSameOrigin(request: Request, requireOrigin = true) {
  const origin = request.headers.get("origin");
  if (requireOrigin && !origin) {
    throw new Error("UNTRUSTED_ORIGIN");
  }
  if (origin && origin !== new URL(request.url).origin) {
    throw new Error("UNTRUSTED_ORIGIN");
  }
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") {
    throw new Error("UNTRUSTED_ORIGIN");
  }
}
