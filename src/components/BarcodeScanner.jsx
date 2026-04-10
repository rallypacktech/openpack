import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";

const isMobile = () => /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);

export default function BarcodeScanner({ onDetected, onClose }) {
  const [status, setStatus] = useState("idle"); // idle | starting | scanning | error
  const [errorMsg, setErrorMsg] = useState("");
  const videoRef = useRef(null);
  const cleanupRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    startScanner();
    return () => cleanup();
  }, []);

  const cleanup = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (cleanupRef.current) cleanupRef.current();
  };

  const startScanner = async () => {
    setStatus("starting");
    try {
      if (isMobile()) {
        await startQuagga();
      } else {
        await startDesktop();
      }
    } catch (err) {
      console.error("Scanner error:", err);
      setErrorMsg(err?.message || "Could not start camera. Try entering barcode manually.");
      setStatus("error");
    }
  };

  const startDesktop = async () => {
    const { WebcamBarcodeScanner } = await import("@point-of-sale/webcam-barcode-scanner");

    const scanner = new WebcamBarcodeScanner({
      allowedSymbologies: ["ean13", "ean8", "upca", "upce"],
      resolution: { width: 1920, height: 1080 },
      preview: { enabled: true },
      debug: false,
    });

    await scanner.open();
    setStatus("scanning");

    // Attach preview to video element
    if (videoRef.current && scanner.videoElement) {
      videoRef.current.replaceWith(scanner.videoElement);
    }

    scanner.addEventListener("barcode", (e) => {
      cleanup();
      onDetected(e.detail?.value || e.detail?.barcode || "");
    });

    timeoutRef.current = setTimeout(() => {
      cleanup();
      setErrorMsg("Scan timed out after 60 seconds.");
      setStatus("error");
    }, 60000);

    cleanupRef.current = () => {
      try { scanner.close(); } catch {}
    };
  };

  const startQuagga = () => {
    return new Promise((resolve, reject) => {
      import("quagga").then(({ default: Quagga }) => {
        if (!videoRef.current) return reject(new Error("No video element"));

        const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

        Quagga.init(
          {
            inputStream: {
              type: "LiveStream",
              target: videoRef.current,
              constraints: { facingMode: "environment" },
            },
            decoder: {
              readers: ["ean_reader", "ean_8_reader", "upc_reader", "upc_e_reader", "code_128_reader", "code_39_reader"],
            },
            numOfWorkers: isIOS ? 0 : navigator.hardwareConcurrency || 2,
            frequency: isIOS ? 10 : 5,
          },
          (err) => {
            if (err) return reject(err);
            Quagga.start();
            setStatus("scanning");
            resolve();
          }
        );

        Quagga.onDetected((result) => {
          const code = result?.codeResult?.code;
          if (code) {
            cleanup();
            onDetected(code);
          }
        });

        timeoutRef.current = setTimeout(() => {
          cleanup();
          setErrorMsg("Scan timed out after 30 seconds.");
          setStatus("error");
        }, 30000);

        cleanupRef.current = () => {
          try { Quagga.stop(); } catch {}
        };
      }).catch(reject);
    });
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  return (
    <div className="space-y-3">
      {(status === "idle" || status === "starting") && (
        <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
          <div className="text-center text-gray-500">
            <Camera className="w-8 h-8 mx-auto mb-2 animate-pulse" />
            <p className="text-sm">Starting camera…</p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {errorMsg || "Camera error. Please enter barcode manually."}
        </div>
      )}

      {/* Camera preview container */}
      <div
        className={`relative rounded-lg overflow-hidden bg-black ${status === "scanning" ? "block" : "hidden"}`}
        style={{ minHeight: "240px" }}
      >
        <video
          ref={videoRef}
          className="w-full"
          autoPlay
          muted
          playsInline
        />
        {/* Aim guide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="border-2 border-white border-dashed rounded w-3/4 h-1/2 opacity-60" />
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={handleClose}>
        <X className="w-4 h-4 mr-2" />
        Cancel Scanner
      </Button>
    </div>
  );
}