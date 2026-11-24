import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsArticleView } from "@/components/news/NewsArticleView";
import { NEWS_ARTICLES, getLocalizedArticle } from "@/lib/data/news";
import { getRequestLang } from "@/lib/i18n/server-routing";

type ArticlePageProps = { params: Promise<{ id: string }> };

function findArticle(id: string) {
  return NEWS_ARTICLES.find((a) => a.slug === id || a.id === id);
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { id } = await params;
  const raw = findArticle(id);
  if (!raw) return {};
  const article = getLocalizedArticle(raw, await getRequestLang());
  return { title: `${article.title} - RediHealth`, description: article.summary };
}

export default async function NewsArticleRoutePage({ params }: ArticlePageProps) {
  const { id } = await params;
  if (!findArticle(id)) notFound();
  return <NewsArticleView id={id} />;
}
