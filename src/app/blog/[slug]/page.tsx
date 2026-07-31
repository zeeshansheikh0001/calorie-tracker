import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  blogData,
  getBlogAuthorName,
  getBlogPost,
} from "@/data/blog-content";
import { BlogPostView } from "@/features/blog/components/blog-post-view";
import {
  getArticleSchema,
  getBreadcrumbSchema,
} from "@/lib/schema";
import { SITE_NAME, absoluteUrl } from "@/lib/seo/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogData.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) {
    return { title: `Article not found | ${SITE_NAME}` };
  }

  const url = absoluteUrl(`/blog/${post.slug}`);
  const title = `${post.title} | ${SITE_NAME} Blog`;

  return {
    title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description: post.excerpt,
      siteName: SITE_NAME,
      publishedTime: post.publishDate,
      images: [
        {
          url: post.imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.excerpt,
      images: [post.imageUrl],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  // Legacy /blog/1 → /blog/slug
  if (slug !== post.slug) {
    permanentRedirect(`/blog/${post.slug}`);
  }

  const articleLd = getArticleSchema({
    title: post.title,
    excerpt: post.excerpt,
    slug: post.slug,
    imageUrl: post.imageUrl,
    publishDate: post.publishDate,
    authorName: getBlogAuthorName(post),
  });

  const breadcrumbLd = getBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <BlogPostView post={post} />
    </>
  );
}
