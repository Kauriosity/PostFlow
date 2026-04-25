"use server";

import { createClient } from "@/lib/supabase/server";
import { generateAISummary } from "@/lib/ai";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const image_url = formData.get("image_url") as string;

  // 1. Generate AI Summary ONLY ONCE at creation
  const summary = await generateAISummary(body);

  const { data, error } = await supabase
    .from("posts")
    .insert({
      title,
      body,
      summary,
      image_url: image_url || null,
      author_id: user.id
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating post:", error);
    throw new Error(error.message);
  }

  revalidatePath("/");
  redirect(`/posts/${data.id}`);
}

export async function updatePost(id: string, formData: FormData) {
  const supabase = await createClient();
  
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const image_url = formData.get("image_url") as string;

  // NOTE: Per requirements, summary is NOT regenerated on edit.

  const { error } = await supabase
    .from("posts")
    .update({
      title,
      body,
      image_url: image_url || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/posts/${id}`);
  redirect(`/posts/${id}`);
}

export async function addComment(postId: string, text: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      comment_text: text
    });

  if (error) throw new Error(error.message);

  revalidatePath(`/posts/${postId}`);
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Security Check: Only admins can change roles
  const { data: adminCheck } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id || '')
    .single();

  if (adminCheck?.role !== 'admin') {
    throw new Error("Unauthorized: Only admins can manage roles");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  
  revalidatePath("/admin");
}
