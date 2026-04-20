import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Tabby",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy." updated="April 18, 2026">
      <p>
        <strong>Tabby is committed to protecting your privacy.</strong> Your
        data is yours — we treat it that way from the first keystroke to the
        day you ask us to delete it. This policy explains, in plain language,
        what Tabby (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
        collects on <strong>splittabby.com</strong> while the product is in
        development, why we collect it, and the control you have over it.
      </p>

      <h2>What we collect</h2>
      <p>
        Our philosophy is simple: collect the minimum we need, nothing more.
        At this pre-launch stage that comes down to what you choose to submit
        through the waitlist form and the basic metadata your browser sends
        automatically with every request.
      </p>
      <ul>
        <li>
          <strong>Name</strong> — optional, and only if you choose to share
          one.
        </li>
        <li>
          <strong>Phone number</strong> — required so we can let you know when
          Tabby is live.
        </li>
        <li>
          <strong>Technical metadata</strong> — IP address, user-agent, and
          referring page. Used only to keep the site healthy, prevent abuse,
          and debug errors. Never sold, never used for ad targeting.
        </li>
        <li>
          <strong>Support chat</strong> — messages you send through the
          &quot;Ask Tabby&quot; AI assistant are processed by our AI provider
          (Anthropic) so we can answer you. We don&apos;t retain chat
          transcripts on our servers.
        </li>
      </ul>
      <p>
        We do not collect payment information, precise location, your
        contacts, or biometric data on this site.
      </p>

      <h2>How we use it</h2>
      <p>
        Your information is only used to deliver the experience you signed up
        for and to keep the site running well:
      </p>
      <ul>
        <li>To let you know when Tabby launches.</li>
        <li>
          To send the occasional short product update leading up to launch
          (we&apos;ll keep it to a handful of messages, max).
        </li>
        <li>To operate, secure, and improve the site itself.</li>
      </ul>
      <p>
        <strong>We never sell your information.</strong> We don&apos;t rent
        it, share it for advertising, or hand it to data brokers. That&apos;s
        a line we won&apos;t cross.
      </p>

      <h2>How we store it</h2>
      <p>
        Waitlist entries are stored in a managed PostgreSQL database hosted
        by a reputable infrastructure partner. Connections are encrypted in
        transit with TLS, access is restricted to the Tabby team, and the
        database itself sits behind modern network controls. We review our
        storage practices regularly as the product evolves.
      </p>

      <h2>Who we share it with</h2>
      <p>
        We share information only with the vendors we genuinely need to run
        the site, and only under standard data-processing agreements:
      </p>
      <ul>
        <li>Our hosting provider — serves the site and hosts the database.</li>
        <li>Our AI provider — processes chat messages if you use the assistant.</li>
      </ul>
      <p>
        We will disclose information if we&apos;re required to by law or a
        valid legal process, or if it&apos;s strictly necessary to protect
        the rights and safety of our users. If we ever receive a request
        like that, we push back whenever we can.
      </p>

      <h2>Your rights + your control</h2>
      <p>
        You&apos;re always in the driver&apos;s seat. You can ask us to
        delete, correct, or export the data tied to your phone number at
        any time — no hoops, no hassle. A dedicated data-requests address
        will be listed here at launch; until then, reach out through the
        &quot;Ask Tabby&quot; chat on the site and we&apos;ll respond within
        30 days.
      </p>
      <p>
        If you live in California, the EU, or the UK, you have additional
        rights under the CCPA, GDPR, or UK GDPR respectively. The rights
        described above apply equally to everyone — we don&apos;t treat
        anyone&apos;s data as worth less.
      </p>

      <h2>Children</h2>
      <p>
        Tabby is not directed at children under 13, and we don&apos;t
        knowingly collect data from them. If you believe a child has
        submitted information to us, contact us and we&apos;ll remove it
        promptly.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy as Tabby grows. Material changes will
        always be flagged on this page and dated above — no quiet rewrites.
      </p>

      <h2>Contact</h2>
      <p>
        Privacy questions or deletion requests: use the &quot;Ask Tabby&quot;
        chat on the site. A dedicated privacy email will be listed here at
        launch. We read every message.
      </p>
    </LegalPage>
  );
}
