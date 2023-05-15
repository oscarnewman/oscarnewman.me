import type { DataFunctionArgs } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { notFound } from "remix-utils";
import type { Post } from "~/lib/posts.server";
import { getPost, getPosts } from "~/lib/posts.server";

function levenshteinEditDistance(a?: string, b?: string) {
  if (!a || !b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i += 1) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= b.length; j += 1) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[b.length][a.length];
}

export async function loader({ request, params }: DataFunctionArgs) {
  if (!params.slug) {
    throw notFound({});
  }
  try {
    const post = await getPost(params.slug);
    return {
      post,
    };
  } catch (error) {
    const allPosts = await getPosts(true);
    // find similar slugs to suggest
    const similar = allPosts.filter(
      (post) => levenshteinEditDistance(post.slug, params.slug) < 5
    );

    throw notFound({
      slug: params.slug,
      similar,
    });
  }
}

export default function Article() {
  const { post } = useLoaderData<typeof loader>();
  return (
    <div className=" px-4 container mx-auto">
      <article className="prose prose-stone prose-headings:font-mono prose-headings:font-medium dark:prose-invert text-gray-900 dark:text-gray-50 mt-10 md:mt-24 prose-pre:bg-gray-50 dark:prose-pre:bg-gray-950 prose-pre:border dark:prose-pre:border-gray-700">
        <div className="not-prose pb-8 space-y-2">
          <h1 className="text-xl font-mono font-medium">{post.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 font-mono gap-3 text-sm flex items-baseline">
            <span>
              {new Date(post.date).toLocaleString("en-US", {
                month: "long",
                day: "2-digit",
                year: "numeric",
                timeZone: "UTC",
              })}
            </span>
            &ndash;
            <span>{post.readTime} min read</span>
          </p>
        </div>

        {post.html && (
          <div dangerouslySetInnerHTML={{ __html: post.html }}></div>
        )}
      </article>

      <div className="pt-12 pb-24">
        <a
          href="mailto:oscar@oscarnewman.me"
          className="border font-mono px-5 py-3 border-gray-900 hover:bg-gray-950 hover:text-white dark:border-gray-100 dark:hover:bg-gray-100 dark:hover:text-gray-900"
        >
          Get in touch &raquo;
        </a>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  // when true, this is what used to go to `CatchBoundary`
  if (isRouteErrorResponse(error)) {
    return (
      <div className="container px-4 mx-auto mt-10 md:mt-24">
        <h1 className="text-xl font-mono">
          Sorry, the article{" "}
          <code className="bg-gray-200 rounded-sm px-1 -mx-1">
            {error.data.slug}
          </code>{" "}
          does not exist
        </h1>

        {error.data.similar.length > 0 && (
          <div className="mt-4">
            <p className="">You might be looking for:</p>
            <ul className="list-disc list-inside">
              {error.data.similar.map((post: Post) => (
                <li key={post.slug}>
                  <a
                    href={`/articles/${post.slug}`}
                    className="underline inline-flex items-center gap-1"
                  >
                    {post.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-4">
          If you think this is a mistake, please{" "}
          <a
            href="mailto:oscar@oscarnewman.me"
            className="underline inline-flex items-center gap-1"
          >
            let me know
          </a>
          .
        </p>

        <p className="mt-4">
          <a
            href="/articles"
            className="underline inline-flex items-center gap-1"
          >
            See all articles
          </a>
        </p>

        <p className="mt-4">
          <a href="/" className="underline inline-flex items-center gap-1">
            Go home
          </a>
        </p>
      </div>
    );
  }

  // Don't forget to typecheck with your own logic.
  // Any value can be thrown, not just errors!
  let errorMessage = "Unknown error";
  if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div>
      <h1>Uh oh ...</h1>
      <p>Something went wrong.</p>
      <pre>{errorMessage}</pre>
    </div>
  );
}
