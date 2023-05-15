import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import remarkParseFrontmatter from "remark-parse-frontmatter";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { z } from "zod";
import { LRUCache } from "lru-cache";
import type { CacheEntry } from "cachified";
import { cachified } from "cachified";

const lru = new LRUCache<string, CacheEntry>({ max: 1000 });

function readTime(document: string): number {
  const wordsPerMinute = 200;
  // remove any markdown or non text or numeric content
  const text = document.replace(/[^a-zA-Z0-9 ]/g, "");
  const numberOfWords = text.split(/\s/g).length;
  const minutes = numberOfWords / wordsPerMinute;
  const readTime = Math.ceil(minutes);
  return readTime;
}

const processor = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, ["yaml", "toml"])
  .use(remarkParseFrontmatter)
  .use(remarkRehype)
  .use(rehypePrettyCode, {
    // keepBackground: true,
    theme: { light: "github-light", dark: "github-dark" },
    onVisitLine(node) {
      if (node.children.length === 0) {
        node.children = [{ type: "text", value: " " }];
      }
    },
    onVisitHighlightedLine(node) {
      node.properties.className.push("highlighted");
    },
    onVisitHighlightedWord(node) {
      node.properties.className = ["word"];
    },
  })
  .use(rehypeStringify);

const postFrontmatterSchema = z.object({
  title: z.string(),
  author: z.string(),
  published: z.boolean(),
  description: z.string(),
  date: z.string().transform((date) => new Date(date)),
});
type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;

export type Post = PostFrontmatter & {
  slug: string;
  html?: string;
  readTime: number;
};

export async function getPosts(omitContent = false) {
  const postFiles = await readdir(join(__dirname, "../posts"));

  const posts = await Promise.all(
    postFiles.map(async (postFile) => getPost(postFile.replace(".md", "")))
  );

  return posts
    .filter((post) => post.published)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map((post) => {
      if (omitContent) {
        const { html, ...rest } = post;
        return rest;
      }
      return post;
    });
}

export async function getPost(slug: string): Promise<Post> {
  return cachified({
    key: `post-${slug}`,
    cache: lru,
    async getFreshValue() {
      console.info(`getFreshValue: ${slug}`);
      const postFile = await readFile(
        join(__dirname, `../posts/${slug}.md`),
        "utf-8"
      );
      const result = await processor.process(postFile);
      const frontmatter = postFrontmatterSchema.parse(result.data.frontmatter);

      return {
        title: frontmatter.title,
        author: frontmatter.author,
        published: frontmatter.published,
        date: frontmatter.date,
        description: frontmatter.description,
        html: result.toString(),
        slug,
        readTime: readTime(postFile),
      } as Post;
    },
    ttl: 300_000, // 5 minutes in MS
    staleWhileRevalidate: 86400_000, // 1 day in MS
  });
}
