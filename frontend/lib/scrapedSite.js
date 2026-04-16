import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { load } from "cheerio";

const SITE_ORIGIN = "https://cal.com";
const FILE_PREFIX = "cal_com_";
const FILE_EXTENSION = ".html";

const SCRAPED_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "scraped_pages");

let fileCache = null;

const CAL_HOSTS = new Set(["cal.com", "www.cal.com", "app.cal.com"]);

const LOCAL_AUTH_ROUTES = [
  { matcher: /^\/auth\/login/i, target: "/login" },
  { matcher: /^\/login/i, target: "/login" },
  { matcher: /^\/auth\/signup/i, target: "/signup" },
  { matcher: /^\/signup/i, target: "/signup" },
  { matcher: /^\/bookings/i, target: "/meeting" },
];

function hasSpecialScheme(value) {
  return /^(mailto:|tel:|javascript:|data:|blob:)/i.test(value);
}

function getResolverBase(currentRoutePath) {
  const normalized = normalizeRoutePath(currentRoutePath);
  const pathWithSlash = normalized.endsWith("/") ? normalized : `${normalized}/`;
  return `${SITE_ORIGIN}${pathWithSlash}`;
}

function isCalDomain(hostname) {
  const normalized = hostname.toLowerCase();
  return CAL_HOSTS.has(normalized);
}

function toAbsoluteUrl(urlValue, currentRoutePath) {
  try {
    return new URL(urlValue, getResolverBase(currentRoutePath));
  } catch {
    return null;
  }
}

export function normalizeRoutePath(routePath) {
  const input = typeof routePath === "string" && routePath.length > 0 ? routePath : "/";
  const withLeadingSlash = input.startsWith("/") ? input : `/${input}`;
  const collapsed = withLeadingSlash.replace(/\/{2,}/g, "/");

  if (collapsed.length === 1) {
    return "/";
  }

  return collapsed.replace(/\/+$/g, "");
}

export function routePathFromSlug(slugParts = []) {
  if (!Array.isArray(slugParts) || slugParts.length === 0) {
    return "/";
  }

  const decodedParts = slugParts.map((part) => decodeURIComponent(part));
  return normalizeRoutePath(`/${decodedParts.join("/")}`);
}

