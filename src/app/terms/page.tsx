import type {
  Metadata,
} from "next";

export const metadata: Metadata = {
  title:
    "Terms of Service | Mathwa",

  description:
    "Terms of Service governing the use of the Mathwa housing platform.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-sand px-5 py-16 text-ink sm:px-8 sm:py-24">

      <article className="mx-auto max-w-3xl">

        <a
          href="/"
          className="text-sm font-medium text-green-700 transition hover:text-green-800"
        >
          ← Back to Mathwa
        </a>

        <div className="mt-10">

          <p className="text-xs font-medium uppercase tracking-[0.18em] text-green-700">
            Mathwa
          </p>

          <h1 className="mt-3 font-display text-4xl font-light leading-tight sm:text-5xl">
            Terms of Service
          </h1>

          <p className="mt-4 text-sm text-ink-soft">
            Last updated: September 27, 2026
          </p>

        </div>

        <div className="mt-12 space-y-10 text-[0.98rem] leading-8 text-ink-soft">

          <section>

            <h2 className="font-display text-2xl font-medium text-ink">
              1. About Mathwa
            </h2>

            <p className="mt-4">
              Mathwa is a housing platform that presents rental
              property listings in Madinah, Saudi Arabia, and
              helps prospective tenants obtain information,
              contact the Mathwa team and request property
              viewings.
            </p>

            <p className="mt-4">
              By accessing the Mathwa website or communicating
              with Mathwa through WhatsApp or another contact
              channel, you agree to these Terms of Service.
            </p>

          </section>

          <section>

            <h2 className="font-display text-2xl font-medium text-ink">
              2. Property listings
            </h2>

            <p className="mt-4">
              Mathwa aims to present property information as
              accurately as reasonably possible based on the
              information available to us.
            </p>

            <p className="mt-4">
              Property information may include rent, location,
              number of rooms, amenities, furnishing,
              availability, photographs and other
              characteristics.
            </p>

            <p className="mt-4">
              Availability, prices and property details may
              change. Users should confirm important
              information before making a rental decision or
              payment.
            </p>

          </section>

          <section>

            <h2 className="font-display text-2xl font-medium text-ink">
              3. Property viewings
            </h2>

            <p className="mt-4">
              Mathwa may assist users in requesting or
              arranging a property viewing.
            </p>

            <p className="mt-4">
              A requested date or time is not considered
              confirmed until confirmation has been provided
              by Mathwa, the property owner or another
              authorised representative.
            </p>

          </section>

          <section>

            <h2 className="font-display text-2xl font-medium text-ink">
              4. WhatsApp service
            </h2>

            <p className="mt-4">
              Mathwa may provide customer assistance through
              WhatsApp, including automated responses.
            </p>

            <p className="mt-4">
              Automated features may help users:
            </p>

            <ul className="mt-4 list-disc space-y-2 ps-6">
              <li>
                Browse available properties.
              </li>

              <li>
                Request information about a listing using its
                reference number.
              </li>

              <li>
                Request a property viewing.
              </li>

              <li>
                Ask to speak with a member of the Mathwa team.
              </li>
            </ul>

            <p className="mt-4">
              Automated responses are provided for convenience
              and do not replace confirmation from a human
              representative where confirmation is required.
            </p>

          </section>

          <section>

            <h2 className="font-display text-2xl font-medium text-ink">
              5. User responsibilities
            </h2>

            <p className="mt-4">
              Users agree to provide truthful information when
              contacting Mathwa and not to misuse the website,
              messaging service or property information.
            </p>

            <p className="mt-4">
              You must not attempt to interfere with the
              operation, security or availability of Mathwa or
              use our services for unlawful, fraudulent or
              abusive purposes.
            </p>

          </section>

          <section>

            <h2 className="font-display text-2xl font-medium text-ink">
              6. Owners and property information
            </h2>

            <p className="mt-4">
              Some information displayed by Mathwa may be
              provided by property owners or other authorised
              sources.
            </p>

            <p className="mt-4">
              Property owners are responsible for providing
              accurate information about their properties and
              informing Mathwa of relevant changes where
              applicable.
            </p>

          </section>

          <section>

            <h2 className="font-display text-2xl font-medium text-ink">
              7. Payments and rental agreements
            </h2>

            <p className="mt-4">
              Unless expressly stated otherwise, a property
              listing on Mathwa does not itself constitute a
              rental agreement.
            </p>

            <p className="mt-4">
              Users should verify payment instructions,
              contractual conditions, deposits, included
              services and the identity of the relevant party
              before transferring money.
            </p>

          </section>

          <section>

            <h2 className="font-display text-2xl font-medium text-ink">
              8. Third-party services and links
            </h2>

            <p className="mt-4">
              Mathwa may contain links to third-party services
              such as maps, WhatsApp or other external
              websites.
            </p>

            <p className="mt-4">
              Those services are operated independently and
              may have their own terms and privacy policies.
            </p>

          </section>

          <section>

            <h2 className="font-display text-2xl font-medium text-ink">
              9. Service availability
            </h2>

            <p className="mt-4">
              We aim to keep Mathwa available and reliable,
              but we do not guarantee that the website,
              messaging system or any individual feature will
              always be available without interruption.
            </p>

            <p className="mt-4">
              Services may occasionally be modified,
              suspended or unavailable for maintenance,
              security or technical reasons.
            </p>

          </section>

          <section>

            <h2 className="font-display text-2xl font-medium text-ink">
              10. Limitation of responsibility
            </h2>

            <p className="mt-4">
              Users remain responsible for evaluating whether
              a property is suitable for their needs and for
              reviewing any rental agreement before accepting
              it.
            </p>

            <p className="mt-4">
              To the extent permitted by applicable law,
              Mathwa is not responsible for losses resulting
              from inaccurate information supplied by third
              parties, changes made after publication or
              agreements entered into directly between other
              parties.
            </p>

          </section>

          <section>

            <h2 className="font-display text-2xl font-medium text-ink">
              11. Privacy
            </h2>

            <p className="mt-4">
              Our processing of personal information is
              described in the Mathwa{" "}
              <a
                href="/privacy"
                className="font-medium text-green-700 underline underline-offset-4"
              >
                Privacy Policy
              </a>
              .
            </p>

          </section>

          <section>

            <h2 className="font-display text-2xl font-medium text-ink">
              12. Changes to these terms
            </h2>

            <p className="mt-4">
              Mathwa may update these Terms of Service when
              our services or applicable requirements change.
            </p>

            <p className="mt-4">
              The latest version will be published on this
              page.
            </p>

          </section>

          <section>

            <h2 className="font-display text-2xl font-medium text-ink">
              13. Contact
            </h2>

            <p className="mt-4">
              If you have questions about these Terms of
              Service, you can contact Mathwa through the
              contact methods available on our website:
            </p>

            <a
              href="https://www.mathwa-medinah.com"
              className="mt-4 inline-block font-medium text-green-700 underline underline-offset-4"
            >
              www.mathwa-medinah.com
            </a>

          </section>

        </div>

      </article>

    </main>
  );
}