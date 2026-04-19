import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Tabby",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy." updated="April 18, 2026">
      <p>
        This Privacy Policy describes how Tabby (&quot;we,&quot; &quot;us,&quot;
        or &quot;our&quot;) collects, uses, and protects information on{" "}
        <strong>splittabby.com</strong> while the product is in development.
      </p>

      <h2>What we collect</h2>
      <p>
        At this pre-launch stage we collect only what you submit through the
        waitlist form and what your browser automatically provides:
      </p>
      <ul>
        <li>
          <strong>Name</strong> — optional, as entered on the waitlist form.
        </li>
        <li>
          <strong>Phone number</strong> — required to join the waitlist and
          reach you at launch.
        </li>
        <li>
          <strong>Technical metadata</strong> — your IP address, user-agent
          (browser/OS), and the page you came from (HTTP referer). Used only
          to prevent abuse and debug errors.
        </li>
        <li>
          <strong>Support chat</strong> — messages you send through the
          &quot;Ask Tabby&quot; AI assistant are processed by our AI provider
          (Anthropic) to generate responses. We do not store chat transcripts
          on our servers.
        </li>
      </ul>
      <p>
        We do not collect payment information, location, contacts, or
        biometric data at this time.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>To notify you when Tabby launches.</li>
        <li>
          To send occasional product updates related to the waitlist (no more
          than a few messages before launch).
        </li>
        <li>To operate, secure, and improve the website.</li>
      </ul>
      <p>
        We do not sell your information. We do not use it for third-party
        advertising.
      </p>

      <h2>How we store it</h2>
      <p>
        Waitlist entries are stored in a managed PostgreSQL database hosted by
        our infrastructure partner. Connections are encrypted in transit
        (TLS). Access is restricted to the Tabby team.
      </p>

      <h2>Who we share it with</h2>
      <p>
        We share information only with vendors who need it to run the site,
        under standard data-processing terms:
      </p>
      <ul>
        <li>Our hosting provider (serves the site and stores the database).</li>
        <li>Our AI provider (processes chat messages if you use the assistant).</li>
      </ul>
      <p>
        We will disclose information if required by law, subpoena, or to
        protect the rights or safety of users.
      </p>

      <h2>Your rights</h2>
      <p>
        You can request that we delete, correct, or export the data associated
        with your phone number at any time. A contact address for data
        requests will be listed here before launch; until then, reach out
        through the &quot;Ask Tabby&quot; chat on the site and we&apos;ll
        respond within 30 days.
      </p>
      <p>
        If you are a resident of California, the EU, or the UK, you have
        additional rights under the CCPA, GDPR, or UK GDPR respectively. The
        rights above apply equally.
      </p>

      <h2>Children</h2>
      <p>
        Tabby is not directed at children under 13, and we do not knowingly
        collect data from them.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy as the product develops. Material changes
        will be flagged on this page and dated above.
      </p>

      <h2>Contact</h2>
      <p>
        Privacy questions or deletion requests: use the &quot;Ask Tabby&quot;
        chat on the site. A dedicated privacy email will be listed here at
        launch.
      </p>
    </LegalPage>
  );
}
