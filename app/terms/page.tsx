import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — Tabby",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service." updated="April 18, 2026">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your use of
        <strong> splittabby.com</strong> (the &quot;Site&quot;). By using the
        Site you agree to these Terms.
      </p>

      <h2>1. What this is</h2>
      <p>
        The Site is a pre-launch marketing page for Tabby, a forthcoming
        mobile application for splitting restaurant bills. The Tabby app is
        not yet available. Joining the waitlist does not create an account,
        does not guarantee access at launch, and does not commit you to
        anything.
      </p>

      <h2>2. The waitlist</h2>
      <p>
        To join the waitlist you provide a phone number (and optionally, a
        name). We will contact you at that number with launch information and
        limited product updates. You can opt out or request deletion at any
        time — a contact address will be listed on this page at launch; until
        then, reach out through the &quot;Ask Tabby&quot; chat on the site.
      </p>

      <h2>3. Acceptable use</h2>
      <p>By using the Site you agree not to:</p>
      <ul>
        <li>Submit fraudulent, impersonating, or bulk-generated entries.</li>
        <li>Attempt to disrupt, probe, or exploit the Site or our systems.</li>
        <li>Scrape or resell content without written permission.</li>
        <li>Use the AI assistant for unlawful purposes.</li>
      </ul>

      <h2>4. AI assistant</h2>
      <p>
        The &quot;Ask Tabby&quot; assistant is an AI tool. It may produce
        inaccurate or incomplete answers. Nothing it says is a binding
        statement of product features, pricing, timing, or policy. For
        authoritative answers, email us.
      </p>

      <h2>5. Intellectual property</h2>
      <p>
        The Tabby name, mark, site design, text, illustrations, and source
        code are owned by Tabby or its licensors. You may not copy or
        reproduce them except for ordinary personal browsing.
      </p>

      <h2>6. Disclaimers</h2>
      <p>
        The Site is provided &quot;as is.&quot; We make no warranties of
        merchantability, fitness for a particular purpose, accuracy, or
        uninterrupted availability. Information on the Site is informational
        and may change.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, Tabby and its team will not
        be liable for any indirect, incidental, consequential, or punitive
        damages arising from your use of the Site. Our total liability for
        direct damages is limited to US $100.
      </p>

      <h2>8. Changes</h2>
      <p>
        We may update these Terms as the product develops. Material changes
        will be flagged on this page and dated above.
      </p>

      <h2>9. Governing law</h2>
      <p>
        These Terms are governed by the laws of the State of California,
        without regard to conflict-of-law rules. Any dispute will be resolved
        in the state or federal courts located in Los Angeles County,
        California.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about these Terms: use the &quot;Ask Tabby&quot; chat on
        the site. A dedicated email will be listed here at launch.
      </p>
    </LegalPage>
  );
}
