import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableFooter, TableHead, TableCaption } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { UserProfile } from '@/components/auth/AuthProvider';
import { UserVerificationStatus } from '@/integrations/supabase/types';

export default function UserVerificationPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      let query = supabase.from('users').select('*');
      if (userTypeFilter !== 'all') {
        const validTypes = ['admin', 'micro_community', 'trekker'];
        if (validTypes.includes(userTypeFilter)) {
          query = query.eq('user_type', userTypeFilter);
        } else {
          setUsers([]);
          setLoading(false);
          return;
        }
      }
      const { data, error } = await query;
      const validTypes = ['admin', 'micro_community', 'trekker'];
      const filtered = (data || []).filter(u => u.user_type && validTypes.includes(u.user_type));
      if (error) {
        toast({ title: 'Error fetching users', description: error.message, variant: 'destructive' });
      } else {
        setUsers(filtered as UserProfile[]);
      }
      setLoading(false);
    }
    fetchUsers();
  }, [userTypeFilter]);

  async function handleVerify(userId: string) {
    const { error } = await supabase
      .from('users')
      .update({ verification_status: 'VERIFIED' as UserVerificationStatus })
      .eq('user_id', userId);
    if (error) {
      toast({ title: 'Error verifying user', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'User verified' });
      setUsers(users => users.map(u => u.user_id === userId ? { ...u, verification_status: 'VERIFIED' as UserVerificationStatus } : u));
    }
  }

  async function handleReject(userId: string) {
    const { error } = await supabase
      .from('users')
      .update({ verification_status: 'REJECTED' as UserVerificationStatus })
      .eq('user_id', userId);
    if (error) {
      toast({ title: 'Error rejecting user', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'User rejected' });
      setUsers(users => users.map(u => u.user_id === userId ? { ...u, verification_status: 'REJECTED' as UserVerificationStatus } : u));
    }
  }

  async function promoteToAdmin(email: string) {
    const { error } = await supabase
      .from('users')
      .update({ user_type: 'admin', verification_status: 'VERIFIED' as UserVerificationStatus })
      .eq('email', email);
    if (error) {
      toast({ title: 'Error promoting user', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'User promoted to admin' });
      setUsers(users => users.filter(u => u.email !== email));
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
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
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>User Type</TableHead>
            <TableHead>Verification Status</TableHead>
            <TableHead>Docs</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
          ) : users.length === 0 ? (
            <TableRow><TableCell colSpan={6} className="text-center">No users found.</TableCell></TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.user_id}>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.user_type}</TableCell>
                <TableCell>{user.verification_status}</TableCell>
                <TableCell>
                  {user.verification_docs?.aadhaar?.front_url && (
                    <div className="space-x-2">
                      <a href={user.verification_docs.aadhaar.front_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Aadhaar Front</a>
                      {user.verification_docs.aadhaar.back_url && (
                        <a href={user.verification_docs.aadhaar.back_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Back</a>
                      )}
                    </div>
                  )}
                  {user.verification_docs?.secondary_id?.front_url && (
                    <div className="space-x-2 mt-1">
                      <span className="text-sm text-gray-600">{user.verification_docs.secondary_id.type}:</span>
                      <a href={user.verification_docs.secondary_id.front_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Front</a>
                      {user.verification_docs.secondary_id.back_url && (
                        <a href={user.verification_docs.secondary_id.back_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Back</a>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {user.verification_status === 'PENDING_REVIEW' && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleVerify(user.user_id)}>Verify</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleReject(user.user_id)}>Reject</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
