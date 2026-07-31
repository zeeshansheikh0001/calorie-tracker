"use client";

import Link from "next/link";
import Image from "next/image";
import { blogData } from "@/data/blog-content";
import type { BlogPost } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";

type BlogPostViewProps = {
  post: BlogPost;
};

function authorName(post: BlogPost): string {
  if (typeof post.author === "object" && post.author?.name) return post.author.name;
  if (typeof post.author === "string") return post.author;
  return "Editorial Team";
}

function authorImage(post: BlogPost): string | undefined {
  if (typeof post.author === "object") return post.author.imageUrl;
  return post.authorImage;
}

function authorRole(post: BlogPost): string | undefined {
  if (typeof post.author === "object") return post.author.role;
  return post.authorRole;
}

export function BlogPostView({ post }: BlogPostViewProps) {
  const name = authorName(post);
  const role = authorRole(post);
  const image = authorImage(post);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Link href="/blog" className="mb-6 inline-block">
        <Button variant="ghost" className="text-primary hover:text-primary/80">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
      </Link>

      <Card className="overflow-hidden rounded-lg border-none shadow-xl">
        <div className="relative h-64 w-full md:h-80">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
          {post.category ? (
            <div className="absolute left-4 top-4 z-10">
              <Badge
                variant="outline"
                className="border-transparent bg-white/90 font-medium text-primary"
              >
                {post.category}
              </Badge>
            </div>
          ) : null}
        </div>

        <CardHeader className="p-6 pb-4">
          <CardTitle className="mb-4 text-3xl font-bold leading-tight">
            {post.title}
          </CardTitle>

          <div className="mb-4 flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-muted">
              <AvatarImage src={image} alt={name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{name}</div>
              {role ? (
                <div className="text-xs text-muted-foreground">{role}</div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {post.publishDate ? (
              <div className="flex items-center">
                <CalendarDays className="mr-1.5 h-4 w-4" />
                <span>{post.publishDate}</span>
              </div>
            ) : null}
            <div className="flex items-center">
              <Clock className="mr-1.5 h-4 w-4" />
              <span>5 min read</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <div className="prose prose-sm max-w-none dark:prose-invert sm:prose-base lg:prose-lg">
            <p className="lead mb-6 text-lg text-muted-foreground">
              {post.excerpt}
            </p>
            {post.content ? (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : null}
          </div>

          <div className="mt-10 border-t pt-6">
            <h3 className="mb-4 text-lg font-semibold">Related Articles</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {blogData
                .filter((b) => b.id !== post.id && b.category === post.category)
                .slice(0, 2)
                .map((related) => (
                  <Link href={related.readMoreLink} key={related.id}>
                    <Card className="h-full border-muted transition-colors hover:bg-accent/50">
                      <CardContent className="flex gap-3 p-4">
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                          <Image
                            src={related.imageUrl}
                            alt={related.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div>
                          <h4 className="line-clamp-2 text-sm font-medium">
                            {related.title}
                          </h4>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {authorName(related)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
