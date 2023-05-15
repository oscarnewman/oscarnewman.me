import { Chalk } from "chalk";
import { promises as fs } from "fs";
import { getPosts } from "~/lib/posts.server";
async function run() {
  const chalk = new Chalk();

  console.log(chalk.bold.white("🛠️  Compiling markdown posts"));

  const posts = await getPosts(false, "./posts");

  // ensure `app/_generated` exists
  await fs.mkdir("./app/_generated", { recursive: true });

  // write `app/_generated/posts.json`
  await fs.writeFile(
    "./app/_generated/posts.json",
    JSON.stringify(posts, null, 2)
  );

  console.log(chalk.bold.white(`✅  Done with ${posts.length} post${posts.length === 1 ? "" : "s"}`));
}

run();
