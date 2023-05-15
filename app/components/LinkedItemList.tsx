import type { ReactNode } from "react";

export function LinkedItemList({ children }: { children: ReactNode }) {
  return <div className="-mx-2">{children}</div>;
}
