import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Database, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-500">Effective Date: December 27, 2025</p>
          <p className="text-gray-500">Last Updated: December 27, 2025</p>
        </div>

        <div className="space-y-6">
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
                <li><strong>Family Coordination:</strong> To facilitate family emergency planning and communication</li>
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
                <li><strong>Open-Meteo:</strong> Weather data provider (location coordinates only, no personal data)</li>
                <li><strong>OpenStreetMap Nominatim:</strong> Address geocoding (address data only, no account information)</li>
              </ul>

              <p className="font-semibold mt-4">Legal Disclosure:</p>
              <p>We may disclose information if required by law, court order, or to protect rights, safety, and property.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul>
                <li><strong>Active Accounts:</strong> Data retained while account is active</li>
                <li><strong>Deleted Accounts:</strong> Data permanently deleted within 30 days of account deletion request</li>
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
                <li><strong>Account Deletion:</strong> Contact support to request full account deletion</li>
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