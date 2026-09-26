import type { MetaFunction } from "@remix-run/node";
import ProgressPage from "~/components/ProgressPage";
export const meta: MetaFunction = () => [
  { title: "Progress: Photo Journal" },
  { name: "description", content: "Your progress photos, finally easy to compare. A personal photo journal for iPhone and iPad." },
];
export default function Progress() {
  return <ProgressPage>
    <p className="text-sm uppercase tracking-widest">For iPhone and iPad</p>
    <h1>Progress: Photo Journal</h1>
    <p className="text-xl">Your progress photos, finally easy to compare.</p>
    <p>Give your progress photos a place of their own. Browse the same pose across months, compare two dates, and follow guided capture to take your next set hands-free.</p>
    <p>Photo analysis happens on your device. Keep photos in your app library, protect access with device authentication, and choose whether to save copies to Apple Photos.</p>
    <p>Progress is preparing for an external TestFlight beta. No account or purchase is required in the beta.</p>
    <p>Made for adults 18 and older. For questions or beta feedback, email <a href="mailto:info@textual.studio">info@textual.studio</a>.</p>
  </ProgressPage>;
}
