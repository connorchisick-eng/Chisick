import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Security - Tabby",
};

export default function SecurityPage() {
  return (
    <LegalPage
      kind="Security"
      monogram="S."
      title="Security Posture."
      accentWord="Security"
      updated="May 1, 2026"
      effective="May 1, 2026"
      outroTagline="trust, but verify"
      outroQuestion="Found a security issue?"
      intro={
        <>
          Tabby is being built to handle sensitive purchase and payment flows,
          so the security bar needs to be high before the app launches. This
          page describes the controls in place on the current pre-launch site
          and the security direction for the future app.
        </>
      }
      summary={[
        {
          label: "Today",
          text: "HTTPS, managed infrastructure, browser protections, request validation, and abuse-prevention controls. No card or bank data is collected on this site.",
        },
        {
          label: "Waitlist data",
          text: "Email is required. Name and phone are optional. Entries are stored with a managed database provider and internal credentials stay private.",
        },
        {
          label: "At launch",
          text: "Payment, banking, escrow, identity, and virtual-card flows will require additional partner controls and app-specific disclosures.",
        },
        {
          label: "Disclosure",
          text: "Responsible vulnerability reports are welcome. A direct security contact will be published before broader beta or launch.",
        },
      ]}
      sections={[
        {
          id: "today-site",
          title: "Today: the waitlist site",
          content: (
            <ul>
              <li>
                <strong>Encryption in transit</strong> - the Site is served
                over HTTPS/TLS, and waitlist submissions are sent to our API
                over encrypted browser connections.
              </li>
              <li>
                <strong>Managed database</strong> - waitlist entries are stored
                with a managed database provider. Internal credentials are not
                shipped to the browser.
              </li>
              <li>
                <strong>No payment data</strong> - this pre-launch site does
                not collect card numbers, bank details, identity documents, or
                other financial account information.
              </li>
              <li>
                <strong>Minimal waitlist fields</strong> - email is required;
                name and phone are optional. Partial phone entries are not sent
                by the primary waitlist form.
              </li>
              <li>
                <strong>API safeguards</strong> - waitlist and chat endpoints
                validate requests, limit abusive traffic, and avoid caching
                sensitive responses.
              </li>
              <li>
                <strong>Hardened browser policy</strong> - the site uses
                browser-level protections that limit framing, unsafe content
                handling, unnecessary browser permissions, and overly broad
                cross-site data sharing.
              </li>
            </ul>
          ),
        },
        {
          id: "chat",
          title: "Ask Tabby safety",
          content: (
            <ul>
              <li>
                <strong>Tabby-only answers</strong> - the assistant is designed
                for general questions about Tabby, the waitlist, and the
                product direction. It is not a general-purpose chatbot.
              </li>
              <li>
                <strong>Abuse prevention</strong> - we use safeguards to reduce
                spam, automated abuse, and attempts to misuse the assistant.
              </li>
              <li>
                <strong>Protected processing</strong> - messages are processed
                through controlled server-side systems, so private service
                credentials are not exposed in the browser.
              </li>
              <li>
                <strong>No sensitive details</strong> - do not send passwords,
                payment details, private legal requests, or future account
                support issues through the assistant.
              </li>
            </ul>
          ),
        },
        {
          id: "launch-app",
          title: "At launch: the Tabby app",
          content: (
            <ul>
              <li>
                <strong>Payment partners</strong> - card, bank, escrow, and
                virtual-card flows will be handled through appropriate regulated
                infrastructure partners and app-specific agreements.
              </li>
              <li>
                <strong>No raw card storage by Tabby</strong> - the intended
                architecture is to rely on compliant payment infrastructure for
                sensitive payment credentials instead of storing raw card or
                bank numbers on Tabby servers.
              </li>
              <li>
                <strong>Account controls</strong> - the app will need stronger
                authentication, account recovery, device controls, and fraud
                monitoring before real funds move.
              </li>
              <li>
                <strong>Auditability</strong> - tab state changes such as item
                claims, edits, payments, and settlement will need durable audit
                trails so disputes can be investigated.
              </li>
            </ul>
          ),
        },
        {
          id: "infrastructure",
          title: "Infrastructure & operations",
          content: (
            <>
              <p>
                The current Site runs on managed cloud infrastructure. We prefer
                managed, well-maintained services instead of custom
                security-sensitive infrastructure. Production secrets are kept
                out of source code.
              </p>
              <p>
                As the app moves toward broader beta, this page should be
                expanded with additional public-facing commitments for access
                review, incident response, vendor review, and payment-specific
                compliance without exposing internal implementation details.
              </p>
            </>
          ),
        },
        {
          id: "disclosure",
          title: "Reporting a vulnerability",
          content: (
            <p>
              If you believe you have found a security issue in this site, the
              waitlist API, or the AI assistant, please avoid public disclosure
              until we have had a fair chance to investigate and fix it. A
              dedicated security contact will be published here before broader
              beta access or public launch. Please do not run high-volume
              scanners, denial-of-service tests, or social-engineering attempts.
            </p>
          ),
        },
        {
          id: "scope",
          title: "Scope & out-of-scope",
          content: (
            <>
              <p>
                In scope today: <em>splittabby.com</em>, the waitlist API, the
                demo page, and the &quot;Ask Tabby&quot; assistant. We will
                expand the in-scope surface as we approach launch.
              </p>
              <p>
                Out of scope: third-party services we link to, denial-of-service
                testing, social engineering of Tabby team members, and reports
                that depend on a victim running outdated browsers.
              </p>
            </>
          ),
        },
        {
          id: "changes",
          title: "Changes to this page",
          content: (
            <p>
              This page will be updated as Tabby&apos;s infrastructure evolves
              toward launch. Material updates will be dated above and the
              version stamp at the top of this document is bumped with every
              revision.
            </p>
          ),
        },
      ]}
    />
  );
}
