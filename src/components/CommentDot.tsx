import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import type { Comment } from "@/sandbox/collaboration";
import { cn } from "@/lib/utils";

interface CommentDotProps {
  comments: Comment[];
  onAddComment: (body: string) => void;
  className?: string;
}

export default function CommentDot({
  comments,
  onAddComment,
  className,
}: CommentDotProps) {
  const [open, setOpen] = useState(false);
  const [newComment, setNewComment] = useState("");

  if (comments.length === 0 && !open) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={cn(
          "group absolute -right-2 -top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 opacity-30 shadow-sm transition-opacity hover:opacity-100 focus:opacity-100",
          className
        )}
        aria-label="Add comment"
      >
        <MessageCircle className="h-3.5 w-3.5 text-white" />
      </button>
    );
  }

  return (
    <div className={cn("absolute -right-1 -top-1 z-10", className)}>
      {!open ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white shadow-sm transition-transform hover:scale-110"
          aria-label={`${comments.length} comment${comments.length !== 1 ? "s" : ""}`}
        >
          {comments.length}
        </button>
      ) : (
        <div
          className="w-64 rounded-lg border border-border bg-white shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <p className="text-xs font-medium">
              {comments.length} comment{comments.length !== 1 && "s"}
            </p>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close comments"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="border-b border-border/50 px-3 py-2 last:border-0"
              >
                <div className="flex items-baseline gap-1.5">
                  <p className="max-w-[120px] truncate text-[10px] font-semibold text-foreground">
                    {comment.author}
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    {formatTime(comment.createdAt)}
                  </p>
                </div>
                <p className="mt-0.5 break-words text-xs text-foreground/80" style={{ overflowWrap: "anywhere" }}>
                  {comment.body}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-border p-2">
            <div className="flex gap-1.5">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={500}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newComment.trim()) {
                    onAddComment(newComment.trim());
                    setNewComment("");
                  }
                }}
                placeholder="Add a comment..."
                className="flex-1 rounded-md border border-border px-2 py-1 text-xs outline-none focus:border-primary"
              />
              <button
                onClick={() => {
                  if (newComment.trim()) {
                    onAddComment(newComment.trim());
                    setNewComment("");
                  }
                }}
                disabled={!newComment.trim()}
                className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString();
}
