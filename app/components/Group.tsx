import type { ReactNode } from "react";
import { SectionTitle } from "~/components/SectionTitle";

type Props = {
  children: ReactNode;
  title?: string;
};

export function Group({ title, children }: Props) {
  return (
    <div className="space-y-4">
      {title && <SectionTitle>{title}</SectionTitle>}
      {children}
    </div>
  );
}
