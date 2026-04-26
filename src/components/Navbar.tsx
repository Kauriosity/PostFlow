"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { LogOut, PenSquare, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        // Retry a few times if the profile isn't ready yet (common in fast signups)
        const fetchRole = async (retries = 3) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();
          
          if (profile?.role) {
            setRole(profile.role);
          } else if (retries > 0) {
            setTimeout(() => fetchRole(retries - 1), 1000);
          }
        };
        fetchRole();
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
        <Link href="/" className="logo">
          PostFlow
        </Link>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {user ? (
            <>
              {role === 'admin' && (
                <Link href="/admin" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                  <LayoutDashboard size={18} /> Admin
                </Link>
              )}
              {(role === 'author' || role === 'admin') && (
                <Link href="/posts/new" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                  <PenSquare size={18} /> New Post
                </Link>
              )}
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
