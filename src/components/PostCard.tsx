import Link from "next/link";
import { ArrowRight, User as UserIcon, Calendar } from "lucide-react";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    summary: string;
    image_url: string | null;
    created_at: string;
    profiles: {
      full_name: string;
    };
  };
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <div className="glass" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {post.image_url ? (
        <div style={{ width: '100%', height: '200px', background: `url(${post.image_url}) center/cover no-repeat` }} />
      ) : (
        <div style={{ width: '100%', height: '200px', background: 'linear-gradient(45deg, #1e293b, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '3rem', opacity: 0.1 }}>📝</span>
        </div>
      )}
      
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--secondary)', marginBottom: '1rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <UserIcon size={14} /> {post.profiles.full_name}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} suppressHydrationWarning>
            <Calendar size={14} /> {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
        
        <h3 style={{ marginBottom: '1rem', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.title}
        </h3>
        
        <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1, lineClamp: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.summary}
        </p>
        
        <Link href={`/posts/${post.id}`} className="btn btn-outline" style={{ justifyContent: 'space-between', padding: '0.5rem 1rem' }}>
          Read Full Post <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
