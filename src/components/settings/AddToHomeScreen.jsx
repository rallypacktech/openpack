import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Apple, Share, MoreVertical } from "lucide-react";

export default function AddToHomeScreen() {
  return (
    <Card id="add-to-home-screen">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-gray-600" aria-hidden="true" />
          <CardTitle className="text-xl font-semibold">Add RallyPack to Your Home Screen</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-gray-600">
          You can install RallyPack as an app-style icon on your phone's home screen for one-tap access —
          especially useful for the <strong>Offline</strong> page, which works without an internet connection.
          No app store download required.
        </p>

        {/* iOS Instructions */}
        <div className="bg-gray-50 rounded-lg p-5 space-y-3">
          <h3 className="font-semibold flex items-center gap-2 text-gray-900">
            <Apple className="w-4 h-4" aria-hidden="true" />
            iPhone & iPad (Safari)
          </h3>
          <ol className="space-y-2.5 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center">1</span>
              <span>Open the <strong>Offline</strong> page in Safari (tap the button below to navigate there first).</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center">2</span>
              <span>Tap the <Share className="w-4 h-4 inline mx-0.5 -mt-0.5" aria-hidden="true" /> <strong>Share</strong> button (square with an up arrow) at the bottom of the screen.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center">3</span>
              <span>Scroll down and tap <strong>"Add to Home Screen."</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center">4</span>
              <span>Tap <strong>"Add"</strong> — the RallyPack icon will appear on your home screen for instant offline access.</span>
            </li>
          </ol>
        </div>

        {/* Android Instructions */}
        <div className="bg-gray-50 rounded-lg p-5 space-y-3">
          <h3 className="font-semibold flex items-center gap-2 text-gray-900">
            <MoreVertical className="w-4 h-4" aria-hidden="true" />
            Android (Chrome)
          </h3>
          <ol className="space-y-2.5 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center">1</span>
              <span>Open the <strong>Offline</strong> page in Chrome (tap the button below to navigate there first).</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center">2</span>
              <span>Tap the <MoreVertical className="w-4 h-4 inline mx-0.5 -mt-0.5" aria-hidden="true" /> <strong>three-dot menu</strong> in the top-right corner.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center">3</span>
              <span>Tap <strong>"Add to Home screen"</strong> (or <strong>"Install app"</strong> if prompted).</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center">4</span>
              <span>Tap <strong>"Add"</strong> — the RallyPack icon will appear on your home screen for instant offline access.</span>
            </li>
          </ol>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4" role="note">
          <p className="text-sm text-gray-700">
            <strong>Tip:</strong> Bookmarking the Offline page specifically ensures that even if cell service
            is down during a disaster, tapping the icon loads your cached emergency resources, contacts, and plans.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}