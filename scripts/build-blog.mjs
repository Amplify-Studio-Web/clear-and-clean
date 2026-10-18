#!/usr/bin/env node
/**
 * Build the Clear & Clean blog into static HTML.
 *
 * Reads content/blog/<slug>.md (files starting with _ are ignored),
 * copies the site into dist/, writes dist/blog/ and dist/sitemap.xml.
 * On Netlify, the same blog output is also written at the repo root so a
 * publish directory of "." still ships /blog/ if the UI overrides netlify.toml.
 *
 * No dependencies. Run: node scripts/build-blog.mjs
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const CONTENT_DIR = path.join(ROOT, "content", "blog");
const SITE = "https://clearandcleanwindowcleaning.com";
const BUSINESS = "Clear & Clean Window Cleaning";
const SKIP_DIRS = new Set([".git", "dist", "node_modules", "netlify"]);

const ASSETS = {
  icon: "/images/clear-clean/favicon-circle.png?v=20260822d",
  fonts: "/css/fonts.css?v=20260822",
  styles: "/css/styles.css?v=20260830-mobile3",
  pages: "/css/pages.css?v=20260830-location-accordion",
  partials: "/js/partials.js?v=20260830-footer-social2",
  main: "/js/main.js?v=20260822e",
  hero: "/images/clear-clean/hero-truck.webp",
  track: "https://crykmqlxzyonrjzubmgh.supabase.co/functions/v1/track/amplify-track.js",
};

const SERVICE_LABELS = {
  "exterior-window-cleaning": "Exterior Window Washing",
  "interior-window-cleaning": "Interior Window Washing",
  "commercial-window-cleaning": "Commercial Window Cleaning",
  "track-cleaning": "Track Detailing",
  "screen-cleaning": "Screen Cleaning",
  "holiday-lighting": "Christmas Light Installation",
  "holiday-lighting-quote": "Holiday Lighting Quote",
  services: "Our Services",
  contact: "Contact",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function fail(message) {
  console.error(`blog build: ${message}`);
  process.exit(1);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function jsonScript(data) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}

function rootify(url) {
  if (!url) return url;
  if (/^(?:[a-z][a-z0-9+.-]*:|\/|#|\.)/i.test(url)) return url;
  return `/${url}`;
}

function absUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const rooted = rootify(url);
  return `${SITE}${rooted.startsWith("/") ? rooted : `/${rooted}`}`;
}

function renderInline(text) {
  const re = /!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  const parts = [];
  let last = 0;
  let match;
  while ((match = re.exec(text))) {
    if (match.index > last) parts.push(escapeHtml(text.slice(last, match.index)));
    if (match[0].startsWith("!")) {
      parts.push(`<img src="${escapeHtml(rootify(match[2]))}" alt="${escapeHtml(match[1])}">`);
    } else if (match[3] !== undefined) {
      parts.push(`<a href="${escapeHtml(rootify(match[4]))}">${escapeHtml(match[3])}</a>`);
    } else if (match[5] !== undefined) {
      parts.push(`<code>${escapeHtml(match[5])}</code>`);
    } else if (match[6] !== undefined) {
      parts.push(`<strong>${escapeHtml(match[6])}</strong>`);
    } else if (match[7] !== undefined) {
      parts.push(`<em>${escapeHtml(match[7])}</em>`);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(escapeHtml(text.slice(last)));
  return parts.join("");
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const blocks = [];
  let i = 0;
  const isSpecial = (line) => /^(#{1,6}\s|```|>\s?|-{3,}\s*$|\*{3,}\s*$|\s*[-*]\s+|\s*\d+\.\s+)/.test(line);

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }
    if (line.startsWith("```")) {
      const buf = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push(`<pre><code>${escapeHtml(buf.join("\n"))}</code></pre>`);
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const level = Math.min(6, heading[1].length + 1);
      blocks.push(`<h${level}>${renderInline(heading[2].trim())}</h${level}>`);
      i += 1;
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      blocks.push("<hr>");
      i += 1;
      continue;
    }
    if (line.startsWith(">")) {
      const buf = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push(`<blockquote><p>${renderInline(buf.join(" "))}</p></blockquote>`);
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i += 1;
      }
      blocks.push(`<ul>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`);
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i += 1;
      }
      blocks.push(`<ol>${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ol>`);
      continue;
    }
    const para = [line.trim()];
    i += 1;
    while (i < lines.length && lines[i].trim() && !isSpecial(lines[i])) {
      para.push(lines[i].trim());
      i += 1;
    }
    blocks.push(`<p>${renderInline(para.join(" "))}</p>`);
  }
  return blocks.join("\n");
}

function parseFrontMatter(raw, fileName) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) fail(`${fileName} is missing YAML front matter wrapped in ---`);
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) fail(`${fileName} has an unreadable front matter line: ${line}`);
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return { data, body: raw.slice(match[0].length) };
}

function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return value;
}

function formatDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

function serviceTarget(service) {
  if (!service || !String(service).trim()) {
    return { href: "/#service-plans", label: "service plans", fallback: true };
  }
  let href = String(service).trim();
  if (!/^https?:\/\//i.test(href)) {
    if (href.endsWith(".html")) href = href.slice(0, -5);
    if (!href.startsWith("/") && !href.startsWith("#")) href = `/${href}`;
  }
  const slug = href.split("#")[0].split("?")[0].split("/").filter(Boolean).pop() || "";
  const label = SERVICE_LABELS[slug] || slug.replace(/-/g, " ").replace(/\b[a-z]/g, (char) => char.toUpperCase());
  return { href, label, fallback: false };
}

function loadPosts() {
  if (!existsSync(CONTENT_DIR)) return [];
  const names = readdirSync(CONTENT_DIR).filter((name) => name.endsWith(".md") && !name.startsWith("_"));
  const posts = names.map((name) => {
    const fileSlug = name.slice(0, -3);
    const raw = readFileSync(path.join(CONTENT_DIR, name), "utf8");
    const { data, body } = parseFrontMatter(raw, name);
    const title = (data.title || "").trim();
    const description = (data.description || "").trim();
    const slug = (data.slug || "").trim();
    const date = parseDate((data.date || "").trim());
    if (!title) fail(`${name} is missing title`);
    if (!description) fail(`${name} is missing description`);
    if (!slug) fail(`${name} is missing slug`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail(`${name} slug must be lowercase words separated by hyphens`);
    if (slug !== fileSlug) fail(`${name} slug "${slug}" must match the filename`);
    if (!date) fail(`${name} date must be a real YYYY-MM-DD date`);
    if (/\u2014/.test(raw)) fail(`${name} contains an em dash. Use a comma, colon, or hyphen.`);
    return {
      title,
      description,
      slug,
      date,
      service: (data.service || "").trim(),
      image: (data.image || "").trim(),
      imageAlt: (data.image_alt || "").trim() || title,
      html: renderMarkdown(body.trim()),
    };
  });
  const seen = new Set();
  for (const post of posts) {
    if (seen.has(post.slug)) fail(`duplicate slug: ${post.slug}`);
    seen.add(post.slug);
  }
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.title.localeCompare(b.title)));
  return posts;
}

function crumbs(items) {
  const html = items.map((item, index) => {
    const sep = index === 0 ? "" : '<span aria-hidden="true">&gt;</span>';
    const node = item.href
      ? `<a href="${escapeHtml(item.href)}">${escapeHtml(item.name)}</a>`
      : `<span aria-current="page">${escapeHtml(item.name)}</span>`;
    return sep + node;
  }).join("");
  return `<nav class="blog-crumbs" aria-label="Breadcrumb">${html}</nav>`;
}

function breadcrumbLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function quoteButtons() {
  return `<div class="blog-actions"><a class="btn btn-orange btn-lg" href="/contact">FREE QUOTE</a><a class="btn btn-white btn-lg" href="tel:+19728905467">CALL US</a></div>`;
}

function shell({ title, description, canonical, jsonLd = "", body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${escapeHtml(canonical)}">
<meta name="theme-color" content="#071b40">
<link rel="icon" href="${ASSETS.icon}">
<link rel="stylesheet" href="${ASSETS.fonts}">
<link rel="stylesheet" href="${ASSETS.styles}">
<link rel="stylesheet" href="${ASSETS.pages}">
${jsonLd}
<script defer src="${ASSETS.track}" data-site="as_ac96b8d3197b4993ae8592904b4c8c1d"></script>
</head>
<body>
<div id="site-nav"></div>
${body}
<div id="site-footer"></div>
<script src="${ASSETS.partials}"></script>
<script src="${ASSETS.main}"></script>
</body>
</html>
`;
}

function renderIndex(posts) {
  const canonical = `${SITE}/blog/`;
  const description = "Articles from Clear & Clean Window Cleaning for homes and businesses across DFW.";
  const crumbItems = [
    { name: "Home", href: "/", url: `${SITE}/` },
    { name: "Blog", href: "", url: canonical },
  ];
  const list = posts.length
    ? `<ul class="blog-list">${posts.map((post) => `<li class="blog-card"><time datetime="${post.date}">${escapeHtml(formatDate(post.date))}</time><h2><a href="/blog/${post.slug}/">${escapeHtml(post.title)}</a></h2><p>${escapeHtml(post.description)}</p><a class="btn btn-orange" href="/blog/${post.slug}/">Read article</a></li>`).join("")}</ul>`
    : `<div class="blog-empty"><p>No articles yet. Check back soon, or tell us about your windows and we will send a free quote.</p>${quoteButtons()}</div>`;
  const sectionClass = posts.length ? "page-section page-section--light" : "page-section page-section--ink";
  const body = `<section class="page-hero page-hero--photo" style="background-image:url('${ASSETS.hero}')"><div class="wrap">${crumbs(crumbItems)}<p class="eyebrow">Clear &amp; Clean</p><h1>Blog</h1><p class="page-hero__sub">Notes on clearer windows for DFW homes and businesses.</p></div></section>
<section class="${sectionClass}"><div class="wrap">${list}</div></section>`;
  return shell({
    title: "Blog | Clear & Clean Window Cleaning",
    description,
    canonical,
    jsonLd: jsonScript(breadcrumbLd(crumbItems)),
    body,
  });
}

function renderPost(post) {
  const canonical = `${SITE}/blog/${post.slug}/`;
  const service = serviceTarget(post.service);
  const related = service.fallback
    ? `<p class="blog-related">Explore our <a href="${escapeHtml(service.href)}">${escapeHtml(service.label)}</a>.</p>`
    : `<p class="blog-related">Related service: <a href="${escapeHtml(service.href)}">${escapeHtml(service.label)}</a>.</p>`;
  const figure = post.image
    ? `<figure class="blog-figure"><img src="${escapeHtml(rootify(post.image))}" alt="${escapeHtml(post.imageAlt)}"></figure>`
    : "";
  const org = {
    "@type": "Organization",
    name: BUSINESS,
    url: `${SITE}/`,
  };
  const posting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url: canonical,
    author: org,
    publisher: org,
  };
  if (post.image) posting.image = absUrl(post.image);
  const crumbItems = [
    { name: "Home", href: "/", url: `${SITE}/` },
    { name: "Blog", href: "/blog/", url: `${SITE}/blog/` },
    { name: post.title, href: "", url: canonical },
  ];
  const body = `<section class="page-hero page-hero--photo page-hero--blog" style="background-image:url('${ASSETS.hero}')"><div class="wrap">${crumbs(crumbItems)}<p class="eyebrow"><time datetime="${post.date}">${escapeHtml(formatDate(post.date))}</time></p><h1>${escapeHtml(post.title)}</h1><p class="page-hero__sub">${escapeHtml(post.description)}</p>${quoteButtons()}</div></section>
<section class="page-section page-section--light"><div class="wrap"><article class="prose blog-article">${figure}${post.html}${related}<div class="center-cta blog-cta">${quoteButtons()}</div></article></div></section>`;
  return shell({
    title: `${post.title} | Clear & Clean`,
    description: post.description,
    canonical,
    jsonLd: `${jsonScript(posting)}\n${jsonScript(breadcrumbLd(crumbItems))}`,
    body,
  });
}

function buildSitemap(existingXml, extraLocs) {
  const locs = [];
  const re = /<loc>\s*([^<]+?)\s*<\/loc>/g;
  let match;
  while ((match = re.exec(existingXml))) locs.push(match[1].trim());
  for (const loc of extraLocs) {
    if (!locs.includes(loc)) locs.push(loc);
  }
  const urls = locs.map((loc) => `  <url><loc>${escapeXml(loc)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function copySite(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    if (src === ROOT && (SKIP_DIRS.has(entry.name) || entry.name === "blog")) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copySite(from, to);
    else if (entry.isFile()) copyFileSync(from, to);
    else if (entry.isSymbolicLink()) copyFileSync(from, to);
  }
}

function writeBlog(outDir, posts, sitemapXml) {
  const blogDir = path.join(outDir, "blog");
  mkdirSync(blogDir, { recursive: true });
  writeFileSync(path.join(blogDir, "index.html"), renderIndex(posts));
  for (const post of posts) {
    const dir = path.join(blogDir, post.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, "index.html"), renderPost(post));
  }
  writeFileSync(path.join(outDir, "sitemap.xml"), sitemapXml);
}

function assertNoEmDash(html, label) {
  if (html.includes("\u2014")) fail(`generated ${label} contains an em dash`);
}

function warnMissingService(post) {
  const service = serviceTarget(post.service);
  if (service.fallback || /^https?:\/\//i.test(service.href) || service.href.startsWith("/#")) return;
  const rel = service.href.split("#")[0].split("?")[0].replace(/^\//, "");
  if (!rel) return;
  const htmlFile = path.join(ROOT, rel.endsWith(".html") ? rel : `${rel}.html`);
  const indexFile = path.join(ROOT, rel, "index.html");
  if (!existsSync(htmlFile) && !existsSync(indexFile)) {
    console.warn(`blog build: ${post.slug} service "${service.href}" does not match a page in this repo`);
  }
}

function main() {
  const sourceSitemapPath = path.join(ROOT, "sitemap.xml");
  if (!existsSync(sourceSitemapPath)) fail("sitemap.xml is missing");
  const sourceSitemap = readFileSync(sourceSitemapPath, "utf8");
  const posts = loadPosts();
  for (const post of posts) warnMissingService(post);
  const extra = [`${SITE}/blog/`, ...posts.map((post) => `${SITE}/blog/${post.slug}/`)];
  const sitemap = buildSitemap(sourceSitemap, extra);
  assertNoEmDash(sitemap, "sitemap");
  assertNoEmDash(renderIndex(posts), "blog index");
  for (const post of posts) assertNoEmDash(renderPost(post), post.slug);

  rmSync(DIST, { recursive: true, force: true });
  copySite(ROOT, DIST);
  writeBlog(DIST, posts, sitemap);
  if (process.env.NETLIFY === "true") writeBlog(ROOT, posts, sitemap);

  const copiedHome = readFileSync(path.join(DIST, "index.html"));
  const sourceHome = readFileSync(path.join(ROOT, "index.html"));
  if (!copiedHome.equals(sourceHome)) fail("dist/index.html does not match the source page");

  console.log(`blog build: ${posts.length} post(s) -> ${path.relative(ROOT, DIST)}/blog`);
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) main();