export function routePathToFileName(routePath) {
  const normalized = normalizeRoutePath(routePath);

  if (normalized === "/") {
    return `${FILE_PREFIX}${FILE_EXTENSION}`;
  }

  const encoded = normalized.slice(1).replace(/\//g, "_");
  return `${FILE_PREFIX}${encoded}${FILE_EXTENSION}`;
}

export function fileNameToRoutePath(fileName) {
  if (!fileName.startsWith(FILE_PREFIX) || !fileName.endsWith(FILE_EXTENSION)) {
    return null;
  }

  const body = fileName.slice(FILE_PREFIX.length, -FILE_EXTENSION.length);
  if (!body) {
    return "/";
  }

  const hashIndex = body.indexOf("#");
  const pathPart = hashIndex === -1 ? body : body.slice(0, hashIndex);
  const hashPart = hashIndex === -1 ? "" : body.slice(hashIndex);
  const routePath = normalizeRoutePath(`/${pathPart.split("_").filter(Boolean).join("/")}`);

  return `${routePath}${hashPart}`;
}

export function routePathToRawPath(routePath) {
  const normalized = normalizeRoutePath(routePath);
  return normalized === "/" ? "/raw" : `/raw${normalized}`;
}

export async function getScrapedFiles() {
  if (fileCache) {
    return fileCache;
  }

  const entries = await fs.readdir(SCRAPED_DIR, { withFileTypes: true });
  fileCache = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".html"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  return fileCache;
}

async function getScrapedFileSet() {
  const files = await getScrapedFiles();
  return new Set(files);
}

function normalizeAnchorText(anchorText) {
  return (anchorText || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function mapSpecialLocalRoute(absoluteUrl, anchorText) {
  const normalizedPath = normalizeRoutePath(absoluteUrl.pathname);
  const text = normalizeAnchorText(anchorText);

  if (text.includes("get started")) {
    return "#";
  }

  for (const routeConfig of LOCAL_AUTH_ROUTES) {
    if (routeConfig.matcher.test(normalizedPath)) {
      return routeConfig.target;
    }
  }

  return null;
}

function rewriteAnchorHref(href, currentRoutePath, fileSet, anchorText) {
  if (!href) {
    return href;
  }

  const value = href.trim();
  if (!value || value.startsWith("#") || hasSpecialScheme(value)) {
    return value;
  }

  const absoluteUrl = toAbsoluteUrl(value, currentRoutePath);
  if (!absoluteUrl || !isCalDomain(absoluteUrl.hostname)) {
    return value;
  }

  const specialLocalRoute = mapSpecialLocalRoute(absoluteUrl, anchorText);
  if (specialLocalRoute) {
    return specialLocalRoute;
  }

  const localRoute = normalizeRoutePath(absoluteUrl.pathname);
  const candidateFile = routePathToFileName(localRoute);

  if (fileSet.has(candidateFile)) {
    return `${localRoute}${absoluteUrl.search}${absoluteUrl.hash}`;
  }

  return `${SITE_ORIGIN}${absoluteUrl.pathname}${absoluteUrl.search}${absoluteUrl.hash}`;
}

function rewriteAssetUrl(urlValue, currentRoutePath) {
  if (!urlValue) {
    return urlValue;
  }

  const value = urlValue.trim();
  if (!value || value.startsWith("#") || hasSpecialScheme(value)) {
    return value;
  }

  const absoluteUrl = toAbsoluteUrl(value, currentRoutePath);
  if (!absoluteUrl || !isCalDomain(absoluteUrl.hostname)) {
    return value;
  }

  return `${SITE_ORIGIN}${absoluteUrl.pathname}${absoluteUrl.search}${absoluteUrl.hash}`;
}

function rewriteSrcSet(srcSet, currentRoutePath) {
  if (!srcSet) {
    return srcSet;
  }

  return srcSet
    .split(",")
    .map((candidate) => {
      const trimmed = candidate.trim();
      if (!trimmed) {
        return trimmed;
      }

      const parts = trimmed.split(/\s+/);
      const rewrittenUrl = rewriteAssetUrl(parts[0], currentRoutePath);

      if (parts.length === 1) {
        return rewrittenUrl;
      }

      return `${rewrittenUrl} ${parts.slice(1).join(" ")}`;
    })
    .join(", ");
}

function rewriteHtmlDocument(html, currentRoutePath, fileSet) {
  const $ = load(html, { decodeEntities: false });

  $("a[href]").each((_, element) => {
    const currentHref = $(element).attr("href");
    const anchorText = $(element).text();
    const rewrittenHref = rewriteAnchorHref(currentHref, currentRoutePath, fileSet, anchorText);

    if (typeof rewrittenHref === "string") {
      $(element).attr("href", rewrittenHref);
    }
  });

  const assetAttributes = [
    ["link[href]", "href"],
    ["script[src]", "src"],
    ["img[src]", "src"],
    ["source[src]", "src"],
    ["iframe[src]", "src"],
    ["video[src]", "src"],
    ["audio[src]", "src"],
    ["form[action]", "action"],
  ];

  for (const [selector, attribute] of assetAttributes) {
    $(selector).each((_, element) => {
      const currentValue = $(element).attr(attribute);
      const rewrittenValue = rewriteAssetUrl(currentValue, currentRoutePath);

      if (typeof rewrittenValue === "string") {
        $(element).attr(attribute, rewrittenValue);
      }
    });
  }

  $("img[srcset], source[srcset]").each((_, element) => {
    const currentSrcSet = $(element).attr("srcset");
    const rewrittenSrcSet = rewriteSrcSet(currentSrcSet, currentRoutePath);

    if (typeof rewrittenSrcSet === "string") {
      $(element).attr("srcset", rewrittenSrcSet);
    }
  });

  const baseTag = $("head base").first();
  if (baseTag.length > 0) {
    baseTag.attr("target", "_top");
  } else {
    $("head").prepend('<base target="_top">');
  }

  // Inject script to intercept "Get Started" and "Sign in" clicks and notify the parent
  const interceptScript = `
    <script>
      document.addEventListener('click', function(e) {
        var link = e.target.closest('a');
        if (link) {
          var text = (link.textContent || '').replace(/\\s+/g, ' ').trim().toLowerCase();
          if (text.includes('get started') || text.includes('sign in')) {
            e.preventDefault();
            e.stopPropagation();
            window.top.postMessage({ type: 'cal-get-started' }, '*');
          }
        }
      }, true);
    </script>
  `;
  $("body").append(interceptScript);

  return $.html({ decodeEntities: false });
}

export function getFallbackLandingHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Cal.com Demo</title>
    <style>
      body {
        margin: 0;
        font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #f5f5f5;
        color: #111827;
      }
      .page {
        min-height: 100vh;
        background: linear-gradient(180deg, #f7f7f8 0%, #ffffff 100%);
        display: grid;
        place-items: center;
        padding: 24px;
      }
      .card {
        width: min(1200px, 100%);
        min-height: 760px;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 18px;
        box-shadow: 0 10px 30px rgba(17, 24, 39, 0.08);
        overflow: hidden;
        display: grid;
        grid-template-rows: auto 1fr;
      }
      .topbar {
        height: 76px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 28px;
        border-bottom: 1px solid #eceef2;
      }
      .brand {
        font-size: 1.9rem;
        font-weight: 800;
        letter-spacing: -0.04em;
      }
      .nav {
        display: flex;
        gap: 24px;
        color: #4b5563;
        font-size: 0.95rem;
      }
      .nav span:last-child {
        font-weight: 700;
        color: #111827;
      }
      .hero {
        display: grid;
        grid-template-columns: 1.1fr 1fr;
        gap: 24px;
        padding: 32px;
        align-items: center;
      }
      .headline {
        max-width: 560px;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        padding: 6px 12px;
        border: 1px solid #e5e7eb;
        border-radius: 999px;
        font-size: 0.9rem;
        color: #4b5563;
        background: #fafafa;
      }
      h1 {
        margin: 16px 0 18px;
        font-size: clamp(3rem, 6vw, 5.25rem);
        line-height: 0.95;
        letter-spacing: -0.06em;
      }
      p {
        margin: 0;
        color: #6b7280;
        font-size: 1.05rem;
        line-height: 1.5;
      }
      .actions {
        margin-top: 28px;
        display: grid;
        gap: 12px;
        width: min(460px, 100%);
      }
      .button {
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        font-weight: 700;
      }
      .button.primary {
        background: #111827;
        color: #fff;
      }
      .button.secondary {
        background: #f3f4f6;
        color: #374151;
      }
      .preview {
        min-height: 520px;
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        background: linear-gradient(180deg, #fff 0%, #fafafa 100%);
        padding: 20px;
      }
      .preview-grid {
        height: 100%;
        display: grid;
        grid-template-columns: 0.9fr 1.1fr;
        gap: 18px;
      }
      .panel {
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        background: #fff;
        padding: 18px;
      }
      .calendar {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;
        margin-top: 14px;
      }
      .day {
        height: 42px;
        border-radius: 10px;
        background: #e5e7eb;
      }
      @media (max-width: 900px) {
        .hero { grid-template-columns: 1fr; }
        .preview { min-height: 360px; }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="card">
        <header class="topbar">
          <div class="brand">Cal.com</div>
          <nav class="nav">
            <span>Solutions</span>
            <span>Enterprise</span>
            <span>Pricing</span>
            <span>Sign in</span>
            <span>Get started</span>
          </nav>
        </header>
        <section class="hero">
          <div class="headline">
            <div class="badge">Cal.com launches v6.4</div>
            <h1>The better way to schedule your meetings</h1>
            <p>A fully customizable scheduling software for individuals, businesses and teams.</p>
            <div class="actions">
              <a class="button primary" href="#">Sign up with Google</a>
              <a class="button secondary" href="#">Sign up with email</a>
            </div>
          </div>
          <div class="preview">
            <div class="preview-grid">
              <div class="panel">
                <strong>Legal Consultation</strong>
                <p style="margin-top:10px; font-size:0.95rem;">Discuss your legal matters with our experienced attorneys.</p>
              </div>
              <div class="panel">
                <strong>May 2025</strong>
                <div class="calendar">
                  ${Array.from({ length: 35 }, () => '<div class="day"></div>').join("")}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </body>
</html>`;
}

export async function hasScrapedFileForRoute(routePath) {
  const fileSet = await getScrapedFileSet();
  const fileName = routePathToFileName(routePath);
  return fileSet.has(fileName);
}

export async function getRenderableRoutePaths() {
  const files = await getScrapedFiles();
  const uniquePaths = new Set();

  for (const fileName of files) {
    const routePath = fileNameToRoutePath(fileName);
    if (!routePath) {
      continue;
    }

    const pathOnly = routePath.includes("#") ? routePath.split("#")[0] : routePath;
    uniquePaths.add(normalizeRoutePath(pathOnly));
  }

  return [...uniquePaths].sort((a, b) => a.localeCompare(b));
}

export async function getRewrittenHtmlByRoute(routePath) {
  const normalizedRoute = normalizeRoutePath(routePath);
  const fileName = routePathToFileName(normalizedRoute);
  const filePath = path.join(SCRAPED_DIR, fileName);

  const [html, fileSet] = await Promise.all([fs.readFile(filePath, "utf8"), getScrapedFileSet()]);
  return rewriteHtmlDocument(html, normalizedRoute, fileSet);
}
