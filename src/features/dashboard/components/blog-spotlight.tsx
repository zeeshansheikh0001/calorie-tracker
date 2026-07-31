import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Icon3D } from "@/components/icons/icon-3d";
import { blogData } from "@/data/blog-content";
import { SurfaceCard } from "@/components/ui/surface-card";
import { Button } from "@/components/ui/button";

const posts = blogData.slice(0, 3);

export function BlogSpotlight() {
  return (
    <section aria-labelledby="dashboard-blog-heading">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Learn
          </p>
          <h2
            id="dashboard-blog-heading"
            className="font-display text-xl font-medium tracking-tight"
          >
            From the blog
          </h2>
        </div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <Link key={post.id} href={post.readMoreLink} className="block">
            <SurfaceCard className="flex gap-3 p-3 transition hover:border-primary/25 sm:p-3.5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-muted sm:h-[4.5rem] sm:w-[4.5rem]">
                <Image
                  src={post.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="72px"
                />
              </div>
              <div className="min-w-0 flex-1">
                {post.category ? (
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                    {post.category}
                  </p>
                ) : null}
                <p className="mt-0.5 line-clamp-2 text-sm font-semibold tracking-tight">
                  {post.title}
                </p>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                  {post.excerpt}
                </p>
              </div>
            </SurfaceCard>
          </Link>
        ))}
      </div>

      <Button asChild variant="outline" className="mt-3 h-11 w-full rounded-2xl">
        <Link href="/blog">
          <Icon3D name="book" size={18} alt="" />
          Explore nutrition blog
        </Link>
      </Button>
    </section>
  );
}
