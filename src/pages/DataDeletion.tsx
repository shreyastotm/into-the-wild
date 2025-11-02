import {
  MobileCard,
  MobilePage,
  MobileSection,
} from "@/components/mobile/MobilePage";
import { SEOHead } from "@/components/SEOHead";

export default function DataDeletionPage() {
  const lastUpdated = "01/11/2025";

  return (
    <>
      <SEOHead
        title="Data Deletion - Into the Wild"
        description="How to request deletion of your account and personal data on Into the Wild."
        canonicalUrl="/data-deletion"
      />
      <MobilePage>
        <MobileSection
          title="Data Deletion"
          subtitle={`Last Updated: ${lastUpdated}`}
        >
          <div className="mobile-list">
            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">Overview</h3>
              <p className="mobile-body">
                You can request deletion of your account and personal
                information at any time. Upon verification, we will delete or
                irreversibly anonymize your personal data, subject to legal and
                regulatory retention requirements under Indian law.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">What gets deleted</h3>
              <ul className="list-disc list-inside space-y-1 mobile-body">
                <li>
                  Account profile information (name, email, phone, address)
                </li>
                <li>
                  Profile media (avatars, images you uploaded not in public
                  galleries)
                </li>
                <li>Registration details for upcoming treks</li>
                <li>Preference and interests data</li>
              </ul>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">
                What may be retained (legal obligations)
              </h3>
              <ul className="list-disc list-inside space-y-1 mobile-body">
                <li>
                  Financial records required by law (typically up to 7 years)
                </li>
                <li>Security, fraud prevention, and audit logs</li>
                <li>
                  Content that other users depend on (e.g., group photos in
                  public gallery) may be retained or anonymized
                </li>
                <li>
                  Backups: data already present in encrypted backups will be
                  purged on the normal backup rotation schedule
                </li>
              </ul>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">How to request deletion</h3>
              <ol className="list-decimal list-inside space-y-1 mobile-body">
                <li>
                  Email your request to{" "}
                  <a
                    className="text-primary underline"
                    href="mailto:agarthaunderground@gmail.com"
                  >
                    agarthaunderground@gmail.com
                  </a>{" "}
                  or{" "}
                  <a
                    className="text-primary underline"
                    href="mailto:shreyasmadhan82@gmail.com"
                  >
                    shreyasmadhan82@gmail.com
                  </a>{" "}
                  from your registered email ID.
                </li>
                <li>
                  Include: your full name, registered phone number, and a
                  statement: “I request deletion of my Into the Wild account and
                  data.”
                </li>
                <li>
                  We will send a verification email/OTP to confirm the request.
                </li>
                <li>
                  Once verified, we will process the deletion within 30 days and
                  notify you on completion.
                </li>
              </ol>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">Impact of deletion</h3>
              <ul className="list-disc list-inside space-y-1 mobile-body">
                <li>
                  You will lose access to your account and any booked events.
                </li>
                <li>
                  Community posts may be anonymized instead of removed if others
                  rely on the content.
                </li>
                <li>
                  Refunds (if any) will follow existing payment and refund
                  policies.
                </li>
              </ul>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">Jurisdiction</h3>
              <p className="mobile-body">
                Requests are handled under applicable Indian laws. Any disputes
                are subject to the exclusive jurisdiction of the courts in
                Bengaluru, India.
              </p>
            </MobileCard>
          </div>
        </MobileSection>
      </MobilePage>
    </>
  );
}
