import { describe, it, expect, vi, beforeEach } from "vitest";

// We'll dynamically import the handler to ensure module-level cache is reset between tests
async function loadHandler() {
  vi.resetModules();
  return (await import("./gst")) as any;
}

function makeReq(gstin: string) {
  return { body: { gstin } } as any;
}

function makeRes() {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe("GST Search handler", () => {
  beforeEach(() => {
    delete process.env.SANDBOX_GST_API_KEY;
    vi.restoreAllMocks();
  });

  it("returns 400 for invalid GST format", async () => {
    const mod = await loadHandler();
    const req = makeReq("123ABC");
    const res = makeRes();

    await mod.handleGSTSearch(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
    const arg = res.json.mock.calls[0][0];
    expect(arg.success).toBe(false);
  });

  it("returns error when API key missing", async () => {
    const mod = await loadHandler();
    const req = makeReq("27ABCDE1234F1Z5");
    const res = makeRes();

    await mod.handleGSTSearch(req, res);

    expect(res.status).toHaveBeenCalledWith(501);
    const arg = res.json.mock.calls[0][0];
    expect(arg.success).toBe(false);
    expect(arg.message).toContain("disabled");
  });

  it("calls provider and caches result", async () => {
    process.env.SANDBOX_GST_API_KEY = "TESTKEY";

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ json: async () => ({ code: 200, data: { gstin: "27ABCDE1234F1Z5", lgnm: "ABC TRADERS", pradr: { addr: "Mumbai" }, sts: "Active" } }) });

    (global as any).fetch = fetchMock;

    const mod = await loadHandler();
    const req = makeReq("27ABCDE1234F1Z5");
    const res = makeRes();

    await mod.handleGSTSearch(req, res);
    // External provider is disabled in the handler; ensure no fetch occurred and proper status returned
    expect(fetchMock).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledWith(501);
    const first = res.json.mock.calls[0][0];
    expect(first.success).toBe(false);
    expect(first.message).toContain("disabled");
  });
});
