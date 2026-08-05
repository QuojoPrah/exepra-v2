import Image from "next/image";
import { Heart, Plus, Star } from "lucide-react";

type ProductCardProps = {
  name: string;
  category: string;
  image: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  sale?: boolean;
};

export default function ProductCard({
  name,
  category,
  image,
  price,
  oldPrice,
  rating,
  reviews,
  sale,
}: ProductCardProps) {
  return (
    <div className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white transition hover:-translate-y-2 hover:shadow-2xl">

      <div className="relative h-80 overflow-hidden">

        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition duration-700 group-hover:scale-110"
        />

        {sale && (
          <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
            SALE
          </span>
        )}

        <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg">
          <Heart size={18} />
        </button>
      </div>

      <div className="p-6">

        <p className="text-sm uppercase tracking-wide text-slate-400">
          {category}
        </p>

        <h3 className="mt-2 text-xl font-semibold text-slate-900">
          {name}
        </h3>

        <div className="mt-3 flex items-center gap-1 text-amber-500">
          <Star size={16} fill="currentColor" />
          <span className="text-sm text-slate-700">
            {rating} ({reviews})
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between">

          <div className="flex items-center gap-2">
            {oldPrice && (
              <span className="text-slate-400 line-through">
                ${oldPrice}
              </span>
            )}

            <span className="text-2xl font-bold">
              ${price}
            </span>
          </div>

          <button className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 transition hover:bg-slate-900 hover:text-white">
            <Plus size={20} />
          </button>

        </div>

      </div>

    </div>
  );
}