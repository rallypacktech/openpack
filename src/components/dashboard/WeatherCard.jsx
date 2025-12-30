import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudSun, AlertTriangle, Thermometer, Wind } from "lucide-react";

export default function WeatherCard({ weather, alerts }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Current Weather & Alerts</CardTitle>
          <CloudSun className="w-5 h-5 text-blue-500" />
        </div>
      </CardHeader>
      <CardContent>
        {weather ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-4xl font-bold text-gray-900">{weather.temperature}{weather.unit || "°C"}</p>
                <p className="text-gray-500">{weather.description}</p>
                {weather.highLow && (
                  <p className="text-sm text-gray-400 mt-1">{weather.highLow}</p>
                )}
              </div>
              <div className="text-right text-sm text-gray-500 space-y-1">
                <div className="flex items-center gap-1 justify-end">
                  <Thermometer className="w-4 h-4" />
                  <span>Feels {weather.feelsLike}{weather.unit || "°C"}</span>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <Wind className="w-4 h-4" />
                  <span>{weather.wind}</span>
                </div>
                {weather.humidity && (
                  <div className="flex items-center gap-1 justify-end">
                    <span>💧 {weather.humidity}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Alerts */}
            {alerts && alerts.length > 0 && (
              <div className="space-y-2 mt-4">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      alert.severity === "warning"
                        ? "bg-orange-100 border border-orange-200"
                        : "bg-red-100 border border-red-200"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                        alert.severity === "warning" ? "text-orange-600" : "text-red-600"
                      }`} />
                      <div>
                        <p className={`font-medium ${
                          alert.severity === "warning" ? "text-orange-800" : "text-red-800"
                        }`}>
                          {alert.title}
                        </p>
                        <p className={`text-sm ${
                          alert.severity === "warning" ? "text-orange-700" : "text-red-700"
                        }`}>
                          {alert.message}
                        </p>
                        {alert.validUntil && (
                          <p className={`text-xs mt-1 ${
                            alert.severity === "warning" ? "text-orange-600" : "text-red-600"
                          }`}>
                            Valid until {alert.validUntil}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CloudSun className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Set your location in Settings to see weather data</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}