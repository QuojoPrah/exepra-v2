import Image from "next/image";

export default function Instagram() {
  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-7xl px-6">

        <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
          FOLLOW US
        </p>

        <h2 className="mt-4 text-center text-5xl font-bold text-slate-900">
          @exepra
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-slate-500">
          Discover inspiration, new arrivals and everyday essentials.
        </p>

        <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-6">

          <Image
            src="/images/instagram/insta1.jpg"
            alt="Instagram 1"
            width={400}
            height={400}
            className="h-72 w-full rounded-3xl object-cover"
          />

          <Image
            src="/images/instagram/insta2.jpg"
            alt="Instagram 2"
            width={400}
            height={400}
            className="h-72 w-full rounded-3xl object-cover"
          />

          <Image
            src="/images/instagram/insta3.jpg"
            alt="Instagram 3"
            width={400}
            height={400}
            className="h-72 w-full rounded-3xl object-cover"
          />

          <Image
            src="/images/instagram/insta4.jpg"
            alt="Instagram 4"
            width={400}
            height={400}
            className="h-72 w-full rounded-3xl object-cover"
          />

          <Image
            src="/images/instagram/insta5.jpg"
            alt="Instagram 5"
            width={400}
            height={400}
            className="h-72 w-full rounded-3xl object-cover"
          />

          <Image
            src="/images/instagram/insta6.jpg"
            alt="Instagram 6"
            width={400}
            height={400}
            className="h-72 w-full rounded-3xl object-cover"
          />
          

        </div>
      </div>
    </section>
  );
}