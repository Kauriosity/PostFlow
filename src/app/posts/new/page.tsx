"use client";

import { useTransition } from "react";
import { createPost } from "@/app/actions";
import Navbar from "@/components/Navbar";

export default function NewPostPage() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createPost(formData);
    });
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>Create New Post</h1>
          <p style={{ marginBottom: '3rem' }}>Share your thoughts with the world. AI will handle the summary.</p>

          <form action={handleSubmit} className="glass" style={{ padding: '2.5rem' }}>
            <div className="form-group">
              <label className="label">Post Title</label>
              <input 
                name="title"
                type="text" 
                className="input" 
                placeholder="Ex: The Future of Agentic AI"
                required
                disabled={isPending}
              />
            </div>

            <div className="form-group">
              <label className="label">Image URL (Optional)</label>
              <input 
                name="image_url"
                type="url" 
                className="input" 
                placeholder="https://images.unsplash.com/..."
                disabled={isPending}
              />
            </div>

            <div className="form-group">
              <label className="label">Content</label>
              <textarea 
                name="body"
                className="textarea" 
                rows={12}
                placeholder="Write your story here..."
                required
                disabled={isPending}
              ></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" disabled={isPending}>
                {isPending ? "Generating AI Summary & Saving..." : "Publish Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
