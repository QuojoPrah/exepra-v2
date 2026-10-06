import Image from "next/image";

type CategoryCardProps = {
  title: string;
  image: string;
};

export default function CategoryCard({
  title,
  image,
}: CategoryCardProps) {
  return (
    <div className="group cursor-pointer">

      <div className="group relative h-[380px] overflow-hidden rounded-[16px]">

        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          className="object-cover transition duration-700 group-hover:scale-110"
        />

      </div>

      <div className="mt-5">

        <h3 className="text-xl font-semibold text-slate-900 transition group-hover:text-slate-700">
          {title}
        </h3>

      </div>

    </div>
  );
}