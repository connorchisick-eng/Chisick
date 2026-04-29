import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Tabby",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      kind="Privacy"
      monogram="P."
      title="Privacy Policy."
      accentWord="Privacy"
      updated="April 18, 2026"
      effective="April 18, 2026"
      outroTagline="your data, in the open"
      outroQuestion="Questions about your data?"
      intro={
        <>
          This Privacy Policy describes how Tabby (&quot;we,&quot; &quot;us,&quot;
          or &quot;our&quot;) collects, uses, and protects information on{" "}
          <strong>splittabby.com</strong> while the product is in development.
          We collect the minimum we need to reach you at launch — nothing more,
          nothing sold, nothing shared with anyone trying to sell you something.
        </>
      }
      summary={[
        {
          label: "Data we collect",
          text: "Your phone number (required) and your name (optional). Plus standard browser metadata to prevent abuse.",
        },
        {
          label: "Where it lives",
          text: "Encrypted in transit. Stored in a managed Postgres database we control, behind an IP allowlist.",
        },
        {
          label: "Who sees it",
          text: "Only Tabby and our hosting + AI providers. Never sold. Never used for third-party advertising.",
        },
        {
          label: "Your control",
          text: "Delete, correct, or export your data anytime. Reach out via Ask Tabby in the corner — we respond within 30 days.",
        },
      ]}
      sections={[
        {
          id: "collection",
          title: "What we collect",
          content: (
            <>
              <p>
                At this pre-launch stage we collect only what you submit through
                the waitlist form and what your browser automatically provides:
              </p>
              <ul>
                <li>
                  <strong>Name</strong> — optional, as entered on the waitlist
                  form.
                </li>
                <li>
                  <strong>Phone number</strong> — required to join the waitlist
                  and reach you at launch.
                </li>
                <li>
                  <strong>Technical metadata</strong> — your IP address,
                  user-agent (browser/OS), and the page you came from (HTTP
                  referer). Used only to prevent abuse and debug errors.
                </li>
                <li>
                  <strong>Support chat</strong> — messages you send through the
                  &quot;Ask Tabby&quot; AI assistant are processed by our AI
                  provider (Anthropic) to generate responses. We do not store
                  chat transcripts on our servers.
                </li>
              </ul>
              <p>
                We do not collect payment information, location, contacts, or
                biometric data at this time.
              </p>
            </>
          ),
        },
        {
          id: "use",
          title: "How we use it",
          content: (
            <>
              <ul>
                <li>To notify you when Tabby launches.</li>
                <li>
                  To send occasional product updates related to the waitlist
                  (no more than a few messages before launch).
                </li>
                <li>To operate, secure, and improve the website.</li>
              </ul>
              <p>
                We do not sell your information. We do not use it for
                third-party advertising. We do not build a shadow profile of
                you or sync our list with ad networks.
              </p>
            </>
          ),
        },
        {
          id: "storage",
          title: "How we store it",
          content: (
            <p>
              Waitlist entries are stored in a managed PostgreSQL database
              hosted by our infrastructure partner. Connections are encrypted
              in transit (TLS 1.2+). Database access requires a rotating
              credential known only to the Tabby team and is restricted by IP
              allowlist. Backups are encrypted at rest.
            </p>
          ),
        },
        {
          id: "sharing",
          title: "Who we share it with",
          content: (
            <>
              <p>
                We share information only with vendors who need it to run the
                site, under standard data-processing terms:
              </p>
              <ul>
                <li>
                  <strong>Hosting provider</strong> — serves the site and
                  stores the database.
                </li>
                <li>
                  <strong>AI provider</strong> — processes chat messages if you
                  use the &quot;Ask Tabby&quot; assistant.
                </li>
              </ul>
              <p>
                We will disclose information if required by law, subpoena, or
                to protect the rights or safety of users.
              </p>
            </>
          ),
        },
        {
          id: "rights",
          title: "Your rights",
          content: (
            <>
              <p>
                You can request that we delete, correct, or export the data
                associated with your phone number at any time. A contact
                address for data requests will be listed here before launch;
                until then, reach out through the &quot;Ask Tabby&quot; chat on
                the site and we&apos;ll respond within 30 days.
              </p>
              <p>
                If you are a resident of California, the EU, or the UK, you
                have additional rights under the CCPA, GDPR, or UK GDPR
                respectively. The rights above apply equally — you can ask us
                what we have, ask us to delete it, ask us to stop processing
                it, or request a copy.
              </p>
            </>
          ),
        },
        {
          id: "children",
          title: "Children",
          content: (
            <p>
              Tabby is not directed at children under 13, and we do not
              knowingly collect data from them. If you believe a child has
              submitted information, contact us and we&apos;ll delete it.
            </p>
          ),
        },
        {
          id: "changes",
          title: "Changes to this policy",
          content: (
            <p>
              We may update this policy as the product develops. Material
              changes will be flagged on this page and dated above. The
              version field in the stamp at the top of this document is bumped
              with every revision so you can tell at a glance whether anything
              has shifted since your last visit.
            </p>
          ),
        },
        {
          id: "contact",
          title: "Contact",
          content: (
            <p>
              Privacy questions or deletion requests: use the &quot;Ask
              Tabby&quot; chat on the site. A dedicated privacy email will be
              listed here at launch.
            </p>
          ),
        },
      ]}
    />
  );
}
