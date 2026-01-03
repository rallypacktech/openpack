import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Bell, ShoppingCart, AlertTriangle, Info, CheckCircle } from "lucide-react";

export default function NotificationsList({ notifications, onViewAll }) {
  const navigate = useNavigate();
  
  const typeConfig = {
    alert: { icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-50" },
    warning: { icon: AlertTriangle, color: "text-yellow-600", bgColor: "bg-yellow-50" },
    info: { icon: Info, color: "text-blue-600", bgColor: "bg-blue-50" },
    success: { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50" }
  };
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Notifications</CardTitle>
          <Button variant="link" size="sm" onClick={onViewAll} className="text-blue-600">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {notifications && notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.slice(0, 5).map((notification, index) => {
              const Icon = typeConfig[notification.type]?.icon || Info;
              return (
                <div key={notification.id || index} className="p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${typeConfig[notification.type]?.bgColor || 'bg-blue-50'}`}>
                      <Icon className={`w-4 h-4 ${typeConfig[notification.type]?.color || 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      {notification.recommendation && (
                        <Button 
                          size="sm" 
                          className="mt-2 bg-blue-600 hover:bg-blue-700"
                          onClick={() => navigate(createPageUrl("Shopping"))}
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Shop Now
                        </Button>
                      )}
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}