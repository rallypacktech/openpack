import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, CheckCircle } from "lucide-react";

const tips = [
  "Review and update your emergency contact list monthly to ensure all information is current",
  "Check expiration dates on food, water, and medical supplies in your emergency caches every season",
  "Practice your family emergency plan at least twice a year, including meet-up procedures"
];

export default function PreparednessTips() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Preparedness Tips</CardTitle>
          <Lightbulb className="w-5 h-5 text-yellow-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100"
            >
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-800">{tip}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}