import { RequestHandler } from "express";

// Simple in-memory cache to avoid repeated external calls during runtime
const cache = new Map<string, { data: any; ts: number }>();
const TTL = 1000 * 60 * 60 * 24; // 24 hours

const SANDBOX_GST_API_URL = "https://api.sandbox.co.in/gst/compliance/public/gstin/search";
const APPYFLOW_GST_API_URL = "https://appyflow.in/api/verifyGST";

function validateGstin(gstin: string) {
  if (!gstin) return false;
  const s = gstin.trim().toUpperCase();
  if (s.length !== 15) return false;
  // Basic GSTIN regex (state(2 digits) + PAN(10 chars) + entity + Z + checksum)
  const re = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/i;
  return re.test(s);
}

export const handleGSTSearch: RequestHandler = async (req, res) => {
  try {
    const { gstin } = req.body || {};
    if (!gstin || typeof gstin !== "string") {
      return res.status(400).json({ success: false, message: "GSTIN is required" });
    }

    const gst = gstin.trim().toUpperCase();
    if (!validateGstin(gst)) {
      return res.status(400).json({ success: false, message: "Invalid GSTIN" });
    }

    // Determine provider based on available env keys. Prefer AppyFlow if present.
    const appyKey = process.env.APPYFLOW_GST_API_KEY;
    const sandboxKey = process.env.SANDBOX_GST_API_KEY;

    let provider: "appyflow" | "sandbox" | null = null;
    if (appyKey) provider = "appyflow";
    else if (sandboxKey) provider = "sandbox";

    if (!provider) {
      return res.status(500).json({ success: false, message: "Server not configured: APPYFLOW_GST_API_KEY or SANDBOX_GST_API_KEY missing" });
    }

    const cacheKey = `${provider}:${gst}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < TTL) {
      return res.json({ success: true, source: "cache", data: cached.data });
    }

    let body: any = null;

    if (provider === "appyflow") {
      // AppyFlow expects GET with query params
      const url = new URL(APPYFLOW_GST_API_URL);
      url.searchParams.set("gstNo", gst);
      url.searchParams.set("key_secret", appyKey as string);
      const resp = await fetch(url.toString(), { method: "GET" });
      body = await resp.json().catch(() => null);

      if (!body) {
        return res.status(502).json({ success: false, message: "Invalid response from AppyFlow provider" });
      }

      if (body.error) {
        return res.status(404).json({ success: false, message: body.message || "GSTIN not found" });
      }

      // Normalize AppyFlow response to existing shape
      const t = body.taxpayerInfo || {};
      const normalized = {
        gstin: t.gstin,
        lgnm: t.legalName,
        tradeNam: t.tradeName,
        sts: t.gstStatus,
        rgdt: t.registrationDate,
        pradr: { addr: [t.address?.buildingName, t.address?.street, t.address?.city].filter(Boolean).join(", ") },
        stj: t.address?.state,
        pincode: t.address?.pincode,
        constitution: t.constitutionOfBusiness,
      };

      cache.set(cacheKey, { data: normalized, ts: Date.now() });
      return res.json({ success: true, source: "appyflow", data: normalized });
    }

    // Fallback: sandbox provider (POST)
    const resp = await fetch(SANDBOX_GST_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": sandboxKey as string,
      },
      body: JSON.stringify({ gstin: gst }),
    });

    body = await resp.json().catch(() => null);

    if (!body) {
      return res.status(502).json({ success: false, message: "Invalid response from GST provider" });
    }

    // Provider returns { code: 200, data: {...} }
    if (body.code === 200 && body.data) {
      cache.set(cacheKey, { data: body.data, ts: Date.now() });
      return res.json({ success: true, source: "sandbox", data: body.data });
    }

    // Map provider error codes/messages
    if (body.code === 404) {
      return res.status(404).json({ success: false, message: body.message || "GSTIN not found" });
    }

    if (body.code === 400) {
      return res.status(400).json({ success: false, message: body.message || "Invalid GSTIN" });
    }

    return res.status(502).json({ success: false, message: "Unexpected response from GST provider", raw: body });
  } catch (err) {
    console.error("GST lookup error:", err);
    return res.status(500).json({ success: false, message: "GST lookup failed" });
  }
};
