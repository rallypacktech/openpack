import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertTriangle, Shield, Users } from "lucide-react";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Terms and Conditions</h1>
          </div>
          <p className="text-gray-500">Effective Date: December 27, 2025</p>
          <p className="text-gray-500">Last Updated: December 27, 2025</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agreement to Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                By accessing or using RallyPack ("the Service"), you agree to be bound by these Terms and Conditions. 
                If you do not agree to these terms, you may not use the Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Age Requirements & User Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h3 className="font-semibold">Minimum Age Requirement:</h3>
              <ul>
                <li>You must be at least <strong>13 years of age</strong> to create an account and use RallyPack</li>
                <li>Users under 13 are prohibited from registering for or using the Service</li>
                <li>By creating an account, you represent that you are at least 13 years old</li>
              </ul>

              <h3 className="font-semibold mt-4">Minors in Family Groups:</h3>
              <ul>
                <li>Users aged 13+ may add family members under 13 to their family groups for emergency planning purposes</li>
                <li>Minors under 13 added to family groups <strong>cannot create their own accounts</strong></li>
                <li>The adult user is responsible for all information entered about minors in their family group</li>
                <li>Parents/guardians must obtain appropriate consent before adding minors to the platform</li>
              </ul>

              <h3 className="font-semibold mt-4">Parental Consent:</h3>
              <ul>
                <li>Users aged 13-17 should have parental or guardian consent to use the Service</li>
                <li>Parents/guardians are responsible for monitoring minors' use of the platform</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Accounts & Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You agree to provide accurate, current, and complete information during registration</li>
                <li>You are responsible for all activities that occur under your account</li>
                <li>You must notify us immediately of any unauthorized access to your account</li>
                <li>You may not create multiple accounts or share your account with others</li>
                <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Description</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>RallyPack is an emergency preparedness platform that provides:</p>
              <ul>
                <li>Personalized weather alerts and emergency notifications</li>
                <li>Emergency resource tracking (caches, supplies, first aid)</li>
                <li>Family and pet information management for emergency planning</li>
                <li>Emergency meeting spot coordination</li>
                <li>Offline access to critical emergency information</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Emergency Services Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
                <p className="font-semibold text-red-800">CRITICAL NOTICE:</p>
                <p className="text-red-700">
                  RallyPack is NOT a substitute for official emergency services. In case of a life-threatening emergency, 
                  always call your local emergency number (911 in the US, 112 in the EU, etc.) immediately.
                </p>
              </div>

              <ul>
                <li>RallyPack provides planning and preparedness tools only</li>
                <li>Weather alerts and notifications are sourced from third-party providers and may be delayed or inaccurate</li>
                <li>We do not provide real-time emergency response or rescue services</li>
                <li>Information provided is for preparedness purposes and should not replace professional emergency advice</li>
                <li>Always follow official government emergency instructions and evacuation orders</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Privacy & Security</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Your privacy is important to us. Our data handling practices are detailed in our 
                <a href="/PrivacyPolicy" className="text-blue-600 hover:underline ml-1">Privacy Policy</a>, 
                which is incorporated into these Terms.
              </p>

              <h3 className="font-semibold mt-4">GDPR Compliance (EU Users):</h3>
              <ul>
                <li>We comply with the General Data Protection Regulation for EU users</li>
                <li>You have rights to access, rectify, erase, and port your data</li>
                <li>Data processing is based on consent, contract, and legitimate interests</li>
                <li>You may withdraw consent or object to processing at any time</li>
              </ul>

              <h3 className="font-semibold mt-4">CCPA Compliance (California Users):</h3>
              <ul>
                <li>We comply with the California Consumer Privacy Act</li>
                <li>You have rights to know, delete, and opt-out of data sale</li>
                <li>We do not sell personal information to third parties</li>
                <li>You will not face discrimination for exercising your rights</li>
              </ul>

              <h3 className="font-semibold mt-4">Data Encryption:</h3>
              <ul>
                <li>Sensitive data is encrypted using AES-256-GCM encryption</li>
                <li>User identifiers are hashed using SHA-256 with unique salts</li>
                <li>All data transmission occurs over secure HTTPS/TLS connections</li>
                <li>Backup data is stored in encrypted format in separate secure databases</li>
              </ul>

              <h3 className="font-semibold mt-4">SOC 2 Type I Compliance:</h3>
              <ul>
                <li>We maintain security controls aligned with SOC 2 Type I Trust Services Criteria</li>
                <li>Our systems undergo regular security assessments and audits</li>
                <li>We implement comprehensive information security policies and procedures</li>
                <li>Access controls, monitoring, and incident response procedures are in place</li>
                <li>Business continuity and disaster recovery plans ensure service availability</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Integrations</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>RallyPack integrates with the following third-party services:</p>
              
              <h3 className="font-semibold mt-4">Data Storage & Infrastructure:</h3>
              <ul>
                <li><strong>Base44:</strong> Primary application platform and secure database infrastructure</li>
                <li><strong>Supabase (PostgreSQL):</strong> Encrypted backup database for compliance and redundancy. Data is encrypted with AES-256-GCM before storage</li>
              </ul>

              <h3 className="font-semibold mt-4">External Data Services:</h3>
              <ul>
                <li><strong>Open-Meteo API:</strong> Weather data and forecasts. Only coordinates are shared, no personal information</li>
                <li><strong>OpenStreetMap Nominatim:</strong> Address geocoding and autocomplete. Only address strings are sent for lookup</li>
              </ul>

              <h3 className="font-semibold mt-4">Authorized Integrations:</h3>
              <ul>
                <li><strong>Notion:</strong> Optional integration for exporting emergency plans (requires user authorization)</li>
              </ul>

              <p className="mt-4">
                You agree that we may share necessary data with these services to provide functionality. 
                Each third-party service has its own terms and privacy policies which you should review.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Content & Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>You retain ownership of the content you submit to RallyPack, including:</p>
              <ul>
                <li>Family member information</li>
                <li>Pet details and photos</li>
                <li>Emergency cache inventories</li>
                <li>Meet spot locations</li>
                <li>Notes and descriptions</li>
              </ul>

              <p className="mt-4">You agree that:</p>
              <ul>
                <li>You have the right to submit all information you provide</li>
                <li>Your content does not violate any laws or third-party rights</li>
                <li>You grant us a license to store, process, and display your content for service provision</li>
                <li>You are responsible for maintaining backups of critical information</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prohibited Activities</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>You may not:</p>
              <ul>
                <li>Use the Service if you are under 13 years of age</li>
                <li>Provide false or misleading information</li>
                <li>Impersonate any person or entity</li>
                <li>Use the Service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Share or sell your account access</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, RALLYPACK AND ITS AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul>
                <li>Loss of profits, data, or use</li>
                <li>Property damage or personal injury</li>
                <li>Consequences of delayed or inaccurate emergency alerts</li>
                <li>Reliance on information provided by the Service</li>
                <li>Service interruptions or unavailability</li>
              </ul>

              <p className="mt-4 font-semibold">
                OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS, OR $100 IF NO PAYMENT WAS MADE.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Warranty Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING:
              </p>
              <ul>
                <li>Merchantability or fitness for a particular purpose</li>
                <li>Accuracy, reliability, or completeness of information</li>
                <li>Uninterrupted or error-free service</li>
                <li>Security or freedom from viruses</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Modifications & Termination</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul>
                <li>We reserve the right to modify or discontinue the Service at any time</li>
                <li>We may update these Terms periodically with notice to users</li>
                <li>You may terminate your account at any time through Settings → Danger Zone</li>
                <li>We may suspend or terminate accounts that violate these Terms</li>
                <li>Upon termination, your personal data will be deleted per our Privacy Policy retention schedule</li>
                <li><strong>Pet Microchip Data Retention:</strong> If you have registered pets with microchip numbers, this information (microchip number, last known owner name and address, pet species/breed) will be retained indefinitely for emergency pet recovery purposes. This data is anonymized, encrypted, and only accessible to authorized microchip companies and emergency response organizations. This practice complies with animal welfare and ownership laws. Contact privacy@rallypack.tech to request complete pet data removal.</li>
                <li><strong>Aggregate Statistics Retention:</strong> After account deletion, your personal information is removed, but you may remain counted in anonymized regional statistics (e.g., "150 households in ZIP code 12345 have emergency plans"). These aggregate statistics support emergency response planning and cannot be traced back to you. They are updated periodically and your contribution to these counts will eventually phase out as data refreshes occur.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Governing Law & Disputes</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul>
                <li>These Terms are governed by the laws of [Your Jurisdiction]</li>
                <li>Any disputes shall be resolved through binding arbitration</li>
                <li>You waive the right to participate in class action lawsuits</li>
                <li>For EU users: This does not affect your statutory consumer rights under EU law</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>For questions about these Terms and Conditions:</p>
              <p className="mt-2">
                <strong>Email:</strong> legal@rallypack.tech<br />
                <strong>Support:</strong> gearup@rallypack.tech
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Severability & Entire Agreement</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect. 
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and RallyPack.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}