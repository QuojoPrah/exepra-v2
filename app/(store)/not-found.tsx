import Link from "next/link";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-4xl font-semibold">We couldn&apos;t find that page</h1>
      <p className="mt-3 max-w-md text-muted">The page may have moved, or the product is no longer available.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <LinkButton href="/shop">Shop all</LinkButton>
        <LinkButton href="/" variant="outline">Back to home</LinkButton>
      </div>
      <p className="mt-6 text-sm text-muted">Need help? <Link href="/contact" className="underline">Contact us</Link></p>
    </div>
  );
}
