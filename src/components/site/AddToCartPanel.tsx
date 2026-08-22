import { useState } from "react";
import { toast } from "sonner";
import type { WaPage } from "@/lib/content-types";
import { cartItemFromPage, useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";

export function AddToCartPanel({ page }: { page: WaPage }) {
  const { add, setOpen } = useCart();
  const min = page.product.minQty ?? 1;
  const max = page.product.maxQty ?? 99;
  const [qty, setQty] = useState(min);

  return (
    <div className="mt-8 flex max-w-md items-center gap-3 rounded-xl border border-border bg-card p-4">
      <input
        type="number"
        min={min}
        max={max}
        value={qty}
        onChange={(e) => setQty(Math.min(Math.max(Number(e.target.value) || min, min), max))}
        aria-label="Quantity"
        className="h-11 w-24 rounded-md border border-input bg-background px-3 text-foreground"
      />
      <Button
        size="lg"
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
  );
}
