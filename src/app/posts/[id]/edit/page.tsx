import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { updatePost } from "@/app/actions";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !post) return notFound();

  // Check roles
  const isAdmin = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id || '')
    .eq('role', 'admin')
    .single()
    .then(({ data }) => !!data);

  if (user?.id !== post.author_id && !isAdmin) {
    redirect(`/posts/${id}`);
  }

  const handleUpdate = async (formData: FormData) => {
    "use server";
    await updatePost(id, formData);
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>Edit Post</h1>
          <p style={{ marginBottom: '3rem' }}>Note: The AI summary is generated only once and won't change on edit.</p>

          <form action={handleUpdate} className="glass" style={{ padding: '2.5rem' }}>
            <div className="form-group">
              <label className="label">Post Title</label>
              <input 
                name="title"
                type="text" 
                className="input" 
                defaultValue={post.title}
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Image URL (Optional)</label>
              <input 
                name="image_url"
                type="url" 
                className="input" 
                defaultValue={post.image_url || ''}
              />
            </div>

            <div className="form-group">
              <label className="label">Content</label>
              <textarea 
                name="body"
                className="textarea" 
                rows={12}
                defaultValue={post.body}
                required
              ></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary">
                Update Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
