import { createHash } from "node:crypto";

const api = "https://api.vercel.com";

function config() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("HOSTING_NOT_CONFIGURED");
  const team = process.env.VERCEL_TEAM_ID;
  return { token, query: team ? `?teamId=${encodeURIComponent(team)}` : "" };
}

async function vercelFetch(path: string, init: RequestInit) {
  const { token, query } = config();
  const response = await fetch(`${api}${path}${path.includes("?") ? "&" + query.slice(1) : query}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init.headers || {}) },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(payload.error?.message || `Vercel request failed (${response.status}).`);
  }
  return response;
}

export type DeploymentFile = { path: string; bytes: Uint8Array };

export async function createVercelDeployment(name: string, framework: "static" | "nextjs", files: DeploymentFile[]) {
  const uploaded: { file: string; sha: string; size: number }[] = [];
  const seen = new Set<string>();
  for (const file of files) {
    const sha = createHash("sha1").update(file.bytes).digest("hex");
    if (!seen.has(sha)) {
      await vercelFetch("/v2/files", { method: "POST", headers: { "Content-Type": "application/octet-stream", "Content-Length": String(file.bytes.byteLength), "x-vercel-digest": sha }, body: Buffer.from(file.bytes) });
      seen.add(sha);
    }
    uploaded.push({ file: file.path, sha, size: file.bytes.byteLength });
  }
  const response = await vercelFetch("/v13/deployments?skipAutoDetectionConfirmation=1", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      files: uploaded,
      target: "production",
      projectSettings: framework === "nextjs" ? { framework: "nextjs" } : { framework: null },
      meta: { createdBy: "bluesass-hosting" },
    }),
  });
  return response.json() as Promise<{ id: string; url?: string; readyState: string; alias?: string[] }>;
}

export async function getVercelDeployment(id: string) {
  const response = await vercelFetch(`/v13/deployments/${encodeURIComponent(id)}`, { method: "GET" });
  return response.json() as Promise<{ id: string; url?: string; readyState: string; errorMessage?: string; alias?: string[] }>;
}
