import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StatsCard({ title, count, subtitle, icon: Icon, onView }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Icon className="w-5 h-5 text-gray-600" />
            </div>
            <span className="font-semibold text-gray-900">{title}</span>
          </div>
          <Button variant="outline" size="sm" onClick={onView}>
            View
          </Button>
        </div>
        <p className="text-3xl font-bold text-gray-900 mb-1">{count}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </CardContent>
    </Card>
  );
}