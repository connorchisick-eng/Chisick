import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Security — Tabby",
};

export default function SecurityPage() {
  return (
    <LegalPage title="Security." updated="April 18, 2026">
      <p>
        Tabby is being built to handle money, so security isn&apos;t an
        afterthought. This page describes how we protect the information you
        share with us on this pre-launch site, and the direction we&apos;re
        building for the app.
      </p>

      <h2>Today: the waitlist site</h2>
      <ul>
        <li>
          <strong>Encryption in transit</strong> — the entire Site is served
          over HTTPS/TLS. Waitlist submissions travel encrypted end-to-end
          between your browser and our database.
        </li>
        <li>
          <strong>Managed database</strong> — waitlist entries are stored in a
          managed PostgreSQL instance. Database access requires a rotating
          credential known only to the Tabby team, and is restricted by IP
          allowlist.
        </li>
        <li>
          <strong>No payment data</strong> — we do not collect card numbers,
          bank details, or any financial information on this pre-launch site.
        </li>
        <li>
          <strong>Minimal collection</strong> — we ask only for the name and
          phone number needed to reach you at launch.
        </li>
      </ul>

      <h2>At launch: the Tabby app</h2>
      <ul>
        <li>
          <strong>PCI-compliant payments</strong> — card and bank transactions
          will be handled by a regulated banking-infrastructure partner. Tabby
          will not store card numbers or account details on our own servers.
        </li>
        <li>
          <strong>Escrowed settlement</strong> — participant funds will be
          held in a secure escrow account until a tab is fully paid. A
          one-time virtual card is generated only when the full amount is
          collected.
        </li>
        <li>
          <strong>Encryption at rest</strong> — personal and transactional
          data will be encrypted at rest using industry-standard algorithms.
        </li>
        <li>
          <strong>Authentication</strong> — accounts will require phone
          verification and support device-level biometrics (Face ID / Touch
          ID / Android biometrics).
        </li>
      </ul>

      <h2>Reporting a vulnerability</h2>
      <p>
        If you believe you have found a security issue — in this site, in a
        preview of the app, or anywhere else — please reach out through the
        &quot;Ask Tabby&quot; chat on the site with details. A dedicated
        security address will be published here at launch. We appreciate
        responsible disclosure and will respond as quickly as we can.
      </p>

      <h2>Changes</h2>
      <p>
        This page will be updated as Tabby&apos;s infrastructure evolves
        toward launch. Material updates will be dated above.
      </p>
    </LegalPage>
  );
}
