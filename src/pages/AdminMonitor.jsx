import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Users, Circle, Clock, User, Mail, ClipboardList, Map, Building2, ShieldCheck, Flame, FileText, Sparkles } from "lucide-react";
import QuizResultsTable from "../components/admin/QuizResultsTable";
import IncidentsPanel from "../components/admin/IncidentsPanel";
import BusinessReferralsPanel from "../components/admin/BusinessReferralsPanel";
import AlertDelegationsPanel from "../components/admin/AlertDelegationsPanel";
import AlertSubmissionsPanel from "../components/admin/AlertSubmissionsPanel";
import GrantLOIWorkflow from "../components/admin/GrantLOIWorkflow";
import CauseCleanupPanel from "../components/admin/CauseCleanupPanel";

export default function AdminMonitor() {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [needHelpUsers, setNeedHelpUsers] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // Get all user profiles
      const profiles = await base44.asServiceRole.entities.UserProfile.list();
      setAllProfiles(profiles);

      // Filter users who need assistance
      const needHelp = profiles.filter(p => p.current_status === 'needs_assistance');
      setNeedHelpUsers(needHelp);

      // Calculate online users (active in last 5 minutes via heartbeat)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const online = profiles.filter(p => {
        if (!p.last_active) return false;
        return new Date(p.last_active) > fiveMinutesAgo;
      });
      setOnlineUsers(online);
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">System Monitor</h1>
              <p className="text-blue-100 mt-1">Live user activity and emergency status</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <Circle className="w-3 h-3 fill-green-400 text-green-400 animate-pulse" />
                <span className="font-medium">Live</span>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <div className="text-sm text-blue-100">Auto-refresh</div>
                <div className="font-bold">10s</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" /> User Monitor
            </TabsTrigger>
            <TabsTrigger value="incidents" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Incidents
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" /> Quiz Results
            </TabsTrigger>
            <TabsTrigger value="delegations" className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Alert Delegations
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" /> Alert Submissions
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Referrals
            </TabsTrigger>

            <TabsTrigger value="grants" className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Grants & LOI
            </TabsTrigger>
            <TabsTrigger value="causes" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Cleanup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incidents">
            <IncidentsPanel />
          </TabsContent>

          <TabsContent value="quiz">
            <QuizResultsTable />
          </TabsContent>

          <TabsContent value="referrals">
            <BusinessReferralsPanel />
          </TabsContent>

          <TabsContent value="delegations">
            <AlertDelegationsPanel />
          </TabsContent>

          <TabsContent value="submissions">
            <AlertSubmissionsPanel />
          </TabsContent>



          <TabsContent value="grants">
            <GrantLOIWorkflow />
          </TabsContent>

          <TabsContent value="causes">
            <CauseCleanupPanel />
          </TabsContent>

          <TabsContent value="users">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{allProfiles.length}</div>
              <p className="text-sm text-gray-500 mt-1">Registered profiles</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <Circle className="w-3 h-3 fill-green-500 text-green-500" />
                Online Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{onlineUsers.length}</div>
              <p className="text-sm text-green-600 mt-1">Active in last 5 minutes</p>
            </CardContent>
          </Card>

          <Card className={needHelpUsers.length > 0 ? "border-red-500 bg-red-50 animate-pulse" : "border-gray-200"}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-sm font-medium flex items-center gap-2 ${needHelpUsers.length > 0 ? 'text-red-700' : 'text-gray-600'}`}>
                <AlertTriangle className={`w-4 h-4 ${needHelpUsers.length > 0 ? 'text-red-500' : ''}`} />
                Need Help
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${needHelpUsers.length > 0 ? 'text-red-900' : 'text-gray-900'}`}>
                {needHelpUsers.length}
              </div>
              <p className={`text-sm mt-1 ${needHelpUsers.length > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                {needHelpUsers.length > 0 ? 'Requires immediate attention!' : 'All users safe'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Users Needing Help - Priority Alert */}
        {needHelpUsers.length > 0 && (
          <Card className="border-4 border-red-500 mb-8">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                URGENT: Users Requesting Assistance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {needHelpUsers.map((profile) => (
                  <div key={profile.id} className="bg-white border-2 border-red-300 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {profile.display_name || profile.created_by}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-3 h-3" />
                              {profile.created_by}
                            </div>
                          </div>
                        </div>
                        
                        {profile.street_address && (
                          <div className="bg-gray-50 rounded px-3 py-2 mb-2">
                            <p className="text-sm text-gray-700">
                              <strong>Location:</strong> {profile.street_address}, {profile.city}, {profile.state_province}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {profile.household_size && (
                            <div>
                              <span className="text-gray-600">Household:</span>
                              <span className="ml-2 font-medium">{profile.household_size} people</span>
                            </div>
                          )}
                          {profile.has_pets && (
                            <div>
                              <Badge variant="outline" className="bg-blue-50">Has Pets</Badge>
                            </div>
                          )}
                        </div>

                        {profile.status_updated_at && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-3 h-3" />
                            Status updated {getTimeAgo(profile.status_updated_at)}
                          </div>
                        )}
                      </div>

                      <Badge className="bg-red-600 text-white">NEEDS HELP</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Online Users - Greenlight System */}
        <Card>
          <CardHeader className="bg-green-50">
            <CardTitle className="text-green-900 flex items-center gap-2">
              <Circle className="w-4 h-4 fill-green-500 text-green-500 animate-pulse" />
              Currently Online Users
            </CardTitle>
            <p className="text-sm text-green-700 mt-1">
              ⚠️ Users active in the last 5 minutes - be cautious when making system changes
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {onlineUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Circle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No users currently active</p>
                <p className="text-sm mt-1">Safe to make system changes</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {onlineUsers.map((profile) => (
                  <div key={profile.id} className="border border-green-200 bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {profile.display_name || 'User'}
                        </p>
                        <p className="text-xs text-gray-600 truncate">{profile.created_by}</p>
                        
                        <div className="mt-2 flex items-center gap-1">
                          <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                          <span className="text-xs text-green-600 font-medium">
                            Active {getTimeAgo(profile.last_active)}
                          </span>
                        </div>

                        {profile.current_status && (
                          <Badge 
                            className={`mt-2 text-xs ${
                              profile.current_status === 'safe' ? 'bg-green-100 text-green-800' :
                              profile.current_status === 'needs_assistance' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {profile.current_status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}