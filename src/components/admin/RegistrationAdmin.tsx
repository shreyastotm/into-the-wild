import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface Registration {
  registration_id: number;
  user_id: string;
  trek_id: number;
  booking_datetime: string;
  payment_status: string;
  trek_event?: {
    trek_name: string;
    start_datetime: string;
  };
  user?: {
    full_name: string;
    email: string;
  };
}

export default function RegistrationAdmin() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  async function fetchRegistrations() {
    setLoading(true);
    const { data, error } = await supabase
      .from('trek_registrations')
      .select('registration_id, user_id, trek_id, booking_datetime, payment_status')
      .order('booking_datetime', { ascending: false });
    if (error) {
      toast({ title: 'Error fetching registrations', description: error.message, variant: 'destructive' });
      setRegistrations([]);
    } else {
      // Fetch trek and user details in bulk
      const trekIds = (data || []).map((reg: any) => reg.trek_id);
      const userIds = (data || []).map((reg: any) => reg.user_id);
      const [{ data: trekData }, { data: userData }] = await Promise.all([
        supabase.from('trek_events').select('trek_id, trek_name, start_datetime').in('trek_id', trekIds),
        supabase.from('users').select('id, full_name, email').in('id', userIds),
      ]);
      const trekMap = (trekData || []).reduce((acc, trek) => {
        acc[trek.trek_id] = trek;
        return acc;
      }, {} as Record<number, any>);
      const userMap = (userData || []).reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as Record<string, any>);
      setRegistrations((data || []).map((reg: any) => ({
        ...reg,
        trek_event: trekMap[reg.trek_id] || null,
        user: userMap[reg.user_id] || null,
      })));
    }
    setLoading(false);
  }

  // Find duplicate registrations (same user, same trek)
  const duplicates = registrations.reduce((acc, reg) => {
    const key = reg.user_id + '_' + reg.trek_id;
    acc[key] = acc[key] ? [...acc[key], reg] : [reg];
    return acc;
  }, {} as Record<string, Registration[]>);

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
              duplicateGroups.map((group, i) => (
                <div key={i} className="border rounded p-3 bg-yellow-50">
                  <div className="font-semibold mb-2">User: {group[0].user?.full_name || group[0].user_id} ({group[0].user?.email}) | Trek: {group[0].trek_event?.trek_name || group[0].trek_id}</div>
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
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
