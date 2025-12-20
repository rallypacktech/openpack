import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { AlertTriangle, WifiOff, Settings, Package } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      label: "Emergency Resources",
      icon: AlertTriangle,
      page: "Emergency",
      variant: "default",
      className: "bg-blue-600 hover:bg-blue-700 text-white"
    },
    {
      label: "Offline Mode",
      icon: WifiOff,
      page: "Offline",
      variant: "outline"
    },
    {
      label: "Settings",
      icon: Settings,
      page: "Settings",
      variant: "outline"
    },
    {
      label: "Manage Resources",
      icon: Package,
      page: "Resources",
      variant: "outline"
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action) => (
            <Link key={action.page} to={createPageUrl(action.page)}>
              <Button
                variant={action.variant}
                className={`w-full h-auto py-3 flex flex-col gap-2 ${action.className || ""}`}
              >
                <action.icon className="w-5 h-5" />
                <span className="text-xs">{action.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}