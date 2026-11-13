/**
 * Development seed. Everything created here is DEMONSTRATION content
 * (products have isDemo = true) and must be replaced with the real catalogue
 * before launch. No reviews, ratings or customer data are fabricated.
 *
 *   npx prisma db seed
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL!, max: 1 }) });

const euro = (n: number) => Math.round(n * 100);

type SeedVariant = { size?: string; color?: string; colorHex?: string; stock: number; price?: number };
type SeedProduct = {
  slug: string;
  name: string;
  category: string;
  description: string;
  details?: string;
  careInfo?: string;
  price: number;
  compareAtPrice?: number;
  images: { url: string; alt: string }[];
  variants: SeedVariant[];
  badge?: string;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  collections?: string[];
  daysAgo?: number;
};

const categories = [
  { slug: "women", name: "Women", description: "Considered pieces and everyday favourites for her.", image: "/images/cozyliving2.jpg" as string | null, sortOrder: 1, isFeatured: true },
  { slug: "kids", name: "Kids", description: "Comfortable, easy-care essentials for little ones.", image: null, sortOrder: 2, isFeatured: true },
  { slug: "accessories", name: "Accessories", description: "The finishing touches — bags, jewellery and everyday carry.", image: "/images/categories/lifestyle.jpg", sortOrder: 3, isFeatured: true },
  { slug: "home-living", name: "Home & Living", description: "Calm, useful pieces for the home you share.", image: "/images/categories/home.jpg", sortOrder: 4, isFeatured: false },
];

const collections = [
  { slug: "the-everyday-edit", name: "The Everyday Edit", description: "Easy, versatile pieces that work from Monday morning to Sunday afternoon.", image: "/images/cozyliving.jpg", sortOrder: 1, isFeatured: true },
  { slug: "calm-at-home", name: "Calm at Home", description: "Natural materials and soft tones for slower, simpler days at home.", image: "/images/sale/home-sale.jpg", sortOrder: 2, isFeatured: true },
];

const SIZES = ["XS", "S", "M", "L", "XL"];
const sized = (stocks: number[], color?: { color: string; colorHex: string }) => SIZES.map((size, i) => ({ size, stock: stocks[i] ?? 0, ...color }));

const products: SeedProduct[] = [
  {
    slug: "linen-weekend-set",
    name: "Linen Weekend Set",
    category: "women",
    description: "A relaxed shirt and straight-leg trouser pairing for warm weekends. Wear together or apart — the soft, breathable linen blend gets better with every wash.",
    details: "Material: 55% linen, 45% cotton (demo data)\nFit: Relaxed\nClosure: Button front",
    careInfo: "Machine wash at 30 °C. Do not tumble dry.",
    price: 79,
    compareAtPrice: 99,
    images: [{ url: "/images/instagram/insta6.jpg", alt: "Linen shirt folded with denim and striped top" }],
    variants: sized([3, 8, 12, 6, 0], { color: "Natural", colorHex: "#e8dfcf" }),
    badge: "New",
    isBestSeller: true,
    isFeatured: true,
    collections: ["the-everyday-edit"],
    daysAgo: 5,
  },
  {
    slug: "soft-lounge-set",
    name: "Soft Lounge Set",
    category: "women",
    description: "A cloud-soft lounge set for slow mornings and quiet evenings. Designed to feel as good as it looks.",
    details: "Material: Cotton-modal jersey (demo data)\nFit: Relaxed",
    careInfo: "Machine wash at 30 °C inside out.",
    price: 64,
    images: [{ url: "/images/cozyliving2.jpg", alt: "Woman relaxing on a sofa in a light living room" }],
    variants: [...sized([4, 10, 9, 5, 2], { color: "Oat", colorHex: "#d9cbb5" }), ...sized([0, 4, 6, 3, 1], { color: "Charcoal", colorHex: "#3a3633" })],
    isBestSeller: true,
    collections: ["the-everyday-edit", "calm-at-home"],
    daysAgo: 20,
  },
  {
    slug: "classic-black-sneakers",
    name: "Classic Black Sneakers",
    category: "women",
    description: "Clean, minimal everyday sneakers with a cushioned sole for all-day comfort.",
    details: "Upper: Textile (demo data)\nSole: Rubber",
    price: 89,
    images: [{ url: "/images/products/shoes.jpg", alt: "Black sneakers worn with black trousers" }],
    variants: ["36", "37", "38", "39", "40", "41"].map((size, i) => ({ size, stock: [2, 5, 7, 6, 3, 0][i], color: "Black", colorHex: "#1f1d1b" })),
    isBestSeller: true,
    daysAgo: 60,
  },
  {
    slug: "everyday-jewellery-set",
    name: "Everyday Jewellery Set",
    category: "accessories",
    description: "A delicate gold-tone set of layering pieces that elevates any outfit.",
    details: "Finish: Gold-tone (demo data)",
    price: 49,
    compareAtPrice: 59,
    images: [{ url: "/images/instagram/insta4.jpg", alt: "Gold-tone jewellery and watch on soft fabric" }],
    variants: [{ stock: 14 }],
    badge: "Gift idea",
    isBestSeller: true,
    collections: ["the-everyday-edit"],
    daysAgo: 10,
  },
  {
    slug: "premium-travel-backpack",
    name: "Premium Travel Backpack",
    category: "accessories",
    description: "A structured, water-resistant backpack with a padded laptop sleeve and luggage pass-through.",
    details: "Capacity: 22 L (demo data)\nLaptop sleeve: up to 15\"",
    price: 149,
    images: [{ url: "/images/products/item6.jpg", alt: "Black backpack attached to a grey suitcase" }],
    variants: [
      { color: "Black", colorHex: "#1f1d1b", stock: 9 },
      { color: "Slate", colorHex: "#5b6168", stock: 0 },
    ],
    isBestSeller: true,
    daysAgo: 90,
  },
  {
    slug: "make-up-brush-set",
    name: "Make-up Brush Set",
    category: "accessories",
    description: "Ten soft, cruelty-free synthetic brushes for face and eyes.",
    details: "Pieces: 10 (demo data)",
    price: 39,
    images: [{ url: "/images/products/item7.jpg", alt: "Make-up brushes fanned out on a white surface" }],
    variants: [{ stock: 22 }],
    isBestSeller: true,
    daysAgo: 30,
  },
  {
    slug: "tech-organiser-pouch",
    name: "Tech Organiser Pouch",
    category: "accessories",
    description: "Keep cables, chargers and small essentials tidy in one slim pouch.",
    price: 29,
    images: [{ url: "/images/products/item2.jpg", alt: "Organiser pouch holding cables and accessories" }],
    variants: [{ stock: 4 }],
    daysAgo: 3,
  },
  {
    slug: "glass-water-bottle",
    name: "Glass Water Bottle",
    category: "accessories",
    description: "A borosilicate glass bottle with a protective sleeve — for school runs and studio days alike.",
    price: 24,
    images: [{ url: "/images/products/item3.jpg", alt: "White water bottle on a wooden surface" }],
    variants: [{ stock: 30 }],
    daysAgo: 12,
  },
  {
    slug: "ceramic-pour-over-set",
    name: "Ceramic Pour-Over Set",
    category: "home-living",
    description: "Slow down with a hand-glazed ceramic dripper and matching cup.",
    price: 58,
    compareAtPrice: 72,
    images: [{ url: "/images/products/coffee.jpg", alt: "Ceramic coffee set on a wooden table" }],
    variants: [{ stock: 7 }],
    collections: ["calm-at-home"],
    isBestSeller: true,
    daysAgo: 70,
  },
  {
    slug: "pineapple-table-lamp",
    name: "Pineapple Table Lamp",
    category: "home-living",
    description: "A sculptural ceramic base with a soft linen shade casts a warm, gentle glow.",
    price: 64,
    images: [{ url: "/images/products/lamp.jpg", alt: "Ceramic table lamp with a linen shade" }],
    variants: [{ stock: 5 }],
    collections: ["calm-at-home"],
    daysAgo: 40,
  },
  {
    slug: "ceramic-bud-vase",
    name: "Ceramic Bud Vase",
    category: "home-living",
    description: "A matte ceramic vase made for a single stem or a handful of dried flowers.",
    price: 34,
    images: [{ url: "/images/products/item1.jpg", alt: "White vase with dried flowers on a sideboard" }],
    variants: [{ stock: 11 }],
    collections: ["calm-at-home"],
    daysAgo: 8,
  },
  {
    slug: "wooden-utensil-set",
    name: "Wooden Utensil Set",
    category: "home-living",
    description: "Hand-finished wooden spoons and spatulas in a matching holder.",
    price: 42,
    images: [{ url: "/images/products/item4.jpg", alt: "Wooden spoons in a wooden utensil holder" }],
    variants: [{ stock: 0 }],
    daysAgo: 100,
  },
  {
    slug: "stoneware-bath-set",
    name: "Stoneware Bath Set",
    category: "home-living",
    description: "Soap dispenser, tumbler and dish in a calm glazed stoneware.",
    price: 54,
    compareAtPrice: 64,
    images: [{ url: "/images/products/item5.jpg", alt: "Blue stoneware bathroom accessories" }],
    variants: [{ stock: 6 }],
    daysAgo: 25,
  },
];

async function main() {
  console.log("Seeding store settings, shipping, categories, collections, hero slides…");

  await db.storeSettings.upsert({
    where: { id: "store" },
    create: {
      id: "store",
      tagline: "Thoughtfully selected fashion and essentials for women and little ones — chosen for quality, style and everyday practicality.",
      announcements: ["Free standard shipping in Germany from 75 €", "Discover our latest new arrivals", "Secure checkout with Stripe"],
    },
    update: {},
  });

  const rates = [
    { code: "de-standard", name: "Standard delivery", description: "DHL Paket", countries: ["DE"], price: euro(4.95), freeOver: euro(75), minDays: 2, maxDays: 4, sortOrder: 1 },
    { code: "de-express", name: "Express delivery", description: "Next business day when ordered before 12:00", countries: ["DE"], price: euro(9.95), freeOver: null, minDays: 1, maxDays: 2, sortOrder: 2 },
    { code: "eu-standard", name: "EU standard delivery", description: "Tracked delivery", countries: ["AT", "NL", "BE", "FR", "LU", "DK", "PL", "IT", "ES"], price: euro(9.95), freeOver: euro(120), minDays: 4, maxDays: 7, sortOrder: 3 },
  ];
  for (const r of rates) await db.shippingRate.upsert({ where: { code: r.code }, create: r, update: {} });

  for (const c of categories) await db.category.upsert({ where: { slug: c.slug }, create: c, update: {} });
  for (const c of collections) await db.collection.upsert({ where: { slug: c.slug }, create: c, update: {} });

  if ((await db.heroSlide.count()) === 0) {
    await db.heroSlide.createMany({
      data: [
        { eyebrow: "The EXEPRA Edit", title: "Discover Everyday Elegance.", subtitle: "Thoughtfully selected essentials for women and little ones.", image: "/images/hero/hero1.jpg", imageAlt: "A bright, calm living room in soft neutral tones", primaryLabel: "Shop Women", primaryHref: "/women", secondaryLabel: "Shop Kids", secondaryHref: "/kids", sortOrder: 1 },
        { eyebrow: "New season", title: "Quietly Considered.", subtitle: "Fresh arrivals chosen for comfort, quality and ease.", image: "/images/hero/hero4.jpg", imageAlt: "Sunlit window with fresh flowers", primaryLabel: "New Arrivals", primaryHref: "/new-arrivals", secondaryLabel: "Collections", secondaryHref: "/collections", sortOrder: 2 },
        { eyebrow: "Accessories", title: "Little Details, Lasting Style.", subtitle: "The finishing touches that make every day feel more put-together.", image: "/images/hero/hero2.jpg", imageAlt: "A tidy, warmly lit desk setup", primaryLabel: "Shop Accessories", primaryHref: "/accessories", secondaryLabel: "Best Sellers", secondaryHref: "/shop?sort=best-selling", sortOrder: 3 },
        { eyebrow: "Everyday comfort", title: "Made for Moving Through Your Day.", subtitle: "Easy pieces for busy schedules — yours and theirs.", image: "/images/hero/hero3.jpg", imageAlt: "Sneakers and a skipping rope laid out on a mat", primaryLabel: "Shop Women", primaryHref: "/women", secondaryLabel: "Shop Kids", secondaryHref: "/kids", sortOrder: 4 },
      ],
    });
  }

  // Set SEED_DEMO_PRODUCTS=false to seed only the store setup (e.g. on a production database).
  if (process.env.SEED_DEMO_PRODUCTS === "false") {
    console.log("Skipping demo products and demo coupon (SEED_DEMO_PRODUCTS=false).");
    console.log("Seed complete. Create an admin with: npm run admin:create -- <email> <name>");
    return;
  }

  console.log(`Seeding ${products.length} demo products…`);
  for (const p of products) {
    const exists = await db.product.findUnique({ where: { slug: p.slug } });
    if (exists) continue;
    const category = await db.category.findUnique({ where: { slug: p.category } });
    const created = new Date(Date.now() - (p.daysAgo ?? 30) * 864e5);
    const product = await db.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        details: p.details,
        careInfo: p.careInfo,
        price: euro(p.price),
        compareAtPrice: p.compareAtPrice ? euro(p.compareAtPrice) : null,
        status: "ACTIVE",
        isDemo: true,
        badge: p.badge,
        isBestSeller: p.isBestSeller ?? false,
        isFeatured: p.isFeatured ?? false,
        categoryId: category?.id,
        createdAt: created,
        publishedAt: created,
        collections: p.collections ? { connect: p.collections.map((slug) => ({ slug })) } : undefined,
        images: { create: p.images.map((img, i) => ({ ...img, sortOrder: i })) },
        variants: {
          create: p.variants.map((v, i) => ({
            sku: `DEMO-${p.slug.slice(0, 12).toUpperCase()}-${[v.color, v.size].filter(Boolean).join("-").toUpperCase().replace(/\s+/g, "") || "STD"}`,
            size: v.size ?? null,
            color: v.color ?? null,
            colorHex: v.colorHex ?? null,
            price: v.price ? euro(v.price) : null,
            stock: v.stock,
            sortOrder: i,
          })),
        },
      },
      include: { variants: true },
    });
    await db.inventoryMovement.createMany({
      data: product.variants.map((v) => ({ variantId: v.id, delta: v.stock, reason: "INITIAL" as const, note: "Seed" })),
    });
  }

  if ((await db.coupon.count()) === 0) {
    await db.coupon.create({
      data: { code: "WELCOME10", description: "Demo: 10% off first order (min. 50 €)", type: "PERCENTAGE", value: 10, minOrderValue: euro(50), isActive: true },
    });
  }

  console.log("Seed complete. Create an admin with: npm run admin:create -- <email> <name>");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
