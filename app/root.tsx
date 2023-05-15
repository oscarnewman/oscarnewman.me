import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import clsx from "clsx";
import { preferences } from "~/lib/session.server";
import markdownCss from "~/markdown.css";
import tailwindCss from "~/tailwind.css";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: tailwindCss },
  { rel: "stylesheet", href: markdownCss },
];

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

export default function App() {
  const settings = useLoaderData<typeof loader>();
  return (
    <html
      lang="en"
      className={clsx(
        "min-h-full flex flex-col justify-stretch bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-50 antialiased selection:bg-gray-300 dark:selection:bg-gray-400",
        !settings.cssEnabled && "no-css"
      )}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="icon" href="https://fav.farm/🌵" />
        <Meta />
        {settings.cssEnabled && <Links />}
        {!settings.cssEnabled && (
          <style
            type="text/css"
            dangerouslySetInnerHTML={{
              __html: `
            html.no-css pre[data-theme="dark"],
            html.no-css code[data-theme="dark"] {
              display: none;
            }
            `,
            }}
          ></style>
        )}
      </head>
      <body className="min-h-full flex flex-col flex-1">
        <div className="min-h-full flex flex-col flex-1 border-gray-900">
          <nav className="font-mono py-2 flex flex-col px-4 gap-4 md:gap-0 md:flex-row items-start md:items-center justify-between">
            <Link
              to="/"
              className="flex items-baseline gap-2 whitespace-nowrap"
            >
              <span>🌵</span>
              <span>Oscar Newman</span>
            </Link>

            <ul className="flex justify-end">
              <li>
                <NavLink
                  className={({ isActive }) =>
                    clsx(
                      isActive &&
                        "bg-gray-950 text-white dark:bg-gray-100 dark:text-gray-900",
                      "block px-2 py-1 md:px-1 md:py-0"
                    )
                  }
                  to="/"
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={({ isActive }) =>
                    clsx(
                      isActive &&
                        "bg-gray-950 text-white dark:bg-gray-100 dark:text-gray-900",
                      "block px-2 py-1 md:px-1 md:py-0"
                    )
                  }
                  to="/articles"
                >
                  Writing
                </NavLink>
              </li>

              <li>
                <a
                  className="block px-2 py-1 md:px-1 md:py-0"
                  target="_blank"
                  href="/cv"
                >
                  CV
                </a>
              </li>
              <li>
                <NavLink
                  className={({ isActive }) =>
                    clsx(
                      isActive &&
                        "bg-gray-950 text-white dark:bg-gray-100 dark:text-gray-900",
                      "block px-2 py-1 md:px-1 md:py-0"
                    )
                  }
                  to="/settings"
                >
                  Settings
                </NavLink>
              </li>
            </ul>
          </nav>
          <Outlet />
        </div>
        {settings.javascriptEnabled && <ScrollRestoration />}
        {settings.javascriptEnabled && <Scripts />}
        <LiveReload />
        {settings.analyticsEnabled && (
          <script
            src="https://cdn.usefathom.com/script.js"
            data-site="XWSBOSJU"
            defer
          ></script>
        )}
      </body>
    </html>
  );
}
