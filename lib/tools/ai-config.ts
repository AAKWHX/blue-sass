import "server-only";
/** Deployed Vercel functions receive OIDC automatically; API keys are optional. */
export function aiAvailable(){return Boolean(process.env.AI_MODEL&&(process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN||process.env.VERCEL));}
