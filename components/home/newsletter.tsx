export default function Newsletter() {
  return (
    <section className="bg-slate-900 py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">

        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
          STAY CONNECTED
        </p>

        <h2 className="mt-4 text-5xl font-bold text-white">
          Join the Exepra community
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
          Get early access to new collections, exclusive discounts and product launches.
        </p>

        <div className="mx-auto mt-10 flex max-w-xl flex-col gap-4 sm:flex-row">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-full bg-white px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />

          <button className="rounded-full bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700">
            Subscribe
          </button>
        </div>

      </div>
    </section>
  );
}