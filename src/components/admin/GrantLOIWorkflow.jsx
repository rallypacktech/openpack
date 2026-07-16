import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import GrantLOIEditor from "@/components/admin/GrantLOIEditor";
import {
  GRANT_LIBRARY, AWARD_LIBRARY, GRANT_CATEGORY_LABELS, LOI_STAGES, PRIORITY_LABELS
} from "@/lib/grantLibrary";
import {
  Plus, FileText, Search, Sparkles, TrendingUp, Calendar, DollarSign, Loader2, Trophy
} from "lucide-react";

const ALL_OPPORTUNITIES = [...GRANT_LIBRARY, ...AWARD_LIBRARY];

export default function GrantLOIWorkflow() {
  const [lois, setLois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [creating, setCreating] = useState(false);

  useEffect(() => { loadLOIs(); }, []);

  const loadLOIs = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.GrantLOI.list("-updated_date", 100);
      setLois(data);
    } catch (e) {
      console.error("Failed to load LOIs:", e);
    } finally {
      setLoading(false);
    }
  };

  const grouped = useMemo(() => {
    const map = {};
    LOI_STAGES.forEach(s => { map[s.key] = []; });
    lois.forEach(loi => {
      if (map[loi.status]) map[loi.status].push(loi);
    });
    return map;
  }, [lois]);

  const totalRequested = useMemo(() =>
    lois.reduce((sum, l) => sum + (l.amount_requested || 0), 0), [lois]);
  const totalAwarded = useMemo(() =>
    lois.filter(l => l.status === "awarded").reduce((sum, l) => sum + (l.award_amount || l.amount_requested || 0), 0), [lois]);

  const startFromLibrary = async (grant) => {
    try {
      setCreating(true);
      const created = await base44.entities.GrantLOI.create({
        grant_name: grant.grant_name,
        funder_name: grant.funder_name,
        grant_category: grant.grant_category,
        opportunity_type: grant.opportunity_type || "grant",
        grant_url: grant.grant_url,
        amount_requested: grant.amount_requested,
        priority: grant.priority,
        status: "drafting",
        loi_sections: grant.loi_sections || {}
      });
      setLois([created, ...lois]);
      setShowLibrary(false);
      setEditing(created);
    } catch (e) {
      console.error("Failed to create LOI:", e);
    } finally {
      setCreating(false);
    }
  };

  const createBlank = async () => {
    try {
      setCreating(true);
      const created = await base44.entities.GrantLOI.create({
        grant_name: "New Grant Opportunity",
        funder_name: "",
        grant_category: "other",
        status: "identified",
        priority: "medium",
        loi_sections: {}
      });
      setLois([created, ...lois]);
      setShowLibrary(false);
      setEditing(created);
    } catch (e) {
      console.error("Failed to create LOI:", e);
    } finally {
      setCreating(false);
    }
  };

  const handleSave = async (updated) => {
    try {
      const saved = await base44.entities.GrantLOI.update(updated.id, updated);
      setLois(lois.map(l => l.id === saved.id ? saved : l));
      setEditing(null);
    } catch (e) {
      console.error("Failed to save LOI:", e);
    }
  };

  const moveStage = async (loiId, newStatus) => {
    const loi = lois.find(l => l.id === loiId);
    if (!loi) return;
    const patch = { status: newStatus };
    if (newStatus === "submitted" && !loi.submitted_date) {
      patch.submitted_date = new Date().toISOString().slice(0, 10);
    }
    try {
      const saved = await base44.entities.GrantLOI.update(loiId, patch);
      setLois(lois.map(l => l.id === saved.id ? saved : l));
    } catch (e) {
      console.error("Failed to move LOI:", e);
    }
  };

  const filteredLibrary = useMemo(() => {
    let list = ALL_OPPORTUNITIES;
    if (typeFilter !== "all") list = list.filter(g => (g.opportunity_type || "grant") === typeFilter);
    if (filter !== "all") list = list.filter(g => g.grant_category === filter);
    return list;
  }, [filter, typeFilter]);

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Grant LOI Pipeline
          </h2>
          <p className="text-sm text-muted-foreground">
            Track Letters of Intent for grants RallyPack qualifies for.
          </p>
        </div>
        <Button onClick={() => setShowLibrary(true)} size="sm">
          <Plus className="w-4 h-4 mr-1" /> New LOI
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><FileText className="w-3.5 h-3.5" /> Total LOIs</div>
          <div className="text-2xl font-bold text-foreground mt-1">{lois.length}</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><DollarSign className="w-3.5 h-3.5" /> Requested</div>
          <div className="text-2xl font-bold text-foreground mt-1">${(totalRequested / 1000).toFixed(0)}K</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingUp className="w-3.5 h-3.5" /> Awarded</div>
          <div className="text-2xl font-bold text-green-600 mt-1">${(totalAwarded / 1000).toFixed(0)}K</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="w-3.5 h-3.5" /> In Pipeline</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {lois.filter(l => ["drafting", "internal_review", "submitted"].includes(l.status)).length}
          </div>
        </Card>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto">
          {LOI_STAGES.map(stage => (
            <div key={stage.key} className="min-w-[220px]">
              <div className={`flex items-center justify-between px-3 py-2 rounded-t border ${stage.color}`}>
                <span className="text-xs font-semibold">{stage.label}</span>
                <span className="text-xs font-bold">{grouped[stage.key]?.length || 0}</span>
              </div>
              <div className="bg-secondary/40 rounded-b p-2 space-y-2 min-h-[120px]">
                {(grouped[stage.key] || []).map(loi => (
                  <div
                    key={loi.id}
                    onClick={() => setEditing(loi)}
                    className="bg-card border rounded p-2.5 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2">
                        {loi.grant_name}
                      </p>
                      {loi.priority === "high" && (
                        <span className={`text-[10px] font-bold ${PRIORITY_LABELS.high.color}`}>●</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{loi.funder_name}</p>
                    {loi.amount_requested > 0 && (
                      <p className="text-[10px] font-medium text-foreground mt-1">
                        ${(loi.amount_requested / 1000).toFixed(0)}K requested
                      </p>
                    )}
                    {loi.opportunity_type === "award" && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-700 mt-1">
                        <Trophy className="w-2.5 h-2.5" /> Award
                      </span>
                    )}
                    {loi.deadline && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Due: {new Date(loi.deadline).toLocaleDateString()}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1.5">
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                        {GRANT_CATEGORY_LABELS[loi.grant_category]?.split(" ")[0]}
                      </Badge>
                    </div>
                    {/* Stage mover */}
                    <select
                      value={loi.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => moveStage(loi.id, e.target.value)}
                      className="w-full mt-2 text-[10px] border rounded px-1 py-0.5 bg-background"
                    >
                      {LOI_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </div>
                ))}
                {(!grouped[stage.key] || grouped[stage.key].length === 0) && (
                  <p className="text-[10px] text-muted-foreground/60 text-center py-4">No LOIs</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grant Library / New LOI Modal */}
      {showLibrary && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowLibrary(false)}>
          <div className="bg-background rounded-lg max-w-3xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Grant Library
                </h3>
                <p className="text-xs text-muted-foreground">Pre-identified grants RallyPack qualifies for — start a draft LOI from any.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowLibrary(false)}>✕</Button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex flex-wrap gap-2 items-center">
                <Search className="w-4 h-4 text-muted-foreground" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="text-sm border rounded px-2 py-1 bg-background"
                >
                  <option value="all">All Types</option>
                  <option value="grant">Grants</option>
                  <option value="award">Awards</option>
                </select>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="text-sm border rounded px-2 py-1 bg-background"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(GRANT_CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <Button variant="outline" size="sm" onClick={createBlank} disabled={creating} className="ml-auto">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Blank LOI
                </Button>
              </div>
              {filteredLibrary.map((grant, i) => (
                <Card key={i} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-foreground">{grant.grant_name}</p>
                      <p className="text-xs text-muted-foreground">{grant.funder_name}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <Badge variant="secondary" className="text-[10px]">
                          {GRANT_CATEGORY_LABELS[grant.grant_category]}
                        </Badge>
                        {grant.opportunity_type === "award" ? (
                          <Badge className="text-[10px] bg-amber-100 text-amber-800 hover:bg-amber-100">
                            <Trophy className="w-2.5 h-2.5 mr-0.5" /> Award
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            ${grant.amount_requested.toLocaleString()} requested
                          </span>
                        )}
                        {grant.priority === "high" && (
                          <span className={`text-[10px] font-semibold ${PRIORITY_LABELS.high.color}`}>High Priority</span>
                        )}
                      </div>
                      {grant.loi_sections?.need && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{grant.loi_sections.need}</p>
                      )}
                    </div>
                    <Button size="sm" onClick={() => startFromLibrary(grant)} disabled={creating}>
                      <FileText className="w-3.5 h-3.5 mr-1" /> Start LOI
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Draft Editor */}
      {editing && (
        <GrantLOIEditor
          loi={editing}
          open={!!editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}