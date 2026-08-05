export default function Testimonials() {
  return (
    <section className="bg-slate-50 py-28">
      <div className="mx-auto max-w-7xl px-6">

        <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
          TESTIMONIALS
        </p>

        <h2 className="mt-4 text-center text-5xl font-bold text-slate-900">
          Loved by customers
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-slate-500">
          Thousands of happy customers trust Exepra for quality products and exceptional service.
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-3">

          <div  className="
            rounded-[32px]
            bg-white
            p-10
            shadow-[0_18px_45px_rgba(15, 23, 42, 0.06)]
            transition-all
            duration-500
            hover:-translate-y-2
            hover:shadow-[0_35px_80px_rgba(15, 23, 42, 0.10)]">
            <div className="text-amber-400 text-xl tracking-wide">★★★★★</div>

            <p className="mt-6 text-lg leading-8 text-slate-600">
             "Amazing quality. Everything arrived beautifully packaged and even better than expected."
            </p>

            <h4 className="mt-6 text-lg font-semibold text-slate-900">
             Sarah M.
            </h4>
          </div>

          <div  className="rounded-3xl bg-white p-10 shadow-sm">
            <div className="text-amber-400 text-xl tracking-wide">★★★★★</div>

            <p className="mt-6 text-lg leading-8 text-slate-600">
             "Exepra has become my favourite place to shop online. Premium products and fast delivery."
            </p>

            <h4 className="mt-8 text-lg font-semibold text-slate-900">
             Daniel K.
            </h4>
          </div>

          <div className="rounded-3xl bg-white p-10 shadow-sm">
            <div className="text-amber-400 text-xl tracking-wide">★★★★★</div>

            <p className="mt-6 text-lg leading-8 text-slate-600">
             "Beautiful website, beautiful products and outstanding customer service."
            </p>

            <h4 className="mt-8 text-lg font-semibold text-slate-900">
             Emma L.
            </h4>
          </div>
        </div>
      </div>
    </section>
  );
}