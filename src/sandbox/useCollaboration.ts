import { useEffect, useRef, useState, useCallback } from "react";
import {
  CollaborationProvider,
  getViewerName,
  setViewerName,
  type Comment,
  type ConnectionStatus,
  type ViewerSticky,
  type ReactionType,
  type VariantReactions,
} from "./collaboration";
import type { StickyColor } from "@/types";

const PARTYKIT_HOST: string | undefined =
  import.meta.env.VITE_PARTYKIT_HOST || undefined;

const EMPTY_COMMENTS: Comment[] = [];
const EMPTY_STICKIES: ViewerSticky[] = [];

export function useCollaboration(projectId: string | null) {
  const providerRef = useRef<CollaborationProvider | null>(null);
  const [comments, setComments] = useState<Comment[]>(EMPTY_COMMENTS);
  const [viewerStickies, setViewerStickies] = useState<ViewerSticky[]>(EMPTY_STICKIES);
  const [reactions, setReactions] = useState<Record<string, VariantReactions>>({});
  const [viewerName, setViewerNameState] = useState<string | null>(
    getViewerName()
  );
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");

  useEffect(() => {
    if (!projectId) {
      providerRef.current?.destroy();
      providerRef.current = null;
      setComments(EMPTY_COMMENTS);
      setViewerStickies(EMPTY_STICKIES);
      setConnectionStatus("disconnected");
      return;
    }

    const collab = new CollaborationProvider(projectId);
    providerRef.current = collab;

    let unsubStatus: (() => void) | undefined;
    if (PARTYKIT_HOST) {
      collab.connect(PARTYKIT_HOST);
      setConnectionStatus("connecting");
      unsubStatus = collab.onStatusChange(setConnectionStatus);
    }

    const refreshComments = () => {
      setComments(collab.getComments());
    };
    const refreshStickies = () => {
      setViewerStickies(collab.getViewerStickies());
    };
    const refreshReactions = () => {
      setReactions(collab.getAllReactions());
    };

    refreshComments();
    refreshStickies();
    refreshReactions();
    const unsubComments = collab.onCommentsChange(refreshComments);
    const unsubStickies = collab.onStickiesChange(refreshStickies);
    const unsubReactions = collab.onReactionsChange(refreshReactions);

    return () => {
      unsubComments();
      unsubStickies();
      unsubReactions();
      unsubStatus?.();
      collab.destroy();
      providerRef.current = null;
      setConnectionStatus("disconnected");
    };
  }, [projectId]);

  const addComment = useCallback(
    (screenId: string, anchorId: string, body: string) => {
      if (!providerRef.current || !viewerName) return;
      providerRef.current.addComment({
        screenId,
        anchorId,
        author: viewerName,
        body,
      });
    },
    [viewerName]
  );

  const addViewerSticky = useCallback(
    (color: StickyColor) => {
      if (!providerRef.current || !viewerName) return;
      providerRef.current.addViewerSticky({
        position: { x: Math.random() * 400 + 200, y: Math.random() * 300 },
        body: "",
        color,
        createdBy: viewerName,
      });
    },
    [viewerName]
  );

  const updateViewerSticky = useCallback(
    (id: string, updates: Partial<Pick<ViewerSticky, "position" | "body">>) => {
      providerRef.current?.updateViewerSticky(id, updates);
    },
    []
  );

  const removeViewerSticky = useCallback(
    (id: string) => {
      providerRef.current?.removeViewerSticky(id, viewerName);
    },
    [viewerName]
  );

  const removeViewerStickyAsBuilder = useCallback(
    (id: string) => {
      providerRef.current?.removeViewerStickyAsBuilder(id);
    },
    []
  );

  const toggleReaction = useCallback(
    (variantId: string, reaction: ReactionType) => {
      if (!providerRef.current || !viewerName) return;
      providerRef.current.toggleReaction(variantId, viewerName, reaction);
    },
    [viewerName]
  );

  const getCommentsForElement = useCallback(
    (screenId: string, anchorId: string) => {
      return comments.filter(
        (c) => c.screenId === screenId && c.anchorId === anchorId
      );
    },
    [comments]
  );

  const getCommentsForScreen = useCallback(
    (screenId: string) => {
      return comments.filter((c) => c.screenId === screenId);
    },
    [comments]
  );

  const promptViewerName = useCallback((name: string) => {
    setViewerName(name);
    setViewerNameState(name);
  }, []);

  const needsName = viewerName === null;

  return {
    provider: providerRef.current,
    comments,
    viewerStickies,
    reactions,
    connectionStatus,
    viewerName,
    needsName,
    addComment,
    addViewerSticky,
    updateViewerSticky,
    removeViewerSticky,
    removeViewerStickyAsBuilder,
    toggleReaction,
    getCommentsForElement,
    getCommentsForScreen,
    promptViewerName,
  };
}
