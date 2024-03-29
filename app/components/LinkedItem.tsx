import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { Link, useRouteError, useRouteLoaderData } from "@remix-run/react";
import type { RootLoaderData } from "~/root";

export type LinkedItemProps = {
  href: string;
  external?: boolean;
  badge?: string;
  date?: Date;
  description?: string;
  title: string;
  onlyLinkTitle?: boolean;
};

export function LinkedItem({
  href,
  external,
  badge,
  date,
  description,
  title,
  onlyLinkTitle,
}: LinkedItemProps) {
  const { cssEnabled } = useRouteLoaderData("root") as RootLoaderData;
  if (!cssEnabled) {
    return (
      <div>
        {badge && <p>{badge}</p>}
        <Link
          to={href}
          {...(external ? { target: "_blank" } : {})}
          prefetch={external ? "none" : "render"}
        >
          <h3>{title}</h3>
        </Link>
        {description && <p>{description}</p>}
        {date && (
          <time dateTime={date.toString()}>
            {date.toLocaleString("en-US", {
              month: "long",
              day: "2-digit",
              year: "numeric",
              timeZone: "UTC",
            })}
          </time>
        )}
      </div>
    );
  }
  return (
    <Link
      to={href}
      {...(external ? { target: "_blank" } : {})}
      className="linked-item max-w-xl space-y-1 hover:border-gray-300 dark:hover:border-gray-600 border border-transparent block p-2"
      prefetch={external ? "none" : "render"}
    >
      {badge && (
        <p className="text-xs uppercase tracking-wide font-mono bg-gray-300 dark:bg-gray-700 dark:text-gray-200 px-0.5 text-gray-700 inline-block">
          {badge}
        </p>
      )}
      <h3 className="font-bold font-mono underline text-sm flex items-center gap-2">
        <span className="title">{title}</span>
        {external && (
          <ArrowTopRightOnSquareIcon
            width={16}
            height={16}
            className="h-4 text-gray-600 dark:text-gray-400 flex-shrink-0"
          />
        )}
      </h3>
      {description && <p className="leading-6 text-sm">{description}</p>}
      {date && (
        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
          {date.toLocaleString("en-US", {
            month: "long",
            day: "2-digit",
            year: "numeric",
            timeZone: "UTC",
          })}
        </p>
      )}
    </Link>
  );
}
