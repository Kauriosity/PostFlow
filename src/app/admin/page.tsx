import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { updateUserRole } from "@/app/actions";
import { UserCog, ShieldCheck, User as UserIcon } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Verify Admin Status
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id || '')
    .single();

  if (profile?.role !== 'admin') {
    return notFound();
  }

  // 2. Fetch all users
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  const handleRoleChange = async (userId: string, formData: FormData) => {
    "use server";
    const newRole = formData.get('role') as string;
    await updateUserRole(userId, newRole);
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: '5rem', paddingBottom: '8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--primary)', borderRadius: '12px' }}>
            <ShieldCheck size={24} color="white" />
          </div>
          <div>
            <h1>Admin Dashboard</h1>
            <p style={{ margin: 0 }}>Manage user roles and platform access</p>
          </div>
        </div>

        <div className="glass" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
              <tr>
                <th style={{ padding: '1.25rem' }}>User</th>
                <th style={{ padding: '1.25rem' }}>Email</th>
                <th style={{ padding: '1.25rem' }}>Joined</th>
                <th style={{ padding: '1.25rem' }}>Current Role</th>
                <th style={{ padding: '1.25rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {profiles?.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UserIcon size={16} />
                        </div>
                        {p.full_name || 'No Name'}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem', color: 'var(--secondary)', fontSize: '0.9rem' }}>{p.email}</td>
                  <td style={{ padding: '1.25rem', color: 'var(--secondary)', fontSize: '0.9rem' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '1.25rem' }}>
                    <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem', 
                        fontWeight: '600',
                        background: p.role === 'admin' ? 'rgba(139, 92, 246, 0.2)' : p.role === 'author' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.1)',
                        color: p.role === 'admin' ? '#a78bfa' : p.role === 'author' ? '#60a5fa' : '#94a3b8'
                    }}>
                      {p.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <form action={handleRoleChange.bind(null, p.id)} style={{ display: 'flex', gap: '0.5rem' }}>
                      <select name="role" className="input" style={{ width: 'auto', padding: '0.4rem', fontSize: '0.85rem' }}>
                        <option value="viewer">Viewer</option>
                        <option value="author">Author</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button type="submit" className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
                        Save
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
