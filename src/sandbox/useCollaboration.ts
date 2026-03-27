import { useEffect, useRef, useState, useCallback } from "react";
import {
  CollaborationProvider,
  getViewerName,
  setViewerName,
  type Comment,
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
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!projectId) {
      providerRef.current?.destroy();
      providerRef.current = null;
      setComments(EMPTY_COMMENTS);
      setConnected(false);
      return;
    }

    const collab = new CollaborationProvider(projectId);
    providerRef.current = collab;

    if (PARTYKIT_HOST) {
      collab.connect(PARTYKIT_HOST);
      setConnected(true);
    }

    const refreshComments = () => {
      setComments(collab.getComments());
    };

    refreshComments();
    const unsub = collab.onCommentsChange(refreshComments);

    return () => {
      unsub();
      collab.destroy();
      providerRef.current = null;
      setConnected(false);
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
    connected,
    viewerName,
    needsName,
    addComment,
    getCommentsForElement,
    getCommentsForScreen,
    promptViewerName,
  };
}
