import { RequestHandler } from "express";

// Simple in-memory cache to avoid repeated external calls during runtime
const cache = new Map<string, { data: any; ts: number }>();
const TTL = 1000 * 60 * 60 * 24; // 24 hours

const GST_API_URL = "https://api.sandbox.co.in/gst/compliance/public/gstin/search";

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

    // Check cache
    const cached = cache.get(gst);
    if (cached && Date.now() - cached.ts < TTL) {
      return res.json({ success: true, source: "cache", data: cached.data });
    }

    const apiKey = process.env.SANDBOX_GST_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: "Server not configured: SANDBOX_GST_API_KEY missing" });
    }

    const resp = await fetch(GST_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ gstin: gst }),
    });

    const body = await resp.json().catch(() => null);

    if (!body) {
      return res.status(502).json({ success: false, message: "Invalid response from GST provider" });
    }

    // Provider returns { code: 200, data: {...} }
    if (body.code === 200 && body.data) {
      cache.set(gst, { data: body.data, ts: Date.now() });
      return res.json({ success: true, source: "gst_api", data: body.data });
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
