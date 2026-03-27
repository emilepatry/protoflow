// Regression: Sprint 2 — keyboard navigation on wireflow canvas
// Tests Enter-to-open and type guarding
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCallback, useState } from "react";

function useHandleKeyDown(
  nodes: Array<{ id: string; selected?: boolean; type?: string }>,
  onScreenSelect: (id: string) => void
) {
  return useCallback(
    (e: { key: string }) => {
      if (e.key === "Enter") {
        const selectedScreen = nodes.find(
          (n) => n.selected && n.type === "screen"
        );
        if (selectedScreen) {
          onScreenSelect(selectedScreen.id);
        }
      }
    },
    [nodes, onScreenSelect]
  );
}

describe("handleKeyDown (wireflow canvas)", () => {
  const onScreenSelect = vi.fn();

  beforeEach(() => {
    onScreenSelect.mockClear();
  });

  it("calls onScreenSelect when Enter is pressed on a selected screen node", () => {
    const nodes = [
      { id: "screen-home", selected: true, type: "screen" },
      { id: "screen-catalog", selected: false, type: "screen" },
    ];
    const { result } = renderHook(() =>
      useHandleKeyDown(nodes, onScreenSelect)
    );
    act(() => result.current({ key: "Enter" }));
    expect(onScreenSelect).toHaveBeenCalledWith("screen-home");
  });

  it("does nothing when Enter is pressed with no selection", () => {
    const nodes = [
      { id: "screen-home", selected: false, type: "screen" },
    ];
    const { result } = renderHook(() =>
      useHandleKeyDown(nodes, onScreenSelect)
    );
    act(() => result.current({ key: "Enter" }));
    expect(onScreenSelect).not.toHaveBeenCalled();
  });

  it("does nothing when Enter is pressed on a selected sticky node", () => {
    const nodes = [
      { id: "sticky-1", selected: true, type: "sticky" },
    ];
    const { result } = renderHook(() =>
      useHandleKeyDown(nodes, onScreenSelect)
    );
    act(() => result.current({ key: "Enter" }));
    expect(onScreenSelect).not.toHaveBeenCalled();
  });

  it("does nothing for non-Enter keys on a selected screen", () => {
    const nodes = [
      { id: "screen-home", selected: true, type: "screen" },
    ];
    const { result } = renderHook(() =>
      useHandleKeyDown(nodes, onScreenSelect)
    );
    act(() => result.current({ key: "Backspace" }));
    expect(onScreenSelect).not.toHaveBeenCalled();
  });
});
