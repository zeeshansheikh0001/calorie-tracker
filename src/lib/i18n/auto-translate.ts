import type { BlogPost } from "@/types";
import type { SupportedLocale } from "./translations";

const LOCALE_CODE: Record<SupportedLocale, string> = {
  en: "en",
  ar: "ar",
  es: "es",
  fr: "fr",
  de: "de",
};

const textCache = new Map<string, Promise<string>>();
const postCache = new Map<string, Promise<BlogPost>>();

async function translateText(text: string, locale: SupportedLocale): Promise<string> {
  if (!text || locale === "en") {
    return text;
  }

  const cacheKey = `${locale}::${text}`;
  const cached = textCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const request = (async () => {
    const target = LOCALE_CODE[locale];
    const url =
      "https://translate.googleapis.com/translate_a/single" +
      `?client=gtx&sl=en&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url, { method: "GET" });
    if (!response.ok) {
      throw new Error(`Translate request failed (${response.status})`);
    }

    const payload = (await response.json()) as unknown;
    if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
      throw new Error("Unexpected translate payload");
    }

    const segments = payload[0] as unknown[];
    return segments
      .map((segment) => (Array.isArray(segment) && typeof segment[0] === "string" ? segment[0] : ""))
      .join("");
  })().catch(() => text);

  textCache.set(cacheKey, request);
  return request;
}

export async function translateBlogPost(post: BlogPost, locale: SupportedLocale): Promise<BlogPost> {
  if (locale === "en") {
    return post;
  }

  const cacheKey = `${locale}::${post.id}`;
  const cached = postCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const request = (async () => {
    const [title, excerpt, category, imageHint, content, authorRole] = await Promise.all([
      translateText(post.title, locale),
      translateText(post.excerpt, locale),
      translateText(post.category || "", locale),
      translateText(post.imageHint || "", locale),
      translateText(post.content || "", locale),
      translateText(post.authorRole || "", locale),
    ]);

    let translatedAuthor = post.author;
    if (translatedAuthor && typeof translatedAuthor === "object" && translatedAuthor.role) {
      translatedAuthor = {
        ...translatedAuthor,
        role: await translateText(translatedAuthor.role, locale),
      };
    }

    return {
      ...post,
      title,
      excerpt,
      category: category || post.category,
      imageHint: imageHint || post.imageHint,
      content: content || post.content,
      authorRole: authorRole || post.authorRole,
      author: translatedAuthor,
    };
  })();

  postCache.set(cacheKey, request);
  return request;
}

export async function translateBlogPosts(posts: BlogPost[], locale: SupportedLocale): Promise<BlogPost[]> {
  if (locale === "en") {
    return posts;
  }
  return Promise.all(posts.map((post) => translateBlogPost(post, locale)));
}
