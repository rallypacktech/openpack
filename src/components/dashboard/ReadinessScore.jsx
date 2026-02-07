import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { Shield, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function ReadinessScore() {
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScore();
  }, []);

  const loadScore = async () => {
    try {
      const response = await base44.functions.invoke('calculateReadinessScore');
      setScoreData(response.data);
    } catch (error) {
      console.error('Error loading readiness score:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!scoreData) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-blue-600';
    if (score >= 40) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">Emergency Readiness Score</CardTitle>
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(scoreData.score)}`}>
            {scoreData.score}%
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">{scoreData.level}</span>
            <span className="text-gray-500">{scoreData.score}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(scoreData.score)}`}
              style={{ width: `${scoreData.score}%` }}
            />
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-2 pt-2 border-t">
          {Object.entries(scoreData.breakdown).map(([key, data]) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{data.label}</span>
              <span className="font-medium">
                {data.score}/{data.max}
              </span>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        {scoreData.recommendations && scoreData.recommendations.length > 0 && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold">Next Steps:</span>
            </div>
            <ul className="space-y-1">
              {scoreData.recommendations.slice(0, 3).map((rec, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}