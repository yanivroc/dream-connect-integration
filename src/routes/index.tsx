import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { siteContentQuery } from "@/lib/content-query";
import { slugify, sortPages } from "@/lib/content-types";
import { HeroSlider } from "@/components/site/HeroSlider";
import { RichText } from "@/components/site/RichText";
import { PageMedia } from "@/components/site/PageMedia";
import { PageCardGrid } from "@/components/site/PageCardGrid";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery),
  head: ({ loaderData }) => {
    const title = loaderData?.content.webApp.title
      ? `${loaderData.content.webApp.title} — Digital Innovation Partner`
      : "DreamozTech — Digital Innovation Partner";
    const description =
      loaderData?.content.webApp.description?.slice(0, 155) ||
      "DreamozTech builds web apps, digital products and growth systems for ambitious businesses.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(siteContentQuery);
  const content = data.content;
  const pages = sortPages(content.pages);
  const [hero, ...rest] = pages;
  const currency =
    content.shippingRates.byAmount[0]?.currency ??
    content.shippingRates.byQuantity[0]?.currency ??
    "AUD";

  if (!hero) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <h1 className="text-3xl font-bold text-foreground">{content.webApp.title}</h1>
        <p className="mt-3 text-muted-foreground">Content is being published. Check back soon.</p>
      </div>
    );
  }

  return (
    <>
      <HeroSlider page={hero} />

      {sortPages(hero.children ?? []).length > 0 ? (
        <section className="mx-auto max-w-6xl px-6 py-16">
          <PageCardGrid pages={hero.children} currency={currency} />
        </section>
      ) : null}

      {rest.map((page, i) => {
        const children = sortPages(page.children ?? []);
        return (
          <section
            key={page.id}
            className={i % 2 === 1 ? "bg-card/40 py-20" : "py-20"}
            id={slugify(page.title)}
          >
            <div className="mx-auto max-w-6xl px-6">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl font-bold text-foreground">{page.title}</h2>
                <RichText html={page.description} className="mt-5 [&_*]:text-center" />
              </div>
              <div className="mx-auto max-w-4xl">
                <PageMedia page={page} />
              </div>
              {children.length > 0 ? (
                <PageCardGrid pages={children} currency={currency} />
              ) : (
                <div className="mt-8 text-center">
                  <Link
                    to="/page/$slug"
                    params={{ slug: slugify(page.title) }}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Read more about {page.title}
                  </Link>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}
