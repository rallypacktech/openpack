import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, AlertTriangle, HelpCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function FamilyStatuses() {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatuses();

    // Subscribe to profile updates
    const unsubscribe = base44.entities.UserProfile.subscribe((event) => {
      if (event.type === 'update') {
        loadStatuses();
      }
    });

    return unsubscribe;
  }, []);

  const loadStatuses = async () => {
    try {
      const response = await base44.functions.invoke('getFamilyStatuses', {});
      setStatuses(response.data.statuses || []);
    } catch (error) {
      console.error('Error loading statuses:', error);
      toast.error('Failed to load family statuses');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'needs_assistance':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <HelpCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'safe':
        return <Badge className="bg-green-100 text-green-800">Safe</Badge>;
      case 'needs_assistance':
        return <Badge className="bg-red-100 text-red-800">Needs Help</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Family Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {statuses.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No family members with status updates yet
          </p>
        ) : (
          <div className="space-y-3">
            {statuses.map((status, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(status.status)}
                  <div>
                    <p className="font-semibold">{status.name}</p>
                    <p className="text-xs text-gray-500">{status.relationship}</p>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(status.status)}
                  {status.status_updated_at && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(status.status_updated_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}