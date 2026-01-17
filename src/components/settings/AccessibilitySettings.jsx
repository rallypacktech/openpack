import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye, Type, Zap } from "lucide-react";
import { useAccessibility } from "../AccessibilityProvider";

export default function AccessibilitySettings() {
  const {
    highContrast,
    toggleHighContrast,
    fontSize,
    changeFontSize,
    reducedMotion,
    toggleReducedMotion
  } = useAccessibility();

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Accessibility Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* High Contrast Mode */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-3 flex-1">
            <Eye className="w-5 h-5 text-gray-600 mt-1" />
            <div>
              <Label htmlFor="high-contrast" className="font-medium cursor-pointer">
                High Contrast Mode
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Increases color contrast for better visibility. Helpful for users with low vision or color blindness.
              </p>
            </div>
          </div>
          <Switch
            id="high-contrast"
            checked={highContrast}
            onCheckedChange={toggleHighContrast}
            aria-label="Toggle high contrast mode"
          />
        </div>

        {/* Text Size */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Type className="w-5 h-5 text-gray-600" />
            <div>
              <Label className="font-medium">Text Size</Label>
              <p className="text-sm text-gray-500 mt-1">
                Adjust text size for better readability
              </p>
            </div>
          </div>
          <div className="flex gap-2" role="group" aria-label="Text size options">
            <Button
              variant={fontSize === 'small' ? 'default' : 'outline'}
              onClick={() => changeFontSize('small')}
              className="flex-1"
              aria-pressed={fontSize === 'small'}
            >
              Small
            </Button>
            <Button
              variant={fontSize === 'normal' ? 'default' : 'outline'}
              onClick={() => changeFontSize('normal')}
              className="flex-1"
              aria-pressed={fontSize === 'normal'}
            >
              Normal
            </Button>
            <Button
              variant={fontSize === 'large' ? 'default' : 'outline'}
              onClick={() => changeFontSize('large')}
              className="flex-1"
              aria-pressed={fontSize === 'large'}
            >
              Large
            </Button>
            <Button
              variant={fontSize === 'xlarge' ? 'default' : 'outline'}
              onClick={() => changeFontSize('xlarge')}
              className="flex-1"
              aria-pressed={fontSize === 'xlarge'}
            >
              X-Large
            </Button>
          </div>
        </div>

        {/* Reduced Motion */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-3 flex-1">
            <Zap className="w-5 h-5 text-gray-600 mt-1" />
            <div>
              <Label htmlFor="reduced-motion" className="font-medium cursor-pointer">
                Reduce Motion
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Minimizes animations and transitions. Helpful for users sensitive to motion or with vestibular disorders.
              </p>
            </div>
          </div>
          <Switch
            id="reduced-motion"
            checked={reducedMotion}
            onCheckedChange={toggleReducedMotion}
            aria-label="Toggle reduced motion"
          />
        </div>

        {/* Screen Reader Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Screen Reader Support</h3>
          <p className="text-sm text-gray-700">
            This application is optimized for screen readers including JAWS, NVDA, and VoiceOver. 
            All interactive elements are keyboard accessible using Tab, Enter, and Arrow keys.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}