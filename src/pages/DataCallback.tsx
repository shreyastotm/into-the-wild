import {
  MobileCard,
  MobilePage,
  MobileSection,
} from "@/components/mobile/MobilePage";
import { SEOHead } from "@/components/SEOHead";

export default function DataCallbackPage() {
  const lastUpdated = "01/11/2025";

  return (
    <>
      <SEOHead
        title="Data Callback Instructions - Into the Wild"
        description="Instructions to request access, export, correction, or withdrawal of your data, and request a callback regarding your privacy at Into the Wild."
        canonicalUrl="/data-callback"
      />
      <MobilePage>
        <MobileSection
          title="Data Callback Instructions"
          subtitle={`Last Updated: ${lastUpdated}`}
        >
          <div className="mobile-list">
            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">Overview</h3>
              <p className="mobile-body">
                You can request access to your data, obtain a copy (export),
                request correction, restrict processing, withdraw consent, or
                ask for a callback regarding your privacy concerns. We respond
                within 30 days as per Indian standards.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">How to submit a request</h3>
              <ol className="list-decimal list-inside space-y-1 mobile-body">
                <li>
                  Email us at{" "}
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
                  Include: full name, registered phone number, and specify the
                  request type (Access / Export / Correction / Restrict /
                  Withdraw Consent / Callback).
                </li>
                <li>
                  For a callback, provide your preferred time-window and phone
                  number.
                </li>
                <li>
                  We will verify your identity via email/OTP before processing.
                </li>
              </ol>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">
                Types of requests we support
              </h3>
              <ul className="list-disc list-inside space-y-1 mobile-body">
                <li>
                  <strong>Access</strong>: Get a summary of data we hold about
                  you.
                </li>
                <li>
                  <strong>Export</strong>: Receive a machine-readable copy
                  (JSON/CSV) of core data elements.
                </li>
                <li>
                  <strong>Correction</strong>: Update inaccurate or incomplete
                  data.
                </li>
                <li>
                  <strong>Restriction</strong>: Limit non-essential processing
                  (e.g., marketing).
                </li>
                <li>
                  <strong>Withdraw Consent</strong>: Stop optional processing
                  you previously agreed to.
                </li>
                <li>
                  <strong>Callback</strong>: Request a phone call to discuss
                  your privacy or account.
                </li>
              </ul>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">Timelines</h3>
              <ul className="list-disc list-inside space-y-1 mobile-body">
                <li>Acknowledge request: within 72 hours</li>
                <li>Complete request: within 30 days of verification</li>
                <li>
                  Complex requests may require additional time; we will notify
                  you with reasons
                </li>
              </ul>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">
                Verification and security
              </h3>
              <p className="mobile-body">
                To protect your privacy, we verify identity before sharing or
                modifying data. If we cannot verify, we may request additional
                information or deny the request with reasons.
              </p>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">Limitations</h3>
              <ul className="list-disc list-inside space-y-1 mobile-body">
                <li>
                  We may refuse requests that are manifestly unfounded,
                  repetitive, or excessive.
                </li>
                <li>
                  Certain data may be retained to comply with legal obligations
                  (e.g., financial records).
                </li>
                <li>Backups will be purged on the normal rotation schedule.</li>
              </ul>
            </MobileCard>

            <MobileCard>
              <h3 className="mobile-heading-3 mb-3">
                Escalation and grievance
              </h3>
              <p className="mobile-body">
                If you are unsatisfied with the response, email our grievance
                team at{" "}
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
                </a>
                . We will attempt resolution within 30 days.
              </p>
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
