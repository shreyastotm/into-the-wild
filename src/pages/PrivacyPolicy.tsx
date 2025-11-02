import { Link } from "react-router-dom";

import {
  MobileCard,
  MobilePage,
  MobileSection,
} from "@/components/mobile/MobilePage";
import { SEOHead } from "@/components/SEOHead";

export default function PrivacyPolicyPage() {
  const lastUpdated = "01/01/2025"; // DD/MM/YYYY format per Indian standards

  return (
    <>
      <SEOHead
        title="Privacy Policy - Into the Wild"
        description="Privacy Policy for Into the Wild - Your trekking adventure platform. Learn how we collect, use, and protect your personal information."
        canonicalUrl="/privacy-policy"
      />
      <MobilePage>
        <MobileSection
          title="Privacy Policy"
          subtitle={`Last Updated: ${lastUpdated}`}
        >
          <div className="mobile-list">
            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">1. Introduction</h3>
              <p className="mobile-body mb-3">
                Welcome to Into the Wild ("we," "our," or "us"). We are
                committed to protecting your privacy and ensuring the security
                of your personal information. This Privacy Policy explains how
                we collect, use, disclose, and safeguard your information when
                you use our mobile application and web platform ("Service").
              </p>
              <p className="mobile-body">
                By accessing or using our Service, you agree to the collection
                and use of information in accordance with this Privacy Policy.
                This policy is compliant with the Information Technology Act,
                2000, and the Information Technology (Reasonable Security
                Practices and Procedures and Sensitive Personal Data or
                Information) Rules, 2011 ("IT Rules").
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">
                2. Information We Collect
              </h3>
              <p className="mobile-body mb-3">
                We collect several types of information for various purposes to
                provide and improve our Service:
              </p>

              <h4 className="font-semibold mb-2 mt-4">
                2.1 Personal Information
              </h4>
              <ul className="list-disc list-inside space-y-1 mobile-body mb-3">
                <li>Full name and contact details (email, phone number)</li>
                <li>Date of birth and address</li>
                <li>Government-issued ID documents for verification</li>
                <li>Payment information and payment proof documents</li>
                <li>Bank account details (where applicable for refunds)</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">
                2.2 Profile Information
              </h4>
              <ul className="list-disc list-inside space-y-1 mobile-body mb-3">
                <li>Trekking experience and skill level</li>
                <li>Interests and preferences</li>
                <li>
                  Health information (medical conditions, allergies) for safety
                  purposes
                </li>
                <li>Profile photos and avatars</li>
                <li>Vehicle information (if offering transport services)</li>
                <li>Pet details (if applicable)</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">2.3 Location Data</h4>
              <p className="mobile-body mb-3">
                We collect location information (latitude, longitude) to help
                you find nearby treks and connect with other trekkers in your
                area. Location data is collected only with your explicit consent
                and can be disabled in your device settings.
              </p>

              <h4 className="font-semibold mb-2 mt-4">2.4 Usage Data</h4>
              <p className="mobile-body mb-3">
                We automatically collect information about how you interact with
                our Service, including:
              </p>
              <ul className="list-disc list-inside space-y-1 mobile-body mb-3">
                <li>Pages visited and features used</li>
                <li>Time spent on the platform</li>
                <li>
                  Device information (type, operating system, unique
                  identifiers)
                </li>
                <li>IP address and browser type</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">2.5 Media Content</h4>
              <p className="mobile-body mb-3">
                When you participate in treks, you may upload photos, videos,
                and other media content. This content may be displayed in our
                public gallery and shared with other users, subject to your
                privacy settings.
              </p>

              <h4 className="font-semibold mb-2 mt-4">
                2.6 Communication Data
              </h4>
              <p className="mobile-body">
                We collect information from your communications with us,
                including customer support inquiries, forum posts, comments, and
                feedback.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">
                3. How We Use Your Information
              </h3>
              <p className="mobile-body mb-3">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 mobile-body">
                <li>
                  <strong>Service Provision:</strong> To register you for
                  trekking events, process payments, manage bookings, and
                  provide customer support
                </li>
                <li>
                  <strong>Safety & Verification:</strong> To verify your
                  identity, assess fitness for trekking activities, and ensure
                  participant safety
                </li>
                <li>
                  <strong>Communication:</strong> To send you trek updates,
                  reminders, weather alerts, emergency notifications, and
                  post-trek follow-ups via WhatsApp, email, SMS, or in-app
                  notifications
                </li>
                <li>
                  <strong>Personalization:</strong> To recommend treks based on
                  your interests, location, and experience level
                </li>
                <li>
                  <strong>Community Features:</strong> To facilitate forum
                  discussions, enable photo sharing, and connect you with fellow
                  trekkers
                </li>
                <li>
                  <strong>Legal Compliance:</strong> To comply with legal
                  obligations, resolve disputes, and enforce our terms of
                  service
                </li>
                <li>
                  <strong>Improvement:</strong> To analyze usage patterns,
                  improve our Service, and develop new features
                </li>
                <li>
                  <strong>Marketing:</strong> To send you promotional
                  communications about new treks and special offers (with your
                  consent, which you can withdraw at any time)
                </li>
              </ul>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">
                4. Information Sharing and Disclosure
              </h3>
              <p className="mobile-body mb-3">
                We do not sell, trade, or rent your personal information to
                third parties. We may share your information only in the
                following circumstances:
              </p>

              <h4 className="font-semibold mb-2 mt-4">4.1 With Your Consent</h4>
              <p className="mobile-body mb-3">
                We share information when you explicitly consent, such as when
                you agree to join WhatsApp groups for specific treks or share
                your contact details with other participants.
              </p>

              <h4 className="font-semibold mb-2 mt-4">4.2 Service Providers</h4>
              <p className="mobile-body mb-3">
                We may share information with trusted third-party service
                providers who assist us in operating our Service, including:
              </p>
              <ul className="list-disc list-inside space-y-1 mobile-body mb-3">
                <li>Payment processors (Razorpay, PayU, or similar)</li>
                <li>Cloud storage providers (Supabase, AWS)</li>
                <li>Email and SMS service providers</li>
                <li>WhatsApp Business API providers</li>
                <li>Analytics and performance monitoring tools</li>
              </ul>
              <p className="mobile-body mb-3">
                These service providers are contractually obligated to maintain
                the confidentiality and security of your information.
              </p>

              <h4 className="font-semibold mb-2 mt-4">
                4.3 Legal Requirements
              </h4>
              <p className="mobile-body mb-3">
                We may disclose your information if required by law, court
                order, or government regulation, or to protect our rights,
                property, or safety, or that of our users or others.
              </p>

              <h4 className="font-semibold mb-2 mt-4">
                4.4 Business Transfers
              </h4>
              <p className="mobile-body">
                In the event of a merger, acquisition, or sale of assets, your
                information may be transferred to the acquiring entity, subject
                to the same privacy protections.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">
                5. Data Storage and Security
              </h3>
              <p className="mobile-body mb-3">
                We implement reasonable security practices and procedures to
                protect your sensitive personal data, as required under the IT
                Rules:
              </p>
              <ul className="list-disc list-inside space-y-2 mobile-body">
                <li>
                  <strong>Encryption:</strong> Sensitive data is encrypted in
                  transit (SSL/TLS) and at rest
                </li>
                <li>
                  <strong>Access Controls:</strong> Limited access to personal
                  information on a need-to-know basis
                </li>
                <li>
                  <strong>Secure Storage:</strong> Data stored on secure servers
                  with regular security audits
                </li>
                <li>
                  <strong>Regular Backups:</strong> Data backup procedures to
                  prevent data loss
                </li>
                <li>
                  <strong>Security Monitoring:</strong> Continuous monitoring
                  for unauthorized access and security breaches
                </li>
              </ul>
              <p className="mobile-body mt-3">
                However, no method of transmission over the internet or
                electronic storage is 100% secure. While we strive to use
                commercially acceptable means to protect your information, we
                cannot guarantee absolute security.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">
                6. Your Rights and Choices
              </h3>
              <p className="mobile-body mb-3">
                Under Indian law and our commitment to privacy, you have the
                following rights:
              </p>
              <ul className="list-disc list-inside space-y-2 mobile-body">
                <li>
                  <strong>Access:</strong> Request access to your personal
                  information that we hold
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate
                  or incomplete information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal
                  information, subject to legal retention requirements
                </li>
                <li>
                  <strong>Withdrawal of Consent:</strong> Withdraw consent for
                  data processing at any time
                </li>
                <li>
                  <strong>Opt-Out:</strong> Opt-out of marketing communications
                  and non-essential data collection
                </li>
                <li>
                  <strong>Data Portability:</strong> Request a copy of your data
                  in a structured, machine-readable format
                </li>
                <li>
                  <strong>Profile Controls:</strong> Update your privacy
                  settings to control who can see your information
                </li>
              </ul>
              <p className="mobile-body mt-3">
                To exercise these rights, please contact us at{" "}
                <a
                  href="mailto:agarthaunderground@gmail.com"
                  className="text-primary underline"
                >
                  agarthaunderground@gmail.com
                </a>{" "}
                or{" "}
                <a
                  href="mailto:shreyasmadhan82@gmail.com"
                  className="text-primary underline"
                >
                  shreyasmadhan82@gmail.com
                </a>
                . We will respond to your request within 30 days as required by
                Indian law.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">
                7. Cookies and Tracking Technologies
              </h3>
              <p className="mobile-body mb-3">
                We use cookies and similar tracking technologies to track
                activity on our Service and store certain information. Cookies
                are files with a small amount of data that may include an
                anonymous unique identifier.
              </p>
              <p className="mobile-body mb-3">Types of cookies we use:</p>
              <ul className="list-disc list-inside space-y-1 mobile-body">
                <li>
                  <strong>Essential Cookies:</strong> Required for the Service
                  to function properly
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Help us understand how
                  users interact with our Service
                </li>
                <li>
                  <strong>Preference Cookies:</strong> Remember your settings
                  and preferences
                </li>
              </ul>
              <p className="mobile-body mt-3">
                You can instruct your browser to refuse all cookies or to
                indicate when a cookie is being sent. However, if you do not
                accept cookies, you may not be able to use some portions of our
                Service.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">8. Children's Privacy</h3>
              <p className="mobile-body mb-3">
                Our Service is not intended for individuals under the age of 18
                years. We do not knowingly collect personal information from
                children without parental consent. If you are a parent or
                guardian and believe your child has provided us with personal
                information, please contact us immediately.
              </p>
              <p className="mobile-body">
                Minors (18-21 years) must have parental consent and provide
                guardian information during registration for adventure
                activities.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">9. Data Retention</h3>
              <p className="mobile-body mb-3">
                We retain your personal information only for as long as
                necessary to fulfill the purposes outlined in this Privacy
                Policy, unless a longer retention period is required or
                permitted by law.
              </p>
              <ul className="list-disc list-inside space-y-1 mobile-body">
                <li>
                  <strong>Active Accounts:</strong> Data retained while your
                  account is active
                </li>
                <li>
                  <strong>Legal Requirements:</strong> Certain data may be
                  retained for legal compliance (e.g., financial records for 7
                  years as per Indian law)
                </li>
                <li>
                  <strong>After Account Closure:</strong> Data may be retained
                  for 30 days after account deletion request, then securely
                  deleted or anonymized
                </li>
              </ul>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">10. Third-Party Links</h3>
              <p className="mobile-body">
                Our Service may contain links to third-party websites or
                services that are not owned or controlled by us. We are not
                responsible for the privacy practices of these third-party
                sites. We encourage you to review the privacy policies of any
                third-party sites you visit.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">
                11. International Data Transfers
              </h3>
              <p className="mobile-body mb-3">
                Your information may be transferred to and processed on servers
                located outside India. When we transfer your information
                internationally, we ensure appropriate safeguards are in place
                to protect your data in accordance with this Privacy Policy and
                applicable Indian laws.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">
                12. Changes to This Privacy Policy
              </h3>
              <p className="mobile-body mb-3">
                We may update our Privacy Policy from time to time. We will
                notify you of any changes by:
              </p>
              <ul className="list-disc list-inside space-y-1 mobile-body">
                <li>Posting the new Privacy Policy on this page</li>
                <li>Updating the "Last Updated" date</li>
                <li>
                  Notifying you via email or in-app notification for material
                  changes
                </li>
              </ul>
              <p className="mobile-body mt-3">
                You are advised to review this Privacy Policy periodically for
                any changes. Changes are effective when posted on this page.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">13. Grievance Redressal</h3>
              <p className="mobile-body mb-3">
                If you have any concerns or grievances regarding our privacy
                practices or handling of your personal information, please
                contact our Grievance Officer:
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-3">
                <p className="mobile-body">
                  <strong>Grievance Officer</strong>
                  <br />
                  Into the Wild
                  <br />
                  Email:{" "}
                  <a
                    href="mailto:agarthaunderground@gmail.com"
                    className="text-primary underline"
                  >
                    agarthaunderground@gmail.com
                  </a>{" "}
                  or{" "}
                  <a
                    href="mailto:shreyasmadhan82@gmail.com"
                    className="text-primary underline"
                  >
                    shreyasmadhan82@gmail.com
                  </a>
                  <br />
                  Response Time: Within 30 days as per IT Rules
                </p>
              </div>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">14. Contact Us</h3>
              <p className="mobile-body mb-3">
                If you have any questions about this Privacy Policy, please
                contact us:
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-3">
                <p className="mobile-body">
                  <strong>Into the Wild</strong>
                  <br />
                  Email:{" "}
                  <a
                    href="mailto:agarthaunderground@gmail.com"
                    className="text-primary underline"
                  >
                    agarthaunderground@gmail.com
                  </a>{" "}
                  or{" "}
                  <a
                    href="mailto:shreyasmadhan82@gmail.com"
                    className="text-primary underline"
                  >
                    shreyasmadhan82@gmail.com
                  </a>
                  <br />
                  Website:{" "}
                  <Link to="/" className="text-primary underline">
                    www.intothewild.in
                  </Link>
                </p>
              </div>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">15. Consent</h3>
              <p className="mobile-body mb-3">
                By using our Service, you consent to:
              </p>
              <ul className="list-disc list-inside space-y-1 mobile-body">
                <li>
                  The collection, use, and disclosure of your information as
                  described in this Privacy Policy
                </li>
                <li>
                  The processing of your sensitive personal data for the
                  purposes outlined herein
                </li>
                <li>Receiving communications from us regarding our Service</li>
              </ul>
              <p className="mobile-body mt-3">
                Your consent may be withdrawn at any time by contacting us or
                adjusting your account settings.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">16. Jurisdiction</h3>
              <p className="mobile-body">
                This Privacy Policy is governed by and construed in accordance
                with the laws of India. Any disputes arising from or relating to
                this Privacy Policy shall be subject to the exclusive
                jurisdiction of the courts in Bengaluru, India.
              </p>
            </MobileCard>
          </div>
        </MobileSection>
      </MobilePage>
    </>
  );
}
