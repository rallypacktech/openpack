import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Trash2, Plus, Power } from "lucide-react";

export default function AlertDelegationsPanel() {
  const [delegations, setDelegations] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ organization_name: "", authorized_email: "", subscription_id: "", provides_shelters: false, is_contracted: false, contracted_type: "", contracted_entity_name: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [delegs, subs] = await Promise.all([
        base44.entities.AlertDelegation.list(),
        base44.entities.BusinessSubscription.list()
      ]);
      setDelegations(delegs);
      setSubscriptions(subs);
    } catch (e) {
      console.error("Failed to load delegations:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.organization_name || !form.authorized_email || !form.subscription_id) return;
    setSaving(true);
    try {
      const me = await base44.auth.me();
      await base44.entities.AlertDelegation.create({
        ...form,
        is_active: true,
        granted_by: me.email
      });
      setForm({ organization_name: "", authorized_email: "", subscription_id: "", provides_shelters: false, is_contracted: false, contracted_type: "", contracted_entity_name: "" });
      setShowForm(false);
      await loadData();
    } catch (e) {
      console.error("Failed to create delegation:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id, currentActive) => {
    await base44.entities.AlertDelegation.update(id, { is_active: !currentActive });
    await loadData();
  };

  const handleDelete = async (id) => {
    await base44.entities.AlertDelegation.delete(id);
    await loadData();
  };

  const subName = (subId) => {
    const sub = subscriptions.find(s => s.id === subId);
    return sub ? sub.organization_name : "Unknown";
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Alert Delegations
          </CardTitle>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-1" />
            Grant Access
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Authorize organizations to send emergency alerts to their own members via Telegram. You control who has access.
        </p>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="border rounded-lg p-4 mb-4 space-y-3 bg-muted/30">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input
                placeholder="e.g. American Red Cross"
                value={form.organization_name}
                onChange={(e) => setForm({ ...form, organization_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Authorized Email (must be a registered RallyPack user)</Label>
              <Input
                type="email"
                placeholder="contact@redcross.org"
                value={form.authorized_email}
                onChange={(e) => setForm({ ...form, authorized_email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Organization Subscription</Label>
              <select
                className="w-full px-3 py-2 border rounded text-sm bg-background"
                value={form.subscription_id}
                onChange={(e) => setForm({ ...form, subscription_id: e.target.value })}
              >
                <option value="">Select a business subscription...</option>
                {subscriptions.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.organization_name} ({sub.tier})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-sm font-sans cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.provides_shelters}
                  onChange={(e) => setForm({ ...form, provides_shelters: e.target.checked })}
                  className="rounded border-border"
                />
                Provides Shelters
              </label>
              <label className="flex items-center gap-2 text-sm font-sans cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_contracted}
                  onChange={(e) => setForm({ ...form, is_contracted: e.target.checked })}
                  className="rounded border-border"
                />
                Contracted (County/State)
              </label>
            </div>
            {form.is_contracted && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Contracted Type</Label>
                  <select
                    className="w-full px-3 py-2 border rounded text-sm bg-background"
                    value={form.contracted_type}
                    onChange={(e) => setForm({ ...form, contracted_type: e.target.value })}
                  >
                    <option value="">Select type...</option>
                    <option value="county">County</option>
                    <option value="state">State</option>
                    <option value="federal">Federal</option>
                    <option value="red_cross">Red Cross</option>
                    <option value="private_shelter_provider">Private Shelter Provider</option>
                    <option value="voad">VOAD</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Contracting Entity</Label>
                  <Input
                    placeholder="e.g. Williamson County, TX"
                    value={form.contracted_entity_name}
                    onChange={(e) => setForm({ ...form, contracted_entity_name: e.target.value })}
                  />
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={saving || !form.organization_name || !form.authorized_email || !form.subscription_id}>
                {saving ? "Granting..." : "Grant Access"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {delegations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No alert delegations yet.</p>
            <p className="text-sm mt-1">Grant access to let organizations send their own emergency alerts.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {delegations.map((d) => (
              <div key={d.id} className="flex items-center justify-between border rounded-lg p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{d.organization_name}</span>
                    <Badge variant={d.is_active ? "default" : "secondary"}>
                      {d.is_active ? "Active" : "Revoked"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Authorized: {d.authorized_email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sends to: {subName(d.subscription_id)}
                  </p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {d.provides_shelters && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">Shelter Provider</Badge>
                    )}
                    {d.is_contracted && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-xs">
                        Contracted: {d.contracted_type || "Verified"}
                      </Badge>
                    )}
                  </div>
                  {d.granted_by && (
                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      Granted by: {d.granted_by}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggle(d.id, d.is_active)}
                    title={d.is_active ? "Revoke access" : "Reactivate access"}
                  >
                    <Power className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(d.id)}
                    title="Delete delegation"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}