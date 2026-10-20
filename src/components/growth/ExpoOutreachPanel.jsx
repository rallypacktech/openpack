import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Plus, Loader2, ClipboardList } from "lucide-react";
import ExpoContactGroups from "./ExpoContactGroups";
import ExpoProspectList from "./ExpoProspectList";
import ExpoProspectDialog from "./ExpoProspectDialog";

export default function ExpoOutreachPanel() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(null);
  const [copying, setCopying] = useState(false);
  const [copyResult, setCopyResult] = useState("");

  const load = async () => {
    const page = await base44.entities.ExpoProspect.filter({}, { sort: "-created_date", limit: 100 });
    setProspects(page.items);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (data) => {
    const { id, ...fields } = data;
    if (id) await base44.entities.ExpoProspect.update(id, fields);
    else await base44.entities.ExpoProspect.create(fields);
    setDraft(null);
    load();
  };

  const handleStatus = async (id, status) => {
    await base44.entities.ExpoProspect.update(id, { status });
    load();
  };

  const handleDelete = async (id) => {
    await base44.entities.ExpoProspect.delete(id);
    load();
  };

  // Mirrors the verified contacts into the business referral pipeline, tagged as
  // coming from the Expo. Those referrals are excluded from the scheduled
  // referral emails, so nothing is ever cold-sent.
  const handleCopyToReferrals = async () => {
    setCopying(true);
    setCopyResult("");
    try {
      const res = await base44.functions.invoke("copyExpoProspectsToReferrals", {});
      setCopyResult(res?.data?.message || "Contacts copied to Referrals.");
    } catch (_e) {
      setCopyResult("Could not copy the contacts. Please try again.");
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-xs font-sans text-amber-900">
          Listing a contact here implies no existing relationship and no confirmed willingness to partner.
          Outreach is manual and non-unsolicited — verify names, booths and sessions on the Expo site before
          contacting anyone, and never send bulk email. Contacts copied to Referrals are tagged as coming from
          the Expo and are skipped by the automated referral emails.
        </p>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h3 className="font-serif text-lg font-semibold text-foreground">Verified contacts by partnership fit</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={handleCopyToReferrals}
              disabled={copying || prospects.length === 0}
            >
              {copying ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <ClipboardList className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              Copy to Referrals
            </Button>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => setDraft({})}>
              <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Add manually
            </Button>
          </div>
        </div>
        {copyResult && (
          <p className="text-xs font-sans text-muted-foreground mb-3">{copyResult}</p>
        )}
        <ExpoContactGroups prospects={prospects} onAdd={setDraft} />
      </div>

      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Outreach list</h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" role="status" aria-label="Loading" />
          </div>
        ) : (
          <ExpoProspectList
            prospects={prospects}
            onStatus={handleStatus}
            onDelete={handleDelete}
            onEdit={setDraft}
          />
        )}
      </div>

      {draft && (
        <ExpoProspectDialog initial={draft} onClose={() => setDraft(null)} onSave={handleSave} />
      )}
    </div>
  );
}