import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function SectionTitle({ children }: Props) {
  return <h2 className="text-xl font-mono">{children}</h2>;
}
