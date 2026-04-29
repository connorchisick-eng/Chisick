import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — Tabby",
};

export default function TermsPage() {
  return (
    <LegalPage
      kind="Terms"
      monogram="T."
      title="Terms of Service."
      accentWord="Service"
      updated="April 18, 2026"
      effective="April 18, 2026"
      outroTagline="rules of the table"
      outroQuestion="Questions about the terms?"
      intro={
        <>
          These Terms of Service (&quot;Terms&quot;) govern your use of{" "}
          <strong>splittabby.com</strong> (the &quot;Site&quot;). By using the
          Site you agree to these Terms. We&apos;ve tried to keep the language
          plain — no clause salad, no traps. If something here is unclear, ask
          us.
        </>
      }
      summary={[
        {
          label: "Pre-launch site",
          text: "This is a marketing page for an unreleased app. Joining the waitlist isn't an account and doesn't guarantee access at launch.",
        },
        {
          label: "Acceptable use",
          text: "Don't impersonate, scrape, or attack the site. The AI chat is a tool, not legal or product advice.",
        },
        {
          label: "Liability cap",
          text: "Site is provided 'as is.' Total liability for direct damages is limited to US $100. No indirect damages.",
        },
        {
          label: "Jurisdiction",
          text: "California law. Disputes go to state or federal courts in Los Angeles County.",
        },
      ]}
      sections={[
        {
          id: "what-this-is",
          title: "What this is",
          content: (
            <p>
              The Site is a pre-launch marketing page for Tabby, a forthcoming
              mobile application for splitting restaurant bills. The Tabby app
              is not yet available. Joining the waitlist does not create an
              account, does not guarantee access at launch, and does not
              commit you to anything. Likewise, nothing on the Site is a
              binding offer to provide a financial product.
            </p>
          ),
        },
        {
          id: "waitlist",
          title: "The waitlist",
          content: (
            <p>
              To join the waitlist you provide a phone number (and optionally,
              a name). We will contact you at that number with launch
              information and limited product updates. You can opt out or
              request deletion at any time — a contact address will be listed
              on this page at launch; until then, reach out through the
              &quot;Ask Tabby&quot; chat on the site.
            </p>
          ),
        },
        {
          id: "acceptable-use",
          title: "Acceptable use",
          content: (
            <>
              <p>By using the Site you agree not to:</p>
              <ul>
                <li>
                  Submit fraudulent, impersonating, or bulk-generated entries.
                </li>
                <li>
                  Attempt to disrupt, probe, or exploit the Site or our
                  systems.
                </li>
                <li>Scrape or resell content without written permission.</li>
                <li>Use the AI assistant for unlawful purposes.</li>
              </ul>
            </>
          ),
        },
        {
          id: "ai-assistant",
          title: "AI assistant",
          content: (
            <p>
              The &quot;Ask Tabby&quot; assistant is an AI tool. It may produce
              inaccurate or incomplete answers. Nothing it says is a binding
              statement of product features, pricing, timing, or policy. For
              authoritative answers, email us — and at launch, the address
              listed at the top of this document is the source of truth.
            </p>
          ),
        },
        {
          id: "ip",
          title: "Intellectual property",
          content: (
            <p>
              The Tabby name, mark, site design, text, illustrations, and
              source code are owned by Tabby or its licensors. You may not
              copy or reproduce them except for ordinary personal browsing.
              Press, partners, and journalists may quote short excerpts with
              attribution.
            </p>
          ),
        },
        {
          id: "disclaimers",
          title: "Disclaimers",
          content: (
            <p>
              The Site is provided &quot;as is.&quot; We make no warranties of
              merchantability, fitness for a particular purpose, accuracy, or
              uninterrupted availability. Information on the Site is
              informational and may change without notice. Plans, screenshots,
              and copy are illustrative of where we&apos;re headed, not a
              guarantee of the final product.
            </p>
          ),
        },
        {
          id: "liability",
          title: "Limitation of liability",
          content: (
            <p>
              To the fullest extent permitted by law, Tabby and its team will
              not be liable for any indirect, incidental, consequential, or
              punitive damages arising from your use of the Site. Our total
              liability for direct damages is limited to US $100.
            </p>
          ),
        },
        {
          id: "changes",
          title: "Changes to these terms",
          content: (
            <p>
              We may update these Terms as the product develops. Material
              changes will be flagged on this page and dated above. The
              version field in the stamp at the top of this document is bumped
              with every revision.
            </p>
          ),
        },
        {
          id: "law",
          title: "Governing law",
          content: (
            <p>
              These Terms are governed by the laws of the State of California,
              without regard to conflict-of-law rules. Any dispute will be
              resolved in the state or federal courts located in Los Angeles
              County, California.
            </p>
          ),
        },
        {
          id: "contact",
          title: "Contact",
          content: (
            <p>
              Questions about these Terms: use the &quot;Ask Tabby&quot; chat
              on the site. A dedicated email will be listed here at launch.
            </p>
          ),
        },
      ]}
    />
  );
}
