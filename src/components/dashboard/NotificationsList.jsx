import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Bell } from "lucide-react";

export default function NotificationsList({ notifications, onViewAll }) {
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
            {notifications.slice(0, 5).map((notification, index) => (
              <div
                key={notification.id || index}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-500">{notification.message}</p>
                </div>
                {notification.read && (
                  <Check className="w-4 h-4 text-gray-400 mt-1" />
                )}
              </div>
            ))}
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