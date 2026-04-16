import {
  getFallbackLandingHtml,
  getRewrittenHtmlByRoute,
  hasScrapedFileForRoute,
} from "../../lib/scrapedSite";

function textResponse(message, status) {
  return new Response(message, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export async function GET() {
  const exists = await hasScrapedFileForRoute("/");

  if (!exists) {
    return new Response(getFallbackLandingHtml(), {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }

  try {
    const html = await getRewrittenHtmlByRoute("/");
    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch {
    return new Response(getFallbackLandingHtml(), {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }
}
