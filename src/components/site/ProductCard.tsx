import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { formatMoney, slugify, sortImages, type WaPage } from "@/lib/content-types";
import { cartItemFromPage, useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";

export function ProductCard({ page, currency }: { page: WaPage; currency: string }) {
  const { add, setOpen } = useCart();
  const min = page.product.minQty ?? 1;
  const max = page.product.maxQty ?? 99;
  const [qty, setQty] = useState(min);
  const image = sortImages(page.images ?? [])[0];

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <Link
        to="/page/$slug"
        params={{ slug: slugify(page.title) }}
        className="block aspect-4/3 overflow-hidden bg-muted"
      >
        {image ? (
          <img
            src={image.url}
            alt={image.alt || page.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {page.title}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-semibold text-foreground">{page.title}</h3>
        <p className="text-xl font-bold text-primary">
          {formatMoney(page.product.price ?? 0, currency)}
        </p>

        <div className="mt-auto flex items-center gap-3">
          <input
            type="number"
            min={min}
            max={max}
            value={qty}
            onChange={(e) =>
              setQty(Math.min(Math.max(Number(e.target.value) || min, min), max))
            }
            aria-label={`Quantity for ${page.title}`}
            className="h-10 w-20 rounded-md border border-input bg-background px-3 text-sm text-foreground"
          />
          <Button
            className="flex-1"
            onClick={() => {
              add(cartItemFromPage(page), qty);
              toast.success(`${page.title} added to cart`);
              setOpen(true);
            }}
          >
            Add to cart
          </Button>
        </div>
      </div>
    </article>
  );
}
