import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Database, Lock, Eye, FileText, AlertTriangle } from "lucide-react";

export default function PrivacyPolicy() {
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
                  features may change, and some functionality may be incomplete or experimental. Your participation helps us improve the platform.
                </p>
                <p className="text-sm text-yellow-800">
                  <strong>Send Feedback:</strong> Have suggestions or found a bug? Email us at{" "}
                  <a href="mailto:beta@rallypack.tech" className="underline font-semibold">beta@rallypack.tech</a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-500">Version: 3.0</p>
          <p className="text-gray-500">Effective Date: October 20, 2026</p>
          <p className="text-gray-500">Last Updated: October 20, 2026</p>
        </div>

        <div className="space-y-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                What changed in Version 3.0 (October 20, 2026)
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                This version brings the policy up to date with features added since Version 2.0. It does not
                reduce any protection described previously. In summary:
              </p>
              <ul>
                <li><strong>Status alerts:</strong> the channels you can broadcast an "I'm Safe" or "Need Help" status through now include email, Telegram and Discord, and the policy names each one.</li>
                <li><strong>Business &amp; organization accounts:</strong> organizations can now hold compliance records and upload supporting documents. How those are stored and who can see them is described below.</li>
                <li><strong>Community features:</strong> the community needs board, the public drill directory and the readiness map are covered, including what is public and what is not.</li>
                <li><strong>Organization affiliations:</strong> an account can now belong to a household and to one or more organizations, with role-based access. The policy explains how those affiliations are scoped.</li>
                <li><strong>Consent-gated analytics:</strong> third-party analytics and advertising measurement load only after you agree, and are never used to build a profile of your preparedness data.</li>
                <li><strong>Referral submissions:</strong> business referrals you submit are stored and shared with our team, and are described as their own category.</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                RallyPack ("we", "us", "our") is committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our emergency preparedness platform.
              </p>
              <p className="font-semibold mt-4">Age Requirement:</p>
              <p>
                RallyPack is intended for users who are 13 years of age or older. If you are under 13 years of age, you may not use this service. 
                Minors under 13 may be added to family groups by adult users but cannot create their own accounts.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h3 className="font-semibold">Personal Information:</h3>
              <ul>
                <li><strong>Account Information:</strong> Email address, full name, display name</li>
                <li><strong>Location Data:</strong> Street address, city, state/province, postal code, country, latitude, longitude coordinates</li>
                <li><strong>Profile Data:</strong> Notification preferences, alert settings</li>
              </ul>

              <h3 className="font-semibold mt-4">Sensitive Information:</h3>
              <ul>
                <li><strong>Family Member Data:</strong> Names, relationships, ages, medical conditions, emergency contacts</li>
                <li><strong>Pet Information:</strong> Names, species, breeds, ages, microchip numbers, medical conditions, photos</li>
                <li><strong>Health Data:</strong> Medical conditions for family members and pets</li>
                <li><strong>Emergency Resources:</strong> Cache locations, inventory items, meet spot coordinates</li>
              </ul>

              <h3 className="font-semibold mt-4">Usage Information:</h3>
              <ul>
                <li>Notifications history and read status</li>
                <li>Emergency cache and supply tracking data</li>
                <li>Weather alert preferences and history</li>
                <li>Readiness quiz answers and the resulting score</li>
              </ul>

              <h3 className="font-semibold mt-4">Status Alert Channels:</h3>
              <ul>
                <li><strong>Channel Connections:</strong> If you connect a messaging account to broadcast an "I'm Safe" or "Need Help" status, we store the connection identifier needed to send to it — for example a Telegram chat ID and username, or a Discord webhook URL for a server you choose.</li>
                <li><strong>Status Broadcasts:</strong> Your current status (safe, needs assistance, or unknown) and the time it was set, so your household can see it.</li>
                <li><strong>Control:</strong> These channels are optional and can be disconnected at any time in Settings.</li>
              </ul>

              <h3 className="font-semibold mt-4">Business & Organization Data:</h3>
              <ul>
                <li><strong>Organization Details:</strong> Organization name, country, and the email address of the account owner.</li>
                <li><strong>Membership:</strong> Which organization a member belongs to and the role they hold, so access can be scoped correctly.</li>
                <li><strong>Compliance Records:</strong> Staff certifications, workplace fire and life-safety equipment, and household safety devices, together with their inspection or expiry dates.</li>
                <li><strong>Uploaded Documents:</strong> Certificates, service reports and inspection records you upload are stored in private storage. They are never publicly readable; they are opened through a short-lived signed link that expires, and only for accounts authorized to view them.</li>
                <li><strong>Billing:</strong> Subscription tier and billing status. Card details are handled entirely by Stripe and never reach our servers.</li>
              </ul>

              <h3 className="font-semibold mt-4">Community Submissions:</h3>
              <ul>
                <li><strong>Needs Board:</strong> When you post a need, or choose to share an individual request with organizations, we store the request, its location area and the contact details you supplied so organizations can respond.</li>
                <li><strong>Drill Listings:</strong> Community drills you submit — the title, organizing body, type, date, location, description and the contact email you provide — are shown publicly in the drill directory. Only submit details you are willing to make public.</li>
                <li><strong>Referrals:</strong> Business referrals you submit are stored with the referred organization's details, your name and email, and any personal message, and are shared with our team for follow-up.</li>
                <li><strong>Contact &amp; Feedback:</strong> Messages sent through the contact and feedback forms, together with the anonymous per-browser identifier used to rate-limit those forms.</li>
              </ul>

              <h3 className="font-semibold mt-4">Camera & Scanning:</h3>
              <ul>
                <li><strong>Camera Access:</strong> When you use our barcode scanning feature, the app requests access to your device camera. Camera access is only used for scanning barcodes/QR codes to add items to your emergency caches.</li>
                <li><strong>No Storage or Transmission:</strong> Camera images are processed locally on your device and are never stored, uploaded, or transmitted to our servers. Only the decoded barcode text is saved to your cache inventory.</li>
                <li><strong>Optional Feature:</strong> Camera access is completely optional. You can manually enter barcode numbers without granting camera permissions.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Data Security & Encryption
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="font-semibold">SOC 2 Type I Compliance:</p>
              <p>
                RallyPack maintains security controls in accordance with SOC 2 Type I standards, addressing Security, 
                Availability, Processing Integrity, Confidentiality, and Privacy criteria. Our infrastructure and processes 
                are designed to protect customer data through comprehensive security policies and procedures.
              </p>

              <p className="font-semibold mt-4">Primary Database (Base44):</p>
              <p>
                Your data is primarily stored in Base44's secure infrastructure with enterprise-grade security measures including encryption at rest and in transit.
              </p>

              <p className="font-semibold mt-4">Backup Database (Supabase Integration):</p>
              <p>
                For redundancy and compliance purposes, we sync selected data to a separate Supabase database using the following security measures:
              </p>
              <ul>
                <li><strong>SHA-256 Hashing:</strong> User email addresses are hashed with a unique salt to create anonymized identifiers</li>
                <li><strong>AES-256-GCM Encryption:</strong> Highly sensitive data including:
                  <ul>
                    <li>Family member names, medical conditions, and emergency contacts</li>
                    <li>Pet names, microchip numbers, and medical information</li>
                    <li>Notification content (titles and messages)</li>
                    <li>Display names and personal identifiers</li>
                  </ul>
                </li>
                <li><strong>Pseudonymization:</strong> All record IDs are hashed to prevent direct linkage</li>
                <li><strong>Minimal Data Sync:</strong> Only necessary data for backup and compliance is synced</li>
              </ul>

              <p className="font-semibold mt-4">Encryption Standards:</p>
              <ul>
                <li>All data transmissions use HTTPS/TLS 1.3</li>
                <li>Encryption keys are stored separately from encrypted data</li>
                <li>PBKDF2 key derivation with 100,000 iterations</li>
                <li>AES-256-GCM authenticated encryption for sensitive fields</li>
              </ul>

              <p className="font-semibold mt-4">Security Controls (SOC 2 Compliance):</p>
              <ul>
                <li><strong>Access Controls:</strong> Multi-factor authentication, role-based access, and least privilege principles</li>
                <li><strong>Monitoring:</strong> Continuous security monitoring, logging, and incident response procedures</li>
                <li><strong>Data Protection:</strong> Encryption at rest and in transit, secure key management</li>
                <li><strong>System Availability:</strong> Regular backups, disaster recovery plans, and uptime monitoring</li>
                <li><strong>Change Management:</strong> Controlled deployment processes and code review procedures</li>
                <li><strong>Vendor Management:</strong> Third-party security assessments and compliance verification</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul>
                <li><strong>Emergency Preparedness:</strong> To provide personalized weather alerts, emergency notifications, and disaster planning tools</li>
                <li><strong>Location Services:</strong> To deliver location-specific weather data and emergency shelter information</li>
                <li><strong>Resource Management:</strong> To help you track emergency supplies, caches, and expiration dates</li>
                <li><strong>Barcode Scanning:</strong> To quickly add items to your caches by scanning product barcodes using your device camera (processed locally, not stored or transmitted)</li>
                <li><strong>Family Coordination:</strong> To facilitate family emergency planning and communication</li>
                <li><strong>E-Commerce:</strong> To process purchases of recommended emergency supplies through our integrated shopping cart and Stripe payment system</li>
                <li><strong>Aggregate Emergency Planning:</strong> To create anonymized, regional statistics (shelter demand, preparedness levels, special needs projections, resource availability) that support emergency response coordination and public safety planning. Your personal data is never shared; only aggregate counts by geographic area are used.</li>
                <li><strong>Service Improvement:</strong> To analyze usage patterns and improve our platform (using anonymized data)</li>
                <li><strong>Compliance:</strong> To maintain backup records for legal and regulatory compliance</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>GDPR Compliance (EU Users)</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>For users in the European Union, we comply with the General Data Protection Regulation (GDPR):</p>
              <ul>
                <li><strong>Legal Basis:</strong> We process data based on consent, contractual necessity, and legitimate interests</li>
                <li><strong>Right to Access:</strong> You can request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> You can update incorrect information through your profile settings</li>
                <li><strong>Right to Erasure:</strong> You can request deletion of your account and data</li>
                <li><strong>Right to Portability:</strong> You can export your data in a machine-readable format</li>
                <li><strong>Right to Object:</strong> You can object to certain data processing activities</li>
                <li><strong>Data Retention:</strong> We retain data only as long as necessary for service provision and compliance</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CCPA Compliance (California Users)</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>For California residents, we comply with the California Consumer Privacy Act (CCPA):</p>
              <ul>
                <li><strong>Right to Know:</strong> You can request information about what data we collect and how it's used</li>
                <li><strong>Right to Delete:</strong> You can request deletion of your personal information</li>
                <li><strong>Right to Opt-Out:</strong> You can opt-out of the sale of personal information (Note: We do not sell personal information)</li>
                <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your privacy rights</li>
                <li><strong>Categories of Data Collected:</strong> Identifiers, location data, health information, usage data</li>
                <li><strong>Business Purpose:</strong> Emergency preparedness services, safety alerts, resource management</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Sharing & Third Parties</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p><strong>We do NOT sell your personal information to third parties.</strong></p>
              
              <p className="font-semibold mt-4">Service Providers:</p>
              <ul>
                <li><strong>Base44:</strong> Primary application platform and database</li>
                <li><strong>Supabase (PostgreSQL):</strong> Encrypted backup database for compliance</li>
                <li><strong>Stripe:</strong> Secure payment processing (receives payment information, email, and transaction details)</li>
                <li><strong>Open-Meteo:</strong> Weather data provider (location coordinates only, no personal data)</li>
                <li><strong>OpenStreetMap Nominatim:</strong> Address geocoding (address data only, no account information)</li>
                <li><strong>Resend:</strong> Email delivery for notifications, reminders and shared plans (recipient address and message content only)</li>
                <li><strong>Telegram:</strong> Delivers emergency alerts and status broadcasts you have opted into, to the chat you connected</li>
                <li><strong>Discord:</strong> Posts status alerts to a server channel you configured with your own webhook URL</li>
              </ul>

              <p className="font-semibold mt-4">Public Emergency Data Sources:</p>
              <ul>
                <li>Wildfire, weather and emergency-alert information is drawn from public agency sources (for example national fire and weather services, and European and global satellite fire monitoring programmes). These sources supply event data only and receive no personal information about you.</li>
              </ul>

              <p className="font-semibold mt-4">Legal Disclosure:</p>
              <p>We may disclose information if required by law, court order, or to protect rights, safety, and property.</p>

              <p className="font-semibold mt-4">Automated Access & AI Agents:</p>
              <ul>
                <li><strong>Bot Detection:</strong> We detect and classify automated traffic (search crawlers, AI agents, scrapers) using User-Agent analysis and session behavior. No personal data is collected for this purpose beyond standard request metadata (IP, UA, timestamp).</li>
                <li><strong>AI Agent Access:</strong> AI agents and chatbots that access RallyPack must comply with our Terms and this Privacy Policy. We do not share user personal data with AI systems. Any AI agent processing public RallyPack content must respect robots.txt and must not republish user-generated data.</li>
                <li><strong>Training Data:</strong> User personal data and user-generated content are never shared with, sold to, or made available to AI model training systems. Using RallyPack content to train AI models without written authorization is prohibited.</li>
                <li><strong>Analytics:</strong> Anonymous, aggregate usage statistics (page views, quiz completions, preparedness scores by region) may be collected to improve the service. These statistics cannot be traced back to individual users.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cookies, Analytics & Your Consent</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Third-party analytics and advertising measurement load <strong>only after you agree</strong>. Until you
                accept, no analytics or advertising script is loaded and no measurement request is sent.
              </p>
              <ul>
                <li><strong>What runs after consent:</strong> aggregate page-view and conversion measurement (for example Google Analytics and Google Ads conversion tracking), used to understand which preparedness pages help people and which campaigns reach them.</li>
                <li><strong>What is never measured:</strong> your preparedness data is not shared with analytics or advertising providers. Cache contents, family and pet details, health information, addresses and uploaded documents are never sent to them.</li>
                <li><strong>Anonymous browser identifier:</strong> the public contact, feedback and referral forms use a random identifier stored in your browser — not a cookie that identifies you — purely to rate-limit submissions. It carries no personal data.</li>
                <li><strong>Withdrawing consent:</strong> you can decline or withdraw at any time; declining does not limit any part of the service.</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul>
                <li><strong>Active Accounts:</strong> Data retained while account is active</li>
                <li><strong>Deleted Accounts:</strong> Personal data permanently deleted within 30 days of account deletion request</li>
                <li><strong>Pet Microchip Records (Special Exception):</strong> When you delete your account, we retain:
                  <ul>
                    <li>Pet microchip numbers</li>
                    <li>Last known owner name and address</li>
                    <li>Pet species and breed</li>
                  </ul>
                  This information is retained indefinitely in an anonymized format to assist with emergency pet recovery and reunification during disasters. This practice complies with animal welfare laws and helps protect pets when traditional contact methods fail. Retained data is only accessible to authorized microchip registry partners and emergency response organizations. If you require complete pet data removal, contact privacy@rallypack.tech.
                </li>
                <li><strong>Aggregated Emergency Statistics (Permanent Retention):</strong> We maintain anonymized, aggregate statistics to support emergency response planning. These statistics are calculated from active user data and include:
                  <ul>
                    <li><strong>Shelter Demand Estimates:</strong> Aggregated counts of people and pets by geographic area (postal code or city level), used to project shelter capacity needs during emergencies</li>
                    <li><strong>Regional Preparedness Index:</strong> Anonymous preparedness scores by region showing the percentage of households with emergency plans, supplies, or meet spots</li>
                    <li><strong>Special Needs Projections:</strong> Aggregate counts (no individual identification) of populations requiring accessibility accommodations, medical support, or pet-friendly sheltering in specific areas</li>
                    <li><strong>Resource Hotspots:</strong> General counts of emergency supplies and caches reported in geographic areas to identify resource availability during crises</li>
                  </ul>
                  These aggregate statistics cannot be traced back to individual users. They are retained indefinitely to support public safety, emergency planning, and disaster response coordination. When you delete your account, your personal data is removed, but you remain counted in these regional aggregates until the next data refresh cycle (typically 30 days).
                </li>
                <li><strong>Business Compliance Records:</strong> Retained while the organization's subscription is active, so inspection and certification history stays auditable. Uploaded documents are deleted with the record. If an organization's subscription ends, records are retained for 90 days to allow export, then removed.</li>
                <li><strong>Backup Data:</strong> Encrypted backups retained for 90 days for disaster recovery</li>
                <li><strong>Compliance Records:</strong> Anonymized data may be retained longer for legal compliance</li>
                <li><strong>Audit Logs:</strong> Security and access logs retained for 12 months for SOC 2 compliance</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights & Choices</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul>
                <li><strong>Access & Update:</strong> You can view and edit your profile and data through Settings</li>
                <li><strong>Delete Data:</strong> You can delete specific entries (family members, pets, caches) at any time</li>
                <li><strong>Account Deletion:</strong> You can delete your account through Settings → Danger Zone. Personal information will be removed, but pet microchip records are retained for emergency recovery purposes.</li>
                <li><strong>Pet Data Removal:</strong> If you need complete pet data removal including microchip information, contact privacy@rallypack.tech with your request</li>
                <li><strong>Notification Controls:</strong> Manage alert preferences in Settings</li>
                <li><strong>Data Export:</strong> Request a copy of your data by contacting support</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>If you have questions about this Privacy Policy or wish to exercise your privacy rights:</p>
              <p className="mt-2">
                <strong>Email:</strong> privacy@rallypack.tech<br />
                <strong>Data Protection Officer:</strong> dpo@rallypack.tech
              </p>
              <p className="mt-4">
                For GDPR requests: gdpr@rallypack.tech<br />
                For CCPA requests: ccpa@rallypack.tech
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                We may update this Privacy Policy periodically. We will notify you of significant changes by email or through the application. 
                Your continued use of RallyPack after changes constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}