import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, AlertTriangle, Shield, Eye } from "lucide-react";

export default function ConfidentialityAgreement() {
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
                  <strong>What is a Beta?</strong> RallyPack is currently in beta testing. Features may change
                  and some functionality is still under development.
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
            <Lock className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Confidentiality Agreement</h1>
          </div>
          <p className="text-gray-500">Effective Date: March 11, 2026</p>
          <p className="text-gray-500">Last Updated: March 11, 2026</p>
          <p className="text-gray-500 mt-1">Version: 1.0</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>1. Purpose</CardTitle></CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                This Confidentiality Agreement ("Agreement") sets forth the obligations of users of the
                RallyPack platform ("the App") regarding the protection of sensitive information accessed,
                submitted, or shared through the App. By using RallyPack, you agree to the terms of this Agreement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                2. Confidential Information Defined
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                "Confidential Information" includes all data submitted to or accessible through the App, including but not limited to:
              </p>
              <ul>
                <li>Personal identifiable information (names, addresses, contact details)</li>
                <li>Family member details, including medical conditions and emergency contacts</li>
                <li>Pet information, including microchip numbers and health data</li>
                <li>Emergency cache inventories and locations</li>
                <li>Meeting spot coordinates and descriptions</li>
                <li>Emergency plans and preparedness notes</li>
                <li>Any information shared by or about other users linked to your household</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>3. User Obligations</CardTitle></CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>As a user of RallyPack, you agree to:</p>
              <ul>
                <li>Keep all information about other users, family members, and linked households strictly confidential</li>
                <li>Not share, sell, disclose, or distribute any Confidential Information accessed through the App to unauthorized third parties</li>
                <li>Use Confidential Information solely for personal emergency preparedness purposes</li>
                <li>Take reasonable precautions to prevent unauthorized access to your account and the information accessible through it</li>
                <li>Notify RallyPack immediately if you become aware of any unauthorized disclosure of Confidential Information</li>
                <li>Not screenshot, export, or reproduce other users' personal emergency data without their explicit consent</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>4. RallyPack's Obligations</CardTitle></CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>RallyPack commits to:</p>
              <ul>
                <li>Protecting your Confidential Information using industry-standard security measures (AES-256-GCM encryption, TLS 1.3, SHA-256 hashing)</li>
                <li>Not selling your personal information to third parties</li>
                <li>Limiting access to your data to authorized personnel only, on a need-to-know basis</li>
                <li>Disclosing your information only when required by law, court order, or to protect public safety</li>
                <li>Notifying you of any material data breach affecting your information as required by applicable law</li>
                <li>Maintaining SOC 2 Type I security controls and policies</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                5. Family & Household Data Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                When you add family members or link household members to your account:
              </p>
              <ul>
                <li>You represent that you have obtained appropriate consent from adult family members before entering their information</li>
                <li>You are responsible for the accuracy and lawful submission of information about minors in your household</li>
                <li>Linked users will have access to shared emergency plans — you agree to only link individuals you trust</li>
                <li>You understand that linked users may view cache locations, meet spots, and emergency plans associated with your household</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>6. Exceptions</CardTitle></CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>Confidentiality obligations do not apply to information that:</p>
              <ul>
                <li>Is or becomes publicly available through no fault of either party</li>
                <li>Was rightfully known to you prior to disclosure through the App</li>
                <li>Is required to be disclosed by law, regulation, or court order (with prior notice to RallyPack where permitted)</li>
                <li>Is disclosed with the express written consent of the person to whom it relates</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>7. Data Retention & Deletion</CardTitle></CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Upon account deletion, your personal Confidential Information will be permanently removed within 30 days,
                subject to the limited exceptions described in our Privacy Policy (pet microchip records and
                anonymized aggregate statistics). Please refer to our{" "}
                <a href="/PrivacyPolicy" className="text-blue-600 hover:underline">Privacy Policy</a> for full details.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>8. Breach & Remedies</CardTitle></CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Any breach of this Agreement may result in immediate termination of your account and access to the App.
                RallyPack reserves the right to seek all available legal remedies for unauthorized disclosure or misuse
                of Confidential Information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>9. Contact</CardTitle></CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>For questions about this Confidentiality Agreement:</p>
              <p className="mt-2">
                <strong>Email:</strong> privacy@rallypack.tech<br />
                <strong>Data Protection Officer:</strong> dpo@rallypack.tech
              </p>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-gray-500">© 2026 RallyPack. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}