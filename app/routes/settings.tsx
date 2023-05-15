import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { SectionTitle } from "~/components/SectionTitle";
import { preferences } from "~/lib/session.server";

export async function loader({ request }: LoaderArgs) {
  const session = await preferences.getSession(request.headers.get("Cookie"));

  const javascriptEnabled = session.get("javascriptEnabled") ?? true;
  const cssEnabled = session.get("cssEnabled") ?? true;
  const analyticsEnabled = session.get("analyticsEnabled") ?? true;

  return {
    javascriptEnabled,
    cssEnabled,
    analyticsEnabled,
  };
}

export default function Settings() {
  const defaults = useLoaderData<typeof loader>();

  return (
    <fieldset className="container mx-auto mt-10 md:mt-24 px-4 space-y-6">
      <legend>
        <SectionTitle>Settings</SectionTitle>
      </legend>

      <form method="post" className="space-y-8" key={JSON.stringify(defaults)}>
        <div className="space-y-4">
          <label className="flex items-center gap-2 font-mono">
            <input
              name="js"
              type="checkbox"
              defaultChecked={defaults.javascriptEnabled}
              className="text-gray-950 bg-gray-100"
            />
            <span>Enable Javascript</span>
          </label>
          <label className="flex items-center gap-2 font-mono">
            <input
              name="css"
              type="checkbox"
              defaultChecked={defaults.cssEnabled}
              className="text-gray-950 bg-gray-100"
            />
            <span>Enable external stylesheets</span>
          </label>
          <label className="flex items-center gap-2 font-mono">
            <input
              name="analytics"
              type="checkbox"
              defaultChecked={defaults.analyticsEnabled}
              className="text-gray-950 bg-gray-100"
            />
            <span>Enable analytics</span>
          </label>
        </div>

        <button className="border font-mono px-4 py-1.5 border-gray-900 hover:bg-gray-950 hover:text-white dark:border-gray-100 dark:hover:bg-gray-100 dark:hover:text-gray-900">
          Save &raquo;
        </button>
      </form>
    </fieldset>
  );
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const session = await preferences.getSession(request.headers.get("Cookie"));

  const javascriptEnabled = formData.get("js") === "on";
  const cssEnabled = formData.get("css") === "on";
  const analyticsEnabled = formData.get("analytics") === "on";

  session.set("javascriptEnabled", javascriptEnabled);
  session.set("cssEnabled", cssEnabled);
  session.set("analyticsEnabled", analyticsEnabled);

  return redirect("/settings", {
    headers: {
      "Set-Cookie": await preferences.commitSession(session),
    },
  });
}
