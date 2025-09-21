import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Check, X, AlertTriangle } from 'lucide-react';

// Interface for the User object (adjust based on your actual users table)
interface UserInfo {
  user_id: string;
  name: string; // Use name instead of full_name
  email: string;
}

// Interface for Trek Event info needed
interface TrekEventInfo {
  trek_id: number;
  name: string; // Use name instead of trek_name
  start_datetime: string;
}

// Interface for the combined registration data
interface RegistrationData {
  registration_id: number;
  user_id: string;
  trek_id: number;
  booking_datetime: string;
  payment_status: string;
  indemnity_agreed: boolean;
  // Nested objects
  trek_event: TrekEventInfo | null; // Use the specific interface
  user: UserInfo | null; // Use the specific interface
}

export default function RegistrationAdmin() {
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  async function fetchRegistrations() {
    setLoading(true);
    const { data, error } = await supabase
      .from('trek_registrations')
      .select('*'); 
      // Add filtering/pagination as needed
    
    if (error) {
      toast({ title: 'Error fetching registrations', description: error.message, variant: 'destructive' });
      setRegistrations([]);
    } else {
      if (!data || data.length === 0) { return; }

      type RawRegistration = { trek_id: number; user_id: string; [key: string]: unknown };

      const trekIds = (data || []).map((reg: RawRegistration) => reg.trek_id);
      const userIds = (data || []).map((reg: RawRegistration) => reg.user_id);

      // Fetch trek and user data in parallel
      const [trekResult, userResult] = await Promise.all([
        supabase.from('trek_events').select('trek_id, name, start_datetime').in('trek_id', trekIds),
        supabase.from('users').select('user_id, name, email').in('user_id', userIds) // Corrected: select user_id, name
      ]);

      const { data: trekData, error: trekError } = trekResult;
      const { data: userData, error: userError } = userResult;

      if (trekError) { throw trekError; }
      if (userError) { throw userError; }

      // Create maps for efficient lookup
      const trekInfoMap = (trekData || []).reduce((acc, trek) => {
        acc[trek.trek_id] = { trek_id: trek.trek_id, name: trek.name, start_datetime: trek.start_datetime };
        return acc;
      }, {} as Record<number, TrekEventInfo>); // Use TrekEventInfo type

      const userMap = (userData || []).reduce((acc, user) => {
        acc[user.user_id] = { user_id: user.user_id, name: user.name, email: user.email }; // Corrected: use user_id, name
        return acc;
      }, {} as Record<string, UserInfo>); // Use UserInfo type

      // Combine data
      const combinedData = (data || []).map((reg: RawRegistration): RegistrationData => ({
        ...reg,
        trek_event: trekInfoMap[reg.trek_id] || null,
        user: userMap[reg.user_id] || null,
      }));

      setRegistrations(combinedData);
    }
    setLoading(false);
  }

  // Find duplicate registrations (same user, same trek)
  const duplicates = registrations.reduce((acc, reg) => {
    const key = reg.user_id + '_' + reg.trek_id;
    acc[key] = acc[key] ? [...acc[key], reg] : [reg];
    return acc;
  }, {} as Record<string, RegistrationData[]>);

  const duplicateGroups = Object.values(duplicates).filter(group => group.length > 1);

  async function deleteRegistration(registration_id: number, trek_id?: number) {
    const { error } = await supabase
      .from('trek_registrations')
      .delete()
      .eq('registration_id', registration_id);
    if (error) {
      toast({ title: 'Error deleting registration', description: error.message, variant: 'destructive' });
    } else {
      // After deletion, just show toast and refresh
      toast({ title: 'Registration deleted', description: 'Duplicate registration removed.' });
      fetchRegistrations();
    }
  }

  // Group duplicates for rendering
  const duplicateGroupsForRendering = duplicateGroups.map((group, i) => (
    <div key={i} className="border rounded p-3 bg-yellow-50">
      <div className="font-semibold mb-2">User: {group[0].user?.name || group[0].user_id} ({group[0].user?.email}) | Trek: {group[0].trek_event?.name || group[0].trek_id}</div>
      <div className="space-y-2">
        {group.map(reg => (
          <div key={reg.registration_id} className="flex items-center gap-4">
            <span className="text-xs text-gray-700">Registered on: {new Date(reg.booking_datetime).toLocaleString()}</span>
            <span className="text-xs">Status: {reg.payment_status}</span>
            <Button size="sm" variant="destructive" onClick={() => deleteRegistration(reg.registration_id, reg.trek_id)}>Delete</Button>
          </div>
        ))}
      </div>
    </div>
  ));

  const nonDuplicateRegistrations = registrations.filter(reg => 
    !duplicateGroups.some(group => group.some(dup => dup.registration_id === reg.registration_id))
  );

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Trek Registrations (Admin)</CardTitle>
        <div className="text-sm text-gray-500">Duplicates are highlighted for review and cleanup.</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-6">
            {duplicateGroups.length === 0 ? (
              <div className="text-green-700">No duplicate registrations found.</div>
            ) : (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3 text-red-600 flex items-center"><AlertTriangle className="mr-2"/> Duplicate Registrations Found</h2>
                {duplicateGroupsForRendering}
              </div>
            )}
            {nonDuplicateRegistrations.length > 0 && (
              <div className="border rounded p-3 bg-gray-50">
                <h2 className="text-xl font-semibold mb-3">Non-Duplicate Registrations</h2>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="p-2">ID</th>
                      <th className="p-2">User</th>
                      <th className="p-2">Trek</th>
                      <th className="p-2">Booking Date</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nonDuplicateRegistrations.map((reg) => (
                      <tr key={reg.registration_id} className="border-b">
                        <td className="p-2">{reg.registration_id}</td>
                        <td className="p-2">{reg.user?.name || reg.user_id}</td>
                        <td className="p-2">{reg.trek_event?.name || reg.trek_id}</td>
                        <td className="p-2">{format(new Date(reg.booking_datetime), 'MMM d, yyyy h:mm a')}</td>
                        <td className="p-2">{reg.payment_status}</td>
                        <td className="p-2">
                          <Button size="sm" variant="destructive" onClick={() => deleteRegistration(reg.registration_id, reg.trek_id)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
