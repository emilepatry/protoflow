// Regression: Sprint 2 — ConnectionStatus component
// Tests tri-state rendering and VITE_PARTYKIT_HOST gate
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ConnectionStatus from "@/components/ConnectionStatus";

describe("ConnectionStatus", () => {
  describe("when VITE_PARTYKIT_HOST is not set", () => {
    beforeEach(() => {
      vi.stubEnv("VITE_PARTYKIT_HOST", "");
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("renders nothing", () => {
      const { container } = render(<ConnectionStatus status="connected" />);
      expect(container.innerHTML).toBe("");
    });
  });

  describe("when VITE_PARTYKIT_HOST is set", () => {
    beforeEach(() => {
      vi.stubEnv("VITE_PARTYKIT_HOST", "localhost:1999");
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("renders a connected dot with success color", () => {
      render(<ConnectionStatus status="connected" />);
      const dot = screen.getByRole("img", { name: "Connected" });
      expect(dot).toBeInTheDocument();
      expect(dot.className).toContain("bg-success");
    });

    it("renders a disconnected dot with error color", () => {
      render(<ConnectionStatus status="disconnected" />);
      const dot = screen.getByRole("img", { name: "Disconnected" });
      expect(dot).toBeInTheDocument();
      expect(dot.className).toContain("bg-error");
    });

    it("renders a connecting dot with warning color and pulse", () => {
      render(<ConnectionStatus status="connecting" />);
      const dot = screen.getByRole("img", { name: /syncing/i });
      expect(dot).toBeInTheDocument();
      expect(dot.className).toContain("bg-warning");

      const wrapper = dot.parentElement!;
      const pulseSpan = wrapper.querySelector("[aria-hidden='true']");
      expect(pulseSpan).toBeInTheDocument();
      expect(pulseSpan!.className).toContain("animate-ping");
    });

    it("does not show pulse for connected state", () => {
      const { container } = render(<ConnectionStatus status="connected" />);
      const pulseSpan = container.querySelector("[aria-hidden='true']");
      expect(pulseSpan).toBeNull();
    });

    it("sets title attribute for tooltip", () => {
      render(<ConnectionStatus status="disconnected" />);
      const wrapper = screen.getByTitle("Disconnected");
      expect(wrapper).toBeInTheDocument();
    });
  });
});
