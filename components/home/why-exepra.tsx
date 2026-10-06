import {
  Truck,
  BadgeCheck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Fast Delivery",
    description: (
      <>
        <span className="font-semibold text-yellow-700">Free</span> shipping
        on orders over €50.
      </>
    ),
  },
  {
    icon: BadgeCheck,
    title: "Premium Quality",
    description: (
      <>
        <span className="font-semibold text-yellow-700">Carefully</span>{" "}
        selected everyday essentials.
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: (
      <>
        <span className="font-semibold text-yellow-700">100%</span> secure and
        encrypted checkout.
      </>
    ),
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: (
      <>
        <span className="font-semibold text-yellow-700">30-day</span>{" "}
        hassle-free returns.
      </>
    ),
  },
];

export default function WhyExepra() {
  return (
    <section className="bg-[#FAFAF8] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="overflow-hidden rounded-[32px] border border-[#F1F1EE] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.03)]">
          <div className="grid md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className={`
                    flex flex-col items-center px-8 py-11 text-center
                    transition-colors duration-300 hover:bg-[#FAFAF8]
                    md:px-10
                    ${
                      index !== features.length - 1
                        ? "xl:border-r xl:border-slate-200/80"
                        : ""
                    }
                    ${
                      index < 2
                        ? "border-b border-slate-200/80 xl:border-b-0"
                        : ""
                    }
                    ${
                      index === 1
                        ? "md:border-b md:border-slate-200/80 xl:border-b-0"
                        : ""
                    }
                  `}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                    <Icon
                      size={27}
                      strokeWidth={1.7}
                      className="text-slate-700"
                    />
                  </div>

                  <h3 className="mt-5 text-base font-semibold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-2 max-w-[190px] text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}