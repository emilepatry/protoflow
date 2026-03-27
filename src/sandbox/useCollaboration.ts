import { useEffect, useRef, useState, useCallback } from "react";
import {
  CollaborationProvider,
  getViewerName,
  setViewerName,
  type Comment,
  type ConnectionStatus,
} from "./collaboration";

const PARTYKIT_HOST: string | undefined =
  import.meta.env.VITE_PARTYKIT_HOST || undefined;

const EMPTY_COMMENTS: Comment[] = [];

export function useCollaboration(projectId: string | null) {
  const providerRef = useRef<CollaborationProvider | null>(null);
  const [comments, setComments] = useState<Comment[]>(EMPTY_COMMENTS);
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

    refreshComments();
    const unsub = collab.onCommentsChange(refreshComments);

    return () => {
      unsub();
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
    comments,
    connectionStatus,
    viewerName,
    needsName,
    addComment,
    getCommentsForElement,
    getCommentsForScreen,
    promptViewerName,
  };
}
