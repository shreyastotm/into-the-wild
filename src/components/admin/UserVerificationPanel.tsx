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

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_type', 'micro_community');
      if (error) {
        toast({ title: 'Error fetching users', description: error.message, variant: 'destructive' });
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

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
      <h2 className="text-2xl font-bold mb-6">Micro-Community Users</h2>
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
                <TableCell colSpan={6} className="text-center text-gray-500">No micro-community users found.</TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
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
