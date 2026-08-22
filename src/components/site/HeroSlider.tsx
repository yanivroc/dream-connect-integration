import { useEffect, useState } from "react";
import { sortImages, type WaPage } from "@/lib/content-types";
import { RichText } from "./RichText";
import { cn } from "@/lib/utils";

export function HeroSlider({ page }: { page: WaPage }) {
  const images = sortImages(page.images ?? []);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), 6000);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <div className="absolute inset-0 -z-10">
        {images.map((img, i) => (
          <img
            key={img.id}
            src={img.url}
            alt={img.alt || page.title}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000",
              i === index ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
        <div className="absolute inset-0 bg-background/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/70 to-background" />
      </div>

      <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-4xl font-bold text-foreground sm:text-5xl">{page.title}</h1>
        <RichText html={page.description} className="mt-6 [&_*]:text-center" />
        {page.hyperlink ? (
          <a
            href={page.hyperlink}
            className="mt-6 inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Learn more
          </a>
        ) : null}

        {images.length > 1 ? (
          <div className="mt-10 flex gap-2">
            {images.map((img, i) => (
              <button
                key={img.id}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === index ? "w-8 bg-primary" : "w-2 bg-muted-foreground/50",
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
