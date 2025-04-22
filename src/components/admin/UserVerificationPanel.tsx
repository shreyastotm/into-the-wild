import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableFooter, TableHead, TableCaption } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';

interface UserRecord {
  id: string;
  email: string;
  full_name?: string;
  user_type?: string;
  partner_id?: string;
  verification_status?: string;
  indemnity_accepted?: boolean;
  verification_docs?: any;
  created_at?: string;
}

export default function UserVerificationPanel() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      console.log('[DEBUG] Current userTypeFilter:', userTypeFilter);
      let query = supabase.from('users').select('*');
      if (userTypeFilter !== 'all') {
        // Defensive: Only allow valid user types
        const validTypes = ['admin', 'micro_community', 'trekker'];
        if (validTypes.includes(userTypeFilter)) {
          query = query.eq('user_type', userTypeFilter);
        } else {
          // If filter is invalid, fetch nothing and warn
          setUsers([]);
          setLoading(false);
          console.warn('Invalid userTypeFilter:', userTypeFilter);
          return;
        }
      }
      const { data, error } = await query;
      // Defensive: Filter out users with missing/invalid user_type
      const validTypes = ['admin', 'micro_community', 'trekker'];
      const filtered = (data || []).filter(u => validTypes.includes(u.user_type));
      if (error) {
        toast({ title: 'Error fetching users', description: error.message, variant: 'destructive' });
      } else {
        setUsers(filtered);
      }
      setLoading(false);
    }
    fetchUsers();
  }, [userTypeFilter]);

  async function handleVerify(id: string) {
    const { error } = await supabase
      .from('users')
      .update({ verification_status: 'verified' })
      .eq('id', id);
    if (error) {
      toast({ title: 'Error verifying user', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'User verified' });
      setUsers(users => users.map(u => u.id === id ? { ...u, verification_status: 'verified' } : u));
    }
  }

  async function handleReject(id: string) {
    const { error } = await supabase
      .from('users')
      .update({ verification_status: 'rejected' })
      .eq('id', id);
    if (error) {
      toast({ title: 'Error rejecting user', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'User rejected' });
      setUsers(users => users.map(u => u.id === id ? { ...u, verification_status: 'rejected' } : u));
    }
  }

  async function promoteToAdmin(email: string) {
    const { error } = await supabase
      .from('users')
      .update({ user_type: 'admin', verification_status: 'verified' })
      .eq('email', email);
    if (error) {
      toast({ title: 'Error promoting user', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'User promoted to admin' });
      setUsers(users => users.filter(u => u.email !== email));
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">User Verification</h2>
      <div className="mb-4 flex gap-4 items-center">
        <label htmlFor="userTypeFilter" className="font-medium">User Type:</label>
        <select
          id="userTypeFilter"
          value={userTypeFilter}
          onChange={e => setUserTypeFilter(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="micro_community">Micro-Community</option>
          <option value="admin">Admin</option>
          <option value="trekker">Trekker</option>
          <option value="all">All</option>
        </select>
      </div>
      <div className="mb-2">
        <button onClick={async () => {
          const { data, error } = await supabase.from('users').select('*');
          console.log('[DEBUG] ALL USERS TABLE:', data, error);
          alert('Check console for full users table dump.');
        }} className="border px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Dump All Users (Debug)</button>
      </div>
      {loading ? <div>Loading...</div> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>User Type</TableCell>
              <TableCell>Verification Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">No users found.</TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id || user.email}>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.user_type}</TableCell>
                  <TableCell>{user.verification_status}</TableCell>
                  <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}</TableCell>
                  <TableCell>
                    {user.verification_status === 'pending' && (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleVerify(user.id)}>Verify</Button>
                        <Button variant="destructive" onClick={() => handleReject(user.id)}>Reject</Button>
                      </div>
                    )}
                    {user.email === 'shreyasmadhan82@gmail.com' && (
                      <Button variant="secondary" onClick={() => promoteToAdmin(user.email)}>Promote to Admin</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
