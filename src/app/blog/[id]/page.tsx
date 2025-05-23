
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { mockBlogData } from "@/app/page"; // Assuming mockBlogData is exported from page.tsx
import type { BlogPost } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowLeft, CalendarDays, Tag } from "lucide-react";

export default function BlogPostPage() {
  const params = useParams();
  const postId = params.id as string;

  // In a real app, you'd fetch this data from a CMS or database
  const post: BlogPost | undefined = mockBlogData.find(p => p.id === postId);

  if (!post) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <Card className="max-w-md mx-auto p-8 shadow-lg">
          <CardTitle className="text-2xl font-bold text-destructive mb-4">Blog Post Not Found</CardTitle>
          <CardDescription className="mb-6">Sorry, we couldn't find the blog post you were looking for.</CardDescription>
          <Link href="/" passHref>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Link href="/" passHref className="mb-6 inline-block">
        <Button variant="ghost" className="text-primary hover:text-primary/80">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </Link>
      <Card className="shadow-xl overflow-hidden rounded-lg">
        <div className="relative w-full h-64 md:h-80">
          <Image
            src={post.imageUrl}
            alt={post.title}
            layout="fill"
            objectFit="cover"
            data-ai-hint={post.imageHint || "blog post image"}
          />
        </div>
        <CardHeader className="p-6">
          <CardTitle className="text-3xl font-bold leading-tight mb-3">{post.title}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground space-x-4">
            <div className="flex items-center">
              <CalendarDays className="mr-1.5 h-4 w-4" />
              <span>Published: May 23, 2025</span> {/* Placeholder date */}
            </div>
            {post.imageHint && (
              <div className="flex items-center">
                <Tag className="mr-1.5 h-4 w-4" />
                <span>{post.imageHint.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(', ')}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <article className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none">
            <p className="lead text-lg text-muted-foreground mb-6">{post.excerpt}</p>
            {/* Placeholder for more content */}
            <p>
              This is where more detailed content for the blog post titled "{post.title}" would go.
              For now, we are only displaying the excerpt. Building out a full blog system would involve
              storing and retrieving complete articles.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </article>
        </CardContent>
      </Card>
    </div>
  );
}
