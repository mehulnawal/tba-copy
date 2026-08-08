import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function DataDeletion() {
  return <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
    <Navbar onSearchChange={() => {}} activeCategory="All" onCategoryChange={() => {}} />
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)]">Privacy</p>
      <h1 className="mt-3 font-primary text-4xl sm:text-5xl">Data Deletion Instructions</h1>
      <div className="mt-10 rounded border border-[var(--color-border)] bg-white p-6 leading-7 sm:p-10">
        <p>This website supports Facebook Login. This page explains how you can request deletion of your account data.</p>
        <h2 className="mt-8 font-primary text-2xl">Request data deletion</h2>
        <p className="mt-3">To request deletion of your personal data collected through this website or Facebook Login, email <a className="text-[var(--color-teal)] underline" href="mailto:customercare.tba@gmail.com?subject=Data%20Deletion%20Request">customercare.tba@gmail.com</a> with the subject line <strong>“Data Deletion Request”</strong>. Include your registered email address or the Facebook account used to sign in. We will process your request and delete your data within <strong>7 business days</strong>.</p>
        <h2 className="mt-8 font-primary text-2xl">Data covered</h2>
        <p className="mt-3">This applies to data stored in our database, including your name, email address, and order history, as well as data received through Facebook Login, including email address and public profile information.</p>
      </div>
    </main>
    <Footer onCategoryChange={() => {}} />
  </div>;
}