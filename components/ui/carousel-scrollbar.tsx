"use client";

import { useEffect,useRef, useState } from "react";
import { EmblaCarouselType } from "embla-carousel";

type CarouselScrollbarProps = {
  emblaApi: EmblaCarouselType | undefined;
};

export default function CarouselScrollbar({
  emblaApi,
  }: CarouselScrollbarProps) {
  const [progress, setProgress] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!emblaApi) return;

    const updateProgress = () => {
      setProgress(emblaApi.scrollProgress());
    };

    updateProgress();

    emblaApi.on("scroll", updateProgress);
    emblaApi.on("reInit", updateProgress);

    return () => {
      emblaApi.off("scroll", updateProgress);
      emblaApi.off("reInit", updateProgress);
    };
  }, [emblaApi]);

  const handleTrackClick = (
   event: React.MouseEvent<HTMLDivElement>
   ) => {
   if (!emblaApi || !trackRef.current) return;

   const rect = trackRef.current.getBoundingClientRect();

   const clickX = event.clientX - rect.left;

   const progress = clickX / rect.width;

   emblaApi.scrollTo(
    Math.round(progress * (emblaApi.scrollSnapList().length - 1))
   );
  };

  return (
  <div
    ref={trackRef}
    onClick={handleTrackClick}
    className="relative mx-auto mt-10 h-[4px] w-[98%] cursor-pointer bg-slate-200">

    <div
      className="absolute top-1/2 h-[4px] w-[40%] -translate-y-1/2 rounded-full bg-slate-900"
      style={{
        left: `calc(${progress * 60}%)`,
      }}
    />

  </div>
  );
}