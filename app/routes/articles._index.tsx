import type { DataFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { LinkedItemList } from "~/components/LinkedItemList";
import { getPosts } from "~/lib/posts.server";

export async function loader({ request, params }: DataFunctionArgs) {
  const posts = await getPosts();

  return {
    posts,
  };
}
export default function Articles() {
  const { posts } = useLoaderData<typeof loader>();
  return (
    <div className="container mx-auto mt-10 md:mt-24 space-y-8 px-4">
      <h1 className="text-xl font-mono">Writing</h1>

      <LinkedItemList>
        {posts.map((post) => (
          <Link
            key={post.slug}
            to={`/articles/${post.slug}`}
            className="max-w-xl space-y-1 hover:border-gray-300 border border-transparent block p-2 "
          >
            <h3 className="font-bold font-mono underline text-sm">
              {post.title}
            </h3>
            <p className="leading-6 text-sm">{post.description}</p>
            <p className="text-sm text-gray-400">
              {new Date(post.date).toLocaleString("en-US", {
                month: "long",
                day: "2-digit",
                year: "numeric",
                timeZone: "UTC",
              })}
            </p>
          </Link>
        ))}
      </LinkedItemList>
    </div>
  );
}
