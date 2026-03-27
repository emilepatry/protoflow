import * as Y from "yjs";
import YPartyKitProvider from "y-partykit/provider";
import { nanoid } from "nanoid";
import { safeGetItem, safeSetItem } from "@/lib/utils";

export interface Comment {
  id: string;
  screenId: string;
  anchorId: string;
  author: string;
  body: string;
  createdAt: number;
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
  #projectId: string;

  constructor(projectId: string) {
    this.#projectId = projectId;
    this.doc = new Y.Doc();
    this.#comments = this.doc.getArray("comments");
    this.#overrides = this.doc.getMap("overrides");
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

  onCommentsChange(callback: () => void) {
    this.#comments.observe(callback);
    return () => this.#comments.unobserve(callback);
  }

  onOverridesChange(callback: () => void) {
    this.#overrides.observe(callback);
    return () => this.#overrides.unobserve(callback);
  }

  destroy() {
    this.disconnect();
    this.doc.destroy();
  }
}
