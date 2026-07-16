import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, Users, Shield, MapPin, AlertTriangle, CheckCircle2, Clock, Flame, Zap } from "lucide-react";
import OrgMembersPanel from "@/components/business/OrgMembersPanel";
import EvacuationPlanPanel from "@/components/business/EvacuationPlanPanel";
import BusinessKitsPanel from "@/components/business/BusinessKitsPanel";
import BusinessSubscriptionPanel from "@/components/business/BusinessSubscriptionPanel";
import AlertSubmissionForm from "@/components/business/AlertSubmissionForm";
import ContactAdminForm from "@/components/business/ContactAdminForm";
import WildfireTimeline from "@/components/admin/WildfireTimeline";
import HolidayFireworkCorrelation from "@/components/admin/HolidayFireworkCorrelation";
import ProfessionalUpgradeCard from "@/components/business/ProfessionalUpgradeCard";

export default function BusinessDashboard() {
  const [subscription, setSubscription] = useState(null);
  const [members, setMembers] = useState([]);
  const [kits, setKits] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [hasDelegation, setHasDelegation] = useState(false);
  const [showProUpgrade, setShowProUpgrade] = useState(false);

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

    let activeSub;
    if (me.role === "admin") {
      const myActiveSub = subs.find(s => s.owner_email === me.email && (s.status === "active" || s.status === "trialing"));
      if (myActiveSub) {
        activeSub = myActiveSub;
      } else {
        activeSub = await base44.entities.BusinessSubscription.create({
          organization_name: "RallyPack Admin",
          owner_email: me.email,
          status: "active",
          tier: "enterprise",
          max_first_aid_kits: 999,
          max_members: 999,
          alert_incidents_included: -1,
          alert_sending_enabled: true,
        });
      }
    } else {
      activeSub = subs.find(s => s.status === "active" || s.status === "trialing") || subs[0] || null;
    }
    setSubscription(activeSub);
    setMembers(membersData);
    setKits(caches);
    setPlans(plansData);

    // Check if this user is authorized to send delegated alerts
    try {
      const delegations = await base44.entities.AlertDelegation.filter({});
      setHasDelegation(delegations.length > 0);
    } catch (e) {
      setHasDelegation(false);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  // Lock business features for users without an active/trialing subscription
  const isSubscribed = subscription && (subscription.status === "active" || subscription.status === "trialing");
  const isAdmin = user?.role === "admin";
  if (!isSubscribed && !isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Building2 className="w-12 h-12 text-primary/40 mx-auto mb-4" />
        <h1 className="font-serif text-3xl font-bold text-foreground mb-3">Business Features</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
          Team member tracking, first aid kit management, chain-of-command alerts, and evacuation planning are available on a Business subscription.
        </p>
        <ProfessionalUpgradeCard organizationName={subscription?.organization_name} onSubscribed={loadAll} />
        <p className="text-xs text-muted-foreground mt-6">
          Looking for other plans?{" "}
          <button
            onClick={() => setSubscription({ id: null, organization_name: "", status: null, tier: "basic" })}
            className="underline hover:text-foreground"
          >
            View all tiers
          </button>
        </p>
        {subscription?.id === null && (
          <div className="mt-10 text-left">
            <BusinessSubscriptionPanel subscription={null} onRefresh={loadAll} />
          </div>
        )}
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
            {isAdmin && !subscription?.stripe_subscription_id && (
              <Badge className="bg-green-100 text-green-800">Free Admin</Badge>
            )}
          </div>
        )}
      </div>

      {/* Professional upsell for basic-tier users */}
      {subscription?.tier === "basic" && (
        <div className="mb-6 bg-primary/5 border border-primary/20 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-foreground text-sm">Unlock Professional features</p>
              <p className="text-xs text-muted-foreground">More kits, more members, emergency alert sending, and priority support.</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setShowProUpgrade(true)} className="shrink-0">
            <Zap className="w-3.5 h-3.5 mr-1" /> Upgrade
          </Button>
        </div>
      )}

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
          {hasDelegation && <TabsTrigger value="alerts">Emergency Alerts</TabsTrigger>}
          <TabsTrigger value="wildfire">Wildfire History</TabsTrigger>
          <TabsTrigger value="contact">Contact Admin</TabsTrigger>
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
        {hasDelegation && (
          <TabsContent value="alerts">
            <AlertSubmissionForm />
          </TabsContent>
        )}
        <TabsContent value="subscription">
          <BusinessSubscriptionPanel subscription={subscription} onRefresh={loadAll} />
        </TabsContent>
        <TabsContent value="contact">
          <ContactAdminForm organizationName={subscription?.organization_name} />
        </TabsContent>
        <TabsContent value="wildfire">
          <div className="space-y-6">
            <WildfireTimeline showIncidentList={true} />
            <HolidayFireworkCorrelation />
          </div>
        </TabsContent>
      </Tabs>

      {/* Professional upgrade dialog for basic-tier users */}
      <Dialog open={showProUpgrade} onOpenChange={setShowProUpgrade}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Upgrade to Professional</DialogTitle>
          </DialogHeader>
          <ProfessionalUpgradeCard
            organizationName={subscription?.organization_name}
            onSubscribed={() => {
              setShowProUpgrade(false);
              loadAll();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}