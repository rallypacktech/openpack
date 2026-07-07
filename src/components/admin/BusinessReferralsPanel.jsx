import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Mail, Building2, Clock, RefreshCw, Loader2 } from "lucide-react";
import AdminReferralForm from "./AdminReferralForm";

const AUDIENCE_LABELS = {
  general: 'General',
  equine: 'Equine',
  canine: 'Canine',
  feline: 'Feline',
  infant: 'Infant',
  avian: 'Avian',
  reptile: 'Reptile',
  livestock: 'Livestock',
};

export default function BusinessReferralsPanel() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadReferrals = useCallback(async () => {
    try {
      const data = await base44.entities.BusinessReferral.list('-created_date', 100);
      setReferrals(data);
    } catch (error) {
      console.error("Error loading referrals:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReferrals();
  }, [loadReferrals]);

  const handleStatusChange = async (referralId, newStatus) => {
    try {
      await base44.entities.BusinessReferral.update(referralId, { status: newStatus });
      setReferrals(prev => prev.map(r => r.id === referralId ? { ...r, status: newStatus } : r));
    } catch (error) {
      console.error("Error updating referral status:", error);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    loadReferrals();
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const pendingCount = referrals.filter(r => r.status === 'pending').length;
  const contactedCount = referrals.filter(r => r.status === 'contacted').length;
  const convertedCount = referrals.filter(r => r.status === 'converted').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5" /> Business Referrals
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review and manage incoming business referrals, or refer a business directly.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadReferrals} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" /> Refer a Business
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Contacted</p>
            <p className="text-2xl font-bold text-blue-700">{contactedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Converted</p>
            <p className="text-2xl font-bold text-green-700">{convertedCount}</p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Refer a Business</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminReferralForm
              onSuccess={handleFormSuccess}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : referrals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Mail className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No business referrals yet.</p>
            <p className="text-sm mt-1">Click "Refer a Business" to send your first invite.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {referrals.map((ref) => (
            <Card key={ref.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-base">
                        {ref.organization_name || ref.referee_email}
                      </h3>
                      {ref.audience_type && ref.audience_type !== 'general' && (
                        <Badge variant="outline" className="bg-primary/5">
                          {AUDIENCE_LABELS[ref.audience_type] || ref.audience_type}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      {ref.referee_name && <p>{ref.referee_name}</p>}
                      <p className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {ref.referee_email}
                      </p>
                      {ref.referrer_name && (
                        <p>Referred by: {ref.referrer_name}
                          {ref.referrer_email && ` (${ref.referrer_email})`}
                        </p>
                      )}
                      {ref.message && (
                        <p className="mt-2 italic text-foreground/80 bg-muted/50 px-3 py-1.5 rounded">
                          "{ref.message}"
                        </p>
                      )}
                      <p className="flex items-center gap-1 text-xs">
                        <Clock className="w-3 h-3" /> {getTimeAgo(ref.created_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={ref.status}
                      onValueChange={(val) => handleStatusChange(ref.id, val)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}