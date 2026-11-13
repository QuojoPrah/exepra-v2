import Image from "next/image";

export function AuthShell({ title, subtitle, children, image = "/images/auth/sign-in.jpg" }: { title: string; subtitle?: string; children: React.ReactNode; image?: string }) {
  return (
    <div className="container-page grid min-h-[calc(100dvh-140px)] items-center gap-10 py-10 lg:grid-cols-2 lg:gap-16 lg:py-14">
      <div className="relative hidden h-full min-h-[560px] overflow-hidden rounded-[calc(var(--radius-card)*1.5)] bg-cream lg:block">
        <Image src={image} alt="" fill sizes="50vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" aria-hidden />
        <p className="absolute bottom-8 left-8 right-8 font-display text-2xl font-medium leading-snug text-white">Thoughtfully selected, for the moments that matter.</p>
      </div>
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
