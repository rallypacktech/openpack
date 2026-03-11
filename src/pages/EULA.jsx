import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertTriangle, Shield } from "lucide-react";

export default function EULA() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-700 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">BETA TEST IN PROGRESS</h3>
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>What is a Beta?</strong> RallyPack is currently in beta testing. This means the app is still under development,
                  features may change, and some functionality may be incomplete or experimental.
                </p>
                <p className="text-sm text-yellow-800">
                  <strong>Send Feedback:</strong>{" "}
                  <a href="mailto:beta@rallypack.org" className="underline font-semibold">beta@rallypack.org</a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">End User License Agreement (EULA)</h1>
          </div>
          <p className="text-gray-500">Effective Date: March 11, 2026</p>
          <p className="text-gray-500">Last Updated: March 11, 2026</p>
          <p className="text-gray-500 mt-1">Version: 1.0</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>1. Grant of License</CardTitle></CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Subject to your acceptance of and compliance with this End User License Agreement ("EULA"),
                RallyPack ("we", "us", "our") grants you a limited, non-exclusive, non-transferable,
                revocable license to access and use the RallyPack application ("the App") solely for your
                personal, non-commercial emergency preparedness purposes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>2. Restrictions</CardTitle></CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>You may not:</p>
              <ul>
                <li>Copy, modify, or distribute the App or its content without written permission</li>
                <li>Reverse engineer, decompile, or disassemble any part of the App</li>
                <li>Use the App to develop competing products or services</li>
                <li>Sublicense, sell, resell, transfer, assign, or commercially exploit the App</li>
                <li>Remove or alter any proprietary notices, labels, or marks on the App</li>
                <li>Use the App in any manner that could disable, overburden, or impair our servers</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>3. Intellectual Property</CardTitle></CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                The App and all of its content, features, and functionality (including but not limited to
                all information, software, text, displays, images, and the design, selection, and arrangement
                thereof) are owned by RallyPack, its licensors, or other providers and are protected by
                copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
              </p>
              <p className="mt-2">
                Your User Content remains your property. By submitting User Content, you grant us a
                worldwide, royalty-free license to use, reproduce, process, and display it solely for the
                purpose of providing and improving the Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>4. Updates & Modifications</CardTitle></CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul>
                <li>We may update the App and this EULA from time to time</li>
                <li>Continued use of the App after an update constitutes acceptance of the revised EULA</li>
                <li>We will notify users of material changes via in-app notification or email</li>
                <li>We reserve the right to modify, suspend, or discontinue the App at any time</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                5. Disclaimer of Warranties
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="font-semibold">
                THE APP IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. TO THE FULLEST EXTENT PERMITTED BY LAW,
                WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
                MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p className="mt-2">
                We do not warrant that the App will be error-free, secure, uninterrupted, or that defects will be corrected.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                6. Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL RALLYPACK BE LIABLE FOR
                ANY INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
                LOSS OF PROFITS, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO
                OR USE OF (OR INABILITY TO ACCESS OR USE) THE APP.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>7. Termination</CardTitle></CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                This EULA is effective until terminated. Your rights under this EULA will terminate automatically
                if you fail to comply with any of its terms. Upon termination, you must cease all use of the App.
                We may also terminate or suspend your access at any time for violations of this EULA or our
                Terms and Conditions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>8. Governing Law</CardTitle></CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                This EULA is governed by and construed in accordance with applicable law. Any disputes arising
                under this EULA shall be subject to binding arbitration as described in our Terms and Conditions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>9. Contact</CardTitle></CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>For questions regarding this EULA:</p>
              <p className="mt-2">
                <strong>Email:</strong> legal@rallypack.tech<br />
                <strong>Support:</strong> gearup@rallypack.tech
              </p>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-gray-500">© 2026 RallyPack. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}