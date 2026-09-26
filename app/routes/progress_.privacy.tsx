import type { MetaFunction } from "@remix-run/node";
import { marked } from "marked";
import ProgressPage from "~/components/ProgressPage";
import content from "~/content/progress/privacy-policy";
export const meta: MetaFunction = () => [{ title: "Progress Privacy Policy" }];
const html = marked.parse(content);
export default function Policy() {
  return <ProgressPage><article dangerouslySetInnerHTML={{ __html: html }} /></ProgressPage>;
}
