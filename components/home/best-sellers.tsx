"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const products = [
  {
    category: "Home & Living",
    title: "Bedside Lamp",
    price: "€249",
    image: "/images/products/item1.jpg",
    badge: "NEW",
  },
  {
    category: "Tech & Gadgets",
    title: "Cables Bag",
    price: "€179",
    image: "/images/products/item2.jpg",
    badge: "POPULAR",
  },
  {
    category: "Fitness",
    title: "Smart Water Bottle",
    price: "€59",
    image: "/images/products/item3.jpg",
    badge: "TRENDING",
  },
  {
    category: "Kitchen",
    title: "Wooden laddle set",
    price: "€119",
    image: "/images/products/item4.jpg",
    badge: "LIMITED",
  },
  {
    category: "Elegant Bathroom",
    title: "Soap containers",
    price: "€89",
    image: "/images/products/item5.jpg",
    badge: "NEW",
  },
  {
    category: "Travel",
    title: "Premium Backpack",
    price: "€149",
    image: "/images/products/item6.jpg",
    badge: "BEST",
  },
  {
    category: "Beauty",
    title: "Make-up Brush Set",
    price: "€99",
    image: "/images/products/item7.jpg",
    badge: "NEW",
  },
  {
    category: "Lifestyle",
    title: "Essential Organizer",
    price: "€69",
    image: "/images/products/item8.jpg",
    badge: "POPULAR",
  },
];

export default function BestSellers() {

  return (
    <section className="bg-[#FAFAF8] py-24">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <div className="mb-12 text-center">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount:0.3 }}
            >
            <p className="mx-auto mb-3 text-m font-semibold uppercase tracking-[0.4em] text-slate-500">
              Best Sellers
            </p>

            <h2 className="text-5xl font-bold text-slate-900">
              Everyone's Favorite
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-lg text-slate-500">
              Discover the products our customers love most.
            </p>
          </motion.div>

        </div>

        {/* Product Grid */}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {products.map((product, index) => (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -10,
              boxShadow: "0 35px 80px rgba(15,23,42,0.12)"
            }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{
             y: {
                type: "spring",
                stiffness: 180,
                damping: 20,
              },

              boxShadow: {
                duration: 0.35,
              },

              opacity: {
                duration: 0.5,
              },
            }}
            key={index}
            className="
            group
            rounded-[12px]
            border
            border-white/70
            bg-white
            p-4
            shadow-[0_12px_30px_rgba(15,23,42,0.06)]
            "
            >

            <div className="relative aspect-square overflow-hidden rounded-[12px] bg-slate-100">

               <div
                className="
                  absolute
                  left-5
                  top-5
                  rounded-full
                  bg-white/90
                  px-2
                  py-1
                  text-[10px]
                  font-bold
                  tracking-[0.2em]
                  uppercase
                  text-slate-900
                  backdrop-blur-xl
                  shadow-lg
                "
              >
                {product.badge}
              </div>

              <button
                className="
                  absolute
                  right-5
                  top-5
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/30
                  bg-white/40
                  backdrop-blur-xl
                  transition-all
                  duration-500
                  hover:scale-110
                  hover:bg-white/80
                "
                >
                <Heart
                  className="
                  h-5
                  w-5
                  text-slate-700
                  transition-colors
                  duration-500
                  hover:text-red-500" />
              </button>

              <Image
                src={product.image}
                alt={product.title}
                width={500}
                height={600}
                loading="eager"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
            </div>

            <div className="px-3 pt-8 pb-2">

              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                {product.category}
              </p>

              <h3 className="mt-2 text-xl font-semibold leading-snug text-slate-900">
                {product.title}
              </h3>

              <div className="mt-2 flex items-center gap-2">

                <span className="text-sm tracking-tight text-amber-400">
                  ★★★★★
                </span>

                <span className="text-xs text-slate-500">
                  4.9 (128)
                </span>

              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-xl font-medium tracking-tight text-slate-900">
                  {product.price}
                </span>

              </div>

            </div>

          </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}