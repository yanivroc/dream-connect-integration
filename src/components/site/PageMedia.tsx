import { sortImages, type WaPage } from "@/lib/content-types";

export function PageMedia({ page }: { page: WaPage }) {
  const images = sortImages(page.images ?? []);
  const embedUrl = page.videoUrl || page.videoEmbed;

  if (images.length === 0 && !embedUrl) return null;

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

      {images.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {images.map((img) => {
            const el = (
              <img
                src={img.url}
                alt={img.alt || page.title}
                loading="lazy"
                className="h-64 w-full rounded-xl border border-border object-cover"
              />
            );
            return img.hyperlink ? (
              <a key={img.id} href={img.hyperlink} target="_blank" rel="noreferrer">
                {el}
              </a>
            ) : (
              <div key={img.id}>{el}</div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
