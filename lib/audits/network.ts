import "server-only";
import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";
import { request as httpsRequest } from "node:https";
import { request as httpRequest } from "node:http";
import { checkServerIdentity } from "node:tls";

const denied = new BlockList();
for (const [network, prefix] of [["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4]] as const) denied.addSubnet(network, prefix, "ipv4");
denied.addSubnet("2001:db8::", 32, "ipv6");
denied.addSubnet("2001::", 32, "ipv6");
denied.addSubnet("2002::", 16, "ipv6");
export function isPublicAddress(address: string) {
  const family = isIP(address);
  if (family === 4) return !denied.check(address, "ipv4");
  // Only globally routed unicast; excludes loopback, mapped IPv4, link-local,
  // private, multicast and metadata addresses, including encoded variants.
  return family === 6 && /^[23][0-9a-f]{3}:/i.test(address) && !denied.check(address, "ipv6");
}
export function auditUrl(input: string) {
  const url = new URL(input);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.port || isIP(url.hostname.replace(/[\[\]]/g, ""))) throw new Error("URL_BLOCKED");
  if (url.hostname.length > 253 || !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,63}|xn--[a-z0-9-]{2,59})$/i.test(url.hostname) || /\.(localhost|local|internal|onion|invalid|test)$/i.test(url.hostname)) throw new Error("URL_BLOCKED");
  url.search = ""; url.hash = "";
  return url;
}
export async function readPublicPage(input: string, method: "GET" | "HEAD" = "GET", redirects = 0, expiresAt = Date.now() + 12_000): Promise<{ html: string; status: number; headers: Record<string, string>; bytes: number; elapsedMs: number; url: URL }> {
  if (redirects > 2 || Date.now() >= expiresAt) throw new Error("URL_UNAVAILABLE");
  const url = auditUrl(input);
  let dnsTimer: ReturnType<typeof setTimeout> | undefined;
  const addresses = await Promise.race([
    lookup(url.hostname, { all: true, verbatim: true }),
    new Promise<never>((_, reject) => { dnsTimer = setTimeout(() => reject(new Error("URL_UNAVAILABLE")), Math.min(2500, Math.max(1, expiresAt - Date.now()))); }),
  ]).finally(() => clearTimeout(dnsTimer));
  if (!addresses.length || addresses.some(entry => !isPublicAddress(entry.address))) throw new Error("URL_BLOCKED");
  const address = addresses.find(entry => entry.family === 4) ?? addresses[0];
  const started = Date.now();
  const result = await new Promise<{ html: string; status: number; headers: Record<string, string>; bytes: number }>((resolve, reject) => {
    const chunks: Buffer[] = []; let bytes = 0;
    const send = url.protocol === "https:" ? httpsRequest : httpRequest;
    const req = send({
      // Connect to the validated address, not a second DNS lookup.
      hostname: address.address, port: url.protocol === "https:" ? 443 : 80,
      path: url.pathname, method, agent: false,
      ...(url.protocol === "https:" ? { servername: url.hostname, rejectUnauthorized: true, checkServerIdentity: (_host: string, cert: Parameters<typeof checkServerIdentity>[1]) => checkServerIdentity(url.hostname, cert) } : {}),
      headers: { Host: url.host, "User-Agent": "BlueSassAudit/1.0", Accept: "text/html", "Accept-Encoding": "identity" },
    }, response => {
      const status = response.statusCode ?? 0;
      if (response.headers["content-encoding"] && response.headers["content-encoding"] !== "identity") { req.destroy(new Error("URL_UNAVAILABLE")); return; }
      const headers: Record<string, string> = {};
      // Never retain cookies, authorization headers or arbitrary response data.
      for (const name of ["content-type", "location", "content-security-policy", "strict-transport-security", "x-frame-options", "x-content-type-options", "referrer-policy"]) {
        const value = response.headers[name]; if (typeof value === "string") headers[name] = value.slice(0, 2000);
      }
      response.on("data", (chunk: Buffer) => {
        bytes += chunk.length;
        if (bytes > 1_000_000) { req.destroy(new Error("RESPONSE_TOO_LARGE")); return; }
        if (method === "GET" && !(status >= 300 && status < 400)) chunks.push(chunk);
      });
      response.on("end", () => resolve({ html: Buffer.concat(chunks).toString("utf8"), status, headers, bytes }));
      response.on("error", () => reject(new Error("URL_UNAVAILABLE")));
    });
    const deadline = setTimeout(() => req.destroy(new Error("URL_UNAVAILABLE")), Math.min(4000, Math.max(1, expiresAt - Date.now())));
    req.on("close", () => clearTimeout(deadline));
    req.on("error", () => reject(new Error("URL_UNAVAILABLE")));
    req.end();
  });
  if ([301, 302, 303, 307, 308].includes(result.status) && result.headers.location) {
    return readPublicPage(new URL(result.headers.location, url).href, method, redirects + 1, expiresAt);
  }
  delete result.headers.location;
  return { ...result, elapsedMs: Date.now() - started, url };
}
