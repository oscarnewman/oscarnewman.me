import type { MetaFunction } from "@remix-run/node";
import ProgressPage from "~/components/ProgressPage";
export const meta: MetaFunction = () => [{ title: "Progress Support" }];
export default function Support() {
  return <ProgressPage>
    <h1>Progress support</h1>
    <p>Questions, feedback, or a problem with Progress? Email <a href="mailto:info@textual.studio">info@textual.studio</a>. Beta testers can also send feedback through TestFlight.</p>
    <h2>Reporting a problem</h2>
    <p>Include your device model, iOS version, Progress build number, and the steps that led to the problem. Please avoid sending body photos, Health records, or other sensitive information unless you intend to share them.</p>
    <h2>Your photos and data</h2>
    <p>Your Progress library is stored on your device. We cannot remotely retrieve or restore it. Before deleting the app, use Settings → Export Data to save a copy of your library.</p>
    <p>Use Settings → Manage Sessions to remove photos from Progress. Copies in Apple Photos and records in Apple Health are separate and must be managed in those apps.</p>
    <h2>Revisit the introduction</h2>
    <p>Choose Settings → Restart Onboarding. Your photos, measurements, and privacy settings are preserved.</p>
    <h2>Privacy requests</h2>
    <p>Email <a href="mailto:info@textual.studio">info@textual.studio</a> for privacy questions or requests concerning information you have sent us.</p>
  </ProgressPage>;
}
