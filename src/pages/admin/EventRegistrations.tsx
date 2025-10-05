import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

type RegistrationRow = {
  registration_id: number;
  trek_id: number;
  user_id: string;
  payment_status: string | null;
  payment_proof_url: string | null;
  booking_datetime?: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  rejection_reason?: string | null;
};

export default function EventRegistrations() {
  const [statusFilter, setStatusFilter] = useState<string>('Pending');
  const [trekIdFilter, setTrekIdFilter] = useState<string>('');
  const [rows, setRows] = useState<RegistrationRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const statuses = useMemo(() => ['ProofUploaded', 'Pending', 'Approved', 'Rejected'], []);

  async function fetchRegistrations() {
    setLoading(true);
    try {
      let query = supabase.from('trek_registrations').select('*');
      if (statusFilter) {
        query = query.in('payment_status', [statusFilter]);
      }
      if (trekIdFilter) {
        query = query.eq('trek_id', Number(trekIdFilter));
      }
      const { data, error } = await query.order('booking_datetime', { ascending: false });
      if (error) throw error;
      setRows((data as RegistrationRow[]) || []);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load registrations';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, trekIdFilter]);

  async function approve(registration_id: number) {
    setActionLoadingId(registration_id);
    try {
      const { error } = await supabase.rpc('approve_registration', { registration_id_param: registration_id });
      if (error) throw error;
      toast({ title: 'Approved', description: `Registration #${registration_id} approved.` });
      await fetchRegistrations();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Approve failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setActionLoadingId(null);
    }
  }

  async function reject(registration_id: number) {
    const reason = window.prompt('Enter rejection reason');
    if (!reason) return;
    setActionLoadingId(registration_id);
    try {
      const { error } = await supabase.rpc('reject_registration', { registration_id_param: registration_id, reason_param: reason });
      if (error) throw error;
      toast({ title: 'Rejected', description: `Registration #${registration_id} rejected.` });
      await fetchRegistrations();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Reject failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Event Registrations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Trek ID" value={trekIdFilter} onChange={e => setTrekIdFilter(e.target.value)} className="w-40" />
          <Button variant="outline" onClick={fetchRegistrations} disabled={loading}>Refresh</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 px-2">ID</th>
                <th className="py-2 px-2">Trek</th>
                <th className="py-2 px-2">User</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">Proof</th>
                <th className="py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.registration_id} className="border-b">
                  <td className="py-2 px-2">{r.registration_id}</td>
                  <td className="py-2 px-2">{r.trek_id}</td>
                  <td className="py-2 px-2">{r.user_id}</td>
                  <td className="py-2 px-2">{r.payment_status}</td>
                  <td className="py-2 px-2">
                    {r.payment_proof_url ? (
                      <a className="text-primary underline" href={r.payment_proof_url} target="_blank" rel="noreferrer">View</a>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex gap-2">
                      <Button size="sm" disabled={actionLoadingId === r.registration_id} onClick={() => approve(r.registration_id)}>Approve</Button>
                      <Button size="sm" variant="destructive" disabled={actionLoadingId === r.registration_id} onClick={() => reject(r.registration_id)}>Reject</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="py-6 text-center text-muted-foreground" colSpan={6}>No registrations</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}


