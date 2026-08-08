import React, { useState } from "react";
import { AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";

export default function EvacuationAlertInfo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-amber-200 rounded-lg overflow-hidden mb-6 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-amber-50 border-b border-amber-200"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700" />
          <span className="font-sans font-semibold text-amber-900 text-sm">
            Know the difference: Evacuation Warnings vs. Evacuation Orders
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-amber-700" />
        ) : (
          <ChevronDown className="w-4 h-4 text-amber-700" />
        )}
      </button>

      {open && (
        <div className="p-5 space-y-4">
          <div className="flex gap-3 items-start">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-sans font-semibold text-foreground mb-1 text-sm">
                Evacuation Warning (Voluntary / Advisory)
              </h3>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                An evacuation <strong>warning</strong> — sometimes called an advisory or
                voluntary evacuation — means conditions are developing that{" "}
                <em>may</em> threaten your area soon. This is your window to{" "}
                <strong>prepare to leave</strong>: pack your go-bag, load your vehicle,
                gather pets and important documents, secure your home, and monitor
                official channels. Leaving at this stage is voluntary but strongly
                recommended, especially if you have mobility issues, medical needs, or
                large animals that take time to transport.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-sans font-semibold text-foreground mb-1 text-sm">
                Evacuation Order (Mandatory)
              </h3>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                An evacuation <strong>order</strong> — a mandatory evacuation — means there
                is an <strong>immediate threat to life</strong>. You must leave the area{" "}
                <strong>right now</strong>. Do not delay to gather belongings. Roads may
                close behind you, and emergency responders may not be able to reach you if
                you stay. Follow designated evacuation routes and go to the nearest shelter
                or safe zone. Refusing to leave during a mandatory order puts you and first
                responders at serious risk.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900 font-sans">
            <strong>Rule of thumb:</strong> A warning is your chance to prepare; an order is
            your signal to go. Always evacuate when an order is issued. Register for your
            county's emergency alert system so you receive both levels of notification
            immediately.
          </div>
        </div>
      )}
    </div>
  );
}