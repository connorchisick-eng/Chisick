import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Security — Tabby",
};

export default function SecurityPage() {
  return (
    <LegalPage
      kind="Security"
      monogram="S."
      title="Security Posture."
      accentWord="Security"
      updated="April 18, 2026"
      effective="April 18, 2026"
      outroTagline="trust, but verify"
      outroQuestion="Found a security issue?"
      intro={
        <>
          Tabby is being built to handle money, so security isn&apos;t an
          afterthought — it&apos;s the foundation we&apos;re pouring before
          anything else lands on top. This page describes how we protect the
          information you share with us on this pre-launch site, and the
          direction we&apos;re building for the app.
        </>
      }
      summary={[
        {
          label: "Today",
          text: "HTTPS everywhere. Managed Postgres. No card data on this site. Minimal collection — name and phone.",
        },
        {
          label: "At launch",
          text: "PCI-compliant payments through a regulated banking partner. Funds held in escrow until everyone pays.",
        },
        {
          label: "Authentication",
          text: "Phone verification at signup. Device-level biometrics — Face ID, Touch ID, Android — to authorize tabs.",
        },
        {
          label: "Disclosure",
          text: "Found a vulnerability? Tap Ask Tabby with details. Responsible disclosure welcomed and credited.",
        },
      ]}
      sections={[
        {
          id: "today-site",
          title: "Today: the waitlist site",
          content: (
            <ul>
              <li>
                <strong>Encryption in transit</strong> — the entire Site is
                served over HTTPS/TLS. Waitlist submissions travel encrypted
                end-to-end between your browser and our database.
              </li>
              <li>
                <strong>Managed database</strong> — waitlist entries are
                stored in a managed PostgreSQL instance. Database access
                requires a rotating credential known only to the Tabby team,
                and is restricted by IP allowlist.
              </li>
              <li>
                <strong>No payment data</strong> — we do not collect card
                numbers, bank details, or any financial information on this
                pre-launch site.
              </li>
              <li>
                <strong>Minimal collection</strong> — we ask only for the name
                and phone number needed to reach you at launch.
              </li>
              <li>
                <strong>Hardened headers</strong> — strict transport security,
                content-type sniffing protection, and conservative referrer
                policy on every response.
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
                <strong>PCI-compliant payments</strong> — card and bank
                transactions will be handled by a regulated
                banking-infrastructure partner. Tabby will not store card
                numbers or account details on our own servers.
              </li>
              <li>
                <strong>Escrowed settlement</strong> — participant funds will
                be held in a secure escrow account until a tab is fully paid.
                A one-time virtual card is generated only when the full amount
                is collected.
              </li>
              <li>
                <strong>Encryption at rest</strong> — personal and
                transactional data will be encrypted at rest using
                industry-standard algorithms.
              </li>
              <li>
                <strong>Authentication</strong> — accounts will require phone
                verification and support device-level biometrics (Face ID /
                Touch ID / Android biometrics).
              </li>
              <li>
                <strong>Audit trails</strong> — every state change on a tab
                (claim, edit, settle) is logged immutably so disputes have a
                clear record to lean on.
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
                We run on managed cloud infrastructure with an explicit
                preference for boring, well-maintained services over novel
                ones. Production access is gated by SSO, role-based
                permissions, and short-lived credentials. Background jobs and
                migrations are reviewed by a second engineer before they run.
              </p>
              <p>
                Backups are encrypted, tested, and stored in a separate
                region. We monitor uptime, error rates, and unusual traffic
                patterns continuously.
              </p>
            </>
          ),
        },
        {
          id: "disclosure",
          title: "Reporting a vulnerability",
          content: (
            <p>
              If you believe you have found a security issue — in this site,
              in a preview of the app, or anywhere else — please reach out
              through the &quot;Ask Tabby&quot; chat on the site with details.
              A dedicated security address will be published here at launch.
              We appreciate responsible disclosure, will respond as quickly
              as we can, and will credit you publicly (with your permission)
              once a fix has shipped.
            </p>
          ),
        },
        {
          id: "scope",
          title: "Scope & out-of-scope",
          content: (
            <>
              <p>
                In scope today: <em>splittabby.com</em>, the waitlist API,
                and the &quot;Ask Tabby&quot; assistant. We&apos;ll expand the
                in-scope surface as we approach launch.
              </p>
              <p>
                Out of scope: third-party services we link to, denial-of-service
                testing, social engineering of Tabby team members, and reports
                that depend on a victim running outdated browsers. Please don't
                run automated scanners against the site without coordinating
                first — happy to help if you do.
              </p>
            </>
          ),
        },
        {
          id: "changes",
          title: "Changes to this page",
          content: (
            <p>
              This page will be updated as Tabby&apos;s infrastructure
              evolves toward launch. Material updates will be dated above and
              the version stamp at the top of this document is bumped with
              every revision.
            </p>
          ),
        },
      ]}
    />
  );
}
