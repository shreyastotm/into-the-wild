import { Link } from "react-router-dom";

import {
  MobileCard,
  MobilePage,
  MobileSection,
} from "@/components/mobile/MobilePage";
import { SEOHead } from "@/components/SEOHead";

export default function TermsOfServicePage() {
  const lastUpdated = "01/01/2025"; // DD/MM/YYYY format per Indian standards

  return (
    <>
      <SEOHead
        title="Terms of Service - Into the Wild"
        description="Terms of Service for Into the Wild - Your trekking adventure platform. Review our terms and conditions for participating in trekking events."
        canonicalUrl="/terms-of-service"
      />
      <MobilePage>
        <MobileSection
          title="Terms of Service"
          subtitle={`Last Updated: ${lastUpdated}`}
        >
          <div className="mobile-list">
            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">1. Acceptance of Terms</h3>
              <p className="mobile-body mb-3">
                Welcome to Into the Wild ("we," "our," "us," or "Company"). By
                accessing or using our mobile application, website, or services
                (collectively, the "Service"), you agree to be bound by these
                Terms of Service ("Terms").
              </p>
              <p className="mobile-body mb-3">
                If you do not agree to these Terms, please do not use our
                Service. These Terms constitute a legally binding agreement
                between you and Into the Wild.
              </p>
              <p className="mobile-body">
                These Terms are governed by the laws of India and comply with
                the Indian Contract Act, 1872, Consumer Protection Act, 2019,
                and other applicable Indian laws.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">
                2. Description of Service
              </h3>
              <p className="mobile-body mb-3">
                Into the Wild is a platform that connects nature enthusiasts
                with trekking and adventure activities in India. Our Service
                includes:
              </p>
              <ul className="list-disc list-inside space-y-1 mobile-body">
                <li>Information about trekking events and adventures</li>
                <li>Registration and booking services for trekking events</li>
                <li>Community features including forums and photo galleries</li>
                <li>Payment processing for trek bookings</li>
                <li>Communication tools (WhatsApp groups, notifications)</li>
                <li>Safety information and trekking resources</li>
              </ul>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">
                3. User Accounts and Registration
              </h3>
              <h4 className="font-semibold mb-2 mt-4">3.1 Account Creation</h4>
              <p className="mobile-body mb-3">
                To use certain features of our Service, you must create an
                account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-1 mobile-body mb-3">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password</li>
                <li>
                  Accept all responsibility for activities under your account
                </li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">3.2 Age Requirements</h4>
              <p className="mobile-body mb-3">
                You must be at least 18 years old to create an account. Minors
                (18-21 years) must provide guardian consent and guardian
                information during registration for adventure activities.
              </p>

              <h4 className="font-semibold mb-2 mt-4">
                3.3 Account Verification
              </h4>
              <p className="mobile-body">
                We may require identity verification (government-issued ID) for
                certain services. Failure to provide accurate verification
                information may result in account suspension or termination.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">
                4. Trek Booking and Registration
              </h3>
              <h4 className="font-semibold mb-2 mt-4">4.1 Booking Process</h4>
              <p className="mobile-body mb-3">When you register for a trek:</p>
              <ul className="list-disc list-inside space-y-1 mobile-body mb-3">
                <li>You are making a binding commitment to participate</li>
                <li>You must provide accurate registration information</li>
                <li>
                  All required documents (ID proof, payment proof) must be
                  submitted
                </li>
                <li>Booking is confirmed only after payment verification</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">
                4.2 Capacity and Availability
              </h4>
              <p className="mobile-body mb-3">
                Trek slots are subject to availability and capacity limits. We
                reserve the right to:
              </p>
              <ul className="list-disc list-inside space-y-1 mobile-body">
                <li>Limit the number of participants per trek</li>
                <li>Close registration when capacity is reached</li>
                <li>Maintain a waiting list for oversubscribed treks</li>
                <li>Modify trek details with reasonable notice</li>
              </ul>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">5. Payment Terms</h3>
              <h4 className="font-semibold mb-2 mt-4">5.1 Pricing</h4>
              <p className="mobile-body mb-3">
                All prices are displayed in Indian Rupees (₹) and include
                applicable taxes (GST) as per Indian tax laws. Prices are
                subject to change, but you will be charged the price displayed
                at the time of booking.
              </p>

              <h4 className="font-semibold mb-2 mt-4">5.2 Payment Methods</h4>
              <p className="mobile-body mb-3">We accept payments through:</p>
              <ul className="list-disc list-inside space-y-1 mobile-body mb-3">
                <li>
                  Online payment gateways (UPI, Credit/Debit Cards, Net Banking)
                </li>
                <li>Payment proof upload (subject to admin verification)</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">
                5.3 Payment Verification
              </h4>
              <p className="mobile-body mb-3">
                After uploading payment proof, our admin team will verify the
                payment. Booking confirmation is subject to successful payment
                verification. This process may take up to 48 hours.
              </p>

              <h4 className="font-semibold mb-2 mt-4">5.4 Payment Security</h4>
              <p className="mobile-body">
                All payment transactions are processed through secure,
                PCI-compliant payment gateways. We do not store your complete
                payment card information on our servers.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">
                6. Cancellation and Refund Policy
              </h3>
              <h4 className="font-semibold mb-2 mt-4">
                6.1 Cancellation by User
              </h4>
              <p className="mobile-body mb-3">
                You may cancel your trek registration subject to the following:
              </p>
              <ul className="list-disc list-inside space-y-1 mobile-body mb-3">
                <li>
                  <strong>Cancellation 48+ hours before trek:</strong> Full
                  refund (minus processing charges, if any)
                </li>
                <li>
                  <strong>Cancellation 24-48 hours before trek:</strong> 50%
                  refund
                </li>
                <li>
                  <strong>Cancellation less than 24 hours:</strong> No refund
                  (emergency exceptions may apply at our discretion)
                </li>
              </ul>
              <p className="mobile-body mb-3">
                All refunds will be processed within 7-14 business days to the
                original payment method, as per Indian banking regulations.
              </p>

              <h4 className="font-semibold mb-2 mt-4">
                6.2 Cancellation by Company
              </h4>
              <p className="mobile-body mb-3">
                We reserve the right to cancel a trek due to:
              </p>
              <ul className="list-disc list-inside space-y-1 mobile-body mb-3">
                <li>Unsafe weather conditions</li>
                <li>Insufficient registrations</li>
                <li>Natural disasters or force majeure events</li>
                <li>Government restrictions or advisories</li>
                <li>Other circumstances beyond our control</li>
              </ul>
              <p className="mobile-body">
                In case of cancellation by us, you will receive a full refund or
                the option to transfer your booking to another available trek.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">
                7. Indemnity and Liability Waiver
              </h3>
              <p className="mobile-body mb-3">
                <strong>
                  IMPORTANT: Adventure activities involve inherent risks. Please
                  read this section carefully.
                </strong>
              </p>
              <h4 className="font-semibold mb-2 mt-4">
                7.1 Acknowledgment of Risks
              </h4>
              <p className="mobile-body mb-3">
                You acknowledge that trekking and adventure activities involve
                inherent risks including, but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-1 mobile-body mb-3">
                <li>Physical injury or death</li>
                <li>
                  Accidents due to terrain, weather, or natural conditions
                </li>
                <li>Wildlife encounters</li>
                <li>
                  Health complications due to altitude, dehydration, or exertion
                </li>
                <li>Equipment failure or malfunction</li>
                <li>Acts of other participants</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">
                7.2 Assumption of Risk
              </h4>
              <p className="mobile-body mb-3">
                By participating in any trek or activity through Into the Wild,
                you voluntarily assume all risks associated with the activity.
              </p>

              <h4 className="font-semibold mb-2 mt-4">7.3 Indemnity</h4>
              <p className="mobile-body mb-3">
                You agree to indemnify, defend, and hold harmless Into the Wild,
                its officers, directors, employees, guides, and partners from
                any and all claims, liabilities, damages, losses, costs, or
                expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc list-inside space-y-1 mobile-body mb-3">
                <li>Your participation in any activity</li>
                <li>Your violation of these Terms</li>
                <li>Your negligence or willful misconduct</li>
                <li>Injury, death, or property damage to yourself or others</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">
                7.4 Limitation of Liability
              </h4>
              <p className="mobile-body mb-3">
                To the maximum extent permitted by Indian law, Into the Wild
                shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages, or any loss of profits or
                revenues, whether incurred directly or indirectly.
              </p>
              <p className="mobile-body">
                Our total liability for any claims arising from the Service
                shall not exceed the amount you paid for the specific trek or
                service giving rise to the claim.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">
                8. Safety and Health Requirements
              </h3>
              <h4 className="font-semibold mb-2 mt-4">
                8.1 Health Declaration
              </h4>
              <p className="mobile-body mb-3">
                You must accurately disclose any medical conditions, allergies,
                or physical limitations that may affect your ability to
                participate safely. Failure to disclose relevant health
                information may result in:
              </p>
              <ul className="list-disc list-inside space-y-1 mobile-body mb-3">
                <li>Removal from the trek without refund</li>
                <li>Increased risk to yourself and others</li>
                <li>Liability for resulting consequences</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">
                8.2 Fitness Requirements
              </h4>
              <p className="mobile-body mb-3">
                Different treks have different difficulty levels. You are
                responsible for:
              </p>
              <ul className="list-disc list-inside space-y-1 mobile-body mb-3">
                <li>Assessing your fitness level before booking</li>
                <li>Preparing physically for the trek</li>
                <li>Following pre-trek preparation guidelines</li>
                <li>Carrying necessary medications and supplies</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">8.3 Safety Compliance</h4>
              <p className="mobile-body">
                You must follow all safety instructions provided by guides,
                respect nature and wildlife, and comply with all applicable laws
                and regulations during the trek.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">
                9. User Conduct and Prohibited Activities
              </h3>
              <p className="mobile-body mb-3">You agree not to:</p>
              <ul className="list-disc list-inside space-y-1 mobile-body mb-3">
                <li>Use the Service for any illegal purpose</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Upload malicious code or viruses</li>
                <li>Impersonate any person or entity</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Collect user information without consent</li>
                <li>Use automated systems to access the Service</li>
                <li>
                  Damage, deface, or harm natural environments during treks
                </li>
                <li>
                  Engage in any activity that endangers yourself or others
                </li>
              </ul>
              <p className="mobile-body">
                Violation of these conduct rules may result in immediate account
                termination and legal action.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">
                10. Content Ownership and Intellectual Property
              </h3>
              <h4 className="font-semibold mb-2 mt-4">
                10.1 User-Generated Content
              </h4>
              <p className="mobile-body mb-3">
                When you upload photos, videos, or other content:
              </p>
              <ul className="list-disc list-inside space-y-1 mobile-body mb-3">
                <li>You retain ownership of your content</li>
                <li>
                  You grant us a license to use, display, and share your content
                </li>
                <li>You confirm you have the right to share the content</li>
                <li>
                  Content may be used in our gallery, marketing, or promotional
                  materials
                </li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">
                10.2 Our Intellectual Property
              </h4>
              <p className="mobile-body">
                The Service, including logos, designs, text, and software, is
                owned by Into the Wild and protected by Indian copyright and
                trademark laws. You may not use our intellectual property
                without written permission.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">
                11. Privacy and Data Protection
              </h3>
              <p className="mobile-body mb-3">
                Your use of our Service is also governed by our Privacy Policy.
                By using the Service, you consent to our collection and use of
                your information as described in the Privacy Policy.
              </p>
              <p className="mobile-body">
                Please review our{" "}
                <Link to="/privacy-policy" className="text-primary underline">
                  Privacy Policy
                </Link>{" "}
                to understand how we handle your data.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">12. Force Majeure</h3>
              <p className="mobile-body mb-3">
                Into the Wild shall not be liable for any failure or delay in
                performance due to circumstances beyond our reasonable control,
                including:
              </p>
              <ul className="list-disc list-inside space-y-1 mobile-body">
                <li>Natural disasters (floods, earthquakes, storms)</li>
                <li>Government actions or restrictions</li>
                <li>Pandemics or health emergencies</li>
                <li>War, terrorism, or civil unrest</li>
                <li>Infrastructure failures</li>
                <li>Other acts of God or circumstances beyond control</li>
              </ul>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">13. Dispute Resolution</h3>
              <h4 className="font-semibold mb-2 mt-4">
                13.1 Grievance Redressal
              </h4>
              <p className="mobile-body mb-3">
                If you have any complaints or disputes, please contact us at:
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
                </p>
              </div>
              <p className="mobile-body mt-3">
                We will attempt to resolve disputes through good-faith
                negotiations within 30 days.
              </p>

              <h4 className="font-semibold mb-2 mt-4">13.2 Mediation</h4>
              <p className="mobile-body mb-3">
                If a dispute cannot be resolved through direct communication,
                parties agree to attempt mediation through a mutually agreed
                mediator before pursuing legal action.
              </p>

              <h4 className="font-semibold mb-2 mt-4">13.3 Arbitration</h4>
              <p className="mobile-body mb-3">
                If mediation fails, disputes shall be resolved through
                arbitration under the Arbitration and Conciliation Act, 2015, in
                Bengaluru, India.
              </p>

              <h4 className="font-semibold mb-2 mt-4">13.4 Consumer Rights</h4>
              <p className="mobile-body">
                Nothing in these Terms affects your rights as a consumer under
                the Consumer Protection Act, 2019. You may also file complaints
                with the appropriate consumer forum.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">14. Changes to Terms</h3>
              <p className="mobile-body mb-3">
                We reserve the right to modify these Terms at any time. We will
                notify you of material changes by:
              </p>
              <ul className="list-disc list-inside space-y-1 mobile-body">
                <li>Posting the updated Terms on this page</li>
                <li>Updating the "Last Updated" date</li>
                <li>Sending email notifications for significant changes</li>
                <li>Displaying in-app notifications</li>
              </ul>
              <p className="mobile-body mt-3">
                Your continued use of the Service after changes constitutes
                acceptance of the modified Terms. If you do not agree to the
                changes, you must stop using the Service.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">15. Account Termination</h3>
              <h4 className="font-semibold mb-2 mt-4">
                15.1 Termination by You
              </h4>
              <p className="mobile-body mb-3">
                You may terminate your account at any time by contacting us or
                using account deletion features in the Service.
              </p>

              <h4 className="font-semibold mb-2 mt-4">
                15.2 Termination by Us
              </h4>
              <p className="mobile-body mb-3">
                We may suspend or terminate your account immediately if you:
              </p>
              <ul className="list-disc list-inside space-y-1 mobile-body">
                <li>Violate these Terms</li>
                <li>Engage in fraudulent or illegal activity</li>
                <li>Harm other users or the Service</li>
                <li>Provide false or misleading information</li>
              </ul>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">
                16. Governing Law and Jurisdiction
              </h3>
              <p className="mobile-body mb-3">
                These Terms are governed by and construed in accordance with the
                laws of India, including:
              </p>
              <ul className="list-disc list-inside space-y-1 mobile-body mb-3">
                <li>Indian Contract Act, 1872</li>
                <li>Consumer Protection Act, 2019</li>
                <li>Information Technology Act, 2000</li>
                <li>Other applicable Indian laws and regulations</li>
              </ul>
              <p className="mobile-body">
                Any disputes arising from or relating to these Terms or the
                Service shall be subject to the exclusive jurisdiction of the
                courts in Bengaluru, India.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">17. Severability</h3>
              <p className="mobile-body">
                If any provision of these Terms is found to be invalid or
                unenforceable, the remaining provisions shall continue in full
                force and effect. The invalid provision shall be modified to the
                minimum extent necessary to make it valid and enforceable.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">18. Entire Agreement</h3>
              <p className="mobile-body">
                These Terms, together with our Privacy Policy, constitute the
                entire agreement between you and Into the Wild regarding the
                Service and supersede all prior agreements and understandings.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">19. Contact Information</h3>
              <p className="mobile-body mb-3">
                For questions about these Terms, please contact us:
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
              <h3 className="mobile-heading-3 mb-3">20. Acknowledgement</h3>
              <p className="mobile-body mb-3">
                By using the Service, you acknowledge that you have read,
                understood, and agree to be bound by these Terms of Service.
              </p>
              <p className="mobile-body">
                If you do not agree to these Terms, please discontinue use of
                the Service immediately.
              </p>
            </MobileCard>
          </div>
        </MobileSection>
      </MobilePage>
    </>
  );
}
