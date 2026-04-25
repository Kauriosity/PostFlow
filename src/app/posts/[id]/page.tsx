import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import CommentSection from "@/components/CommentSection";
import { notFound } from "next/navigation";
import { Calendar, User as UserIcon, Edit3 } from "lucide-react";
import Link from "next/link";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch post with author profile
  const { data: post, error } = await supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(id, full_name, role)")
    .eq("id", id)
    .single();

  if (error || !post) return notFound();

  // Fetch comments
  const { data: comments } = await supabase
    .from("comments")
    .select("*, profiles(full_name)")
    .eq("post_id", id)
    .order("created_at", { ascending: false });

  // Check roles for edit button
  const isAdmin = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id || '')
    .eq('role', 'admin')
    .single()
    .then(({ data }) => !!data);

  const canEdit = user?.id === post.author_id || isAdmin;

  return (
    <>
      <Navbar />
      <article className="container" style={{ paddingTop: '5rem', paddingBottom: '8rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--secondary)', fontSize: '0.9rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserIcon size={16} /> {post.profiles.full_name}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} suppressHydrationWarning>
                <Calendar size={16} /> {new Date(post.created_at).toLocaleDateString()}
              </span>
            </div>
            {canEdit && (
              <Link href={`/posts/${id}/edit`} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                <Edit3 size={16} /> Edit Post
              </Link>
            )}
          </div>

          <h1 style={{ fontSize: '3.5rem', marginBottom: '2rem', lineHeight: 1.1 }}>{post.title}</h1>
          
          {post.image_url && (
            <img 
              src={post.image_url} 
              alt={post.title} 
              style={{ width: '100%', borderRadius: 'var(--radius)', marginBottom: '3rem', objectFit: 'cover', maxHeight: '500px' }} 
            />
          )}

          {/* AI Summary Banner */}
          <div className="glass" style={{ padding: '2rem', marginBottom: '3rem', borderLeft: '4px solid var(--primary)', background: 'linear-gradient(to right, rgba(59, 130, 246, 0.05), transparent)' }}>
            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '0.75rem' }}>AI Summary</h3>
            <p style={{ color: 'var(--foreground)', fontStyle: 'italic', margin: 0, fontSize: '1.1rem' }}>
              "{post.summary}"
            </p>
          </div>

          <div style={{ fontSize: '1.2rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.9)', whiteSpace: 'pre-wrap' }}>
            {post.body}
          </div>

          <hr style={{ margin: '5rem 0', opacity: 0.1 }} />

          <CommentSection postId={id} comments={comments || []} user={user} />
        </div>
      </article>
    </>
  );
}
