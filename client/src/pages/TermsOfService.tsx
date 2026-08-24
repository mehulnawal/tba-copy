import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const updatedOn = "8 August 2026";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Navbar
        onSearchChange={() => {}}
        activeCategory="All"
        onCategoryChange={() => {}}
      />
      <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
          Legal
        </p>
        <h1 className="mt-3 font-primary text-4xl sm:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">
          Last updated: {updatedOn}
        </p>
        <div className="mt-10 space-y-8 rounded border border-[var(--color-border)] bg-white p-6 leading-7 sm:p-10">
          <section>
            <h2 className="font-primary text-2xl">Introduction</h2>
            <p className="mt-3">
              These Terms of Service govern your use of
              thebrillianceatelier.com, operated by{" "}
              <strong>The Brilliance Atelier (TBA)</strong>. By browsing,
              creating an account, or placing an order, you agree to these
              terms.
            </p>
          </section>
          <section>
            <h2 className="font-primary text-2xl">Use of the Website</h2>
            <p className="mt-3">
              You may use this website for lawful personal and business
              purposes. You are responsible for providing accurate account and
              order information and for keeping your account credentials
              confidential.
            </p>
          </section>
          <section>
            <h2 className="font-primary text-2xl">Products &amp; Pricing</h2>
            <p className="mt-3">
              Product prices shown on the website are estimates based on live
              metal and diamond rates. Rates, availability, specifications, and
              estimated prices may change before final invoicing. The final
              invoice and order confirmation will state the applicable amount.
            </p>
          </section>
          <section>
            <h2 className="font-primary text-2xl">Orders &amp; Payments</h2>
            <p className="mt-3">
              An order is accepted only after our confirmation. Available
              payment methods are shown during checkout. Cancellation requests
              are subject to order status, product customisation, and our
              applicable cancellation policy.
            </p>
          </section>
          <section>
            <h2 className="font-primary text-2xl">Intellectual Property</h2>
            <p className="mt-3">
              All website content, product images, designs, text, logos, and
              branding belong to <strong>[legal business name]</strong> or its
              licensors. They may not be copied, reproduced, or used without
              written permission.
            </p>
          </section>
          <section>
            <h2 className="font-primary text-2xl">Limitation of Liability</h2>
            <p className="mt-3">
              To the extent permitted by law,{" "}
              <strong>[legal business name]</strong> is not liable for indirect,
              incidental, special, or consequential losses arising from use of
              this website or its products.
            </p>
          </section>
          <section>
            <h2 className="font-primary text-2xl">Governing Law</h2>
            <p className="mt-3">
              These terms are governed by the laws of India. Any disputes will
              be subject to the jurisdiction of the competent courts in India.
            </p>
          </section>
          <section>
            <h2 className="font-primary text-2xl">Contact</h2>
            <p className="mt-3">
              For questions about these terms, email{" "}
              <a
                className="text-[var(--color-teal)] underline"
                href="mailto:customercare.tba@gmail.com"
              >
                customercare.tba@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer onCategoryChange={() => {}} />
    </div>
  );
}
