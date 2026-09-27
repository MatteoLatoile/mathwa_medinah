import type {
  Metadata,
} from "next";

export const metadata: Metadata = {
  title:
    "Data Deletion Instructions | Mathwa",

  description:
    "Instructions for requesting deletion of personal information associated with Mathwa.",
};

export default function DataDeletionPage() {
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
            Data Deletion Instructions
          </h1>

          <p className="mt-4 text-sm text-ink-soft">
            Last updated: September 27, 2026
          </p>

        </div>

        <div className="mt-12 space-y-10 text-[0.98rem] leading-8 text-ink-soft">

          <section>

            <h2 className="font-display text-2xl font-medium text-ink">
              Request deletion of your information
            </h2>

            <p className="mt-4">
              If you have communicated with Mathwa through
              WhatsApp or another Mathwa service, you may
              request deletion of personal information
              associated with you.
            </p>

          </section>

          <section className="rounded-3xl border border-green-700/10 bg-paper p-6 sm:p-8">

            <p className="text-xs font-medium uppercase tracking-[0.15em] text-green-700">
              How to make a request
            </p>

            <ol className="mt-6 list-decimal space-y-4 ps-6">

              <li>
                Contact Mathwa using the same WhatsApp number
                that you previously used to communicate with
                us.
              </li>

              <li>
                Send a message stating:
                <div className="mt-3 rounded-2xl bg-sand px-5 py-4 font-medium text-ink">
                  I would like to request deletion of my
                  personal data from Mathwa.
                </div>
              </li>

              <li>
                If necessary, we may ask you to confirm
                information required to identify the relevant
                records and prevent unauthorised deletion
                requests.
              </li>

              <li>
                Once the request has been verified, Mathwa
                will process the deletion request within a
                reasonable period, subject to any information
                that we are legally required or permitted to
                retain.
              </li>

            </ol>

          </section>

          <section>

            <h2 className="font-display text-2xl font-medium text-ink">
              Information that may be deleted
            </h2>

            <p className="mt-4">
              Depending on your interactions with Mathwa, a
              deletion request may concern information such
              as:
            </p>

            <ul className="mt-4 list-disc space-y-2 ps-6">
              <li>
                Your phone number.
              </li>

              <li>
                Your name, if provided.
              </li>

              <li>
                Stored customer enquiries.
              </li>

              <li>
                Property references associated with your
                enquiry.
              </li>

              <li>
                Property viewing request information.
              </li>

              <li>
                Preferences associated with your messaging
                session, such as your selected language.
              </li>
            </ul>

          </section>

          <section>

            <h2 className="font-display text-2xl font-medium text-ink">
              Information we may need to retain
            </h2>

            <p className="mt-4">
              Certain information may be retained where
              necessary to comply with legal obligations,
              resolve disputes, prevent fraud, maintain
              security or establish and defend legal rights.
            </p>

            <p className="mt-4">
              Where complete deletion is not appropriate or
              legally possible, information may be restricted
              or anonymised where applicable.
            </p>

          </section>

          <section>

            <h2 className="font-display text-2xl font-medium text-ink">
              WhatsApp and Meta
            </h2>

            <p className="mt-4">
              A request submitted to Mathwa concerns
              information controlled by Mathwa.
            </p>

            <p className="mt-4">
              WhatsApp and Meta may separately process
              information under their own services and privacy
              policies. Requests relating specifically to data
              controlled by Meta or WhatsApp may need to be
              submitted directly to those services.
            </p>

          </section>

          <section>

            <h2 className="font-display text-2xl font-medium text-ink">
              Contact Mathwa
            </h2>

            <p className="mt-4">
              You can contact Mathwa using the contact options
              available on:
            </p>

            <a
              href="https://www.mathwa-medinah.com"
              className="mt-4 inline-block font-medium text-green-700 underline underline-offset-4"
            >
              www.mathwa-medinah.com
            </a>

            <p className="mt-5">
              For WhatsApp-related deletion requests, we
              recommend contacting us from the same phone
              number concerned by the request so that we can
              identify the relevant conversation.
            </p>

          </section>

          <section>

            <p>
              For more information about how Mathwa processes
              personal information, please read our{" "}
              <a
                href="/privacy"
                className="font-medium text-green-700 underline underline-offset-4"
              >
                Privacy Policy
              </a>
              .
            </p>

          </section>

        </div>

      </article>

    </main>
  );
}