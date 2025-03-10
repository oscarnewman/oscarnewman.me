import type { DataFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import meAvif from "~/assets/me.avif";
import mePng from "~/assets/me.png";
import meWebp from "~/assets/me.webp";
import meAvif2x from "~/assets/me@2x.avif";
import mePng2x from "~/assets/me@2x.png";
import meWebp2x from "~/assets/me@2x.webp";
import ExternalLink from "~/components/ExternalLink";
import { Group } from "~/components/Group";
import { LinkedItem } from "~/components/LinkedItem";
import { LinkedItemList } from "~/components/LinkedItemList";
import { getPosts } from "~/lib/posts.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Oscar Newman" },
    {
      name: "description",
      content:
        "Oscar Newman is a producty engineering lead at Solv building consumer healthcare experiences.",
    },
  ];
};

export async function loader({ request, params }: DataFunctionArgs) {
  return {
    posts: await getPosts(true),
  };
}

export default function Index() {
  const { posts } = useLoaderData<typeof loader>();
  return (
    <div className="container px-4 mx-auto mt-10 md:mt-24 relative flex-col lg:flex-row flex gap-12 pb-24">
      <div className="space-y-8 flex-shrink-0 md:sticky md:top-16 md:self-start">
        <picture className="rounded-full">
          <source srcSet={`${meAvif}, ${meAvif2x} 2x`} type="image/avif" />
          <source srcSet={`${meWebp}, ${meWebp2x} 2x`} type="image/webp" />
          <source srcSet={`${mePng}, ${mePng2x} 2x`} className="" />
          <img
            src={mePng}
            width={90}
            height={90}
            alt="Oscar Newman"
            className="rounded-full"
          />
        </picture>
        <h1 className="text-xl font-medium font-mono">👋 Howdy, I'm Oscar.</h1>
        <div className="max-w-lg font-sans leading-7 space-y-4">
          <p>
            I'm a producty engineering lead at{" "}
            <ExternalLink to="https://www.solvhealth.com">Solv</ExternalLink>{" "}
            building great consumer healthcare experiences.
          </p>
          <p>
            I graduated from Brown in 2021 studying Computer Science and Machine
            Learning (officially), and Healthcare Policy (unofficially).
          </p>
          <p>Raised in Austin, Texas. 🤠</p>
          <p className="flex items-baseline gap-4">
            <ExternalLink to="/cv">Latest CV</ExternalLink>
            <ExternalLink to="https://github.com/oscarnewman">
              Github
            </ExternalLink>
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Group title="Speaking">
          <LinkedItemList>
            <LinkedItem
              external
              href="https://www.youtube.com/watch?v=-qU56TTRdnk"
              title="Hybrid native apps powered by Remix"
              badge="Remix Conf 2023"
            />
          </LinkedItemList>
        </Group>

        <Group title="Writing">
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
        </Group>

        <Group title="Projects">
          <LinkedItemList>
            <LinkedItem
              title="Textual"
              href="https://www.textual.wedding?ref=oscarnewman.me"
              external
              description="Guest experience copilot for weddings. Collect candid photo and coordinate with guests via SMS."
            />
            <LinkedItem
              title="TabType"
              href="https://tabtype.co?ref=oscarnewman.me"
              external
              description="Turn you browser tabs into beautiful slides with a simple notion-like editor."
            />
            <LinkedItem
              title="AdSync"
              href="https://www.useadsync.com?ref=oscarnewman.me"
              external
              description="A dashboard to run all your ads, with AI-enhanced tools to help you get the most out of your ads."
            />
            <LinkedItem
              title="writ.link"
              href="https://www.writ.link?ref=oscarnewman.me"
              external
              description="A beautiful text-first link in bio site built for academics and writers."
            />
            <LinkedItem
              title="Comment Click | Comment and collaborate directly on your site"
              href="https://comment.click?ref=oscarnewman.me"
              external
              description="Just like Figma and Google Docs—have discussions and give feedback where it matters, no more screenshots or third-party tools to wrangle."
            />
            <LinkedItem
              title="Electric Insured"
              href="https://electricinsured.com?ref=oscarnewman.me"
              external
              description="Affordable theft & loss insurance tailored for e-bikes"
            />
            <LinkedItem
              title="The Telehealth Report"
              href="/Telehealth.pdf"
              external
              description="A deep-dive analysis of the Telehealth industry, its history, its efficacy in cost savings and outcomes, and market opportunities moving forward."
            />

            <LinkedItem
              title="Pillar | A Better Way to Give"
              href="https://pillar.gives"
              external
              description="A smart, automated giving platform that uses expert advice to build
              you a dynamic giving portfolio, keep it up to date, and maximize your
              impact."
            />

            <LinkedItem
              title="oscarnewman.me"
              description="This site! Built with Remix and Typescript. A testing ground for new things I want to try out."
              href="https://github.com/oscarnewman/oscarnewman.me"
              external
            />
          </LinkedItemList>
        </Group>
      </div>
    </div>
  );
}
