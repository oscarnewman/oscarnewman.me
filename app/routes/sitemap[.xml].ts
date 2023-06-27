import { getPosts } from "~/lib/posts.server";

const baseUrl = `https://oscarnewman.me`;

const formatDateW3C = (date: Date) => {
  return date.toISOString().split("T")[0];
};


export async function loader() {
  const posts = await getPosts();

  const postsSitemap = `
    ${posts
      .map((post) => {
        return `
            <url>
                <loc>${baseUrl}/articles/${post.slug}</loc>
                <lastmod>${formatDateW3C(post.date)}</lastmod>
            </url>
            `;
      })
      .join("")}
    `;

  const otherPages = {
    home: "/",
    writing: "/articles",
    cv: "/cv",
    settings: "/settings",
  };

  const otherPagesSitemap = `
        ${Object.keys(otherPages)
          .map((key) => {
            return `
                <url>
                    <loc>${baseUrl}${otherPages[key]}</loc>
                </url>
                `;
          })
          .join("")}
        `;

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset
        xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
        ${postsSitemap}
        ${otherPagesSitemap}
    </urlset>
    `;

  return new Response(sitemap, {
    headers: {
      "content-type": "application/xml",
    },
  });
}
