import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Security — Tabby",
};

export default function SecurityPage() {
  return (
    <LegalPage title="Security." updated="April 18, 2026">
      <p>
        <strong>
          Tabby is built with modern, bank-grade security measures from day
          one.
        </strong>{" "}
        Because Tabby will handle real money between real people, we treat
        security as a first-class feature — not a finish-line fix. This
        page walks through the layered protections already in place on this
        pre-launch site, and the security posture we&apos;re committing to
        as we move toward the Tabby app itself.
      </p>

      <h2>Today: the waitlist site</h2>
      <ul>
        <li>
          <strong>End-to-end encryption in transit.</strong> The entire Site
          is served over HTTPS with modern TLS. Every waitlist submission
          travels encrypted between your browser and our database — never
          in the clear, never exposed to the networks in between.
        </li>
        <li>
          <strong>Hardened, managed database.</strong> Waitlist entries are
          stored in a managed PostgreSQL instance from an enterprise-grade
          infrastructure partner. Access requires a rotating credential
          that only the Tabby team holds, and traffic is restricted by IP
          allowlist so the database isn&apos;t reachable from the open
          internet.
        </li>
        <li>
          <strong>Zero payment data on the marketing site.</strong> Nothing
          to protect is nothing to breach. We do not ask for card numbers,
          bank details, or any financial information at this stage.
        </li>
        <li>
          <strong>Minimal collection by design.</strong> We only ask for the
          name and phone number we genuinely need to reach you at launch.
          Everything optional is optional.
        </li>
        <li>
          <strong>Continuous monitoring.</strong> The site sits behind
          edge-level rate limiting and request logging, so abnormal traffic
          is flagged automatically.
        </li>
      </ul>

      <h2>At launch: the Tabby app</h2>
      <p>
        The app is being architected on the same principles that protect
        traditional banking products. Some of what we&apos;re building in
        from day one:
      </p>
      <ul>
        <li>
          <strong>PCI-DSS-compliant payment processing.</strong> Card and
          bank transactions will be handled exclusively by a regulated
          banking-infrastructure partner. Raw card numbers and account
          details will never touch Tabby&apos;s own servers.
        </li>
        <li>
          <strong>Escrowed settlement.</strong> Participant funds will be
          held in a secure, regulated escrow account until every
          person&apos;s share of a tab is paid. A one-time virtual card is
          issued only once the full amount is collected — no one fronts the
          bill, no one is left chasing.
        </li>
        <li>
          <strong>AES-256 encryption at rest.</strong> Personal and
          transactional data will be encrypted at rest with industry-
          standard algorithms. Keys are managed through a dedicated
          key-management service, rotated on a regular schedule.
        </li>
        <li>
          <strong>Biometric authentication.</strong> Accounts will require
          phone verification and support device-level biometrics — Face ID,
          Touch ID, and Android biometrics — so you can lock Tabby down to
          your device.
        </li>
        <li>
          <strong>Principle of least privilege.</strong> Internally, access
          to production data is strictly role-based, logged, and audited.
          No single person holds broad, unreviewed access to user data.
        </li>
        <li>
          <strong>Third-party review.</strong> Before general availability,
          Tabby will undergo independent security testing — penetration
          tests and code review — by experienced security professionals.
        </li>
      </ul>

      <h2>Reporting a vulnerability</h2>
      <p>
        Security is a team sport, and we genuinely appreciate the community
        that helps make software safer. If you believe you&apos;ve found a
        security issue in this site, in a preview of the app, or anywhere
        else Tabby-related, please tell us. For now, reach out through the
        &quot;Ask Tabby&quot; chat with the details and we&apos;ll route it
        to the right person. A dedicated security disclosure address will
        be published here at launch. We commit to responding quickly,
        fixing verified issues on a clear timeline, and giving researchers
        public credit when they want it.
      </p>

      <h2>Changes</h2>
      <p>
        This page will evolve as Tabby&apos;s infrastructure matures toward
        launch and beyond. Material updates will always be flagged here
        and dated above.
      </p>
    </LegalPage>
  );
}
