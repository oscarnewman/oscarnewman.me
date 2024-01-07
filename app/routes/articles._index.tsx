import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { LinkedItem } from "~/components/LinkedItem";
import { LinkedItemList } from "~/components/LinkedItemList";
import { getPosts } from "~/lib/posts.server";

export const meta: MetaFunction = () => [
  { title: "Writing | Oscar Newman" },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
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
          <LinkedItem
            key={post.slug}
            href={`/articles/${post.slug}`}
            title={post.title}
            description={post.description}
            date={new Date(post.date)}
          />
        ))}
      </LinkedItemList>
    </div>
  );
}
