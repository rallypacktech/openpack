import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Apple, Share, MoreVertical, ExternalLink, CheckCircle } from "lucide-react";

export default function AddToHomeScreen({ embedded = false }) {
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

        {embedded ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
            <div className="text-sm text-emerald-900">
              <p className="font-semibold">You're already on the Offline page</p>
              <p className="text-xs text-emerald-700 mt-0.5">Your address bar shows <strong className="font-mono">rallypack.org/offline</strong> — the correct URL. Follow the steps below to save it to your home screen.</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-0.5">Step 0: Open the Offline page first</p>
              <p className="text-xs text-gray-500 font-mono break-all">https://www.rallypack.org/offline</p>
              <p className="text-xs text-gray-500 mt-1">The home screen bookmark saves whatever URL is in your address bar — so make sure it shows <strong>/offline</strong> before you add it. This button opens a fresh page load at that URL.</p>
            </div>
            <a href="/offline" className="shrink-0">
              <Button variant="default" size="sm" className="gap-2">
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                Open Offline Page
              </Button>
            </a>
          </div>
        )}

        {/* iOS Instructions */}
        <div className="bg-gray-50 rounded-lg p-5 space-y-3">
          <h3 className="font-semibold flex items-center gap-2 text-gray-900">
            <Apple className="w-4 h-4" aria-hidden="true" />
            iPhone & iPad (Safari)
          </h3>
          <ol className="space-y-2.5 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center">1</span>
              <span>If you used the "Open Offline Page" button above, the page has reloaded at the correct address. Check that your address bar shows <strong className="font-mono">rallypack.org/offline</strong>.</span>
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
              <span>Confirm the URL field shows <strong className="font-mono">rallypack.org/offline</strong> (you can't edit it), then tap <strong>"Add"</strong>.</span>
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
              <span>If you used the "Open Offline Page" button above, the page has reloaded at the correct address. Check that your address bar shows <strong className="font-mono">rallypack.org/offline</strong>.</span>
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