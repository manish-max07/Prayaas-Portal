import { getAllNewsArticles } from "@/lib/newsData";

export default async function sitemap() {
  const baseUrl = "https://prayaas-portal.vercel.app";
  const newsArticles = await getAllNewsArticles();

  const newsEntries = newsArticles.map((article) => ({
    url: `${baseUrl}/news/${article.slug}`,
    lastModified: new Date(article.lastUpdated || article.publishDate),
    changeFrequency: "hourly",
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.95,
    },
    ...newsEntries,
    {
      url: `${baseUrl}/rank-calculator`,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rank-calculator/terms-conditions`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
