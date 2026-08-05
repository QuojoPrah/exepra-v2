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
    description:(
      <>
        <span className="font-semibold text-yellow-700">Free</span> shipping on orders over €50.
      </>
    ),
  },
  {
    icon: BadgeCheck,
    title: "Premium Quality",
    description:(
      <>
        <span className="font-semibold text-yellow-700">Carefully</span> selected
        everyday essentials.
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description:(
      <>
        <span className="font-semibold text-yellow-700">100%</span> secure and encrypted checkout.
      </>
    ),
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description:(
      <>
        <span className="font-semibold text-yellow-700">30-day</span> hassle-free
        returns.
      </>
    ),
  },
];

export default function WhyExepra() {
  return (
    <section className="bg-[#FAFAF8] py-18">
      <div className="mx-auto max-w-7xl px-6">

        <div className="rounded-[32px] border border-[#F1F1EE] bg-white">
          <div className="grid md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature, index) => {
            const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className={`
                    flex flex-col items-center px-10 py-12 text-center
                    ${index !== features.length - 1 ? "xl:border-r border-slate-200" : ""}
                    ${index < 2 ? "md:border-b xl:border-b-0" : ""}
                  `}
                  >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                    <Icon
                      size={32}
                      strokeWidth={1.8}
                      className="text-slate-700"
                    />
                  </div>

                  <h3 className="mt-2 text-base font-medium text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-2 max-w-[220px] text-sm leading-6 text-slate-500 max-w-[180px]">
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