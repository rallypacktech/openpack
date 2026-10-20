import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, AlertTriangle, Shield, Eye, FileText } from "lucide-react";

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
                  <a href="mailto:beta@rallypack.tech" className="underline font-semibold">beta@rallypack.tech</a>
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
          <p className="text-gray-500">Effective Date: October 20, 2026</p>
          <p className="text-gray-500">Last Updated: October 20, 2026</p>
          <p className="text-gray-500 mt-1">Version: 2.0</p>
        </div>

        <div className="space-y-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                What changed in Version 2.0 (October 20, 2026)
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul>
                <li><strong>Organization affiliations are now covered.</strong> An account can belong to a household and to one or more organizations. Section 5 has been renamed and extended so the sharing rules apply to organization members and their roles, not only to households.</li>
                <li><strong>Business compliance documents are named as Confidential Information.</strong> Certificates, service reports, inspection records and the staff or equipment details they relate to are now explicitly protected under Section 2.</li>
                <li><strong>Referral and community submissions are addressed.</strong> Section 2 now distinguishes what you publish deliberately (drill listings, needs board posts) from what stays confidential, so the two are not confused.</li>
                <li><strong>Auditable sharing is stated.</strong> Access to shared records is scoped by role and the person granting access is accountable for it, as set out in Section 5.</li>
              </ul>
            </CardContent>
          </Card>
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
                <li>Status alert channel connections — Telegram chat identifiers and Discord webhook URLs you have configured</li>
                <li>Business compliance records, including staff certifications, equipment details, inspection dates, and the contents of any certificate, service report or inspection record you upload</li>
                <li>Organization membership details, including which members belong to an organization and the role each holds</li>
                <li>Contact and feedback messages sent to our team, and business referrals you submit</li>
              </ul>

              <p className="font-semibold mt-4">What is not Confidential Information:</p>
              <p>
                Information you deliberately publish is not confidential. Community drill listings you submit, needs
                board posts you choose to share with organizations, and the anonymized regional aggregates shown on
                the readiness map are public or shared by design. Everything else listed above remains confidential.
              </p>
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
                5. Family, Household & Organization Data Sharing
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

              <h3 className="font-semibold mt-4">Keeping your own plan under your own control:</h3>
              <ul>
                <li>Accepting shared access to another person's plan gives you a view of that plan. It does not merge, copy or duplicate it, and it does not take your own plan away from you</li>
                <li>You remain the owner of your own records at all times, and can leave a shared plan without losing anything of your own</li>
                <li>The person who granted access controls what is shared and can withdraw it at any time</li>
              </ul>

              <h3 className="font-semibold mt-4">Organization affiliations and roles:</h3>
              <ul>
                <li>An account may hold a household context and one or more organization affiliations at the same time. Data entered in one context is not automatically visible in another</li>
                <li>Access to an organization's records is scoped by the role granted to each member. Members see only what their role permits</li>
                <li>Who granted access, to whom, and in what role is recorded, so sharing within an organization stays auditable</li>
                <li>The account owner is accountable for the members they invite and the roles they assign, and must remove access when a person no longer needs it</li>
                <li>Compliance records about a named staff member belong to the organization, not to the individual's personal account, and are handled under the organization's instructions</li>
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