import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tent, Users, Calendar, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { TentRequest } from '@/types/trek';
import { useCallback } from 'react';

interface TentRequestsAdminProps {
  eventId: number;
}

export const TentRequestsAdmin: React.FC<TentRequestsAdminProps> = ({ eventId }) => {
  const [requests, setRequests] = useState<TentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<number | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<TentRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const fetchTentRequests = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tent_requests')
        .select(`
          *,
          tent_type:tent_types(*),
          user:profiles(id, full_name, email)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching tent requests:', error);
      toast({
        title: "Error",
        description: "Failed to load tent requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchTentRequests();
  }, [eventId, fetchTentRequests]);

  const handleRequestAction = (request: TentRequest, requestAction: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setAction(requestAction);
    setAdminNotes(request.admin_notes || '');
    setDialogOpen(true);
  };

  const processRequest = async () => {
    if (!selectedRequest || !action) return;

    try {
      setProcessingRequest(selectedRequest.id!);
      
      const updates: Partial<TentRequest> = {
        status: action === 'approve' ? 'approved' : 'rejected',
        admin_notes: adminNotes.trim() || null
      };

      const { error } = await supabase
        .from('tent_requests')
        .update(updates)
        .eq('id', selectedRequest.id);

      if (error) throw error;

      // If approving, update the reserved count in tent_inventory
      if (action === 'approve') {
        const { error: inventoryError } = await supabase.rpc('update_tent_reserved_count', {
          p_event_id: eventId,
          p_tent_type_id: selectedRequest.tent_type_id,
          p_quantity_change: selectedRequest.quantity_requested
        });

        if (inventoryError) {
          console.error('Error updating tent inventory:', inventoryError);
          // We'll still show success but note the inventory issue
        }
      }

      toast({
        title: `Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `Tent request has been ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      });

      await fetchTentRequests();
      setDialogOpen(false);
      setSelectedRequest(null);
      setAdminNotes('');
      setAction(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : `Failed to ${action} tent request`;
      console.error('Error processing tent request:', error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getPendingRequests = () => requests.filter(r => r.status === 'pending');
  const getProcessedRequests = () => requests.filter(r => r.status !== 'pending');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tent className="h-5 w-5" />
            Tent Rental Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading tent requests...</div>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tent className="h-5 w-5" />
            Tent Rental Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Tent className="h-4 w-4" />
            <AlertDescription>
              No tent rental requests have been submitted for this event yet.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = getPendingRequests();
  const processedRequests = getProcessedRequests();

  return (
    <div className="space-y-6">
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tent className="h-5 w-5" />
              Pending Tent Requests ({pendingRequests.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Review and approve or reject tent rental requests from participants.
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Tent Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Nights</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.user?.full_name || 'Unknown User'}</div>
                        <div className="text-sm text-muted-foreground">{request.user?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.tent_type?.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {request.tent_type?.capacity} people
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{request.quantity_requested}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {request.nights}
                      </div>
                    </TableCell>
                    <TableCell>₹{request.total_cost}</TableCell>
                    <TableCell>
                      <div className="max-w-32 truncate text-sm">
                        {request.request_notes || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleRequestAction(request, 'approve')}
                          disabled={processingRequest === request.id}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRequestAction(request, 'reject')}
                          disabled={processingRequest === request.id}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tent className="h-5 w-5" />
              Processed Requests ({processedRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Tent Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.user?.full_name || 'Unknown User'}</div>
                        <div className="text-sm text-muted-foreground">{request.user?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.tent_type?.name}</div>
                        <div className="text-sm text-muted-foreground">₹{request.total_cost}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{request.quantity_requested} tent(s) × {request.nights} nights</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="max-w-32 truncate text-sm">
                        {request.admin_notes || '-'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approve' : 'Reject'} Tent Request
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  {action === 'approve' ? 'Approve' : 'Reject'} tent rental request from{' '}
                  <strong>{selectedRequest.user?.full_name}</strong> for{' '}
                  <strong>{selectedRequest.quantity_requested} {selectedRequest.tent_type?.name}</strong>.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
              <Textarea
                id="admin-notes"
                placeholder="Add any notes or comments for the user..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={processRequest}
              disabled={!!processingRequest}
              variant={action === 'approve' ? 'default' : 'destructive'}
            >
              {action === 'approve' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Request
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
