import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
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
}

export default function UserVerificationPanel() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  async function fetchPendingUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('verification_status', 'pending');
    if (error) {
      toast({ title: 'Error fetching users', description: error.message, variant: 'destructive' });
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }

  async function handleVerify(id: string) {
    const { error } = await supabase
      .from('users')
      .update({ verification_status: 'verified' })
      .eq('id', id);
    if (error) {
      toast({ title: 'Error verifying user', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'User verified' });
      setUsers(users => users.filter(u => u.id !== id));
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
      setUsers(users => users.filter(u => u.id !== id));
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Pending User Verifications</h2>
      {loading ? <div>Loading...</div> : (
        users.length === 0 ? <div>No users pending verification.</div> : (
          <div className="space-y-4">
            {users.map(user => (
              <Card key={user.id}>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                      <div className="font-semibold">{user.full_name || 'No Name'}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">User Type: {user.user_type}</div>
                      {user.partner_id && <div className="text-xs text-gray-400">Partner ID: {user.partner_id}</div>}
                      <div className="text-xs">Indemnity Accepted: {user.indemnity_accepted ? 'Yes' : 'No'}</div>
                    </div>
                    <div className="flex space-x-2 mt-2 md:mt-0">
                      <Button variant="secondary" onClick={() => handleVerify(user.id)}>Verify</Button>
                      <Button variant="destructive" onClick={() => handleReject(user.id)}>Reject</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {user.verification_docs ? (
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(user.verification_docs, null, 2)}</pre>
                  ) : (
                    <div className="text-xs text-gray-400">No verification docs uploaded.</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}
