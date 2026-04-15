import { notFound } from "next/navigation";
import {
  getRenderableRoutePaths,
  hasScrapedFileForRoute,
  routePathFromSlug,
  routePathToRawPath,
} from "../../lib/scrapedSite";

export default async function ScrapedWebsitePage({ params }) {
  const routePath = routePathFromSlug(params?.slug);
  const exists = await hasScrapedFileForRoute(routePath);

  if (!exists) {
    notFound();
  }

  return (
    <main className="viewer-shell">
      <iframe className="viewer-frame" src={routePathToRawPath(routePath)} title={`page-${routePath}`} />
    </main>
  );
}

export async function generateStaticParams() {
  const routePaths = await getRenderableRoutePaths();

  return routePaths
    .filter((routePath) => routePath !== "/")
    .map((routePath) => ({ slug: routePath.slice(1).split("/") }));
}
