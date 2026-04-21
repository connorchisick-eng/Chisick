import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — Tabby",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service." updated="April 18, 2026">
      <p>
        Welcome to Tabby. These Terms of Service (&quot;Terms&quot;) are the
        ground rules for using <strong>splittabby.com</strong> (the
        &quot;Site&quot;). We&apos;ve tried to keep them short, honest, and
        written in plain English — no small-print tricks, no buried gotchas.
        By using the Site, you&apos;re agreeing to what&apos;s below. If
        anything feels unclear, tap &quot;Ask Tabby&quot; in the corner and
        we&apos;ll explain it without the jargon.
      </p>

      <h2>1. What this is</h2>
      <p>
        The Site is a pre-launch marketing page for Tabby — a forthcoming
        mobile application for splitting restaurant bills without the
        awkwardness. The Tabby app is not yet available. Joining the
        waitlist doesn&apos;t create an account, doesn&apos;t guarantee
        you&apos;ll make the cut at launch, and doesn&apos;t commit you to
        anything. Consider it a save-the-date.
      </p>

      <h2>2. The waitlist</h2>
      <p>
        To join the waitlist, you share a phone number (a name is optional).
        We&apos;ll contact you at that number with launch news and a small
        number of meaningful product updates — never more than you&apos;d
        want. You can opt out or ask us to delete your entry at any time. A
        contact address will be listed on this page at launch; until then,
        reach out through the &quot;Ask Tabby&quot; chat and we&apos;ll take
        care of it.
      </p>

      <h2>3. Acceptable use</h2>
      <p>
        We want Tabby to feel good to use, so we ask the same of you. By
        using the Site, you agree not to:
      </p>
      <ul>
        <li>Submit fraudulent, impersonated, or bulk-generated entries.</li>
        <li>
          Attempt to disrupt, probe, reverse-engineer, or exploit the Site
          or our underlying systems.
        </li>
        <li>Scrape, mirror, or resell content without written permission.</li>
        <li>
          Use the AI assistant for anything illegal, harmful, or designed to
          mislead others.
        </li>
      </ul>

      <h2>4. AI assistant</h2>
      <p>
        The &quot;Ask Tabby&quot; assistant is an AI tool. It&apos;s helpful,
        it&apos;s fast, and — like any AI — it can occasionally be wrong.
        Nothing it says is a binding commitment about product features,
        pricing, launch timing, or policy. For anything that really matters,
        email us and we&apos;ll give you a definitive answer.
      </p>

      <h2>5. Intellectual property</h2>
      <p>
        The Tabby name, mark, site design, illustrations, words, and source
        code are owned by Tabby or its licensors. Enjoy the site, share
        links freely, but please don&apos;t copy the design, text, or code
        for your own projects without asking first.
      </p>

      <h2>6. Disclaimers</h2>
      <p>
        The Site is provided &quot;as is&quot; and &quot;as available.&quot;
        We work hard to keep it accurate, fast, and reliable, but we
        can&apos;t promise uninterrupted uptime or that every piece of
        pre-launch information will turn out exactly as described. Use it
        with that in mind.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the fullest extent allowed by law, Tabby and its team won&apos;t
        be liable for indirect, incidental, consequential, or punitive
        damages arising from your use of the Site. Our total liability for
        direct damages is limited to US $100. This is standard stuff, but
        we&apos;re saying it up front so there are no surprises.
      </p>

      <h2>8. Changes</h2>
      <p>
        We may update these Terms as the product develops. When we make
        material changes, we&apos;ll flag them on this page and update the
        date above — no quiet rewrites.
      </p>

      <h2>9. Governing law</h2>
      <p>
        These Terms are governed by the laws of the State of California,
        without regard to conflict-of-law rules. Any dispute will be
        resolved in the state or federal courts located in Los Angeles
        County, California.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about these Terms? Use the &quot;Ask Tabby&quot; chat on
        the site. A dedicated email address will be listed here at launch.
      </p>
    </LegalPage>
  );
}
