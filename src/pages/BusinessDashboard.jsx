import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Shield, MapPin, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import OrgMembersPanel from "@/components/business/OrgMembersPanel";
import EvacuationPlanPanel from "@/components/business/EvacuationPlanPanel";
import BusinessKitsPanel from "@/components/business/BusinessKitsPanel";
import BusinessSubscriptionPanel from "@/components/business/BusinessSubscriptionPanel";

export default function BusinessDashboard() {
  const [subscription, setSubscription] = useState(null);
  const [members, setMembers] = useState([]);
  const [kits, setKits] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const me = await base44.auth.me();
    setUser(me);

    const [subs, membersData, caches, plansData] = await Promise.all([
      base44.entities.BusinessSubscription.list(),
      base44.entities.OrganizationMember.list(),
      base44.entities.EmergencyCache.list(),
      base44.entities.EvacuationPlan.list(),
    ]);

    const activeSub = subs.find(s => s.status === "active" || s.status === "trialing") || subs[0] || null;
    setSubscription(activeSub);
    setMembers(membersData);
    setKits(caches);
    setPlans(plansData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  const tierColor = { active: "bg-green-100 text-green-800", trialing: "bg-blue-100 text-blue-800", past_due: "bg-yellow-100 text-yellow-800", cancelled: "bg-red-100 text-red-800" };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            {subscription?.organization_name || "Business Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your organization's emergency preparedness</p>
        </div>
        {subscription && (
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${tierColor[subscription.status] || ""}`}>
              {subscription.status}
            </span>
            <Badge variant="outline" className="capitalize">{subscription.tier} plan</Badge>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary/60" />
            <div>
              <div className="text-2xl font-bold">{members.length}</div>
              <div className="text-xs text-muted-foreground">Members</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary/60" />
            <div>
              <div className="text-2xl font-bold">{kits.length} / {subscription?.max_first_aid_kits || 5}</div>
              <div className="text-xs text-muted-foreground">Kits Tracked</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-primary/60" />
            <div>
              <div className="text-2xl font-bold">{plans.length}</div>
              <div className="text-xs text-muted-foreground">Evacuation Plans</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-500/60" />
            <div>
              <div className="text-2xl font-bold">{members.filter(m => m.status === "active").length}</div>
              <div className="text-xs text-muted-foreground">Active Members</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members">
        <TabsList className="mb-4">
          <TabsTrigger value="members">Members & Alerts</TabsTrigger>
          <TabsTrigger value="kits">First Aid Kits</TabsTrigger>
          <TabsTrigger value="evacuation">Evacuation Plans</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <OrgMembersPanel subscription={subscription} members={members} onRefresh={loadAll} />
        </TabsContent>
        <TabsContent value="kits">
          <BusinessKitsPanel subscription={subscription} kits={kits} onRefresh={loadAll} />
        </TabsContent>
        <TabsContent value="evacuation">
          <EvacuationPlanPanel subscription={subscription} plans={plans} onRefresh={loadAll} />
        </TabsContent>
        <TabsContent value="subscription">
          <BusinessSubscriptionPanel subscription={subscription} onRefresh={loadAll} />
        </TabsContent>
      </Tabs>
    </div>
  );
}