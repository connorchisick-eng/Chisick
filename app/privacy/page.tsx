import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy - Tabby",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      kind="Privacy"
      monogram="P."
      title="Privacy Policy."
      accentWord="Privacy"
      updated="May 1, 2026"
      effective="May 1, 2026"
      outroTagline="your data, in the open"
      outroQuestion="Questions about your data?"
      intro={
        <>
          This Privacy Policy describes how Tabby (&quot;we,&quot; &quot;us,&quot;
          or &quot;our&quot;) collects, uses, and protects information on{" "}
          <strong>splittabby.com</strong> while the product is in development.
          We collect the minimum we need to run the waitlist, understand site
          performance, answer Tabby questions, and protect the site from abuse.
          We do not sell your personal information or use it for third-party ads.
        </>
      }
      summary={[
        {
          label: "Data we collect",
          text: "Email is required for the waitlist. Name and phone are optional. We also process basic browser, analytics, and abuse-prevention metadata.",
        },
        {
          label: "Where it lives",
          text: "Waitlist entries are stored with a managed database provider. Site traffic is served over HTTPS, and internal credentials are not exposed to the browser.",
        },
        {
          label: "Who sees it",
          text: "Tabby and service providers that operate the site, analytics, database, and AI assistant. Never sold.",
        },
        {
          label: "Your control",
          text: "You can ask us to delete, correct, or export waitlist data associated with your email when a direct privacy contact is published.",
        },
      ]}
      sections={[
        {
          id: "collection",
          title: "What we collect",
          content: (
            <>
              <p>
                At this pre-launch stage we collect what you submit through the
                waitlist form, what your browser automatically provides, and
                limited product analytics:
              </p>
              <ul>
                <li>
                  <strong>Email address</strong> - required to join the
                  waitlist and receive launch or beta updates.
                </li>
                <li>
                  <strong>Name</strong> - optional, as entered on the waitlist
                  form.
                </li>
                <li>
                  <strong>Phone number</strong> - optional. If you enter one,
                  the form sends it only when it looks complete; partial phone
                  entries are dropped instead of blocking signup.
                </li>
                <li>
                  <strong>Technical metadata</strong> - your IP address,
                  user-agent (browser/OS), and the page you came from (HTTP
                  referer). Used to prevent abuse, rate-limit submissions,
                  debug errors, and understand whether the site is working.
                </li>
                <li>
                  <strong>Analytics data</strong> - page views, button clicks,
                  waitlist funnel events, approximate source/landing page, and
                  similar usage data collected through our analytics tools.
                  Those tools may use cookies or browser storage.
                </li>
                <li>
                  <strong>Support chat</strong> - messages you send through the
                  &quot;Ask Tabby&quot; AI assistant are processed by our AI
                  infrastructure providers to generate responses. We do not
                  store chat transcripts in the waitlist database.
                </li>
              </ul>
              <p>
                We do not collect payment information, location, contacts, or
                biometric data on this pre-launch website.
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
                <li>To notify you about launch, beta access, and product updates.</li>
                <li>
                  To manage the waitlist, deduplicate entries, and understand
                  which launch messages are useful.
                </li>
                <li>To operate, secure, analyze, and improve the website.</li>
                <li>To answer Tabby-related questions through the AI assistant.</li>
              </ul>
              <p>
                We do not sell your information. We do not use it for
                third-party advertising. We do not build a shadow profile of
                you or sync our waitlist with ad networks.
              </p>
            </>
          ),
        },
        {
          id: "storage",
          title: "How we store it",
          content: (
            <p>
              Waitlist entries are stored with a managed database provider.
              Connections to the site use HTTPS. Internal credentials are not
              exposed to the browser. We keep access limited to people and
              systems that need it to run the waitlist.
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
                  <strong>Hosting and infrastructure providers</strong> - serve
                  the site and run the systems needed to process waitlist and
                  chat requests.
                </li>
                <li>
                  <strong>Database provider</strong> - stores waitlist entries
                  and related technical metadata.
                </li>
                <li>
                  <strong>Analytics provider</strong> - measures page views,
                  conversion events, and product-interest signals.
                </li>
                <li>
                  <strong>AI infrastructure provider</strong> - processes chat
                  messages if you use the &quot;Ask Tabby&quot; assistant.
                </li>
              </ul>
              <p>
                We may disclose information if required by law, subpoena, court
                order, or to protect the rights, safety, and security of Tabby,
                users, or the public.
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
                associated with your email address. A direct privacy contact
                channel will be listed here before broader beta access or
                public launch. Please do not submit sensitive account or legal
                requests through the AI assistant.
              </p>
              <p>
                If you are a resident of California, the EU, or the UK, you
                may have additional rights under privacy laws such as CCPA,
                GDPR, or UK GDPR. Those rights may include access, deletion,
                correction, portability, objection, and limits on certain
                processing.
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
              submitted information, contact us through the direct privacy
              channel once it is published and we will delete it.
            </p>
          ),
        },
        {
          id: "changes",
          title: "Changes to this policy",
          content: (
            <p>
              We may update this policy as the product develops. Material
              changes will be flagged on this page and dated above. The version
              field in the stamp at the top of this document is bumped with
              every revision so you can tell whether anything has shifted since
              your last visit.
            </p>
          ),
        },
        {
          id: "contact",
          title: "Contact",
          content: (
            <p>
              Privacy questions: use the &quot;Ask Tabby&quot; chat for general
              policy questions only. A dedicated privacy email will be listed
              here before broader beta access or public launch.
            </p>
          ),
        },
      ]}
    />
  );
}
