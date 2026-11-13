import { StoreProviders } from "@/components/providers/store-providers";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { QuickView } from "@/components/product/quick-view";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { Toaster } from "@/components/layout/toaster";
import { getActiveCollections, getNavCategories } from "@/lib/catalog";
import { getStoreSettings } from "@/lib/settings";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories, collections] = await Promise.all([getStoreSettings(), getNavCategories(), getActiveCollections()]);

  return (
    <StoreProviders>
      {settings.announcementActive && <AnnouncementBar messages={settings.announcements} />}
      <Navbar categories={categories} collections={collections.map((c) => ({ slug: c.slug, name: c.name }))} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer social={settings} tagline={settings.tagline} />
      <CartDrawer />
      <QuickView />
      <Toaster />
      <CookieConsent />
    </StoreProviders>
  );
}
