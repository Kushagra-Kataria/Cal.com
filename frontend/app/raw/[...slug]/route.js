import {
  getRewrittenHtmlByRoute,
  hasScrapedFileForRoute,
  routePathFromSlug,
} from "../../../lib/scrapedSite";

function textResponse(message, status) {
  return new Response(message, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export async function GET(_request, { params }) {
  const routePath = routePathFromSlug(params?.slug);
  const exists = await hasScrapedFileForRoute(routePath);

  if (!exists) {
    return textResponse("Page not found", 404);
  }

  try {
    const html = await getRewrittenHtmlByRoute(routePath);

    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch {
    return textResponse("Page not found", 404);
  }
}
