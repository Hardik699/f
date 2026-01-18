import { RequestHandler } from "express";

// Minimal GST handler with NO external API calls (sandbox removed)
function validateGstin(gstin: string) {
  if (!gstin) return false;
  const s = gstin.trim().toUpperCase();
  if (s.length !== 15) return false;
  const re = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/i;
  return re.test(s);
}

export const handleGSTSearch: RequestHandler = async (req, res) => {
  const { gstin } = req.body || {};
  if (!gstin || typeof gstin !== "string") {
    return res.status(400).json({ success: false, message: "GSTIN is required" });
  }

  const gst = gstin.trim().toUpperCase();
  if (!validateGstin(gst)) {
    return res.status(400).json({ success: false, message: "Invalid GSTIN" });
  }

  // External GST provider removed intentionally. Inform client to use manual mode.
  return res.status(501).json({ success: false, message: "GST lookup disabled on server — please use manual entry" });
};
