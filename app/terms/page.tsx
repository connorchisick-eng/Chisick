import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service - Tabby",
};

export default function TermsPage() {
  return (
    <LegalPage
      kind="Terms"
      monogram="T."
      title="Terms of Service."
      accentWord="Service"
      updated="May 1, 2026"
      effective="May 1, 2026"
      outroTagline="rules of the table"
      outroQuestion="Questions about the terms?"
      intro={
        <>
          These Terms of Service (&quot;Terms&quot;) govern your use of{" "}
          <strong>splittabby.com</strong> (the &quot;Site&quot;). By using the
          Site you agree to these Terms. The Site is pre-launch, so these Terms
          cover the marketing website, waitlist, demo, and AI assistant. The
          app, payments, escrow, and virtual card features will have additional
          terms before public launch.
        </>
      }
      summary={[
        {
          label: "Pre-launch site",
          text: "This is a marketing site for an unreleased app. Joining the waitlist is not an account and does not guarantee beta or launch access.",
        },
        {
          label: "Waitlist",
          text: "Email is required. Name and phone are optional. You should only submit accurate information that belongs to you.",
        },
        {
          label: "Acceptable use",
          text: "Do not attack, scrape, spam, impersonate, or abuse the site, APIs, waitlist, demo, or AI assistant.",
        },
        {
          label: "Product status",
          text: "Screens, pricing, payment flows, launch timing, and features can change. Nothing here is a financial product offer.",
        },
      ]}
      sections={[
        {
          id: "what-this-is",
          title: "What this is",
          content: (
            <p>
              The Site is a pre-launch marketing page for Tabby, a forthcoming
              mobile application for splitting and settling shared purchases.
              The public Tabby app is not yet available. Joining the waitlist
              does not create an account, does not guarantee access at launch,
              and does not commit you to buy or use anything. Nothing on the
              Site is a binding offer to provide a financial, banking, credit,
              escrow, payment, or money-transmission product.
            </p>
          ),
        },
        {
          id: "waitlist",
          title: "The waitlist",
          content: (
            <>
              <p>
                To join the waitlist you must provide an email address. You may
                also provide a name and phone number, but they are optional. We
                may use the information you submit to send launch updates, beta
                invitations, product notices, or waitlist-related messages.
              </p>
              <p>
                You agree not to submit someone else&apos;s information without
                permission, bulk-generate entries, or use the waitlist in a way
                that interferes with fair access for real prospective users.
              </p>
            </>
          ),
        },
        {
          id: "demo",
          title: "Demo and marketing content",
          content: (
            <p>
              The interactive demo, screenshots, pricing sections, FAQ answers,
              and product descriptions show the direction of the product. They
              are not a guarantee that every screen, workflow, price, supported
              payment method, or launch date will ship exactly as shown.
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
                <li>Submit fraudulent, impersonating, or bulk-generated entries.</li>
                <li>
                  Attempt to disrupt, probe, overload, or exploit the Site,
                  APIs, database, analytics endpoints, or AI assistant.
                </li>
                <li>
                  Scrape, copy, or resell Site content except for ordinary
                  personal browsing, search indexing, or short attributed
                  excerpts.
                </li>
                <li>
                  Use the AI assistant for unlawful, abusive, harassing,
                  security-testing, or off-topic purposes.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "ai-assistant",
          title: "AI assistant",
          content: (
            <p>
              The &quot;Ask Tabby&quot; assistant is an AI tool for general
              Tabby questions. It may produce inaccurate or incomplete answers.
              Nothing it says is legal, financial, tax, security, or product
              advice, and nothing it says changes these Terms or any future app
              agreement. For sensitive legal, privacy, support, or account
              issues, use the direct contact channel we publish for that purpose.
            </p>
          ),
        },
        {
          id: "future-app",
          title: "Future app terms",
          content: (
            <p>
              Before Tabby handles real accounts, payments, escrowed funds,
              virtual cards, identity checks, subscriptions, refunds, or
              disputes, we will provide app-specific terms and any legally
              required disclosures. Those future terms will control the app and
              payment services. These Terms control only the current Site.
            </p>
          ),
        },
        {
          id: "ip",
          title: "Intellectual property",
          content: (
            <p>
              The Tabby name, mark, site design, text, illustrations, demo
              flows, and source code are owned by Tabby or its licensors. You
              may not copy or reproduce them except for ordinary personal
              browsing. Press, partners, and journalists may quote short
              excerpts with attribution.
            </p>
          ),
        },
        {
          id: "disclaimers",
          title: "Disclaimers",
          content: (
            <p>
              The Site is provided &quot;as is&quot; and &quot;as available.&quot;
              We make no warranties of merchantability, fitness for a particular
              purpose, accuracy, non-infringement, uninterrupted availability,
              or that the Site will be error-free. Information on the Site is
              informational and may change without notice.
            </p>
          ),
        },
        {
          id: "liability",
          title: "Limitation of liability",
          content: (
            <p>
              To the fullest extent permitted by law, Tabby and its team will
              not be liable for any indirect, incidental, consequential,
              special, exemplary, or punitive damages arising from your use of
              the Site. Our total liability for direct damages related to the
              Site is limited to US $100.
            </p>
          ),
        },
        {
          id: "changes",
          title: "Changes to these terms",
          content: (
            <p>
              We may update these Terms as the product develops. Material
              changes will be flagged on this page and dated above. The version
              field in the stamp at the top of this document is bumped with
              every revision.
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
              for general questions. A dedicated legal contact channel will be
              listed here before broader beta access or public launch.
            </p>
          ),
        },
      ]}
    />
  );
}
