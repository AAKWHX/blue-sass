// Runs only in the production build, using existing environment credentials in memory.
const endpoint = "https://www.bluesass.nl/api/paypal/webhook";
if (process.env.VERCEL_ENV === "production" && process.env.PAYPAL_ENV === "live") {
  const id = process.env.PAYPAL_CLIENT_ID?.trim(); const secret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  if (!id || !secret) throw new Error("PayPal production credentials are missing.");
  const base = "https://api-m.paypal.com";
  const tokenResponse = await fetch(`${base}/v1/oauth2/token`, { method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials", signal: AbortSignal.timeout(15000) });
  if (!tokenResponse.ok) throw new Error("PayPal webhook setup authentication failed.");
  const { access_token: token } = await tokenResponse.json();
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const list = await fetch(`${base}/v1/notifications/webhooks`, { headers, signal: AbortSignal.timeout(15000) });
  if (!list.ok) throw new Error("PayPal webhook inventory unavailable.");
  const { webhooks } = await list.json();
  const expected = ["PAYMENT.CAPTURE.COMPLETED", "PAYMENT.CAPTURE.PENDING", "PAYMENT.CAPTURE.DENIED", "PAYMENT.CAPTURE.REFUNDED", "PAYMENT.CAPTURE.REVERSED"];
  const existing = webhooks.find(item => item.url === endpoint);
  if (existing && !existing.event_types?.some(item=>item.name==="*") && expected.some(name=>!existing.event_types?.some(item=>item.name===name))) {
    const events = [...new Set([...expected, ...(existing.event_types??[]).map(item=>item.name)])].map(name=>({name}));
    const updated=await fetch(`${base}/v1/notifications/webhooks/${existing.id}`,{method:"PATCH",headers,body:JSON.stringify([{op:"replace",path:"/event_types",value:events}]),signal:AbortSignal.timeout(15000)});
    if(!updated.ok)throw new Error("PayPal webhook event update failed.");
  }
  if (!existing) {
    const created = await fetch(`${base}/v1/notifications/webhooks`, { method: "POST", headers, body: JSON.stringify({ url: endpoint, event_types: [{ name: "PAYMENT.CAPTURE.COMPLETED" }, { name: "PAYMENT.CAPTURE.PENDING" }, { name: "PAYMENT.CAPTURE.DENIED" }, { name: "PAYMENT.CAPTURE.REFUNDED" }, { name: "PAYMENT.CAPTURE.REVERSED" }] }), signal: AbortSignal.timeout(15000) });
    if (!created.ok) throw new Error("PayPal webhook registration failed.");
  }
  console.log("PayPal production webhook registered for Blue Sass.");
}
