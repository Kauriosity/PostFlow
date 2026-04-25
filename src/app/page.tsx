import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import Link from "next/link";
import { Search } from "lucide-react";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
  const query = typeof params.q === 'string' ? params.q : "";
  const pageSize = 6;
  
  const supabase = await createClient();

  let postQuery = supabase
    .from("posts")
    .select("*, profiles(full_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (query) {
    postQuery = postQuery.ilike("title", `%${query}%`);
  }

  const { data: posts, count, error } = await postQuery;

  if (error) {
    console.error("Error fetching posts:", error);
  }

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

  return (
    <>
      <Navbar />
      <main className="container" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>The Future of <span style={{ color: 'var(--primary)' }}>Ideas</span></h1>
          <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            A production-ready blogging platform powered by Next.js and Google AI.
          </p>
        </div>

        <form method="GET" style={{ maxWidth: '600px', margin: '0 auto 4rem', position: 'relative' }}>
          <input 
            name="q"
            defaultValue={query}
            className="input" 
            placeholder="Search for articles..." 
            style={{ paddingLeft: '3rem', borderRadius: '50px', height: '60px', background: 'var(--card-bg)' }}
          />
          <Search size={20} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
        </form>

        <div className="post-grid">
          {posts?.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {posts?.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem', opacity: 0.5 }}>
            <h2>No articles found</h2>
            <p>Try searching for something else or check back later.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '4rem' }}>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <Link 
                  key={p}
                  href={`/?page=${p}${query ? `&q=${query}` : ''}`}
                  className={`btn ${p === page ? 'btn-primary' : 'btn-outline'}`}
                  style={{ minWidth: '45px', padding: '0.5rem' }}
                >
                  {p}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
