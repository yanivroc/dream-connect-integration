import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { sortImages, type WaPage } from "@/lib/content-types";

export function PageMedia({ page, wide = false }: { page: WaPage; wide?: boolean }) {
  const images = sortImages(page.images ?? []);
  const embedUrl = page.videoUrl || page.videoEmbed;
  const [index, setIndex] = useState(0);

  if (images.length === 0 && !embedUrl) return null;

  const current = images[Math.min(index, images.length - 1)];
  const go = (delta: number) =>
    setIndex((i) => (i + delta + images.length) % Math.max(images.length, 1));

  const img = current ? (
    <img
      src={current.url}
      alt={current.alt || page.title}
      loading="lazy"
      className={
        wide
          ? "mx-auto max-h-[70vh] w-auto max-w-full object-contain"
          : "mx-auto max-h-[70vh] w-auto max-w-full object-contain"
      }
    />
  ) : null;

  return (
    <div className="mt-8 space-y-6">
      {embedUrl ? (
        <div className="aspect-video overflow-hidden rounded-xl border border-border">
          <iframe
            src={embedUrl}
            title={`${page.title} video`}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null}

      {current ? (
        <div className="relative">
          {current.hyperlink ? (
            <a href={current.hyperlink} target="_blank" rel="noreferrer">
              {img}
            </a>
          ) : (
            img
          )}

          {images.length > 1 ? (
            <>
              <button
                onClick={() => go(-1)}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-border bg-background/80 p-2 text-foreground transition-colors hover:text-primary"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-border bg-background/80 p-2 text-foreground transition-colors hover:text-primary"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="absolute bottom-3 right-3 rounded-full bg-background/80 px-3 py-1 text-xs text-muted-foreground">
                {Math.min(index, images.length - 1) + 1} / {images.length}
              </span>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
