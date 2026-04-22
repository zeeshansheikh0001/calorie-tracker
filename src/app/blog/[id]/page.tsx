"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { blogData } from "@/data/blog-content"; // Using blogData instead of mockBlogData
import type { BlogPost } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { ArrowLeft, CalendarDays, Tag, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n/provider";
import { useEffect, useMemo, useState } from "react";
import { translateBlogPosts } from "@/lib/i18n/auto-translate";

export default function BlogPostPage() {
  const { t, locale } = useLanguage();
  const params = useParams();
  const postId = params.id as string;
  const [localizedPosts, setLocalizedPosts] = useState<BlogPost[]>(blogData);

  useEffect(() => {
    let cancelled = false;

    const loadLocalizedPosts = async () => {
      const translated = await translateBlogPosts(blogData, locale);
      if (!cancelled) {
        setLocalizedPosts(translated);
      }
    };

    loadLocalizedPosts();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const post: BlogPost | undefined = useMemo(
    () => localizedPosts.find((p) => p.id === postId),
    [localizedPosts, postId]
  );

  if (!post) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <Card className="max-w-md mx-auto p-8 shadow-lg">
          <CardTitle className="text-2xl font-bold text-destructive mb-4">{t("blog.postNotFoundTitle")}</CardTitle>
          <CardDescription className="mb-6">{t("blog.postNotFoundDesc")}</CardDescription>
          <Link href="/blog" passHref>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("blog.backToBlog")}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Link href="/blog" passHref className="mb-6 inline-block">
        <Button variant="ghost" className="text-primary hover:text-primary/80">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("blog.backToBlog")}
        </Button>
      </Link>
      
      <Card className="shadow-xl overflow-hidden rounded-lg border-none">
        <div className="relative w-full h-64 md:h-80">
          <Image
            src={post.imageUrl}
            alt={post.title}
            layout="fill"
            objectFit="cover"
            data-ai-hint={post.imageHint || "blog post image"}
          />
          {post.category && (
            <div className="absolute top-4 left-4 z-10">
              <Badge variant="outline" className="bg-white/90 text-primary border-transparent font-medium">
                {post.category}
              </Badge>
            </div>
          )}
        </div>
        
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-3xl font-bold leading-tight mb-4">{post.title}</CardTitle>
          
          {/* Author information */}
          {post.author && (
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10 border-2 border-muted">
                <AvatarImage 
                  src={
                    typeof post.author === 'object' && post.author?.imageUrl 
                      ? post.author.imageUrl 
                      : post.authorImage || `https://placehold.co/200x200.png`
                  }
                  alt={
                    typeof post.author === 'object' && post.author?.name
                      ? post.author.name
                      : typeof post.author === 'string' 
                        ? post.author 
                        : t("blog.authorFallback")
                  }
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {typeof post.author === 'object' && post.author?.name
                    ? post.author.name.charAt(0)
                    : typeof post.author === 'string'
                      ? post.author.charAt(0)
                      : "A"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {typeof post.author === 'object' && post.author?.name
                    ? post.author.name
                    : typeof post.author === 'string'
                      ? post.author
                      : t("blog.authorFallback")}
                </div>
                {(typeof post.author === 'object' && post.author?.role) || post.authorRole ? (
                  <div className="text-xs text-muted-foreground">
                    {typeof post.author === 'object' && post.author?.role 
                      ? post.author.role 
                      : post.authorRole}
                  </div>
                ) : null}
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-4">
            {post.publishDate && (
              <div className="flex items-center">
                <CalendarDays className="mr-1.5 h-4 w-4" />
                <span>{post.publishDate}</span>
              </div>
            )}
            {post.imageHint && (
              <div className="flex items-center">
                <Tag className="mr-1.5 h-4 w-4" />
                <span>{post.imageHint.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(', ')}</span>
              </div>
            )}
            <div className="flex items-center">
              <Clock className="mr-1.5 h-4 w-4" />
              <span>{t("blog.readTime")}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 pt-0">
          <div className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none">
            <p className="lead text-lg text-muted-foreground mb-6">{post.excerpt}</p>
            
            {/* Render full content if available */}
            {post.content ? (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : (
              <p>{t("common.loading")}</p>
            )}
          </div>
          
          {/* Share and related articles section */}
          <div className="mt-10 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">{t("blog.relatedArticles")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {localizedPosts
                .filter(b => b.id !== post.id && b.category === post.category)
                .slice(0, 2)
                .map(relatedPost => (
                  <Link href={relatedPost.readMoreLink} key={relatedPost.id}>
                    <Card className="h-full hover:bg-accent/50 transition-colors border-muted">
                      <CardContent className="p-4 flex gap-3">
                        <div className="w-16 h-16 rounded-md overflow-hidden relative flex-shrink-0">
                          <Image
                            src={relatedPost.imageUrl}
                            alt={relatedPost.title}
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm line-clamp-2">{relatedPost.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {typeof relatedPost.author === 'object' && relatedPost.author?.name
                              ? relatedPost.author.name
                              : typeof relatedPost.author === 'string'
                                ? relatedPost.author
                                : t("blog.editorialTeam")}
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
