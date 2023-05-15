import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { Link } from "@remix-run/react";
import type { ComponentProps } from "react";

type ExternalLinkProps = ComponentProps<typeof Link>;

export default function ExternalLink({
  to,
  children,
  ...props
}: ExternalLinkProps) {
  return (
    <Link
      className="underline inline-flex items-center gap-1"
      target="_blank"
      to={to}
      rel="noreferrer"
      {...props}
    >
      {children}
      <ArrowTopRightOnSquareIcon
        width={16}
        height={16}
        className="h-4 text-gray-600 dark:text-gray-400"
      />
    </Link>
  );
}
