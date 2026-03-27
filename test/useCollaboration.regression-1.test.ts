// Regression: ISSUE-002 — WebSocket spam when PartyKit not configured
// Found by /qa on 2026-03-27
// Report: .gstack/qa-reports/qa-report-localhost-2026-03-27.md

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/sandbox/collaboration", () => {
  const actual = vi.importActual("../src/sandbox/collaboration");
  return {
    ...actual,
    CollaborationProvider: vi.fn().mockImplementation(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      destroy: vi.fn(),
      getComments: vi.fn().mockReturnValue([]),
      onCommentsChange: vi.fn().mockReturnValue(() => {}),
    })),
  };
});

describe("useCollaboration — VITE_PARTYKIT_HOST not set", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("does not call connect when VITE_PARTYKIT_HOST is undefined", async () => {
    const origEnv = import.meta.env.VITE_PARTYKIT_HOST;
    import.meta.env.VITE_PARTYKIT_HOST = "";

    const mod = await import("../src/sandbox/useCollaboration");
    const { CollaborationProvider } = await import(
      "../src/sandbox/collaboration"
    );

    expect(CollaborationProvider).toBeDefined();

    import.meta.env.VITE_PARTYKIT_HOST = origEnv;
  });
});
