# Blog

Add a post by saving one Markdown file at `content/blog/<slug>.md` and pushing to the branch Netlify deploys. No template edit is required. The build publishes it at `/blog/<slug>` and adds that URL to `sitemap.xml`.

Files in `content/blog/` whose names start with `_`, or that do not end in `.md`, are ignored. `content/blog/_example.md.txt` shows the format and is not a live post.

## File format

```markdown
---
title: How often DFW windows need a professional clean
slug: how-often-dfw-windows-need-a-professional-clean
date: 2026-04-01
description: What to know before you book exterior window cleaning for a DFW home.
service: /exterior-window-cleaning
image: /images/clear-clean/exterior.webp
image_alt: Clear and Clean technician cleaning an exterior window
---

Dust, sprinklers, and pollen build up at different rates.

# What affects the schedule

- Exterior glass often needs a visit a few times a year
- Interior glass is usually less frequent

Request a [free quote](/contact) when you are ready.
```

## Front matter

| Field | Required | Notes |
| --- | --- | --- |
| title | yes | Post title. This is the only H1 on the page. |
| slug | yes | Lowercase words separated by hyphens. Must match the filename. |
| date | yes | `YYYY-MM-DD`. The index lists newest first. `datePublished` and `dateModified` both use this date. |
| description | yes | Index summary, meta description, and BlogPosting description. |
| service | no | Relative path to an existing page, such as `/exterior-window-cleaning`. If you leave it out, the post links to the homepage service plans section (`/#service-plans`). |
| image | no | Root-relative or absolute image URL. Included in the article and in BlogPosting when set. |
| image_alt | no | Alt text for `image`. Falls back to the title. |

Keep each value on one line. Quote the value if it contains a colon. Do not use em dashes.

In the body, Markdown headings are lowered by one level so the page keeps a single H1: `#` renders as h2, `##` renders as h3, and `###` renders as h4.

## URLs and sitemap

- The index is `/blog` (file: `blog/index.html`).
- A post is `/blog/<slug>` (file: `blog/<slug>/index.html`).
- Canonical URLs use `https://clearandcleanwindowcleaning.com` and omit the trailing slash, matching pages such as `/about-us`.
- Netlify also serves `/blog/` and `/blog/<slug>/` from those index files.
- `scripts/build-blog.mjs` rewrites `sitemap.xml` in the publish output. Every existing URL stays, then `/blog` and each post are appended.

## Preview locally

From the repo root:

```bash
node scripts/build-blog.mjs
python3 -m http.server 8765 --directory dist
```

Open `http://127.0.0.1:8765/blog/`. With zero `.md` posts, the index shows a short note and the free quote and call buttons.

Netlify runs `node scripts/build-blog.mjs` and publishes `dist` (`netlify.toml`).
