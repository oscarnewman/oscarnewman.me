import type { LoaderArgs } from "@remix-run/node";

const CURRENT_CV_PDF = "OscarNewman.CV.11.23.2022.pdf";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  url.pathname = `/${CURRENT_CV_PDF}`;

  // proxy the request to the origin / the CURRENT_CV_PDF
  return fetch(url);
}
