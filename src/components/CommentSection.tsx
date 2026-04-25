"use client";

import { useState, useTransition } from "react";
import { addComment } from "@/app/actions";
import { Send, User as UserIcon } from "lucide-react";

interface Comment {
  id: string;
  comment_text: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

export default function CommentSection({ postId, comments, user }: { postId: string, comments: Comment[], user: any }) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAddComment = () => {
    if (!text.trim()) return;
    startTransition(async () => {
      await addComment(postId, text);
      setText("");
    });
  };

  return (
    <div style={{ marginTop: '4rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Comments ({comments.length})</h2>

      {user ? (
        <div className="glass" style={{ padding: '1.5rem', marginBottom: '3rem' }}>
          <textarea 
            className="textarea" 
            placeholder="What are your thoughts?" 
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isPending}
            style={{ marginBottom: '1rem', background: 'transparent', border: '1px solid var(--card-border)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={handleAddComment} 
              className="btn btn-primary" 
              disabled={isPending || !text.trim()}
            >
              <Send size={18} /> {isPending ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </div>
      ) : (
        <div className="glass" style={{ padding: '2rem', textAlign: 'center', marginBottom: '3rem' }}>
          <p>Please log in to join the conversation.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {comments.map((comment) => (
          <div key={comment.id} className="glass" style={{ padding: '1.5rem', border: 'none', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserIcon size={16} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{comment.profiles?.full_name || "User"}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }} suppressHydrationWarning>{new Date(comment.created_at).toLocaleDateString()}</div>
              </div>
            </div>
            <p style={{ color: 'var(--foreground)', fontSize: '0.95rem', margin: 0 }}>
              {comment.comment_text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
