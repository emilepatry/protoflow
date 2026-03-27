import * as Y from "yjs";
import YPartyKitProvider from "y-partykit/provider";
import { nanoid } from "nanoid";
import { safeGetItem, safeSetItem } from "@/lib/utils";
import type { StickyColor } from "@/types";

export type ConnectionStatus = "connected" | "disconnected" | "connecting";

export interface Comment {
  id: string;
  screenId: string;
  anchorId: string;
  author: string;
  body: string;
  createdAt: number;
}

export interface ViewerSticky {
  id: string;
  position: { x: number; y: number };
  body: string;
  color: StickyColor;
  createdBy: string;
}

export type ReactionType = "up" | "down";

export interface VariantReactions {
  [viewerName: string]: ReactionType;
}

const VIEWER_NAME_KEY = "protoflow-viewer-name";

export function getViewerName(): string | null {
  return safeGetItem(VIEWER_NAME_KEY);
}

export function setViewerName(name: string) {
  const trimmed = name.slice(0, 30);
  safeSetItem(VIEWER_NAME_KEY, trimmed);
}

export class CollaborationProvider {
  doc: Y.Doc;
  provider: YPartyKitProvider | null = null;
  #comments: Y.Array<Y.Map<string>>;
  #overrides: Y.Map<Y.Text>;
  #stickies: Y.Map<Y.Map<string>>;
  #reactions: Y.Map<Y.Map<string>>;
  #projectId: string;

  constructor(projectId: string) {
    this.#projectId = projectId;
    this.doc = new Y.Doc();
    this.#comments = this.doc.getArray("comments");
    this.#overrides = this.doc.getMap("overrides");
    this.#stickies = this.doc.getMap("stickies");
    this.#reactions = this.doc.getMap("reactions");
  }

  connect(host: string) {
    this.provider = new YPartyKitProvider(host, this.#projectId, this.doc);
  }

  disconnect() {
    this.provider?.destroy();
    this.provider = null;
  }

  addComment(comment: Omit<Comment, "id" | "createdAt">) {
    const map = new Y.Map<string>();
    const id = `comment-${nanoid(8)}`;
    map.set("id", id);
    map.set("screenId", comment.screenId);
    map.set("anchorId", comment.anchorId);
    map.set("author", comment.author);
    map.set("body", comment.body);
    map.set("createdAt", String(Date.now()));
    this.#comments.push([map]);
    return id;
  }

  getComments(): Comment[] {
    const result: Comment[] = [];
    for (let i = 0; i < this.#comments.length; i++) {
      const map = this.#comments.get(i);
      result.push({
        id: map.get("id") as string,
        screenId: map.get("screenId") as string,
        anchorId: map.get("anchorId") as string,
        author: map.get("author") as string,
        body: map.get("body") as string,
        createdAt: Number(map.get("createdAt")),
      });
    }
    return result;
  }

  getCommentsForScreen(screenId: string): Comment[] {
    return this.getComments().filter((c) => c.screenId === screenId);
  }

  setTextOverride(screenId: string, pfId: string, text: string) {
    const key = `${screenId}:${pfId}`;
    let ytext = this.#overrides.get(key);
    if (!ytext) {
      ytext = new Y.Text();
      this.#overrides.set(key, ytext);
    }
    ytext.delete(0, ytext.length);
    ytext.insert(0, text);
  }

  getTextOverride(screenId: string, pfId: string): string | undefined {
    const key = `${screenId}:${pfId}`;
    const ytext = this.#overrides.get(key);
    return ytext?.toString();
  }

  addViewerSticky(sticky: Omit<ViewerSticky, "id">): string {
    const id = `vsticky-${nanoid(8)}`;
    const map = new Y.Map<string>();
    map.set("id", id);
    map.set("x", String(sticky.position.x));
    map.set("y", String(sticky.position.y));
    map.set("body", sticky.body);
    map.set("color", sticky.color);
    map.set("createdBy", sticky.createdBy);
    this.#stickies.set(id, map);
    return id;
  }

  updateViewerSticky(id: string, updates: Partial<Pick<ViewerSticky, "position" | "body">>) {
    const map = this.#stickies.get(id);
    if (!map) return;
    if (updates.position) {
      map.set("x", String(updates.position.x));
      map.set("y", String(updates.position.y));
    }
    if (updates.body !== undefined) {
      map.set("body", updates.body);
    }
  }

  removeViewerSticky(id: string, viewerName: string | null) {
    if (viewerName === null) return;
    const map = this.#stickies.get(id);
    if (!map) return;
    const createdBy = map.get("createdBy") as string;
    if (viewerName === createdBy) {
      this.#stickies.delete(id);
    }
  }

  removeViewerStickyAsBuilder(id: string) {
    this.#stickies.delete(id);
  }

  getViewerStickies(): ViewerSticky[] {
    const result: ViewerSticky[] = [];
    this.#stickies.forEach((map) => {
      const id = map.get("id") as string;
      const x = Number(map.get("x"));
      const y = Number(map.get("y"));
      const body = map.get("body") as string;
      const color = map.get("color") as StickyColor;
      const createdBy = map.get("createdBy") as string;
      if (!id || isNaN(x) || isNaN(y) || !createdBy) return;
      result.push({ id, position: { x, y }, body: body ?? "", color: color ?? "yellow", createdBy });
    });
    return result;
  }

  toggleReaction(variantId: string, viewerName: string, reaction: ReactionType) {
    let variantMap = this.#reactions.get(variantId);
    if (!variantMap) {
      variantMap = new Y.Map<string>();
      this.#reactions.set(variantId, variantMap);
    }
    const current = variantMap.get(viewerName);
    if (current === reaction) {
      variantMap.delete(viewerName);
    } else {
      variantMap.set(viewerName, reaction);
    }
  }

  getReactionsForVariant(variantId: string): VariantReactions {
    const variantMap = this.#reactions.get(variantId);
    if (!variantMap) return {};
    const result: VariantReactions = {};
    variantMap.forEach((value, key) => {
      if (value === "up" || value === "down") {
        result[key] = value;
      }
    });
    return result;
  }

  getAllReactions(): Record<string, VariantReactions> {
    const result: Record<string, VariantReactions> = {};
    this.#reactions.forEach((variantMap, variantId) => {
      const reactions: VariantReactions = {};
      variantMap.forEach((value, key) => {
        if (value === "up" || value === "down") {
          reactions[key] = value;
        }
      });
      result[variantId] = reactions;
    });
    return result;
  }

  onReactionsChange(callback: () => void) {
    const handler = () => callback();
    this.#reactions.observe(handler);
    this.#reactions.forEach((variantMap) => {
      variantMap.observe(handler);
    });
    return () => {
      this.#reactions.unobserve(handler);
      this.#reactions.forEach((variantMap) => {
        variantMap.unobserve(handler);
      });
    };
  }

  onStickiesChange(callback: () => void) {
    this.#stickies.observe(callback);
    return () => this.#stickies.unobserve(callback);
  }

  onCommentsChange(callback: () => void) {
    this.#comments.observe(callback);
    return () => this.#comments.unobserve(callback);
  }

  onOverridesChange(callback: () => void) {
    this.#overrides.observe(callback);
    return () => this.#overrides.unobserve(callback);
  }

  onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    if (!this.provider) return () => {};
    const handler = ({ status }: { status: string }) => {
      callback(status as ConnectionStatus);
    };
    this.provider.on("status", handler);
    return () => this.provider?.off("status", handler);
  }

  destroy() {
    this.disconnect();
    this.doc.destroy();
  }
}
