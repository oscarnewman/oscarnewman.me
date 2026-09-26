import type { ReactNode } from "react";
import { Link } from "@remix-run/react";

export default function ProgressPage({ children }: { children: ReactNode }) {
  return <main className="mx-auto w-full max-w-3xl px-6 py-12 sm:py-20">
    <div className="prose prose-gray dark:prose-invert max-w-none">{children}</div>
    <nav aria-label="Progress links" className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-gray-300 pt-6 text-sm dark:border-gray-700">
      <Link to="/progress">Progress</Link><Link to="/progress/privacy">Privacy</Link><Link to="/progress/terms">Terms</Link><Link to="/progress/support">Support</Link>
    </nav>
  </main>;
}
